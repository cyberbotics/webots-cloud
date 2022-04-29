<?php # This script deletes an animation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
if (!isset($data->animation))
  error('Missing animation id');
$type = isset($data->type) ? strtoupper($data->type[0]) : 'A';
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$user = isset($data->user) ? intval($data->user) : 0;
$animation = intval($data->animation);
$password = isset($data->password) ? $mysqli->escape_string($data->password) : '';
$query = "SELECT id FROM user WHERE id=$user AND email LIKE '%@cyberbotics.com'";
$result = $mysqli->query($query) or error($mysqli->error);
$admin = $result->fetch_assoc();
$query = "DELETE FROM animation WHERE id=$animation";
if (!$admin)
  $query .= " AND (user=0 OR user IN (SELECT id FROM user WHERE id=$user AND password=\"$password\"))";
$mysqli->query($query) or error($mysqli->error);
if ($mysqli->affected_rows === 0)
  error('Could not delete animation');
require '../../../php/animation.php';
delete_animation($type, $animation);
die("{\"status\":1}");
?>
