-- Test Data for HomelyBites Application
-- Run this script to populate test data for development

USE HomelyBites_Simplified;

-- Insert test chefs (IMPORTANT: is_active must be TRUE to show in browse)
INSERT INTO HomeChefs (business_name, is_active, email, password_hash, phone_number, average_rating) VALUES
('Chef Raj Kitchen', TRUE, 'raj@homely.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9876543210', 4.5),
('Spice House Delights', TRUE, 'spice@homely.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9876543211', 4.3),
('Homestyle Cooking', TRUE, 'homestyle@homely.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9876543212', 4.7),
('Sweet Treats Bakery', TRUE, 'bakery@homely.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9876543213', 4.2),
('Desi DabaWala', TRUE, 'desi@homely.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9876543214', 4.6);

-- Insert menu items for Chef Raj Kitchen (chef_id = 1)
INSERT INTO MenuItems (chef_id, name, description, base_price, image_url, is_available) VALUES
(1, 'Butter Chicken', 'Creamy butter chicken with rice', 280, 'https://via.placeholder.com/200?text=Butter+Chicken', TRUE),
(1, 'Palak Paneer', 'Spinach and cottage cheese curry', 250, 'https://via.placeholder.com/200?text=Palak+Paneer', TRUE),
(1, 'Biryani', 'Fragrant basmati rice with meat', 300, 'https://via.placeholder.com/200?text=Biryani', TRUE),
(1, 'Naan Bread', 'Fresh baked traditional naan', 50, 'https://via.placeholder.com/200?text=Naan', TRUE),
(1, 'Chole Bhature', 'Spicy chickpea curry with fried bread', 180, 'https://via.placeholder.com/200?text=Chole+Bhature', TRUE);

-- Insert menu items for Spice House Delights (chef_id = 2)
INSERT INTO MenuItems (chef_id, name, description, base_price, image_url, is_available) VALUES
(2, 'Tandoori Chicken', 'Grilled marinated chicken', 320, 'https://via.placeholder.com/200?text=Tandoori+Chicken', TRUE),
(2, 'Biryani Special', 'Premium biryani with vegetables', 350, 'https://via.placeholder.com/200?text=Biryani+Special', TRUE),
(2, 'Paneer Tikka', 'Grilled cottage cheese cubes', 280, 'https://via.placeholder.com/200?text=Paneer+Tikka', TRUE),
(2, 'Samosa', 'Crispy fried pastry with filling', 80, 'https://via.placeholder.com/200?text=Samosa', TRUE),
(2, 'Raita', 'Yogurt and cucumber sauce', 60, 'https://via.placeholder.com/200?text=Raita', TRUE);

-- Insert menu items for Homestyle Cooking (chef_id = 3)
INSERT INTO MenuItems (chef_id, name, description, base_price, image_url, is_available) VALUES
(3, 'Dal Makhani', 'Creamy lentil curry', 220, 'https://via.placeholder.com/200?text=Dal+Makhani', TRUE),
(3, 'Rajma Rice', 'Red kidney beans with rice', 200, 'https://via.placeholder.com/200?text=Rajma+Rice', TRUE),
(3, 'Aloo Gobi', 'Potato and cauliflower curry', 180, 'https://via.placeholder.com/200?text=Aloo+Gobi', TRUE),
(3, 'Roti', 'Whole wheat flatbread', 15, 'https://via.placeholder.com/200?text=Roti', TRUE),
(3, 'Sabzi Pulao', 'Rice with vegetables', 240, 'https://via.placeholder.com/200?text=Sabzi+Pulao', TRUE);

-- Insert menu items for Sweet Treats Bakery (chef_id = 4)
INSERT INTO MenuItems (chef_id, name, description, base_price, image_url, is_available) VALUES
(4, 'Chocolate Cake', 'Moist chocolate cake slice', 150, 'https://via.placeholder.com/200?text=Chocolate+Cake', TRUE),
(4, 'Gulab Jamun', 'Traditional milk solid dumplings', 120, 'https://via.placeholder.com/200?text=Gulab+Jamun', TRUE),
(4, 'Cupcakes', 'Assorted flavored cupcakes', 100, 'https://via.placeholder.com/200?text=Cupcakes', TRUE),
(4, 'Brownie', 'Fudgy chocolate brownie', 80, 'https://via.placeholder.com/200?text=Brownie', TRUE),
(4, 'Cookies', 'Chocolate chip cookies', 60, 'https://via.placeholder.com/200?text=Cookies', TRUE);

-- Insert menu items for Desi DabaWala (chef_id = 5)
INSERT INTO MenuItems (chef_id, name, description, base_price, image_url, is_available) VALUES
(5, 'Lunch Box Special', 'Complete meal with curry and rice', 350, 'https://via.placeholder.com/200?text=Lunch+Box+Special', TRUE),
(5, 'Simple Rice & Dal', 'Basic but delicious comfort food', 150, 'https://via.placeholder.com/200?text=Rice+and+Dal', TRUE),
(5, 'Vegetable Curry', 'Mixed vegetables in gravy', 180, 'https://via.placeholder.com/200?text=Vegetable+Curry', TRUE),
(5, 'Pickle & Papad', 'Homemade pickle and fried papad', 40, 'https://via.placeholder.com/200?text=Pickle+and+Papad', TRUE),
(5, 'Khichdi', 'Light and nutritious rice-lentil dish', 160, 'https://via.placeholder.com/200?text=Khichdi', TRUE);

-- Insert sample customer
INSERT INTO Customers (first_name, last_name, email, password_hash, phone_number) VALUES
('John', 'Doe', 'john@example.com', '$2b$10$JL9XTR9AByVyKHVKkN0CVu0tnZS6GFNGJVpF0R5LN0rFKXuJ7Tjn.', '9999999999');

-- Insert service areas for chefs (pincode 560001 is Bangalore)
INSERT INTO ServiceAreas (chef_id, pincode) VALUES
(1, '560001'),
(1, '560002'),
(2, '560001'),
(2, '560003'),
(3, '560001'),
(4, '560001'),
(5, '560002');

-- Insert sample address for customer (pincode 560001)
INSERT INTO Addresses (entity_type, entity_id, street, city, pincode, house_no, label) VALUES
('Customer', 1, '123 Main Street', 'Bangalore', '560001', '42', 'Home');

-- Note: Password hash above is for password 'password123' using bcrypt
-- You can use this password to test login with email: john@example.com
