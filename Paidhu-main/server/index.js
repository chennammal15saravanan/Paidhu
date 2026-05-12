const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed!"));
    }
});

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretpaidhukey123', (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token." });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Registration Route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, phone, password, role } = req.body;
        
        // Basic validation
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if user exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role (default to customer if not specified or invalid)
        const userRole = role === 'admin' ? 'admin' : 'customer';

        // Insert into DB
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, phone, hashedPassword, userRole]
        );

        res.status(201).json({ message: "Registration successful!", userId: result.insertId });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Database error: " + err.message + ". Please ensure MySQL is running and init_db.js was executed." });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Get user from DB
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        const user = users[0];

        // If they try to log in via Admin portal, ensure they are an admin
        if (role === 'admin' && user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. You do not have admin privileges." });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name },
            process.env.JWT_SECRET || 'supersecretpaidhukey123',
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Database error: " + err.message + ". Please ensure MySQL is running and init_db.js was executed." });
    }
});

// --- UPLOAD ROUTE ---
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Failed to upload image." });
    }
});

// --- PRODUCT ROUTES ---

// Get all active products
app.get('/api/products/active', async (req, res) => {
    try {
        const [products] = await pool.query("SELECT * FROM products WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC");
        res.json(products);
    } catch (err) {
        console.error("Fetch products error:", err);
        res.status(500).json({ error: "Server error fetching products." });
    }
});

// Get all products (Admin Only)
app.get('/api/products/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }
        const [products] = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(products);
    } catch (err) {
        console.error("Fetch all products error:", err);
        res.status(500).json({ error: "Server error." });
    }
});

