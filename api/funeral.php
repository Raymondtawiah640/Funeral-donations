<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

class FuneralAPI {
    private $pdo;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    
    // Get all active funeral announcements (public endpoint)
    public function getAnnouncements() {
        try {
            $current_date = date('Y-m-d');
            $sql = "
                SELECT 
                    fa.*,
                    u.full_name as creator_name,
                    u.email as creator_email,
                    COUNT(d.id) as donation_count,
                    SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END) as total_raised,
                    CASE 
                        WHEN fa.is_closed = 1 THEN 'closed'
                        WHEN CURRENT_DATE > DATE_ADD(fa.announcement_end_date, INTERVAL 5 DAY) THEN 'expired'
                        WHEN CURRENT_DATE <= fa.announcement_end_date THEN 'active'
                        ELSE 'grace_period'
                    END as status
                FROM funeral_announcements fa
                LEFT JOIN users u ON fa.creator_user_id = u.id
                LEFT JOIN donations d ON fa.id = d.announcement_id
                WHERE (fa.is_closed = 0 OR CURRENT_DATE <= DATE_ADD(fa.announcement_end_date, INTERVAL 5 DAY))
                GROUP BY fa.id
                ORDER BY 
                    CASE 
                        WHEN fa.is_closed = 1 THEN 3
                        WHEN CURRENT_DATE > DATE_ADD(fa.announcement_end_date, INTERVAL 5 DAY) THEN 2
                        ELSE 1
                    END ASC,
                    fa.created_at DESC
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $announcements = $stmt->fetchAll();
            
            // Get files for each announcement
            foreach ($announcements as &$announcement) {
                $files_sql = "SELECT * FROM announcement_files WHERE announcement_id = ? ORDER BY upload_purpose";
                $files_stmt = $this->pdo->prepare($files_sql);
                $files_stmt->bind_param("i", $announcement['id']);
                $files_stmt->execute();
                $announcement['files'] = $files_stmt->fetchAll();
            }
            
            return $this->successResponse($announcements);
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch announcements: " . $e->getMessage());
        }
    }
    
    // Get single funeral announcement by ID
    public function getAnnouncement($id) {
        try {
            $sql = "
                SELECT 
                    fa.*,
                    u.full_name as creator_name,
                    u.email as creator_email,
                    COUNT(d.id) as donation_count,
                    SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END) as total_raised,
                    CASE 
                        WHEN fa.is_closed = 1 THEN 'closed'
                        WHEN CURRENT_DATE > DATE_ADD(fa.announcement_end_date, INTERVAL 5 DAY) THEN 'expired'
                        WHEN CURRENT_DATE <= fa.announcement_end_date THEN 'active'
                        ELSE 'grace_period'
                    END as status
                FROM funeral_announcements fa
                LEFT JOIN users u ON fa.creator_user_id = u.id
                LEFT JOIN donations d ON fa.id = d.announcement_id
                WHERE fa.id = ?
                GROUP BY fa.id
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $announcement = $stmt->fetch();
            
            if (!$announcement) {
                return $this->errorResponse("Announcement not found");
            }
            
            // Get files for the announcement
            $files_sql = "SELECT * FROM announcement_files WHERE announcement_id = ? ORDER BY upload_purpose";
            $files_stmt = $this->pdo->prepare($files_sql);
            $files_stmt->bind_param("i", $id);
            $files_stmt->execute();
            $announcement['files'] = $files_stmt->fetchAll();
            
            // Get recent donations (limit to 10 for performance)
            $donations_sql = "SELECT * FROM donations WHERE announcement_id = ? AND status = 'completed' ORDER BY donated_at DESC LIMIT 10";
            $donations_stmt = $this->pdo->prepare($donations_sql);
            $donations_stmt->bind_param("i", $id);
            $donations_stmt->execute();
            $announcement['recent_donations'] = $donations_stmt->fetchAll();
            
            return $this->successResponse($announcement);
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch announcement: " . $e->getMessage());
        }
    }
    
    // Create new funeral announcement
    public function createAnnouncement() {
        // Simple session check (in production, use proper authentication)
        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = [
            'deceased_name', 'family_message', 'beneficiary_name', 
            'beneficiary_account_type', 'announcement_start_date', 'announcement_end_date'
        ];
        
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                return $this->errorResponse("Field '$field' is required");
            }
        }
        
        try {
            // Validate dates
            $start_date = date('Y-m-d', strtotime($input['announcement_start_date']));
            $end_date = date('Y-m-d', strtotime($input['announcement_end_date']));
            
            if ($start_date >= $end_date) {
                return $this->errorResponse("End date must be after start date");
            }
            
            // Get user ID from session token (simplified for demo)
            $user_id = $this->getUserIdFromToken($session_token);
            if (!$user_id) {
                return $this->errorResponse("Invalid authentication token");
            }
            
            // Validate account type and account details
            if ($input['beneficiary_account_type'] === 'bank' && empty($input['beneficiary_bank_account'])) {
                return $this->errorResponse("Bank account number is required for bank account type");
            }
            
            if ($input['beneficiary_account_type'] === 'mobile_money' && empty($input['beneficiary_mobile_money'])) {
                return $this->errorResponse("Mobile money number is required for mobile money type");
            }
            
            $sql = "
                INSERT INTO funeral_announcements (
                    creator_user_id, deceased_name, deceased_birth_date, deceased_death_date,
                    funeral_date, funeral_location, ceremony_type, family_message,
                    goal_amount, beneficiary_name, beneficiary_bank_account, beneficiary_mobile_money,
                    beneficiary_account_type, announcement_start_date, announcement_end_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";
            
            $stmt = $this->pdo->prepare($sql);
            
            $stmt->bind_param("issssssdsssssss", 
                $user_id,
                $input['deceased_name'],
                isset($input['deceased_birth_date']) ? date('Y-m-d', strtotime($input['deceased_birth_date'])) : null,
                isset($input['deceased_death_date']) ? date('Y-m-d', strtotime($input['deceased_death_date'])) : null,
                isset($input['funeral_date']) ? $input['funeral_date'] : null,
                isset($input['funeral_location']) ? $input['funeral_location'] : null,
                isset($input['ceremony_type']) ? $input['ceremony_type'] : 'burial',
                $input['family_message'],
                isset($input['goal_amount']) ? $input['goal_amount'] : null,
                $input['beneficiary_name'],
                $input['beneficiary_bank_account'] ?? null,
                $input['beneficiary_mobile_money'] ?? null,
                $input['beneficiary_account_type'],
                $start_date,
                $end_date
            );
            
            if ($stmt->execute()) {
                $announcement_id = $this->pdo->lastInsertId();
                
                // Log activity
                $this->logActivity($user_id, 'create_announcement', "Created announcement ID: $announcement_id");
                
                return $this->successResponse([
                    "message" => "Funeral announcement created successfully",
                    "announcement_id" => $announcement_id
                ]);
            }
            
            return $this->errorResponse("Failed to create announcement");
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to create announcement: " . $e->getMessage());
        }
    }
    
    // Update funeral announcement
    public function updateAnnouncement($id) {
        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }
        
        $user_id = $this->getUserIdFromToken($session_token);
        if (!$user_id) {
            return $this->errorResponse("Invalid authentication token");
        }
        
        // Check if user owns this announcement
        if (!$this->isAnnouncementOwner($id, $user_id)) {
            return $this->errorResponse("You can only edit your own announcements");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $announcement = $this->getAnnouncementById($id);
            if (!$announcement) {
                return $this->errorResponse("Announcement not found");
            }
            
            // Don't allow updates if announcement is closed
            if ($announcement['is_closed']) {
                return $this->errorResponse("Cannot update a closed announcement");
            }
            
            // Build update query dynamically
            $update_fields = [];
            $params = [];
            $param_types = "";
            
            $allowed_fields = [
                'deceased_name', 'deceased_birth_date', 'deceased_death_date',
                'funeral_date', 'funeral_location', 'ceremony_type', 'family_message',
                'goal_amount', 'beneficiary_name', 'beneficiary_bank_account', 
                'beneficiary_mobile_money', 'beneficiary_account_type'
            ];
            
            foreach ($allowed_fields as $field) {
                if (isset($input[$field])) {
                    $update_fields[] = "$field = ?";
                    
                    if (in_array($field, ['deceased_birth_date', 'deceased_death_date'])) {
                        $params[] = !empty($input[$field]) ? date('Y-m-d', strtotime($input[$field])) : null;
                        $param_types .= "s";
                    } elseif ($field === 'goal_amount') {
                        $params[] = $input[$field];
                        $param_types .= "d";
                    } else {
                        $params[] = $input[$field];
                        $param_types .= "s";
                    }
                }
            }
            
            if (empty($update_fields)) {
                return $this->errorResponse("No valid fields to update");
            }
            
            $params[] = $id;
            $param_types .= "i";
            
            $sql = "UPDATE funeral_announcements SET " . implode(', ', $update_fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param($param_types, ...$params);
            
            if ($stmt->execute()) {
                $this->logActivity($user_id, 'update_announcement', "Updated announcement ID: $id");
                
                return $this->successResponse(["message" => "Announcement updated successfully"]);
            }
            
            return $this->errorResponse("Failed to update announcement");
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to update announcement: " . $e->getMessage());
        }
    }
    
    // Close announcement (only by owner)
    public function closeAnnouncement($id) {
        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }
        
        $user_id = $this->getUserIdFromToken($session_token);
        if (!$user_id) {
            return $this->errorResponse("Invalid authentication token");
        }
        
        if (!$this->isAnnouncementOwner($id, $user_id)) {
            return $this->errorResponse("You can only close your own announcements");
        }
        
        try {
            $sql = "UPDATE funeral_announcements SET is_closed = 1, closed_at = CURRENT_TIMESTAMP WHERE id = ? AND is_closed = 0";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute() && $stmt->affected_rows > 0) {
                $this->logActivity($user_id, 'close_announcement', "Closed announcement ID: $id");
                
                return $this->successResponse(["message" => "Announcement closed successfully"]);
            }
            
            return $this->errorResponse("Failed to close announcement or already closed");
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to close announcement: " . $e->getMessage());
        }
    }
    
    // Get user's announcements (requires authentication)
    public function getUserAnnouncements() {
        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }
        
        $user_id = $this->getUserIdFromToken($session_token);
        if (!$user_id) {
            return $this->errorResponse("Invalid authentication token");
        }
        
        try {
            $sql = "
                SELECT 
                    fa.*,
                    COUNT(d.id) as donation_count,
                    SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END) as total_raised,
                    CASE 
                        WHEN fa.is_closed = 1 THEN 'closed'
                        WHEN CURRENT_DATE > DATE_ADD(fa.announcement_end_date, INTERVAL 5 DAY) THEN 'expired'
                        WHEN CURRENT_DATE <= fa.announcement_end_date THEN 'active'
                        ELSE 'grace_period'
                    END as status
                FROM funeral_announcements fa
                LEFT JOIN donations d ON fa.id = d.announcement_id
                WHERE fa.creator_user_id = ?
                GROUP BY fa.id
                ORDER BY fa.created_at DESC
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $announcements = $stmt->fetchAll();
            
            return $this->successResponse($announcements);
            
        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch your announcements: " . $e->getMessage());
        }
    }
    
    // Helper methods
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
        // For now, we'll decode a simple format or use a default
        if (strlen($token) === 64) { // hex token
            // For demo purposes, return user ID 1 (in production, lookup in database)
            return 1;
        }
        return null;
    }
    
    private function isAnnouncementOwner($announcement_id, $user_id) {
        try {
            $sql = "SELECT creator_user_id FROM funeral_announcements WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $announcement_id);
            $stmt->execute();
            $result = $stmt->fetch();
            
            return $result && $result['creator_user_id'] == $user_id;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    private function getAnnouncementById($id) {
        try {
            $sql = "SELECT * FROM funeral_announcements WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            return null;
        }
    }
    
    private function logActivity($user_id, $action, $details) {
        try {
            $sql = "INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $stmt->bind_param("isss", $user_id, $action, $details, $ip_address);
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
$funeral = new FuneralAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'user-announcements') {
            echo $funeral->getUserAnnouncements();
        } elseif (isset($_GET['id'])) {
            echo $funeral->getAnnouncement($_GET['id']);
        } else {
            echo $funeral->getAnnouncements();
        }
        break;
    case 'POST':
        echo $funeral->createAnnouncement();
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            echo $funeral->updateAnnouncement($_GET['id']);
        } else {
            echo json_encode(["success" => false, "error" => "Announcement ID required"]);
        }
        break;
    case 'DELETE':
        if (isset($_GET['action']) && $_GET['action'] === 'close' && isset($_GET['id'])) {
            echo $funeral->closeAnnouncement($_GET['id']);
        } else {
            echo json_encode(["success" => false, "error" => "Invalid action or missing ID"]);
        }
        break;
    default:
        echo json_encode([
            "success" => false,
            "error" => "Method not allowed"
        ]);
}
?>