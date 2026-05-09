const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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
        res.status(500).json({ error: "Server error during registration." });
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
        res.status(500).json({ error: "Server error during login." });
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
            gtin, stock_status, weight_g, length_cm, width_cm, height_cm, upsell_ids, cross_sell_ids, attributes
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
                gtin, stock_status, weight_g, length_cm, width_cm, height_cm, upsell_ids, cross_sell_ids, attributes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            attributes ? JSON.stringify(attributes) : null
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
            gtin, stock_status, weight_g, length_cm, width_cm, height_cm, upsell_ids, cross_sell_ids, attributes
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
                upsell_ids = ?, cross_sell_ids = ?, attributes = ?
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Paidhu Backend Server running on port ${PORT}`);
});