// Add new product (Admin Only)
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Only admins can add products." });
        }

        const { 
            name, title, category, description, short_description, 
            image_url, banner_image, features, benefits, 
            interest_rate, eligibility_details, status, 
            display_order, slug, cta_text, redirect_link, price,
            gallery_images, on_sale, original_price, sizes, sku, additional_info,
            gtin, stock_status, weight_g, length_cm, width_cm, height_cm, 
            upsell_ids, cross_sell_ids, attributes, rating, tag,
            ingredients, brewing_guide, storage_instructions, floral_notes, 
            aroma_profile, taste_notes, caffeine_level, is_organic, 
            is_handcrafted, is_limited_edition, seo_title, seo_description, seo_keywords
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Product name is required." });
        }

        const query = `
            INSERT INTO products (
                name, title, category, description, short_description, 
                image_url, banner_image, features, benefits, 
                interest_rate, eligibility_details, status, 
                display_order, slug, cta_text, redirect_link, price, created_by,
                gallery_images, on_sale, original_price, sizes, sku, additional_info,
                gtin, stock_status, weight_g, length_cm, width_cm, height_cm, 
                upsell_ids, cross_sell_ids, attributes, rating, tag,
                ingredients, brewing_guide, storage_instructions, floral_notes, 
                aroma_profile, taste_notes, caffeine_level, is_organic, 
                is_handcrafted, is_limited_edition, seo_title, seo_description, seo_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            name, title || null, category || null, description || null, short_description || null,
            image_url || null, banner_image || null, features ? JSON.stringify(features) : null, benefits ? JSON.stringify(benefits) : null,
            interest_rate || null, eligibility_details || null, status || 'Active',
            display_order || 0, slug || null, cta_text || 'Apply Now', redirect_link || null, price || 0, req.user.id,
            gallery_images ? JSON.stringify(gallery_images) : null, on_sale || false, original_price || null, 
            sizes ? JSON.stringify(sizes) : null, sku || null, additional_info ? JSON.stringify(additional_info) : null,
            gtin || null, stock_status || 'In stock', weight_g || 0, length_cm || 0, width_cm || 0, height_cm || 0,
            upsell_ids ? JSON.stringify(upsell_ids) : null, cross_sell_ids ? JSON.stringify(cross_sell_ids) : null, 
            attributes ? JSON.stringify(attributes) : null, rating || 5.0, tag || null,
            ingredients || null, brewing_guide || null, storage_instructions || null, floral_notes || null,
            aroma_profile || null, taste_notes || null, caffeine_level || 'None', is_organic !== undefined ? is_organic : true,
            is_handcrafted !== undefined ? is_handcrafted : true, is_limited_edition || false, 
            seo_title || null, seo_description || null, seo_keywords || null
        ];

        const [result] = await pool.query(query, values);
        res.status(201).json({ message: "Product added successfully!", productId: result.insertId });

    } catch (err) {
        console.error("Add product error:", err);
        res.status(500).json({ error: "Server error adding product." });
    }
});

// Update existing product (Admin Only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }

        const { id } = req.params;
        const { 
            name, title, category, description, short_description, 
            image_url, banner_image, features, benefits, 
            interest_rate, eligibility_details, status, 
            display_order, slug, cta_text, redirect_link, price,
            gallery_images, on_sale, original_price, sizes, sku, additional_info,
            gtin, stock_status, weight_g, length_cm, width_cm, height_cm, 
            upsell_ids, cross_sell_ids, attributes, rating, tag,
            ingredients, brewing_guide, storage_instructions, floral_notes, 
            aroma_profile, taste_notes, caffeine_level, is_organic, 
            is_handcrafted, is_limited_edition, seo_title, seo_description, seo_keywords
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Product name is required." });
        }

        const query = `
            UPDATE products SET 
                name = ?, title = ?, category = ?, description = ?, short_description = ?, 
                image_url = ?, banner_image = ?, features = ?, benefits = ?, 
                interest_rate = ?, eligibility_details = ?, status = ?, 
                display_order = ?, slug = ?, cta_text = ?, redirect_link = ?, price = ?,
                gallery_images = ?, on_sale = ?, original_price = ?, sizes = ?, sku = ?, additional_info = ?,
                gtin = ?, stock_status = ?, weight_g = ?, length_cm = ?, width_cm = ?, height_cm = ?, 
                upsell_ids = ?, cross_sell_ids = ?, attributes = ?, rating = ?, tag = ?,
                ingredients = ?, brewing_guide = ?, storage_instructions = ?, floral_notes = ?, 
                aroma_profile = ?, taste_notes = ?, caffeine_level = ?, is_organic = ?, 
                is_handcrafted = ?, is_limited_edition = ?, seo_title = ?, seo_description = ?, seo_keywords = ?
            WHERE id = ?
        `;
        
        const values = [
            name, title || null, category || null, description || null, short_description || null,
            image_url || null, banner_image || null, 
            features ? (typeof features === 'string' ? features : JSON.stringify(features)) : null, 
            benefits ? (typeof benefits === 'string' ? benefits : JSON.stringify(benefits)) : null,
            interest_rate || null, eligibility_details || null, status || 'Active',
            display_order || 0, slug || null, cta_text || 'Apply Now', redirect_link || null, price || 0,
            gallery_images ? (typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images)) : null, 
            on_sale || false, original_price || null, 
            sizes ? (typeof sizes === 'string' ? sizes : JSON.stringify(sizes)) : null, 
            sku || null, 
            additional_info ? (typeof additional_info === 'string' ? additional_info : JSON.stringify(additional_info)) : null,
            gtin || null, stock_status || 'In stock', weight_g || 0, length_cm || 0, width_cm || 0, height_cm || 0,
            upsell_ids ? (typeof upsell_ids === 'string' ? upsell_ids : JSON.stringify(upsell_ids)) : null, 
            cross_sell_ids ? (typeof cross_sell_ids === 'string' ? cross_sell_ids : JSON.stringify(cross_sell_ids)) : null, 
            attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null, 
            rating || 5.0, tag || null,
            ingredients || null, brewing_guide || null, storage_instructions || null, floral_notes || null,
            aroma_profile || null, taste_notes || null, caffeine_level || 'None', is_organic !== undefined ? is_organic : true,
            is_handcrafted !== undefined ? is_handcrafted : true, is_limited_edition || false, 
            seo_title || null, seo_description || null, seo_keywords || null,
            id
        ];

        await pool.query(query, values);
        res.json({ message: "Product updated successfully!" });

    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ error: "Server error updating product." });
    }
});

// Delete product (Admin Only)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE id = ?", [id]);
        res.json({ message: "Product deleted successfully!" });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ error: "Server error deleting product." });
    }
});

// Duplicate Product (Admin Only)
app.post('/api/products/:id/duplicate', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
        
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found." });
        
        const p = rows[0];
        const { id, created_at, ...productData } = p;
        
        productData.name = `${productData.name} (Copy)`;
        productData.slug = `${productData.slug}-copy-${Date.now()}`;
        productData.status = 'Draft';

        const keys = Object.keys(productData).join(', ');
        const values = Object.values(productData);
        const placeholders = values.map(() => '?').join(', ');

        const [result] = await pool.query(`INSERT INTO products (${keys}) VALUES (${placeholders})`, values);
        res.status(201).json({ message: "Product duplicated!", productId: result.insertId });
    } catch (err) {
        console.error("Duplicate product error:", err);
        res.status(500).json({ error: "Server error duplicating product." });
    }
});

// Product Variants APIs
app.get('/api/products/:id/variants', authenticateToken, async (req, res) => {
    try {
        const [variants] = await pool.query("SELECT * FROM product_variants WHERE product_id = ?", [req.params.id]);
        res.json(variants);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch variants." });
    }
});

app.post('/api/products/:id/variants', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        const { variant_name, price, stock_count, sku } = req.body;
        await pool.query(
            "INSERT INTO product_variants (product_id, variant_name, price, stock_count, sku) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, variant_name, price, stock_count, sku]
        );
        res.status(201).json({ message: "Variant added." });
    } catch (err) {
        res.status(500).json({ error: "Failed to add variant." });
    }
});

app.delete('/api/admin/variants/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        await pool.query("DELETE FROM product_variants WHERE id = ?", [req.params.id]);
        res.json({ message: "Variant deleted." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete variant." });
    }
});

// --- PRODUCT-BASED LOGIN ROUTE ---
app.post('/api/product-access/login', async (req, res) => {
    try {
        const { email, password, productId } = req.body;

        if (!email || !password || !productId) {
            return res.status(400).json({ error: "Email, password, and product ID are required." });
        }

        // Validate User
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid credentials." });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // Grant access if not already granted
        try {
            await pool.query('INSERT IGNORE INTO product_access (user_id, product_id) VALUES (?, ?)', [user.id, productId]);
        } catch (e) {
            console.error("Access grant error:", e);
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name, productId: productId },
            process.env.JWT_SECRET || 'supersecretpaidhukey123',
            { expiresIn: '24h' }
        );

        res.json({
            message: "Product login successful. Access granted.",
            token,
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role },
            productId
        });

    } catch (err) {
        console.error("Product login error:", err);
        res.status(500).json({ error: "Server error during product login." });
    }
});


// --- ORDER ROUTES ---

// Create New Order
app.post('/api/orders', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { 
            fullName, email, phone, address, pincode, city, state, 
            items, totalAmount, paymentMethod, upiId, cardNumber, cardExpiry, cardCvv,
            couponCode, discountAmount
        } = req.body;

        const paymentDetails = JSON.stringify({ upiId, cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : null, cardExpiry });

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        // Generate Unique Order ID
        const orderId = `PAIDHU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 1. Insert Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (
                order_id, user_id, full_name, email, phone, address, pincode, city, state, 
                total_amount, payment_method, payment_status, order_status, payment_details,
                discount_amount, coupon_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId, req.user.id, fullName, email, phone, address, pincode, city, state, 
                totalAmount, paymentMethod, paymentMethod === 'COD' ? 'Pending' : 'Success', 'Confirmed', paymentDetails,
                discountAmount || 0, couponCode || null
            ]
        );

        const internalOrderId = orderResult.insertId;

        // 1.5 Handle Coupon Usage
        if (couponCode) {
            const [coupons] = await connection.query(`SELECT id FROM coupons WHERE coupon_code = ?`, [couponCode]);
            if (coupons.length > 0) {
                const couponId = coupons[0].id;
                await connection.query(
                    `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)`,
                    [couponId, req.user.id, internalOrderId, discountAmount || 0]
                );
                await connection.query(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [couponId]);
            }
        }

        // 2. Insert Order Items & Update Stock
        for (const item of items) {
            const qty = parseInt(item.quantity) || 1;
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [internalOrderId, item.id, item.name, qty, item.price, item.size || null]
            );

            // Reduce Stock
            await connection.query(
                `UPDATE products SET stock_count = stock_count - ? WHERE id = ? AND stock_count >= ?`,
                [qty, item.id, qty]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            message: "Your order has been placed successfully!", 
            orderId: orderId,
            id: internalOrderId
        });

    } catch (err) {
        await connection.rollback();
        console.error("Order creation error:", err);
        res.status(500).json({ error: "Failed to place order: " + err.message });
    } finally {
        connection.release();
    }
});

