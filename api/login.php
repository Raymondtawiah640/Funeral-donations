<?php
/**
 * Login API - Handles user authentication with email verification
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'AuthDatabase.php';
require_once 'GmailSMTPMailer.php';
require_once 'EmailRateLimiter.php';

class LoginAPI {
    private $db;
    private $mailer;
    private $rateLimiter;
    
    public function __construct() {
        $this->db = new AuthDatabase();
        $this->mailer = new GmailSMTPMailer();
        $this->rateLimiter = new EmailRateLimiter();
    }
    
    /**
     * Request login code for existing verified user
     */
    public function requestLoginCode() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email'])) {
            return $this->errorResponse("Email is required");
        }
        
        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            return $this->errorResponse("Valid email is required");
        }
        
        try {
            // Check rate limiting
            if (!$this->rateLimiter->canSendEmail($email)) {
                $waitTime = $this->rateLimiter->getWaitTime($email);
                return $this->errorResponse("Please wait {$waitTime} more seconds before requesting another login code");
            }
            
            // Check if user exists and is verified
            $user = $this->db->getUserForLogin($email);
            
            if (!$user) {
                return $this->errorResponse("No account found with this email");
            }
            
            if (!$user['is_verified']) {
                return $this->errorResponse("Please verify your email first");
            }
            
            // Generate login code and expiration
            $login_code = $this->db->generateCode();
            $expires_at = $this->db->generateExpirationTime(5);
            
            // Update user with login code
            if (!$this->db->updateUserLoginCode($user['id'], $login_code, $expires_at)) {
                return $this->errorResponse("Failed to generate login code");
            }
            
            // Log login code request
            $this->db->logVerificationCode($email, 'login', $login_code, $expires_at);
            
            // Send login code email
            $subject = "Your Login Code";
            $message = "Your login code is: $login_code\n\nThis code will expire in 5 minutes.";
            $emailSent = $this->mailer->sendEmail($email, $subject, $message);
            
            if (!$emailSent) {
                return $this->errorResponse("Failed to send login code email. Please try again.");
            }
            
            // Record email sent for rate limiting
            $this->rateLimiter->recordEmailSent($email);
            
            return $this->successResponse([
                "message" => "Login code sent to your email",
                "login_code" => $login_code,
                "expires_at" => $expires_at,
                "note" => "If you don't receive the email, use the code shown here"
            ]);
            
        } catch (Exception $e) {
            return $this->errorResponse("Database error: " . $e->getMessage());
        }
    }
    
    /**
     * Login with verification code
     */
    public function loginWithCode() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['login_code'])) {
            return $this->errorResponse("Email and login code are required");
        }
        
        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        $login_code = trim($input['login_code']);
        
        if (!$email) {
            return $this->errorResponse("Valid email is required");
        }
        
        try {
            // Get user for login code validation
            $user = $this->db->getUserForLoginCode($email);
            
            if (!$user) {
                return $this->errorResponse("Invalid login credentials");
            }
            
            // Check if code matches and not expired
            if ($user['login_code'] !== $login_code) {
                return $this->errorResponse("Invalid login code");
            }
            
            if (strtotime($user['login_code_expires_at']) < time()) {
                return $this->errorResponse("Login code has expired");
            }
            
            // Clear login code (one-time use)
            $this->db->clearUserLoginCode($user['id']);
            
            // Mark login code as used
            $this->db->markVerificationCodeUsed($email, 'login', $login_code);
            
            // Generate session token
            $session_token = $this->db->generateSessionToken();

            // Log login activity
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $this->db->logUserActivity($user['id'], 'login', $ip_address);
            
            return $this->successResponse([
                "message" => "Login successful",
                "user" => [
                    "id" => $user['id'],
                    "email" => $email,
                    "full_name" => $user['full_name'],
                    "role" => $user['role']
                ],
                "session_token" => $session_token
            ]);
            
        } catch (Exception $e) {
            return $this->errorResponse("Database error: " . $e->getMessage());
        }
    }
    
    /**
     * Generate success JSON response
     */
    private function successResponse($data) {
        return json_encode([
            "success" => true,
            "data" => $data
        ]);
    }
    
    /**
     * Generate error JSON response
     */
    private function errorResponse($message) {
        return json_encode([
            "success" => false,
            "error" => $message
        ]);
    }
}

// Handle API requests
$login = new LoginAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'request-login':
        echo $login->requestLoginCode();
        break;
    case 'login':
        echo $login->loginWithCode();
        break;
    default:
        echo json_encode([
            "success" => false,
            "error" => "Invalid action. Available actions: request-login, login"
        ]);
}
?>