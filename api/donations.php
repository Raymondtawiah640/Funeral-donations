<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

class DonationAPI {
    private $pdo;
    private $upload_dir;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        $this->upload_dir = 'uploads/';
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
    }
    
    // Create a new donation
    public function createDonation() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!$input || !isset($input['announcement_id']) || !isset($input['donor_name']) || 
            !isset($input['donor_email']) || !isset($input['amount']) || !isset($input['payment_method'])) {
            return $this->errorResponse("Required fields: announcement_id, donor_name, donor_email, amount, payment_method");
        }
        
        $announcement_id = $input['announcement_id'];
        $donor_name = trim($input['donor_name']);
        $donor_email = filter_var(trim($input['donor_email']), FILTER_VALIDATE_EMAIL);
        $amount = filter_var($input['amount'], FILTER_VALIDATE_FLOAT);
        $payment_method = $input['payment_method'];
        
        if (!$announcement_id || !$donor_name || !$donor_email || !$amount || !$payment_method) {
            return $this->errorResponse("All required fields must be provided with valid values");
        }
        
        if ($amount <= 0) {
            return $this->errorResponse("Donation amount must be greater than zero");
        }
        
        // Validate payment method
        $allowed_methods = ['bank_transfer', 'mobile_money', 'card'];
        if (!in_array($payment_method, $allowed_methods)) {
            return $this->errorResponse("Invalid payment method. Allowed: " . implode(', ', $allowed_methods));
        }
        
        try {
            // Check if announcement exists and is still accepting donations
            $announcement = $this->getAnnouncementStatus($announcement_id);
            if (!$announcement) {
                return $this->errorResponse("Funeral announcement not found");
            }
            
            if ($announcement['status'] !== 'active' && $announcement['status'] !== 'grace_period') {
                return $this->errorResponse("This funeral announcement is no longer accepting donations");
            }
            
            // Generate a simple payment reference
            $payment_reference = 'DON_' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12));
            
            // Insert donation
            $sql = "
                INSERT INTO donations (
                    announcement_id, donor_name, donor_email, donor_phone, amount,
                    donor_message, is_anonymous, payment_method, payment_reference, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("issdsisss",
                $announcement_id,
                $donor_name,
                $donor_email,
                isset($input['donor_phone']) ? trim($input['donor_phone']) : null,
                $amount,
                isset($input['donor_message']) ? trim($input['donor_message']) : null,
                isset($input['is_anonymous']) ? (int)$input['is_anonymous'] : 0,
                $payment_method,
                $payment_reference
            );
            
            if ($stmt->execute()) {
                $donation_id = $this->pdo->lastInsertId();
                
                // Update announcement raised amount
                $this->updateAnnouncementRaisedAmount($announcement_id);
                
                // Log the donation
                $this->logDonationActivity($donation_id, $announcement_id, 'donation_created');
                
                return $this->successResponse([
                    "message" => "Donation recorded successfully",
                    "donation_id" => $donation_id,
                    "payment_reference" => $payment_reference,
                    "announcement_details" => [
                        "deceased_name" => $announcement['deceased_name'],
                        "beneficiary_name" => $announcement['beneficiary_name'],
                        "beneficiary_account" => $announcement['beneficiary_account_type'] === 'bank' 
                            ? $announcement['beneficiary_bank_account'] 
                            : $announcement['beneficiary_mobile_money']
                    ]
                ]);
            }
            
            return $this->errorResponse("Failed to process donation");
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to create donation: " . $e->getMessage());
        }
    }
    
    // Get donations for an announcement
    public function getDonations($announcement_id) {
        try {
            // Check if user owns this announcement or if it's a public view
            $session_token = $this->getAuthToken();
            $user_id = $session_token ? $this->getUserIdFromToken($session_token) : null;
            
            if (!$this->isAnnouncementPublic($announcement_id) && 
                !$this->isAnnouncementOwner($announcement_id, $user_id)) {
                return $this->errorResponse("Access denied or announcement not found");
            }
            
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
            $offset = isset($_GET['offset']) ? max((int)$_GET['offset'], 0) : 0;
            
            $sql = "
                SELECT 
                    id, donor_name, amount, donor_message, donated_at,
                    payment_method, is_anonymous
                FROM donations 
                WHERE announcement_id = ? AND status = 'completed'
                ORDER BY donated_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("iii", $announcement_id, $limit, $offset);
            $stmt->execute();
            $donations = $stmt->fetchAll();
            
            // Get total count for pagination
            $count_sql = "SELECT COUNT(*) as total FROM donations WHERE announcement_id = ? AND status = 'completed'";
            $count_stmt = $this->pdo->prepare($count_sql);
            $count_stmt->bind_param("i", $announcement_id);
            $count_stmt->execute();
            $total = $count_stmt->fetch()['total'];
            
            return $this->successResponse([
                "donations" => $donations,
                "pagination" => [
                    "total" => (int)$total,
                    "limit" => $limit,
                    "offset" => $offset,
                    "has_more" => ($offset + $limit) < $total
                ]
            ]);
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch donations: " . $e->getMessage());
        }
    }
    
    // Get donation statistics
    public function getDonationStats($announcement_id) {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_donations,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_amount,
                    MIN(amount) as min_amount,
                    MAX(amount) as max_amount
                FROM donations 
                WHERE announcement_id = ? AND status = 'completed'
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $announcement_id);
            $stmt->execute();
            $stats = $stmt->fetch();
            
            return $this->successResponse([
                "total_donations" => (int)$stats['total_donations'],
                "total_amount" => (float)$stats['total_amount'],
                "avg_amount" => (float)$stats['avg_amount'],
                "min_amount" => (float)$stats['min_amount'],
                "max_amount" => (float)$stats['max_amount']
            ]);
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch donation statistics: " . $e->getMessage());
        }
    }
    
    // Helper methods
    private function getAnnouncementStatus($announcement_id) {
        try {
            $sql = "
                SELECT 
                    deceased_name, beneficiary_name, beneficiary_bank_account, 
                    beneficiary_mobile_money, beneficiary_account_type,
                    CASE 
                        WHEN is_closed = 1 THEN 'closed'
                        WHEN CURRENT_DATE > DATE_ADD(announcement_end_date, INTERVAL 5 DAY) THEN 'expired'
                        WHEN CURRENT_DATE <= announcement_end_date THEN 'active'
                        ELSE 'grace_period'
                    END as status
                FROM funeral_announcements 
                WHERE id = ?
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $announcement_id);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            return null;
        }
    }
    
    private function updateAnnouncementRaisedAmount($announcement_id) {
        try {
            $sql = "
                UPDATE funeral_announcements 
                SET raised_amount = (
                    SELECT COALESCE(SUM(amount), 0) 
                    FROM donations 
                    WHERE announcement_id = ? AND status = 'completed'
                )
                WHERE id = ?
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("ii", $announcement_id, $announcement_id);
            $stmt->execute();
        } catch (PDOException $e) {
            // Log silently
        }
    }
    
    private function isAnnouncementPublic($announcement_id) {
        try {
            $sql = "
                SELECT COUNT(*) as count
                FROM funeral_announcements 
                WHERE id = ? AND (is_closed = 0 OR CURRENT_DATE <= DATE_ADD(announcement_end_date, INTERVAL 5 DAY))
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $announcement_id);
            $stmt->execute();
            $result = $stmt->fetch();
            
            return $result['count'] > 0;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    private function isAnnouncementOwner($announcement_id, $user_id) {
        if (!$user_id) return false;
        
        try {
            $sql = "SELECT COUNT(*) as count FROM funeral_announcements WHERE id = ? AND creator_user_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("ii", $announcement_id, $user_id);
            $stmt->execute();
            $result = $stmt->fetch();
            
            return $result['count'] > 0;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    private function getAuthToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (strpos($auth, 'Bearer ') === 0) {
                return substr($auth, 7);
            }
        }
        return null;
    }
    
    private function getUserIdFromToken($token) {
        // Simplified - in production, validate against database
        if (strlen($token) === 64) {
            return 1; // Demo user ID
        }
        return null;
    }
    
    private function logDonationActivity($donation_id, $announcement_id, $action) {
        try {
            $sql = "INSERT INTO activity_logs (action, details, ip_address) VALUES (?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $details = "Donation ID: $donation_id, Announcement ID: $announcement_id";
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $stmt->bind_param("sss", $action, $details, $ip_address);
            $stmt->execute();
        } catch (PDOException $e) {
            // Log silently
        }
    }
    
    private function successResponse($data) {
        return json_encode([
            "success" => true,
            "data" => $data
        ]);
    }
    
    private function errorResponse($message) {
        return json_encode([
            "success" => false,
            "error" => $message
        ]);
    }
}

// Handle the request
$donation_api = new DonationAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        echo $donation_api->createDonation();
        break;
    case 'GET':
        if ($action === 'stats' && isset($_GET['announcement_id'])) {
            echo $donation_api->getDonationStats($_GET['announcement_id']);
        } elseif (isset($_GET['announcement_id'])) {
            echo $donation_api->getDonations($_GET['announcement_id']);
        } else {
            echo json_encode(["success" => false, "error" => "announcement_id required"]);
        }
        break;
    default:
        echo json_encode([
            "success" => false,
            "error" => "Method not allowed"
        ]);
}
?>