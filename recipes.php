<?php
header('Content-Type: application/json');
require_once '../config.php';

// Get all recipes
function getRecipes() {
    global $conn;
    $sql = "SELECT * FROM recipes ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $recipes = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $recipes[] = $row;
        }
    }
    
    return $recipes;
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $recipes = getRecipes();
    echo json_encode($recipes);
}
?>