// Get My Orders
app.get('/api/orders/my', authenticateToken, async (req, res) => {
    try {
        const [orders] = await pool.query(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", 
            [req.user.id]
        );
        
        // Fetch items for each order
        for (let order of orders) {
            const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error("Fetch orders error:", err);
        res.status(500).json({ error: "Failed to fetch orders." });
    }
});

// Cancel Order
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { reason } = req.body;

        // Check if order exists and belongs to user
        const [orders] = await connection.query(
            "SELECT * FROM orders WHERE id = ? AND user_id = ?", 
            [id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: "Order not found." });
        }

        const order = orders[0];

        // Check eligibility
        const eligibleStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed'];
        if (!eligibleStatuses.includes(order.order_status)) {
            return res.status(400).json({ error: "Order cannot be cancelled at this stage." });
        }

        // Update status
        await connection.query(
            "UPDATE orders SET order_status = 'Cancelled', cancellation_reason = ? WHERE id = ?",
            [reason || 'Cancelled by user', id]
        );

        // Restore Stock
        const [items] = await connection.query("SELECT * FROM order_items WHERE order_id = ?", [id]);
        for (const item of items) {
            await connection.query(
                "UPDATE products SET stock_count = stock_count + ? WHERE id = ?",
                [item.quantity, item.product_id]
            );
        }

        // Handle Refund if prepaid
        if (order.payment_status === 'Success') {
            await connection.query(
                "INSERT INTO refunds (order_id, amount, status, reason) VALUES (?, ?, 'Pending', ?)",
                [id, order.total_amount, 'Order cancelled by user']
            );
            await connection.query("UPDATE orders SET payment_status = 'Refunded' WHERE id = ?", [id]);
        }

        await connection.commit();
        res.json({ message: "Order cancelled successfully." });

    } catch (err) {
        await connection.rollback();
        console.error("Cancel order error:", err);
        res.status(500).json({ error: "Failed to cancel order." });
    } finally {
        connection.release();
    }
});

