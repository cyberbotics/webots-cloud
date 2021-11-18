<?php # This script deletes an animation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}
function rrmdir($dir) {  # recursive rmdir, e.g., rm -rf
  $files = array_diff(scandir($dir), array('.','..'));
  foreach ($files as $file) {
    $path = "$dir/$file";
    (is_dir($path) && !is_link($path)) ? rrmdir($path) : unlink($path);
  }
  return rmdir($dir);
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
if (!isset($data->user))
  error('Missing user id');
if (!isset($data->password))
  error('Missing password');
if (!isset($data->animation))
  error('Missing animation id');
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$user = intval($data->user);
$animation = intval($data->animation);
$password = $mysqli->escape_string($data->password);
$query = "DELETE FROM animation WHERE user IN (SELECT id FROM user WHERE id=$user AND password=\"$password\")";
$mysqli->query($query) or error($mysqli->error);
if ($mysqli->affected_rows === 0)
  error('Could not delete animation');
require '../../../php/mysql_id_string.php';
$path = '../storage/A' . mysql_id_to_string($animation);
rrmdir($path);
die("{\"status\":1}");
?>
