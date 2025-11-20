<?php
/**
 * Legacy Donation Authentication API
 * Refactored with proper separation of concerns
 * - AuthDatabase: Handles all database operations
 * - GmailSMTPMailer: Handles all email operations
 * - AuthAPI: Contains business logic only
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

class AuthAPI {
    private $db;
    private $mailer;
    
    public function __construct() {
        $this->db = new AuthDatabase();
        $this->mailer = new GmailSMTPMailer();
    }
    
    /**
     * User signup with email verification
     */
    public function signup() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['full_name'])) {
            return $this->errorResponse("Email and full name are required");
        }
        
        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        $full_name = trim($input['full_name']);
        $phone = isset($input['phone']) ? trim($input['phone']) : null;
        
        if (!$email || !$full_name) {
            return $this->errorResponse("Valid email and full name are required");
        }
        
        try {
            // Check if user already exists
            if ($this->db->userExists($email)) {
                return $this->errorResponse("User with this email already exists");
            }
            
            // Generate verification code and expiration
            $verification_code = $this->db->generateCode();
            $expires_at = $this->db->generateExpirationTime(10);
            
            // Create user account
            if (!$this->db->createUser($email, $full_name, $phone, $verification_code, $expires_at)) {
                return $this->errorResponse("Failed to create account");
            }
            
            // Log verification code request
            $this->db->logVerificationCode($email, 'signup', $verification_code, $expires_at);
            
            // Send verification email
            $subject = "Verify Your Email Address";
            $message = "Your verification code is: $verification_code\n\nThis code will expire in 10 minutes.";
            $this->mailer->sendEmail($email, $subject, $message);
            
            // Always include verification code in response for now (until email delivery is stable)
            $responseData = [
                "message" => "Verification code sent to your email",
                "verification_code" => $verification_code,
                "expires_at" => $expires_at,
                "note" => "If you don't receive the email, use the code shown here"
            ];
            
            return $this->successResponse($responseData);
            
        } catch (Exception $e) {
            return $this->errorResponse("Database error: " . $e->getMessage());
        }
    }
    
    /**
     * Verify email with verification code
     */
    public function verifyEmail() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['verification_code'])) {
            return $this->errorResponse("Email and verification code are required");
        }
        
        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        $verification_code = trim($input['verification_code']);
        
        if (!$email) {
            return $this->errorResponse("Valid email is required");
        }
        
        try {
            // Get user verification data
            $userData = $this->db->getUserVerificationData($email);
            
            if (!$userData) {
                return $this->errorResponse("Invalid verification request");
            }
            
            // Verify the code
            $verificationResult = $this->db->verifyUser($userData['id'], $email, $verification_code);
            
            if (!$verificationResult['success']) {
                return $this->errorResponse($verificationResult['message']);
            }
            
            // Mark verification code as used
            $this->db->markVerificationCodeUsed($email, 'signup', $verification_code);
            
            return $this->successResponse(["message" => "Email verified successfully"]);
            
        } catch (Exception $e) {
            return $this->errorResponse("Database error: " . $e->getMessage());
        }
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
            $this->mailer->sendEmail($email, $subject, $message);
            
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

            // TEMPORARY: Skip storing session token until column is added
            // $this->db->updateUserSessionToken($user['id'], $session_token);

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
     * Resend verification code for unverified users
     */
    public function resendVerificationCode() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email'])) {
            return $this->errorResponse("Email is required");
        }
        
        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            return $this->errorResponse("Valid email is required");
        }
        
        try {
            // Get user for resend verification
            $user = $this->db->getUserForResendVerification($email);
            
            if (!$user) {
                return $this->errorResponse("No account found with this email");
            }
            
            if ($user['is_verified']) {
                return $this->errorResponse("Account is already verified");
            }
            
            // Generate new verification code
            $verification_code = $this->db->generateCode();
            $expires_at = $this->db->generateExpirationTime(10);
            
            // Update user with new verification code
            if (!$this->db->updateUserVerificationCode($user['id'], $verification_code, $expires_at)) {
                return $this->errorResponse("Failed to resend verification code");
            }
            
            // Send verification email
            $subject = "Email Verification Code";
            $message = "Your new verification code is: $verification_code\n\nThis code will expire in 10 minutes.";
            $this->mailer->sendEmail($email, $subject, $message);
            
            return $this->successResponse(["message" => "New verification code sent"]);
            
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
$auth = new AuthAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'signup':
        echo $auth->signup();
        break;
    case 'verify':
        echo $auth->verifyEmail();
        break;
    case 'request-login':
        echo $auth->requestLoginCode();
        break;
    case 'login':
        echo $auth->loginWithCode();
        break;
    case 'resend-verification':
        echo $auth->resendVerificationCode();
        break;
    default:
        echo json_encode([
            "success" => false,
            "error" => "Invalid action. Available actions: signup, verify, request-login, login, resend-verification"
        ]);
}
?>