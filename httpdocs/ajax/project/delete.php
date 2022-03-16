<?php # This script deletes a simulation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}

header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);

if (!isset($data->simulation))
  error('Missing simulation id');

if (!isset($data->password))
  error('No password provided...')

require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);

if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");

error("I really tried to delete simulation $data->simulation...");

die("{\"status\":1}");
?>