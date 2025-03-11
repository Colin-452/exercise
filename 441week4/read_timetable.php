<!-- Colin-->
<?php
// read_timetable.php

$host = 'sql201.infinityfree.com'; // Replace with your host
$dbname = 'if0_38341114_time_db';  // Replace with your database name
$username = 'if0_38341114';  // Replace with your MySQL username
$password = 'RDG8yHog9b';      // Replace with your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT * FROM timetable");
    $timetable = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timetable</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>Timetable</h1>
    <table>
        <tr>
            <th>Subject</th>
            <th>Day</th>
            <th>Time</th>
            <th>Teacher</th>
        </tr>
        <?php foreach ($timetable as $entry): ?>
        <tr>
            <td><?php echo htmlspecialchars($entry['subject']); ?></td>
            <td><?php echo htmlspecialchars($entry['day']); ?></td>
            <td><?php echo htmlspecialchars($entry['time']); ?></td>
            <td><?php echo htmlspecialchars($entry['teacher']); ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>