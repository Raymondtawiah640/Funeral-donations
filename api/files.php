<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

class FileAPI {
    private $pdo;
    private $upload_dir = 'uploads/';
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    
    // Serve file to browser
    public function serveFile() {
        try {
            $file_id = $_GET['file_id'] ?? null;
            
            if (!$file_id) {
                return $this->errorResponse("File ID is required");
            }
            
            // Get file information from database
            $sql = "SELECT * FROM announcement_files WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$file_id]);
            $file = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$file) {
                return $this->errorResponse("File not found");
            }
            
            $file_path = $file['file_path'];
            
            // Check if file exists
            if (!file_exists($file_path)) {
                return $this->errorResponse("File not found on server");
            }
            
            // Determine content type based on file extension
            $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
            $content_types = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            $content_type = $content_types[$extension] ?? 'application/octet-stream';
            
            // Set headers for file download/display
            header("Content-Type: $content_type");
            header("Content-Length: " . filesize($file_path));
            header("Content-Disposition: inline; filename=\"" . $file['original_name'] . "\"");
            header("Cache-Control: public, max-age=31536000"); // Cache for 1 year
            
            // Output file content
            readfile($file_path);
            exit;
            
        } catch (Exception $e) {
            return $this->errorResponse("Failed to serve file: " . $e->getMessage());
        }
    }
    
    // Get file information (for debugging)
    public function getFileInfo() {
        try {
            $file_id = $_GET['file_id'] ?? null;
            
            if (!$file_id) {
                return $this->errorResponse("File ID is required");
            }
            
            $sql = "SELECT * FROM announcement_files WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$file_id]);
            $file = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$file) {
                return $this->errorResponse("File not found");
            }
            
            // Add file existence check
            $file['file_exists'] = file_exists($file['file_path']);
            $file['file_size_actual'] = file_exists($file['file_path']) ? filesize($file['file_path']) : 0;
            
            return $this->successResponse($file);
            
        } catch (Exception $e) {
            return $this->errorResponse("Failed to get file info: " . $e->getMessage());
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
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $file_api = new FileAPI();
    
    if (isset($_GET['action']) && $_GET['action'] === 'info') {
        echo $file_api->getFileInfo();
    } else {
        $file_api->serveFile();
    }
} else {
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed. Use GET to serve files."
    ]);
}
?>