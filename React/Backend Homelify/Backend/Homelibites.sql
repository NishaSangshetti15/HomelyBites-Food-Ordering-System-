CREATE DATABASE IF NOT EXISTS HomelyBites_Simplified;
USE HomelyBites_Simplified;

-- 1. Customers table
CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. HomeChefs table (Simplified: focus on core business info)
CREATE TABLE HomeChefs (
    chef_id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE, -- Must be approved by admin
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DeliveryPersonnel table
CREATE TABLE DeliveryPersonnel (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    status ENUM('Available', 'On Delivery', 'Offline') DEFAULT 'Offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Addresses table (Used by both customers for delivery and chefs for pickup)
CREATE TABLE Addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('Customer', 'Chef') NOT NULL,
    entity_id INT NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    house_no VARCHAR(20),
    label VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    INDEX idx_address_pincode (pincode)
);

-- 5. Service Areas (Defining where a chef delivers)
CREATE TABLE ServiceAreas (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (chef_id) REFERENCES HomeChefs(chef_id) ON DELETE CASCADE
);

-- 6. MenuItems table
CREATE TABLE MenuItems (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chef_id) REFERENCES HomeChefs(chef_id) ON DELETE CASCADE
);

-- 7. Orders table (The central transaction table)
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    chef_id INT NOT NULL,
    delivery_address_id INT NOT NULL,
    delivery_person_id INT, -- NULL initially, assigned later
    status ENUM('Placed', 'Accepted', 'Preparing', 'Ready', 'Picked Up', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Placed',
    grand_total DECIMAL(10, 2) NOT NULL,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (chef_id) REFERENCES HomeChefs(chef_id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_person_id) REFERENCES DeliveryPersonnel(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_address_id) REFERENCES Addresses(address_id) ON DELETE RESTRICT
);

-- 8. Order Items table (What was in the order)
CREATE TABLE OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES MenuItems(item_id) ON DELETE RESTRICT
);

-- 9. Feedback table
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
);

drop database HomelyBites_Simplified;