<?php
/**
 * Email Rate Limiter to prevent Gmail throttling
 * Ensures emails are sent at reasonable intervals
 */

class EmailRateLimiter {
    private $logFile = 'email_rate_limit.log';
    private $minInterval = 2; // Minimum 2 seconds between emails
    
    public function canSendEmail($email) {
        $logData = $this->getEmailLog();
        
        // Check if this email was sent recently
        if (isset($logData[$email])) {
            $lastSent = $logData[$email];
            $timeSinceLastSent = time() - $lastSent;
            
            if ($timeSinceLastSent < $this->minInterval) {
                $waitTime = $this->minInterval - $timeSinceLastSent;
                error_log("Rate limit: Email to $email blocked for {$waitTime} more seconds");
                return false;
            }
        }
        
        return true;
    }
    
    public function recordEmailSent($email) {
        $logData = $this->getEmailLog();
        $logData[$email] = time();
        
        // Keep only recent logs (last 100 entries)
        $logData = array_slice($logData, -100, null, true);
        
        file_put_contents($this->logFile, json_encode($logData) . "\n", FILE_APPEND);
    }
    
    private function getEmailLog() {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $content = file_get_contents($this->logFile);
        $lines = explode("\n", trim($content));
        
        $logData = [];
        foreach ($lines as $line) {
            if (empty($line)) continue;
            
            $data = json_decode($line, true);
            if ($data && is_array($data)) {
                $logData = array_merge($logData, $data);
            }
        }
        
        return $logData;
    }
    
    public function getWaitTime($email) {
        $logData = $this->getEmailLog();
        
        if (isset($logData[$email])) {
            $timeSinceLastSent = time() - $logData[$email];
            return max(0, $this->minInterval - $timeSinceLastSent);
        }
        
        return 0;
    }
}
?>