<?php
require_once 'db_connect.php';

try {
    // Update existing file paths to include ../ prefix
    $sql = "UPDATE announcement_files SET file_path = CONCAT('./', file_path) WHERE file_path NOT LIKE '../%'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "File paths updated successfully",
        "affected_rows" => $stmt->rowCount()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>