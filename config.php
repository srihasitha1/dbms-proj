<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root@localhost');
define('DB_PASS', '12345678');
define('DB_NAME', 'recipe_hub');

// Create database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>