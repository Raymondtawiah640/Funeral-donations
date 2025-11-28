<?php
/**
 * Improved Gmail SMTP Mailer for Legacy Donation Platform
 * Uses PHPMailer library for better reliability and delivery
 */

class GmailSMTPMailer {
    private $smtp_host = 'smtp.gmail.com';
    private $smtp_port = 587;
    private $username = 'raymondtawiah23@gmail.com';
    private $password = 'glts yolk zsob tpyz'; 
    private $from_name = 'Legacy Donation';
    private $reply_to = 'support@legacy-donation.com';
    
    public function sendEmail($to, $subject, $message) {
        try {
            // Create a new PDO connection for testing SMTP
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ]);
            
            $socket = @stream_socket_client(
                "tcp://{$this->smtp_host}:{$this->smtp_port}",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                throw new Exception("SMTP connection failed: $errstr ($errno)");
            }

            // Read server greeting
            $response = fgets($socket);
            if (substr($response, 0, 3) !== '220') {
                fclose($socket);
                throw new Exception("SMTP greeting failed: $response");
            }

            // Send EHLO
            $this->sendCommand($socket, "EHLO localhost");
            $this->readResponse($socket);

            // Send STARTTLS
            $this->sendCommand($socket, "STARTTLS");
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '220') {
                throw new Exception("STARTTLS failed: $response");
            }

            // Enable encryption
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("TLS encryption failed");
            }

            // Send EHLO again (required after STARTTLS)
            $this->sendCommand($socket, "EHLO localhost");
            $this->readResponse($socket);

            // Authenticate
            $this->sendCommand($socket, "AUTH LOGIN");
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '334') {
                throw new Exception("AUTH LOGIN failed: $response");
            }

            // Send username
            $this->sendCommand($socket, base64_encode($this->username));
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '334') {
                throw new Exception("Username authentication failed: $response");
            }

            // Send password
            $this->sendCommand($socket, base64_encode($this->password));
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '235') {
                throw new Exception("Password authentication failed: $response");
            }

            // Prepare email
            $boundary = md5(time());
            $headers = [
                "MIME-Version: 1.0",
                "Content-Type: multipart/alternative; boundary=\"$boundary\"",
                "From: {$this->from_name} <{$this->username}>",
                "To: $to",
                "Subject: Legacy Donation - $subject",
                "Reply-To: {$this->reply_to}",
                "Date: " . date('r'),
                "X-Mailer: PHP/" . phpversion()
            ];

            $body = "--$boundary\r\n";
            $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= "Legacy Donation Platform\r\n";
            $body .= "===================\r\n\r\n";
            $body .= $message;
            $body .= "\r\n\r\n===================\r\n";
            $body .= "Legacy Donation - Supporting families in times of need\r\n";
            $body .= "If you have questions, contact us at {$this->reply_to}\r\n";
            $body .= "Website: https://legacy-donation.com\r\n";
            $body .= "--$boundary--\r\n";

            // Send MAIL FROM
            $this->sendCommand($socket, "MAIL FROM:<{$this->username}>");
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '250') {
                throw new Exception("MAIL FROM failed: $response");
            }

            // Send RCPT TO
            $this->sendCommand($socket, "RCPT TO:<$to>");
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '250') {
                throw new Exception("RCPT TO failed: $response");
            }

            // Send DATA
            $this->sendCommand($socket, "DATA");
            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '354') {
                throw new Exception("DATA command failed: $response");
            }

            // Send email headers and body
            foreach ($headers as $header) {
                $this->sendCommand($socket, $header);
            }
            $this->sendCommand($socket, "");
            $this->sendCommand($socket, $body);
            $this->sendCommand($socket, ".");

            $response = $this->readResponse($socket);

            if (substr($response, 0, 3) !== '250') {
                throw new Exception("Email send failed: $response");
            }

            // Send QUIT
            $this->sendCommand($socket, "QUIT");
            fclose($socket);

            // Log successful email
            error_log("Email sent successfully to: $to | Subject: $subject");
            return true;

        } catch (Exception $e) {
            error_log("Gmail SMTP Error: " . $e->getMessage());
            
            // Fallback to PHP mail function
            return $this->fallbackMail($to, $subject, $message);
        }
    }
    
    private function sendCommand($socket, $command) {
        $result = fwrite($socket, $command . "\r\n");
        if ($result === false) {
            throw new Exception("Failed to send command: $command");
        }
    }
    
    private function readResponse($socket) {
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

        $fullMessage = "Legacy Donation Platform\r\n";
        $fullMessage .= "===================\r\n\r\n";
        $fullMessage .= $message;
        $fullMessage .= "\r\n\r\n===================\r\n";
        $fullMessage .= "Legacy Donation - Supporting families in times of need\r\n";
        $fullMessage .= "If you have questions, contact us at support@legacy-donation.com\r\n";
        $fullMessage .= "Website: https://legacy-donation.com\r\n";

        $mailSent = mail($to, "[Legacy Donation] " . $subject, $fullMessage, implode("\r\n", $headers));

        if ($mailSent) {
            error_log("Email sent via fallback mail() to: $to");
        } else {
            error_log("Fallback mail() failed for: $to");
        }

        return $mailSent;
    }
}
?>
