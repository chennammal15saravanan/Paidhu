const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        // First connect without specifying DB to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || ''
        });

        console.log("Connected to MySQL Server.");

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database '${process.env.DB_NAME}' created or already exists.`);

        // Switch to the new database
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('customer', 'admin') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'users' created or already exists.");

        // Create Products Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                image_url VARCHAR(1024),
                category VARCHAR(100),
                rating DECIMAL(3,1) DEFAULT 5.0,
                tag VARCHAR(50),
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            );
        `);
        console.log("Table 'products' created or already exists.");

        // Insert some dummy products if empty
        const [rows] = await connection.query("SELECT COUNT(*) as count FROM products");
        if (rows[0].count === 0) {
            await connection.query(`
                INSERT INTO products (name, price, image_url, category, rating, tag) VALUES
                ('Kashmiri Mongra Saffron', 999.00, 'https://paidhu.com/wp-content/uploads/2025/07/saffron-1.jpg', 'Saffron', 5.0, 'Bestseller'),
                ('Brew Flora - Blue Pea (30g)', 425.00, 'https://paidhu.com/wp-content/uploads/2025/07/Brew-Flora-300x300.jpg', 'Brew Flora', 4.8, 'Organic'),
                ('Bloom Powder - Hibiscus', 350.00, 'https://paidhu.com/wp-content/uploads/2024/12/Bloom-Powder-2-300x300.png', 'Bloom Powders', 4.9, NULL),
                ('Bloom Cookies - Hibiscus', 66.00, 'https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg', 'Cookies', 4.7, NULL)
            `);
            console.log("Inserted initial dummy products.");
        }

        await connection.end();
        console.log("Database initialization complete.");

    } catch (err) {
        console.error("Database initialization failed. Are you sure MySQL is running?", err.message);
        process.exit(1);
    }
}

initDB();
