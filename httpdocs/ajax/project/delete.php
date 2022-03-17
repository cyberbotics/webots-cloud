<?php # This script deletes a simulation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}

header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
if (!isset($data->id))
  error('Missing simulation id');
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$id = isset($data->id) ? intval($data->id) : '';
$url = isset($data->url) ? $mysqli->escape_string($data->url) : '';

// Need to find where simulations are in database...
$query = "DELETE FROM project WHERE url=\"$url\" AND id=$id";
$mysqli->query($query) or error($mysqli->error);
// Until here all is good in the hood
//error("Found this info: $result");

error("I really tried to delete simulation $data->id...");

die("{\"status\":1}");
?>