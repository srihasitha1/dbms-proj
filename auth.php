<?php
header('Content-Type: application/json');
require_once '../config.php';

// Register new user
function register($email, $password) {
    global $conn;
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return array('error' => 'Email already exists');
    }
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $email, $hashed_password);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('error' => 'Registration failed');
    }
}

// Login user
function login($email, $password) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            return array('success' => true);
        }
    }
    
    return array('error' => 'Invalid credentials');
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'register':
                echo json_encode(register($data['email'], $data['password']));
                break;
            case 'login':
                echo json_encode(login($data['email'], $data['password']));
                break;
            case 'logout':
                session_start();
                session_destroy();
                echo json_encode(array('success' => true));
                break;
        }
    }
}
?>