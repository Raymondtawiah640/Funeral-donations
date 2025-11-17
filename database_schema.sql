-- Legacy Donation Database Schema
-- Run this SQL script to create the required tables

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(20),
    donation_type ENUM('one-time', 'monthly') DEFAULT 'one-time',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (donor_email),
    INDEX idx_created (created_at)
);

-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Create organizations table (for future use)
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create donation campaigns table (for future use)
CREATE TABLE IF NOT EXISTS donation_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(10,2),
    raised_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    organization_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Insert sample data (optional)
INSERT INTO organizations (name, description, contact_email, contact_phone) VALUES
('Legacy Donation', 'A platform for funeral donations', 'info@legacydonation.org', '(555) 123-4567');

INSERT INTO donation_campaigns (title, description, goal_amount, raised_amount, start_date, end_date, organization_id) VALUES
('Family Support Fund', 'Help families during their time of need', 50000.00, 12300.00, '2025-01-01', '2025-12-31', 1);

-- Create views for easier reporting
CREATE VIEW donation_summary AS
SELECT 
    DATE(created_at) as donation_date,
    COUNT(*) as donation_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM donations 
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY donation_date DESC;

-- Create indexes for better performance
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_type ON donations(donation_type);
CREATE INDEX idx_contact_status ON contact_messages(status);