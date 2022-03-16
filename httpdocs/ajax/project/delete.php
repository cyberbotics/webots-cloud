<?php # This script deletes a simulation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}

header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);

error("Leaving because I can, but I read $data->simulation...");

require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);

if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");

die("{\"status\":1}");
?>