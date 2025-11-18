<?php
/**
 * Legacy Donation Database Connection
 * Connects to MySQL database with error handling
 */

$dbhost = "localhost"; 
$dbport = "3306";
$dbuser = "dbuser";          
$dbpass = "kilnpassword1";   
$dbname = "Donations";

try {
    $pdo = new PDO(
        "mysql:host=$dbhost;port=$dbport;dbname=$dbname;charset=utf8mb4", 
        $dbuser, 
        $dbpass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Test the connection immediately
    $pdo->query("SELECT 1");
    
    // Set headers for JSON response
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

/**
 * Helper function to send JSON response
 */
function sendResponse($success, $message = '', $data = null) {
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    if ($data !== null) {
        $response["data"] = $data;
    }
    
    echo json_encode($response);
    exit;
}

/**
 * Helper function to validate required fields
 */
function validateRequiredFields($required_fields, $data) {
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        sendResponse(false, "Missing required fields: " . implode(', ', $missing_fields));
    }
    
    return true;
}

/**
 * Get donation statistics
 */
function getDonationStatistics($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                COUNT(*) as total_donations,
                COALESCE(SUM(amount), 0) as total_amount
            FROM donations 
            WHERE status = 'completed'
        ");
        
        $stats = $stmt->fetch();
        
        // Get recent donations
        $stmt = $pdo->query("
            SELECT id, amount, donor_name, donation_type, created_at
            FROM donations 
            WHERE status = 'completed'
            ORDER BY created_at DESC 
            LIMIT 5
        ");
        
        $recent_donations = $stmt->fetchAll();
        
        return [
            'total_donations' => (int)$stats['total_donations'],
            'total_amount' => (float)$stats['total_amount'],
            'recent_donations' => $recent_donations
        ];
        
    } catch (PDOException $e) {
        sendResponse(false, "Failed to fetch statistics: " . $e->getMessage());
    }
}
?>
