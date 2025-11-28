<?php
/**
 * Signup API - Handles user registration with email verification
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

class SignupAPI {
    private $db;
    private $mailer;
    private $rateLimiter;
    
    public function __construct() {
        $this->db = new AuthDatabase();
        $this->mailer = new GmailSMTPMailer();
        $this->rateLimiter = new EmailRateLimiter();
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
            // Check rate limiting
            if (!$this->rateLimiter->canSendEmail($email)) {
                $waitTime = $this->rateLimiter->getWaitTime($email);
                return $this->errorResponse("Please wait {$waitTime} more seconds before signing up again");
            }
            
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
            $emailSent = $this->mailer->sendEmail($email, $subject, $message);
            
            if (!$emailSent) {
                return $this->errorResponse("Failed to send verification email. Please try again.");
            }
            
            // Record email sent for rate limiting
            $this->rateLimiter->recordEmailSent($email);
            
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
            // Check rate limiting
            if (!$this->rateLimiter->canSendEmail($email)) {
                $waitTime = $this->rateLimiter->getWaitTime($email);
                return $this->errorResponse("Please wait {$waitTime} more seconds before requesting another verification code");
            }
            
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
            $emailSent = $this->mailer->sendEmail($email, $subject, $message);
            
            if (!$emailSent) {
                return $this->errorResponse("Failed to resend verification email. Please try again.");
            }
            
            // Record email sent for rate limiting
            $this->rateLimiter->recordEmailSent($email);
            
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
$signup = new SignupAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'signup':
        echo $signup->signup();
        break;
    case 'verify':
        echo $signup->verifyEmail();
        break;
    case 'resend-verification':
        echo $signup->resendVerificationCode();
        break;
    default:
        echo json_encode([
            "success" => false,
            "error" => "Invalid action. Available actions: signup, verify, resend-verification"
        ]);
}
?>