<?php # This script deletes a simulation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}

header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
if (!isset($data->simulation))
  error('Missing simulation id');
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$user = isset($data->user) ? intval($data->user) : 0;
$simulation = intval($data->simulation);
$password = isset($data->password) ? $mysqli->escape_string($data->password) : '';
// Until here all is good in the hood

// Need to find where simulations are in database...
//$query = "DELETE FROM animation WHERE id=$simulation AND (user=0 OR user IN (SELECT id FROM user WHERE id=$user AND password=\"$password\"))";

//$query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='dbName' ";
$query = "USE $database_name SELECT * FROM sys.Tables";
$result = $mysqli->query($query);
error("Found these tables: $result");

error("I really tried to delete simulation $data->simulation...");

die("{\"status\":1}");
?>