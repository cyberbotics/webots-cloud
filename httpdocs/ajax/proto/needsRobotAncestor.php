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
  $url = $mysqli->escape_string($data->url);
  $branch = basename(dirname(__FILE__, 4));
  if (!$branch)
    $branch = "main";
  $condition = "branch=\"$branch\" AND url=\"$url\"";

  $result = $mysqli->query("SELECT needs_robot_ancestor FROM proto WHERE $condition");
  die(json_encode($result->fetch_array(MYSQLI_ASSOC)));
 ?>
