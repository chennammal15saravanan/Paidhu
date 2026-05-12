CREATE DATABASE IF NOT EXISTS paidhu_db;
USE paidhu_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS product_access;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    short_description VARCHAR(500),
    image_url VARCHAR(1024),
    banner_image VARCHAR(1024),
    features JSON,
    benefits JSON,
    interest_rate VARCHAR(50),
    eligibility_details TEXT,
    status ENUM('Active', 'Inactive', 'Draft') DEFAULT 'Active',
    display_order INT DEFAULT 0,
    slug VARCHAR(255) UNIQUE,
    cta_text VARCHAR(100) DEFAULT 'Apply Now',
    redirect_link VARCHAR(1024),
    price DECIMAL(10, 2) DEFAULT 0.00,
    gallery_images JSON,
    on_sale BOOLEAN DEFAULT FALSE,
    original_price DECIMAL(10, 2),
    sizes JSON,
    sku VARCHAR(100),
    additional_info JSON,
    gtin VARCHAR(100),
    stock_status VARCHAR(50) DEFAULT 'In stock',
    weight_g DECIMAL(10, 2) DEFAULT 0.00,
    length_cm DECIMAL(10, 2) DEFAULT 0.00,
    width_cm DECIMAL(10, 2) DEFAULT 0.00,
    height_cm DECIMAL(10, 2) DEFAULT 0.00,
    upsell_ids JSON,
    cross_sell_ids JSON,
    attributes JSON,
    rating DECIMAL(3,1) DEFAULT 5.0,
    tag VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE product_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

INSERT INTO products (name, title, price, image_url, category, rating, tag, status, cta_text) VALUES
('Kashmiri Mongra Saffron', 'Premium Saffron', 999.00, 'https://paidhu.com/wp-content/uploads/2025/07/saffron-1.jpg', 'Saffron', 5.0, 'Bestseller', 'Active', 'Buy Now'),
('Brew Flora - Blue Pea (30g)', 'Organic Blue Pea Tea', 425.00, 'https://paidhu.com/wp-content/uploads/2025/07/Brew-Flora-300x300.jpg', 'Brew Flora', 4.8, 'Organic', 'Active', 'Buy Now'),
('Bloom Powder - Hibiscus', 'Natural Hibiscus Powder', 350.00, 'https://paidhu.com/wp-content/uploads/2024/12/Bloom-Powder-2-300x300.png', 'Bloom Powders', 4.9, NULL, 'Active', 'Buy Now'),
('Bloom Cookies - Hibiscus', 'Healthy Hibiscus Cookies', 66.00, 'https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg', 'Cookies', 4.7, NULL, 'Active', 'Buy Now');
