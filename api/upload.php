<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

class FileUploadAPI {
    private $pdo;
    private $upload_dir = './uploads/';
    private $max_file_size = 10485760; // 10MB in bytes
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        
        // Create uploads directory if it doesn't exist
        if (!file_exists($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
    }
    
    public function uploadFile() {
        try {
            // Debug: Log upload information
            error_log("Upload request received");
            error_log("POST data: " . print_r($_POST, true));
            error_log("FILES data: " . print_r($_FILES, true));
            
            // Check if file was uploaded
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                $error_message = "No file uploaded. Upload error: " . ($_FILES['file']['error'] ?? 'unknown');
                error_log($error_message);
                return $this->errorResponse($error_message);
            }
            
            $file = $_FILES['file'];
            $announcement_id = $_POST['announcement_id'] ?? null;
            $upload_purpose = $_POST['upload_purpose'] ?? 'other';
            
            error_log("Processing upload - Announcement ID: $announcement_id, Purpose: $upload_purpose, File: {$file['name']}");
            
            if (!$announcement_id) {
                return $this->errorResponse("Announcement ID is required");
            }
            
            // Validate file size
            if ($file['size'] > $this->max_file_size) {
                return $this->errorResponse("File size exceeds 10MB limit");
            }
            
            // Get file extension
            $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            // Determine file type
            $image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $document_extensions = ['pdf', 'doc', 'docx'];
            
            if (in_array($file_extension, $image_extensions)) {
                $file_type = 'image';
            } elseif (in_array($file_extension, $document_extensions)) {
                $file_type = 'document';
            } else {
                return $this->errorResponse("Invalid file type. Allowed: images (jpg, png, gif) and documents (pdf, doc, docx)");
            }
            
            // Generate unique filename
            $unique_filename = uniqid() . '_' . time() . '.' . $file_extension;
            $file_path = $this->upload_dir . $unique_filename;
            
            error_log("Moving file to: $file_path");
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $file_path)) {
                error_log("Failed to move uploaded file");
                return $this->errorResponse("Failed to save uploaded file");
            }
            
            error_log("File moved successfully. Now saving to database.");
            
            // Save file info to database - match actual table structure
            $sql = "INSERT INTO announcement_files (announcement_id, file_name, original_name, file_type, file_path, file_size, upload_purpose)
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            
            if ($stmt->execute([$announcement_id, $unique_filename, $file['name'], $file_type, $file_path, $file['size'], $upload_purpose])) {
                $file_id = $this->pdo->lastInsertId();
                error_log("Database insert successful. File ID: $file_id");
                
                return $this->successResponse([
                    "message" => "File uploaded successfully",
                    "file_id" => $file_id,
                    "file_path" => $file_path,
                    "file_type" => $file_type,
                    "original_filename" => $file['name']
                ]);
            }
            
            // If database insert failed, delete the uploaded file
            error_log("Database insert failed. Deleting uploaded file.");
            unlink($file_path);
            return $this->errorResponse("Failed to save file information to database");
            
        } catch (Exception $e) {
            error_log("Exception in uploadFile: " . $e->getMessage());
            return $this->errorResponse("Upload failed: " . $e->getMessage());
        }
    }
    
    private function successResponse($data) {
        return json_encode([
            "success" => true,
            "data" => $data
        ]);
    }
    
    private function errorResponse($message) {
        error_log("Upload error: " . $message);
        return json_encode([
            "success" => false,
            "error" => $message
        ]);
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $upload = new FileUploadAPI();
    echo $upload->uploadFile();
} else {
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed. Use POST to upload files."
    ]);
}
?>
