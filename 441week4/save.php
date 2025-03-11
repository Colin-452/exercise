<?php
// save.php

header('Content-Type: application/json');

$host = 'sql201.infinityfree.com'; // Replace with your host
$dbname = 'if0_38341114_time_db';  // Replace with your database name
$username = 'if0_38341114';  // Replace with your MySQL username
$password = 'RDG8yHog9b';      // Replace with your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    foreach ($data as $entry) {
        $stmt = $pdo->prepare("INSERT INTO timetable (subject, day, time, teacher) VALUES (:subject, :day, :time, :teacher)");
        $stmt->execute([
            ':subject' => $entry['subject'],
            ':day' => $entry['day'],
            ':time' => $entry['time'],
            ':teacher' => $entry['teacher']
        ]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>