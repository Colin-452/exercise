<?php
// Database configuration
$host = 'sql201.infinityfree.com'; // Replace with your host
$dbname = 'if0_38341114_time_db';  // Replace with your database name
$username = 'if0_38341114';  // Replace with your MySQL username
$password = 'RDG8yHog9b';      // Replace with your MySQL password

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the raw POST data
$data = file_get_contents('php://input');
$classes = json_decode($data, true);

if (!empty($classes)) {
    // Prepare the SQL statement
    $stmt = $conn->prepare("INSERT INTO timetable (subject, day, time, teacher) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }

    // Bind parameters and execute the statement for each class
    foreach ($classes as $class) {
        $subject = $class['subject'];
        $day = $class['day'];
        $time = $class['time'];
        $teacher = $class['teacher'];

        $stmt->bind_param("ssss", $subject, $day, $time, $teacher);

        if (!$stmt->execute()) {
            echo json_encode(['status' => 'error', 'message' => 'Error inserting data: ' . $stmt->error]);
            exit;
        }
    }

    // Close the statement
    $stmt->close();

    // Send success response
    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully!']);
} else {
    // Send error response if no data is received
    echo json_encode(['status' => 'error', 'message' => 'No data received!']);
}

// Close the connection
$conn->close();
?>