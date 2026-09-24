-- ============================================================
-- DHARIGA MART - Sample Products
-- INSERT ... ON DUPLICATE KEY UPDATE refreshes image_url on
-- every startup (existing rows) and seeds fresh databases.
-- Images: real product photos (Pexels, free license) in
-- /assets/images/products/
-- ============================================================

INSERT INTO products
(id, name, description, category, price, stock, rating, image_url, created_at)
VALUES
(1,  'Floral Summer Dress',      'Lightweight floral-print knee-length dress, breathable cotton blend, perfect for day outs.', 'Women''s Dresses', 1299.00, 40, 4.6, '/assets/images/products/dress-floral.jpg', NOW()),
(2,  'Classic Denim Dress',      'Timeless denim midi dress with side pockets and button front.',                           'Women''s Dresses', 1699.00, 25, 4.4, '/assets/images/products/dress-denim.jpg',  NOW()),
(3,  'Elegant Party Gown',       'Floor-length sequin gown for parties and special occasions.',                               'Women''s Dresses', 3299.00, 12, 4.8, '/assets/images/products/dress-gown.jpg',   NOW()),
(4,  'Men''s Casual Shirt',      'Soft cotton check shirt, smart casual fit for men.',                                        'Men''s Wear',      1099.00, 50, 4.3, '/assets/images/products/shirt-casual.jpg', NOW()),
(5,  'Skinny Fit Jeans',         'High-stretch skinny jeans with a comfortable waistband.',                                    'Men''s Wear',      1599.00, 60, 4.5, '/assets/images/products/jeans-skinny.jpg',  NOW()),
(6,  'Floral Wrap Skirt',        'Trendy midi wrap skirt with elastic waist and vibrant print.',                              'Western Wear',     999.00,  35, 4.2, '/assets/images/products/skirt-floral.jpg', NOW()),
(7,  'Classic Denim Jacket',     'Versatile denim jacket for a stylish western look.',                                         'Western Wear',     1999.00, 20, 4.6, '/assets/images/products/jacket-denim.jpg', NOW()),
(8,  'Embroidered Sherwani',     'Royal embroidered sherwani for festive and wedding occasions.',                              'Traditional Wear', 4999.00, 8,  4.9, '/assets/images/products/sherwani.jpg',     NOW()),
(9,  'Designer Anarkali Kurti',  'Floor-length Anarkali kurti with chikankari embroidery.',                                    'Kurtis',           1899.00, 30, 4.7, '/assets/images/products/anarkali.jpg',     NOW()),
(10, 'Casual Printed Kurti',     'Daily-wear printed kurti in soft rayon fabric.',                                            'Kurtis',           899.00,  45, 4.3, '/assets/images/products/kurti-casual.jpg', NOW()),
(11, 'Banarasi Silk Saree',      'Handwoven Banarasi silk saree with zari work and matching blouse piece.',                     'Sarees',           5999.00, 10, 4.9, '/assets/images/products/saree-banarasi.jpg', NOW()),
(12, 'Cotton Chanderi Saree',    'Lightweight Chanderi cotton saree for everyday elegance.',                                   'Sarees',           2399.00, 18, 4.5, '/assets/images/products/saree-chanderi.jpg', NOW()),
(13, 'Blush & Bronzer Kit',      'Smooth blendable blush and bronzer compact for a natural glow.',                             'Cosmetics',        699.00,  55, 4.4, '/assets/images/products/cosmetics-kit.jpg', NOW()),
(14, 'Matte Red Lipstick',       'Long-lasting matte red lipstick with a creamy, non-drying formula.',                         'Makeup',           499.00,  80, 4.7, '/assets/images/products/lipstick-red.jpg',  NOW()),
(15, 'Liquid Foundation',        'Full-coverage liquid foundation with SPF 20, for all skin types.',                           'Makeup',           799.00,  65, 4.5, '/assets/images/products/foundation.jpg',   NOW()),
(16, 'Volume Mascara',           'Smudge-proof volumizing mascara for dramatic lashes.',                                       'Makeup',           399.00,  90, 4.4, '/assets/images/products/mascara.jpg',      NOW()),
(17, 'Gentle Face Wash',         'pH-balanced herbal face wash that deep cleans without dryness.',                              'Skincare',         299.00,  100,4.6, '/assets/images/products/facewash.jpg',     NOW()),
(18, 'SPF 50 Sunscreen',         'Broad-spectrum sunscreen lotion, water resistant and non-greasy.',                            'Skincare',         449.00,  70, 4.6, '/assets/images/products/sunscreen.jpg',    NOW()),
(19, 'Herbal Shampoo',           'Nourishing herbal shampoo with natural extracts for silky hair.',                            'Skincare',         349.00,  85, 4.3, '/assets/images/products/shampoo.jpg',      NOW()),
(20, 'Leather Handbag',          'Chic premium handbag with zip compartments and adjustable strap.',                           'Accessories',      1899.00, 22, 4.7, '/assets/images/products/handbag-bag.jpg',  NOW()),
(21, 'Gold Plated Earrings',     'Elegant gold-plated jhumka earrings, tarnish resistant.',                                    'Accessories',      599.00,  48, 4.5, '/assets/images/products/earrings.jpg',     NOW()),
(22, 'Statement Necklace',       'Trendy layered statement necklace for party looks.',                                        'Accessories',       749.00, 33, 4.4, '/assets/images/products/necklace.jpg',     NOW())
AS new
ON DUPLICATE KEY UPDATE image_url = new.image_url;