// --- ADMIN ORDER ROUTES ---

// Get All Orders (Admin)
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }

        const [orders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
        
        for (let order of orders) {
            const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error("Admin fetch orders error:", err);
        res.status(500).json({ error: "Failed to fetch all orders." });
    }
});

// Update Order Status (Admin)
app.put('/api/admin/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }

        const { id } = req.params;
        const { status, trackingId } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status." });
        }

        await pool.query(
            "UPDATE orders SET order_status = ?, tracking_id = ? WHERE id = ?",
            [status, trackingId || null, id]
        );

        res.json({ message: "Order status updated successfully." });
    } catch (err) {
        console.error("Admin update status error:", err);
        res.status(500).json({ error: "Failed to update order status." });
    }
});

// Get Analytics (Admin)
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied." });
        }

        const [counts] = await pool.query(`
            SELECT 
                COUNT(*) as totalOrders,
                SUM(CASE WHEN order_status = 'Delivered' THEN total_amount ELSE 0 END) as revenue,
                SUM(CASE WHEN order_status = 'Pending' OR order_status = 'Confirmed' THEN 1 ELSE 0 END) as pendingOrders,
                SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
                SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders
            FROM orders
        `);

        res.json(counts[0]);
    } catch (err) {
        console.error("Admin analytics error:", err);
        res.status(500).json({ error: "Failed to fetch analytics." });
    }
});

// --- COUPON ROUTES ---

