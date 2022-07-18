<?php # This script list available animations (or scenes)
function error($message) {
  die("{\"error\":\"$message\"}");
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$time = isset($data->time) ? $data->time : "week";

$query = "SELECT id FROM animation WHERE uploaded < DATE_SUB(NOW(), INTERVAL 1 DAY)";

die(json_encode($answer));
?>