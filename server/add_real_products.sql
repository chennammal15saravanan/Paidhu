USE paidhu_db;

-- Delete old dummy products to start fresh with actual website products
DELETE FROM products;
ALTER TABLE products AUTO_INCREMENT = 1;

INSERT INTO products (name, title, category, description, short_description, price, image_url, status, cta_text, tag) VALUES
(
    'Tanner’s Jam (Cassia Fistula)',
    'Ayurvedic Tonic & Herbal Laxative',
    'Petal Jam',
    'Tanner’s Jam is a premium natural herbal spread made from carefully selected Avaram Poo (Cassia Auriculata) flowers, known for their traditional wellness benefits and delicate floral taste. 100% natural flower-based jam, no added preservatives, no artificial colors or flavors.',
    'Support your digestion naturally with Cassia Fistula Jam—an ancient Ayurvedic tonic. 100% natural! Rich in antioxidants and fiber!',
    350.00,
    'https://paidhu.com/wp-content/uploads/2025/07/paidhu-logo-meroon.png',
    'Active',
    'Buy Now',
    '100% Natural'
),
(
    'Rose Gulkhand Jam',
    'Premium Rose Preserve',
    'Petal Jam',
    'Delicious and cooling Rose Gulkhand Jam made from fresh rose petals.',
    'Traditional cooling rose preserve packed with antioxidants.',
    350.00,
    'https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Cooling'
),
(
    'Hibiscus Petal Jam',
    'Natural Antioxidant Health Spread',
    'Petal Jam',
    'Hibiscus Petal Jam is a natural antioxidant health spread that provides a tangy and sweet flavor profile.',
    'Natural Antioxidant Health Spread made from real hibiscus petals.',
    350.00,
    'https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Antioxidant'
),
(
    'Saffron Powder',
    'Authentic Saffron Powder',
    'Saffron',
    'Pure, high-grade Saffron Powder perfect for culinary and wellness uses.',
    'Pure, high-grade Saffron Powder perfect for culinary and wellness uses.',
    1600.00,
    'https://images.unsplash.com/photo-1615486171448-4df2b010c2c1?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Premium'
),
(
    'Kashmiri Mongra Saffron',
    'Premium Grade Saffron',
    'Saffron',
    'The finest Kashmiri Mongra Saffron, known for its deep red color and intense aroma.',
    'The finest Kashmiri Mongra Saffron, known for its deep red color and intense aroma.',
    1700.00,
    'https://images.unsplash.com/photo-1615486171448-4df2b010c2c1?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Bestseller'
),
(
    'Super Negin Saffron',
    'High Quality Negin',
    'Saffron',
    'Super Negin Saffron with long, thick red threads.',
    'Super Negin Saffron with long, thick red threads.',
    1173.00,
    'https://images.unsplash.com/photo-1615486171448-4df2b010c2c1?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Export Quality'
),
(
    'Neem Dry Flower',
    'Natural Neem Flowers',
    'Dry Flowers',
    'Sun-dried neem flowers for traditional recipes and wellness preparations.',
    'Sun-dried neem flowers for traditional recipes and wellness preparations.',
    200.00,
    'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Herbal'
),
(
    'Bloom Cookies Hibiscus',
    'Healthy Hibiscus Cookies',
    'Bloom Cookies',
    'Delicious cookies baked with the goodness of hibiscus. No maida, no refined sugar.',
    'Delicious cookies baked with the goodness of hibiscus. No maida, no refined sugar.',
    150.00,
    'https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg',
    'Active',
    'Buy Now',
    'No Maida'
),
(
    'Brew Flora Lavender',
    'Lavender Infusion',
    'Brew Flora',
    'Calming and aromatic Brew Flora Lavender tea.',
    'Calming and aromatic Brew Flora Lavender tea.',
    300.00,
    'https://images.unsplash.com/photo-1576092762791-dd9e2220c4c7?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Relaxing'
),
(
    'Brew Flora Blue Pea',
    'Blue Pea Infusion',
    'Brew Flora',
    'Vibrant Blue Pea flower tea, rich in antioxidants.',
    'Vibrant Blue Pea flower tea, rich in antioxidants.',
    300.00,
    'https://images.unsplash.com/photo-1576092762791-dd9e2220c4c7?auto=format&fit=crop&q=80&w=800',
    'Active',
    'Buy Now',
    'Antioxidant'
);