// Validate Coupon (Customer)
app.get('/api/coupons/validate/:code', authenticateToken, async (req, res) => {
    try {
        const { code } = req.params;
        const { totalAmount } = req.query;

        const [coupons] = await pool.query(`SELECT * FROM coupons WHERE coupon_code = ? AND status = 'Active'`, [code]);
        if (coupons.length === 0) return res.status(404).json({ error: "Invalid coupon code." });

        const coupon = coupons[0];
        const now = new Date();

        // Basic Checks
        if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
            return res.status(400).json({ error: "Coupon has expired." });
        }
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ error: "Coupon usage limit reached." });
        }
        if (parseFloat(totalAmount) < parseFloat(coupon.min_order_amount)) {
            return res.status(400).json({ error: `Minimum order of ₹${coupon.min_order_amount} required.` });
        }

        // Per User Limit Check
        const [usage] = await pool.query(`SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`, [coupon.id, req.user.id]);
        if (usage[0].count >= coupon.per_user_limit) {
            return res.status(400).json({ error: "You have already used this coupon." });
        }

        // First Order Only Check
        if (coupon.first_order_only) {
            const [orders] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE user_id = ?`, [req.user.id]);
            if (orders[0].count > 0) {
                return res.status(400).json({ error: "This coupon is only for your first order." });
            }
        }

        res.json({ success: true, coupon });
    } catch (err) {
        console.error("Coupon validation error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Admin: Get All Coupons
app.get('/api/admin/coupons', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        const [coupons] = await pool.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch coupons." });
    }
});

// Admin: Create Coupon
app.post('/api/admin/coupons', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        const { 
            coupon_code, coupon_name, description, discount_type, discount_value, 
            min_order_amount, max_discount_amount, start_date, expiry_date, usage_limit, 
            per_user_limit, first_order_only, free_shipping 
        } = req.body;

        await pool.query(
            `INSERT INTO coupons (
                coupon_code, coupon_name, description, discount_type, discount_value, 
                min_order_amount, max_discount_amount, start_date, expiry_date, usage_limit, 
                per_user_limit, first_order_only, free_shipping
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                coupon_code, coupon_name, description, discount_type, discount_value, 
                min_order_amount, max_discount_amount, start_date || null, expiry_date || null, 
                usage_limit || null, per_user_limit || 1, first_order_only || false, free_shipping || false
            ]
        );
        res.status(201).json({ message: "Coupon created successfully." });
    } catch (err) {
        console.error("Coupon creation error:", err);
        res.status(500).json({ error: "Failed to create coupon. Code might already exist." });
    }
});

// Admin: Update Coupon
app.put('/api/admin/coupons/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        const { 
            coupon_code, coupon_name, description, discount_type, discount_value, 
            min_order_amount, max_discount_amount, start_date, expiry_date, usage_limit, 
            per_user_limit, first_order_only, free_shipping, status
        } = req.body;

        await pool.query(
            `UPDATE coupons SET 
                coupon_code = ?, coupon_name = ?, description = ?, discount_type = ?, 
                discount_value = ?, min_order_amount = ?, max_discount_amount = ?, 
                start_date = ?, expiry_date = ?, usage_limit = ?, per_user_limit = ?, 
                first_order_only = ?, free_shipping = ?, status = ?
            WHERE id = ?`,
            [
                coupon_code, coupon_name, description, discount_type, discount_value, 
                min_order_amount, max_discount_amount, start_date || null, expiry_date || null, 
                usage_limit || null, per_user_limit || 1, first_order_only || false, free_shipping || false,
                status || 'Active', req.params.id
            ]
        );
        res.json({ message: "Coupon updated successfully." });
    } catch (err) {
        console.error("Coupon update error:", err);
        res.status(500).json({ error: "Failed to update coupon." });
    }
});

// Admin: Update Coupon Status
app.put('/api/admin/coupons/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        const { status } = req.body;
        await pool.query(`UPDATE coupons SET status = ? WHERE id = ?`, [status, req.params.id]);
        res.json({ message: "Status updated." });
    } catch (err) {
        res.status(500).json({ error: "Update failed." });
    }
});

// Admin: Delete Coupon
app.delete('/api/admin/coupons/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    try {
        await pool.query(`DELETE FROM coupons WHERE id = ?`, [req.params.id]);
        res.json({ message: "Coupon deleted." });
    } catch (err) {
        res.status(500).json({ error: "Delete failed." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Paidhu Backend Server running on port ${PORT}`);
});
