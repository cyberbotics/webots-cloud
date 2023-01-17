<?php # This script list available protos
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  header("Access-Control-Allow-Origin: *");
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $base_types = $data->base_types;
  $branch = basename(dirname(__FILE__, 4));
  if (!$branch)
    $branch = "proto";
  $condition = "branch=\"$branch\" AND base_type IN ('"
     . implode("','", array_map(fn($string): string => mysqli_real_escape_string($mysqli, $string),$base_types))
     . "')";
  $result = $mysqli->query("SELECT * FROM proto WHERE $condition");
  $protos = array();
  while($row = $result->fetch_assoc()) {
    array_push($protos, $row);
  }
  $result->free();
  die(json_encode($protos));
 ?>
