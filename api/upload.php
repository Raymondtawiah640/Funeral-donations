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
    private $upload_dir = 'uploads/';
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
            // Check if file was uploaded
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                return $this->errorResponse("No file uploaded or upload error occurred");
            }
            
            $file = $_FILES['file'];
            $announcement_id = $_POST['announcement_id'] ?? null;
            $upload_purpose = $_POST['upload_purpose'] ?? 'other';
            
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
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $file_path)) {
                return $this->errorResponse("Failed to save uploaded file");
            }
            
            // Save file info to database - match actual table structure
            $sql = "INSERT INTO announcement_files (announcement_id, file_name, original_name, file_type, file_path, file_size, upload_purpose)
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            
            if ($stmt->execute([$announcement_id, $unique_filename, $file['name'], $file_type, $file_path, $file['size'], $upload_purpose])) {
                $file_id = $this->pdo->lastInsertId();
                
                return $this->successResponse([
                    "message" => "File uploaded successfully",
                    "file_id" => $file_id,
                    "file_path" => $file_path,
                    "file_type" => $file_type,
                    "original_filename" => $file['name']
                ]);
            }
            
            // If database insert failed, delete the uploaded file
            unlink($file_path);
            return $this->errorResponse("Failed to save file information to database");
            
        } catch (Exception $e) {
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
