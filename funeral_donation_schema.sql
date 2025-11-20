-- Funeral Donation Platform Database Schema
-- Compatible with most database systems

-- Users table for email-based authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT 0,
    verification_code VARCHAR(6),
    verification_expires_at DATETIME,
    login_code VARCHAR(6),
    login_code_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funeral announcements table
CREATE TABLE funeral_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_user_id INTEGER NOT NULL,
    deceased_name VARCHAR(255) NOT NULL,
    deceased_birth_date DATE,
    deceased_death_date DATE,
    funeral_date DATETIME,
    funeral_location VARCHAR(500),
    ceremony_type VARCHAR(50) DEFAULT 'burial',
    family_message TEXT,
    goal_amount DECIMAL(10,2),
    raised_amount DECIMAL(10,2) DEFAULT 0,
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_bank_account VARCHAR(100),
    beneficiary_mobile_money VARCHAR(20),
    beneficiary_account_type VARCHAR(20) NOT NULL,
    announcement_start_date DATE NOT NULL,
    announcement_end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT 0,
    closed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File uploads for funeral announcements
CREATE TABLE announcement_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_purpose VARCHAR(50) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES funeral_announcements(id) ON DELETE CASCADE
);

-- Donations table
CREATE TABLE donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    donor_message TEXT,
    is_anonymous BOOLEAN DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    donated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES funeral_announcements(id) ON DELETE CASCADE
);

-- Verification codes tracking
CREATE TABLE verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    code_type VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for security
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample data for testing
INSERT INTO users (email, full_name, phone) VALUES 
('john.doe@email.com', 'John Doe', '+1234567890'),
('jane.smith@email.com', 'Jane Smith', '+0987654321');

-- Sample funeral announcement
INSERT INTO funeral_announcements (
    creator_user_id, deceased_name, deceased_birth_date, deceased_death_date,
    funeral_date, funeral_location, ceremony_type, family_message,
    goal_amount, beneficiary_name, beneficiary_bank_account, beneficiary_account_type,
    announcement_start_date, announcement_end_date
) VALUES 
(
    1, 'Robert Johnson', '1950-05-15', '2025-11-10',
    '2025-11-20 10:00:00', 'Sunset Cemetery, Main Street',
    'burial', 'Our beloved father who will be greatly missed by all who knew him.',
    10000.00, 'John Johnson', '1234567890', 'bank',
    '2025-11-12', '2025-12-12'
);