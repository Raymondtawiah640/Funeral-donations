<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

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
            
            // Get files and reactions for each announcement
            foreach ($announcements as &$announcement) {
                $files_sql = "SELECT * FROM announcement_files WHERE announcement_id = ? ORDER BY upload_purpose";
                $files_stmt = $this->pdo->prepare($files_sql);
                $files_stmt->execute([$announcement['id']]);
                $announcement['files'] = $files_stmt->fetchAll();

                // Add reaction data
                $announcement['reactions'] = $this->getAnnouncementReactions($announcement['id']);
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
            $stmt->execute([$id]);
            $announcement = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$announcement) {
                return $this->errorResponse("Announcement not found");
            }
            
            // Get files for the announcement
            $files_sql = "SELECT * FROM announcement_files WHERE announcement_id = ? ORDER BY upload_purpose";
            $files_stmt = $this->pdo->prepare($files_sql);
            $files_stmt->execute([$id]);
            $announcement['files'] = $files_stmt->fetchAll();
            
            // Get recent donations (limit to 10 for performance)
            $donations_sql = "SELECT * FROM donations WHERE announcement_id = ? AND status = 'completed' ORDER BY donated_at DESC LIMIT 10";
            $donations_stmt = $this->pdo->prepare($donations_sql);
            $donations_stmt->execute([$id]);
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
            
            $params = [
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
            ];
            
            if ($stmt->execute($params)) {
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
            
            if ($stmt->execute($params)) {
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
            
            if ($stmt->execute([$id]) && $stmt->rowCount() > 0) {
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
            $stmt->execute([$user_id]);
            $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add reaction data for each announcement
            foreach ($announcements as &$announcement) {
                $announcement['reactions'] = $this->getAnnouncementReactions($announcement['id']);
                $announcement['notifications'] = $this->getReactionNotificationsForUser($announcement['id'], $user_id);
            }

            return $this->successResponse($announcements);

        } catch (PDOException $e) {
            return $this->errorResponse("Failed to fetch your announcements: " . $e->getMessage());
        }
    }

    // Add reaction to announcement
    public function addReaction() {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['announcement_id']) || !isset($input['reaction_type'])) {
            return $this->errorResponse("Announcement ID and reaction type are required");
        }

        $announcement_id = $input['announcement_id'];
        $reaction_type = $input['reaction_type'];

        if (!in_array($reaction_type, ['like', 'love'])) {
            return $this->errorResponse("Invalid reaction type. Must be 'like' or 'love'");
        }

        // Check if announcement exists
        if (!$this->getAnnouncementById($announcement_id)) {
            return $this->errorResponse("Announcement not found");
        }

        $session_token = $this->getAuthToken();
        $user_id = null;
        $user_name = 'Anonymous';

        if ($session_token) {
            $user_id = $this->getUserIdFromToken($session_token);
            if ($user_id) {
                // Get user name for logged-in users
                $user_sql = "SELECT full_name FROM users WHERE id = ?";
                $user_stmt = $this->pdo->prepare($user_sql);
                $user_stmt->execute([$user_id]);
                $user_result = $user_stmt->fetch(PDO::FETCH_ASSOC);
                $user_name = $user_result ? $user_result['full_name'] : 'Anonymous';
            }
        }

        try {
            // Check if user already reacted
            $check_sql = "SELECT id, reaction_type FROM reactions WHERE announcement_id = ? AND user_id <=> ? AND user_session = ?";
            $check_stmt = $this->pdo->prepare($check_sql);
            $check_stmt->execute([$announcement_id, $user_id, $session_token ?: '']);
            $existing_reaction = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_reaction) {
                if ($existing_reaction['reaction_type'] === $reaction_type) {
                    // Same reaction - remove it
                    return $this->removeReaction($announcement_id, $user_id, $session_token);
                } else {
                    // Different reaction - update it
                    $update_sql = "UPDATE reactions SET reaction_type = ?, reacted_at = CURRENT_TIMESTAMP WHERE id = ?";
                    $update_stmt = $this->pdo->prepare($update_sql);
                    $update_stmt->execute([$reaction_type, $existing_reaction['id']]);
                }
            } else {
                // New reaction
                $insert_sql = "INSERT INTO reactions (announcement_id, user_id, user_session, user_name, reaction_type) VALUES (?, ?, ?, ?, ?)";
                $insert_stmt = $this->pdo->prepare($insert_sql);
                $insert_stmt->execute([$announcement_id, $user_id, $session_token ?: '', $user_name, $reaction_type]);
            }

            // Log activity if user is logged in
            if ($user_id) {
                $this->logActivity($user_id, 'add_reaction', "Added $reaction_type reaction to announcement ID: $announcement_id");
            }

            return $this->successResponse([
                "message" => "Reaction added successfully",
                "reactions" => $this->getAnnouncementReactions($announcement_id)
            ]);

        } catch (PDOException $e) {
            return $this->errorResponse("Failed to add reaction: " . $e->getMessage());
        }
    }

    // Remove reaction from announcement
    public function removeReaction($announcement_id = null, $user_id = null, $session_token = null) {
        if ($announcement_id === null) {
            $input = json_decode(file_get_contents('php://input'), true);
            $announcement_id = $input['announcement_id'] ?? null;
        }

        if (!$announcement_id) {
            return $this->errorResponse("Announcement ID is required");
        }

        if ($user_id === null || $session_token === null) {
            $session_token = $this->getAuthToken();
            $user_id = $session_token ? $this->getUserIdFromToken($session_token) : null;
        }

        try {
            $delete_sql = "DELETE FROM reactions WHERE announcement_id = ? AND user_id <=> ? AND user_session = ?";
            $delete_stmt = $this->pdo->prepare($delete_sql);
            $delete_stmt->execute([$announcement_id, $user_id, $session_token ?: '']);

            // Log activity if user is logged in
            if ($user_id) {
                $this->logActivity($user_id, 'remove_reaction', "Removed reaction from announcement ID: $announcement_id");
            }

            return $this->successResponse([
                "message" => "Reaction removed successfully",
                "reactions" => $this->getAnnouncementReactions($announcement_id)
            ]);

        } catch (PDOException $e) {
            return $this->errorResponse("Failed to remove reaction: " . $e->getMessage());
        }
    }

    // Get reaction notifications for user
    public function getReactionNotifications() {
        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }

        $user_id = $this->getUserIdFromToken($session_token);
        if (!$user_id) {
            return $this->errorResponse("Invalid authentication token");
        }

        try {
            // Get user's announcements
            $announcements_sql = "SELECT id FROM funeral_announcements WHERE creator_user_id = ?";
            $announcements_stmt = $this->pdo->prepare($announcements_sql);
            $announcements_stmt->execute([$user_id]);
            $user_announcements = $announcements_stmt->fetchAll(PDO::FETCH_COLUMN);

            $notifications = [];

            foreach ($user_announcements as $announcement_id) {
                $notifications[$announcement_id] = $this->getReactionNotificationsForUser($announcement_id, $user_id);
            }

            return $this->successResponse($notifications);

        } catch (PDOException $e) {
            return $this->errorResponse("Failed to get notifications: " . $e->getMessage());
        }
    }

    // Mark notifications as read
    public function markNotificationsRead() {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['announcement_id'])) {
            return $this->errorResponse("Announcement ID is required");
        }

        $announcement_id = $input['announcement_id'];

        $session_token = $this->getAuthToken();
        if (!$session_token) {
            return $this->errorResponse("Authentication required");
        }

        $user_id = $this->getUserIdFromToken($session_token);
        if (!$user_id) {
            return $this->errorResponse("Invalid authentication token");
        }

        // Check if user owns this announcement
        if (!$this->isAnnouncementOwner($announcement_id, $user_id)) {
            return $this->errorResponse("You can only mark notifications for your own announcements");
        }

        try {
            $update_sql = "UPDATE reactions SET is_read = 1 WHERE announcement_id = ? AND is_read = 0";
            $update_stmt = $this->pdo->prepare($update_sql);
            $update_stmt->execute([$announcement_id]);

            return $this->successResponse(["message" => "Notifications marked as read"]);

        } catch (PDOException $e) {
            return $this->errorResponse("Failed to mark notifications as read: " . $e->getMessage());
        }
    }

    // Helper method to get reactions for an announcement
    private function getAnnouncementReactions($announcement_id) {
        try {
            $sql = "
                SELECT
                    COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as likes,
                    COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) as loves
                FROM reactions
                WHERE announcement_id = ?
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$announcement_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'likes' => (int)$result['likes'],
                'loves' => (int)$result['loves']
            ];
        } catch (PDOException $e) {
            return ['likes' => 0, 'loves' => 0];
        }
    }

    // Helper method to get reaction notifications for a specific announcement and user
    private function getReactionNotificationsForUser($announcement_id, $user_id) {
        try {
            $sql = "
                SELECT
                    COUNT(*) as new_likes,
                    GROUP_CONCAT(
                        CONCAT(
                            '{\"name\":\"', REPLACE(user_name, '\"', '\\\"'), '\",\"reaction_type\":\"', reaction_type, '\",\"reacted_at\":\"', reacted_at, '\"}'
                        )
                        ORDER BY reacted_at DESC
                        SEPARATOR '|||'
                    ) as recent_likers_json
                FROM reactions
                WHERE announcement_id = ? AND user_id != ? AND is_read = 0
                ORDER BY reacted_at DESC
                LIMIT 10
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$announcement_id, $user_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            $recent_likers = [];
            if ($result['recent_likers_json']) {
                $likers_parts = explode('|||', $result['recent_likers_json']);
                foreach ($likers_parts as $liker_json) {
                    $recent_likers[] = json_decode($liker_json, true);
                }
            }

            return [
                'new_likes' => (int)$result['new_likes'],
                'recent_likers' => $recent_likers
            ];
        } catch (PDOException $e) {
            return ['new_likes' => 0, 'recent_likers' => []];
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
        // Look up user ID from session token in database
        try {
            $sql = "SELECT user_id FROM activity_logs WHERE action = 'login' ORDER BY created_at DESC LIMIT 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return $result['user_id'];
            }
            
            // Fallback: get the most recent user
            $sql = "SELECT id FROM users ORDER BY created_at DESC LIMIT 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result ? $result['id'] : null;
        } catch (PDOException $e) {
            error_log("Error getting user ID from token: " . $e->getMessage());
            return null;
        }
    }
    
    private function isAnnouncementOwner($announcement_id, $user_id) {
        try {
            $sql = "SELECT creator_user_id FROM funeral_announcements WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$announcement_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result && $result['creator_user_id'] == $user_id;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    private function getAnnouncementById($id) {
        try {
            $sql = "SELECT * FROM funeral_announcements WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return null;
        }
    }
    
    private function logActivity($user_id, $action, $details) {
        try {
            $sql = "INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $stmt->execute([$user_id, $action, $details, $ip_address]);
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
        } elseif ($action === 'reaction-notifications') {
            echo $funeral->getReactionNotifications();
        } elseif (isset($_GET['id'])) {
            echo $funeral->getAnnouncement($_GET['id']);
        } else {
            echo $funeral->getAnnouncements();
        }
        break;
    case 'POST':
        if ($action === 'react') {
            echo $funeral->addReaction();
        } elseif ($action === 'mark-notifications-read') {
            echo $funeral->markNotificationsRead();
        } else {
            echo $funeral->createAnnouncement();
        }
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            echo $funeral->updateAnnouncement($_GET['id']);
        } else {
            echo json_encode(["success" => false, "error" => "Announcement ID required"]);
        }
        break;
    case 'DELETE':
        if ($action === 'react') {
            echo $funeral->removeReaction();
        } elseif (isset($_GET['action']) && $_GET['action'] === 'close' && isset($_GET['id'])) {
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