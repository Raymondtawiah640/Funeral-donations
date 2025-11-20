<?php
/**
 * AuthDatabase Class - Handles all database operations for authentication
 * Extracted from AuthAPI to improve separation of concerns
 */

require_once 'db_connect.php';

class AuthDatabase {
    private $pdo;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    
    /**
     * Check if user exists by email
     */
    public function userExists($email) {
        try {
            $sql = "SELECT id FROM users WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            throw new Exception("Failed to check user existence: " . $e->getMessage());
        }
    }
    
    /**
     * Create new user account
     */
    public function createUser($email, $fullName, $phone, $verificationCode, $expiresAt) {
        try {
            $sql = "INSERT INTO users (email, full_name, phone, verification_code, verification_expires_at) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->bindParam(2, $fullName);
            $stmt->bindParam(3, $phone);
            $stmt->bindParam(4, $verificationCode);
            $stmt->bindParam(5, $expiresAt);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to create user: " . $e->getMessage());
        }
    }
    
    /**
     * Get user verification data
     */
    public function getUserVerificationData($email) {
        try {
            $sql = "SELECT id, verification_code, verification_expires_at FROM users WHERE email = ? AND is_verified = 0";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception("Failed to get user verification data: " . $e->getMessage());
        }
    }
    
    /**
     * Verify user email
     */
    public function verifyUser($userId, $email, $verificationCode) {
        try {
            // Check if code matches and not expired
            $sql = "SELECT verification_code, verification_expires_at FROM users WHERE id = ? AND email = ? AND is_verified = 0";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $userId);
            $stmt->bindParam(2, $email);
            $stmt->execute();
            
            $result = $stmt->fetch();
            
            if (!$result) {
                return ['success' => false, 'message' => 'Invalid verification request'];
            }
            
            if ($result['verification_code'] !== $verificationCode) {
                return ['success' => false, 'message' => 'Invalid verification code'];
            }
            
            if (strtotime($result['verification_expires_at']) < time()) {
                return ['success' => false, 'message' => 'Verification code has expired'];
            }
            
            // Mark user as verified
            $updateSql = "UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?";
            $updateStmt = $this->pdo->prepare($updateSql);
            $updateStmt->bindParam(1, $userId);
            
            return ['success' => $updateStmt->execute(), 'message' => 'Email verified successfully'];
        } catch (Exception $e) {
            throw new Exception("Failed to verify user: " . $e->getMessage());
        }
    }
    
    /**
     * Get user by email (for login)
     */
    public function getUserForLogin($email) {
        try {
            $sql = "SELECT id, full_name, is_verified FROM users WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception("Failed to get user for login: " . $e->getMessage());
        }
    }
    
    /**
     * Update user with login code
     */
    public function updateUserLoginCode($userId, $loginCode, $expiresAt) {
        try {
            $sql = "UPDATE users SET login_code = ?, login_code_expires_at = ? WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $loginCode);
            $stmt->bindParam(2, $expiresAt);
            $stmt->bindParam(3, $userId);

            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to update login code: " . $e->getMessage());
        }
    }

    /**
     * Update user session token
     */
    public function updateUserSessionToken($userId, $sessionToken) {
        try {
            $sql = "UPDATE users SET session_token = ? WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $sessionToken);
            $stmt->bindParam(2, $userId);

            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to update session token: " . $e->getMessage());
        }
    }
    
    /**
     * Get user for login code validation
     */
    public function getUserForLoginCode($email) {
        try {
            $sql = "SELECT id, full_name, login_code, login_code_expires_at FROM users WHERE email = ? AND is_verified = 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception("Failed to get user for login code: " . $e->getMessage());
        }
    }
    
    /**
     * Clear user login code
     */
    public function clearUserLoginCode($userId) {
        try {
            $sql = "UPDATE users SET login_code = NULL, login_code_expires_at = NULL WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $userId);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to clear login code: " . $e->getMessage());
        }
    }
    
    /**
     * Get user by email for resend verification
     */
    public function getUserForResendVerification($email) {
        try {
            $sql = "SELECT id, is_verified FROM users WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception("Failed to get user for resend verification: " . $e->getMessage());
        }
    }
    
    /**
     * Update user verification code
     */
    public function updateUserVerificationCode($userId, $verificationCode, $expiresAt) {
        try {
            $sql = "UPDATE users SET verification_code = ?, verification_expires_at = ? WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $verificationCode);
            $stmt->bindParam(2, $expiresAt);
            $stmt->bindParam(3, $userId);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to update verification code: " . $e->getMessage());
        }
    }
    
    /**
     * Log verification code request
     */
    public function logVerificationCode($email, $codeType, $code, $expiresAt) {
        try {
            $sql = "INSERT INTO verification_logs (email, code_type, code, expires_at) VALUES (?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->bindParam(2, $codeType);
            $stmt->bindParam(3, $code);
            $stmt->bindParam(4, $expiresAt);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to log verification code: " . $e->getMessage());
        }
    }
    
    /**
     * Mark verification code as used
     */
    public function markVerificationCodeUsed($email, $codeType, $code) {
        try {
            $sql = "UPDATE verification_logs SET is_used = 1 WHERE email = ? AND code_type = ? AND code = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $email);
            $stmt->bindParam(2, $codeType);
            $stmt->bindParam(3, $code);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to mark verification code as used: " . $e->getMessage());
        }
    }
    
    /**
     * Log user activity
     */
    public function logUserActivity($userId, $action, $ipAddress) {
        try {
            $sql = "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(1, $userId);
            $stmt->bindParam(2, $action);
            $stmt->bindParam(3, $ipAddress);
            
            return $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Failed to log user activity: " . $e->getMessage());
        }
    }
    
    /**
     * Generate secure session token
     */
    public function generateSessionToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Generate verification code
     */
    public function generateCode() {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Generate expiration time
     */
    public function generateExpirationTime($minutes = 10) {
        return date('Y-m-d H:i:s', strtotime("+{$minutes} minutes"));
    }
}
?>