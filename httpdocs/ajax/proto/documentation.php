<?php # This script list available protos
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
  $branch = basename(dirname(__FILE__, 4));
  $url = $mysqli->escape_string($data->url);
  $condition = "branch=\"$branch\" AND url=\"$url\"";
  $query = "SELECT base_type, description, version, license, license_url, no_3d_view, needs_robot_ancestor, updated, id FROM proto WHERE $condition";
  $result = $mysqli->query($query) or error($mysqli->error);
  die(json_encode($result->fetch_array(MYSQLI_ASSOC)));
 ?>
