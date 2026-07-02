-- Migration Script to Add password_hash to DeliveryPersonnel Table
-- Run this if you get "Error creating account" when signing up as delivery person

-- Add password_hash column if it doesn't exist
ALTER TABLE DeliveryPersonnel 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) AFTER phone_number;

-- Verify the table structure
DESCRIBE DeliveryPersonnel;

-- If you need to drop and recreate the table (only if you have no data):
-- DROP TABLE DeliveryPersonnel;
-- Then run the CREATE TABLE statement from Homelibites.sql
