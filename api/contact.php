<?php
/**
 * Legacy Donation API - Contact Endpoint
 * Handles contact form submissions
 */

require_once  'db_connect.php';
require_once 'GmailSMTPMailer.php';

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '/';
$path_parts = explode('/', trim($path_info, '/'));

// Route handling
switch ($method) {
    case 'GET':
        if (empty($path_parts[0]) || $path_parts[0] === '') {
            // Get all contact messages
            getContactMessages($pdo);
        } elseif (is_numeric($path_parts[0])) {
            // Get specific contact message
            getContactMessage($pdo, (int)$path_parts[0]);
        }
        break;
        
    case 'POST':
        createContactMessage($pdo);
        break;
        
    case 'PUT':
        if (is_numeric($path_parts[0])) {
            updateContactMessage($pdo, (int)$path_parts[0]);
        } else {
            sendResponse(false, "Invalid contact message ID");
        }
        break;
        
    default:
        sendResponse(false, "Method not allowed");
}

/**
 * Get all contact messages
 */
function getContactMessages($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT id, name, email, phone, subject, message, status, created_at
            FROM contact_messages 
            ORDER BY created_at DESC
        ");
        
        $messages = $stmt->fetchAll();
        sendResponse(true, "Contact messages retrieved successfully", $messages);
        
    } catch (PDOException $e) {
        sendResponse(false, "Failed to retrieve contact messages: " . $e->getMessage());
    }
}

/**
 * Get specific contact message by ID
 */
function getContactMessage($pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, name, email, phone, subject, message, status, created_at
            FROM contact_messages 
            WHERE id = ?
        ");
        
        $stmt->execute([$id]);
        $message = $stmt->fetch();
        
        if ($message) {
            sendResponse(true, "Contact message retrieved successfully", $message);
        } else {
            sendResponse(false, "Contact message not found");
        }
        
    } catch (PDOException $e) {
        sendResponse(false, "Failed to retrieve contact message: " . $e->getMessage());
    }
}

/**
 * Create new contact message
 */
function createContactMessage($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendResponse(false, "Invalid JSON data");
        }
        
        // Validate required fields
        validateRequiredFields(['name', 'email', 'subject', 'message'], $input);
        
        // Sanitize and validate input
        $name = trim($input['name']);
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $subject = trim($input['subject']);
        $message = trim($input['message']);
        
        if (!$email) {
            sendResponse(false, "Invalid email address");
        }
        
        // Insert contact message
        $stmt = $pdo->prepare("
            INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'new', NOW())
        ");
        
        $stmt->execute([$name, $email, $phone, $subject, $message]);
        $message_id = $pdo->lastInsertId();

        // Send email notification
        try {
            $mailer = new GmailSMTPMailer();
            $emailSubject = "New Contact Form Submission: " . $subject;
            $emailMessage = "Dear Admin,\n\n";
            $emailMessage .= "You have received a new contact form submission.\n\n";
            $emailMessage .= "Contact Details:\n";
            $emailMessage .= "Name: " . $name . "\n";
            $emailMessage .= "Email: " . $email . "\n";
            $emailMessage .= "Phone: " . ($phone ?: 'Not provided') . "\n";
            $emailMessage .= "Subject: " . $subject . "\n";
            $emailMessage .= "Message:\n" . $message . "\n\n";
            $emailMessage .= "Please respond to this inquiry as soon as possible.\n\n";
            $emailMessage .= "Best regards,\n";
            $emailMessage .= "Legacy Donation System";

            $emailSent = $mailer->sendEmail('melakahinfotechsolutions@gmail.com', $emailSubject, $emailMessage);

            if (!$emailSent) {
                // Log but don't fail the request
                error_log("Failed to send contact email to admin");
            }
        } catch (Exception $e) {
            error_log("Exception sending contact email: " . $e->getMessage());
        }

        sendResponse(true, "Contact message sent successfully", ['message_id' => $message_id]);
        
    } catch (PDOException $e) {
        sendResponse(false, "Failed to send contact message: " . $e->getMessage());
    }
}

/**
 * Update contact message
 */
function updateContactMessage($pdo, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendResponse(false, "Invalid JSON data");
        }
        
        $updates = [];
        $params = [];
        
        // Build dynamic update query
        if (isset($input['status'])) {
            $statuses = ['new', 'read', 'responded'];
            if (in_array($input['status'], $statuses)) {
                $updates[] = "status = ?";
                $params[] = $input['status'];
            }
        }
        
        if (empty($updates)) {
            sendResponse(false, "No valid fields to update");
        }
        
        $params[] = $id; // Add ID for WHERE clause
        
        $sql = "UPDATE contact_messages SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, "Contact message updated successfully");
        } else {
            sendResponse(false, "Contact message not found or no changes made");
        }
        
    } catch (PDOException $e) {
        sendResponse(false, "Failed to update contact message: " . $e->getMessage());
    }
}
?>