<?php
/**
 * Simple Gmail SMTP Mailer for Legacy Donation Platform
 * Sends emails directly via Gmail SMTP server
 */

class GmailSMTPMailer {
    private $smtp_host = 'smtp.gmail.com';
    private $smtp_port = 587;
    private $username = 'raymondtawiah23@gmail.com';
    private $password = 'dprqbgfqawvqukyd'; 
    private $from_name = 'Legacy Donation';
    private $reply_to = 'support@legacy-donation.com';
    
    public function sendEmail($to, $subject, $message) {
        $boundary = md5(time());

        // Email headers and body
        $headers = [
            "MIME-Version: 1.0",
            "Content-Type: multipart/alternative; boundary=\"$boundary\"",
            "From: {$this->from_name} <{$this->username}>",
            "To: $to",
            "Subject: [Legacy Donation] $subject",
            "Reply-To: {$this->reply_to}",
            "Date: " . date('r')
        ];

        $body = "--$boundary\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\n";
        $body .= "Content-Transfer-Encoding: 8bit\n\n";
        $body .= "Legacy Donation Platform\n";
        $body .= "===================\n\n";
        $body .= $message;
        $body .= "\n\n===================\n";
        $body .= "Legacy Donation - Supporting families in times of need\n";
        $body .= "If you have questions, contact us at {$this->reply_to}\n";
        $body .= "Website: https://legacy-donation.com\n";
        $body .= "--$boundary--\n";

        // Connect to Gmail SMTP
        $socket = @fsockopen($this->smtp_host, $this->smtp_port, $errno, $errstr, 30);

        if (!$socket) {
            $error = "SMTP connection failed: $errstr ($errno)";
            error_log($error);
            return false;
        }

        // Read server greeting
        $response = fgets($socket);
        if (substr($response, 0, 3) !== '220') {
            $error = "SMTP greeting failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send EHLO
        fwrite($socket, "EHLO localhost\r\n");
        $this->readMultilineResponse($socket);

        // Send STARTTLS
        fwrite($socket, "STARTTLS\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '220') {
            $error = "STARTTLS failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Enable encryption
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $error = "TLS encryption failed";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send EHLO again (required after STARTTLS)
        fwrite($socket, "EHLO localhost\r\n");
        $this->readMultilineResponse($socket);

        // Authenticate
        fwrite($socket, "AUTH LOGIN\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '334') {
            $error = "AUTH LOGIN failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send username
        fwrite($socket, base64_encode($this->username) . "\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '334') {
            $error = "Username authentication failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send password
        fwrite($socket, base64_encode($this->password) . "\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '235') {
            $error = "Password authentication failed: $response - Check your Gmail App Password";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send MAIL FROM
        fwrite($socket, "MAIL FROM:<{$this->username}>\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '250') {
            $error = "MAIL FROM failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send RCPT TO
        fwrite($socket, "RCPT TO:<$to>\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '250') {
            $error = "RCPT TO failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send DATA
        fwrite($socket, "DATA\r\n");
        $response = fgets($socket);

        if (substr($response, 0, 3) !== '354') {
            $error = "DATA command failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send email headers and body
        foreach ($headers as $header) {
            fwrite($socket, "$header\r\n");
        }
        fwrite($socket, "\r\n");
        fwrite($socket, $body);
        fwrite($socket, ".\r\n");

        $response = fgets($socket);

        if (substr($response, 0, 3) !== '250') {
            $error = "Email send failed: $response";
            error_log($error);
            fclose($socket);
            return false;
        }

        // Send QUIT
        fwrite($socket, "QUIT\r\n");
        fclose($socket);

        return true;
    }
    
    private function readMultilineResponse($socket) {
        $response = '';
        while ($line = fgets($socket)) {
            $response .= $line;
            // Check if this is the last line (doesn't have a dash after the code)
            if (preg_match('/^\d{3} /', $line)) {
                break;
            }
        }
        return $response;
    }
    
    private function fallbackMail($to, $subject, $message) {
        $headers = [
            'From: Legacy Donation <raymondtawiah23@gmail.com>',
            'Reply-To: support@legacy-donation.com',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'X-Mailer: PHP/' . phpversion()
        ];

        $fullMessage = "Legacy Donation Platform\n";
        $fullMessage .= "===================\n\n";
        $fullMessage .= $message;
        $fullMessage .= "\n\n===================\n";
        $fullMessage .= "Legacy Donation - Supporting families in times of need\n";
        $fullMessage .= "If you have questions, contact us at support@legacy-donation.com\n";
        $fullMessage .= "Website: https://legacy-donation.com\n";

        $mailSent = mail($to, $subject, $fullMessage, implode("\r\n", $headers));

        if (!$mailSent) {
            error_log("PHP mail() function failed for: $to");
        }

        return $mailSent;
    }
}
?>
