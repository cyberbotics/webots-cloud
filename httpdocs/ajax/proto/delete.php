<?php
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
$user = isset($data->user) ? intval($data->user) : 0;
$password = isset($data->password) ? $mysqli->escape_string($data->password) : '';
$id = isset($data->id) ? intval($data->id) : 0;
$query = "DELETE FROM proto WHERE id=$id AND EXISTS (SELECT * FROM user WHERE id=$user AND password='$password' AND email LIKE '%@cyberbotics.com')";
$mysqli->query($query) or error($mysqli->error);
if ($mysqli->affected_rows === 0)
  error("Could not delete proto");
$mysqli->query("DELETE FROM proto_keywordmap WHERE proto_id=$id") or error($mysqli->error);
die('{"status":1}');
?>
