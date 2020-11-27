<?php # This script initializes a new project
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
  $url = $mysqli->escape_string($data->url);
  $query = "INSERT IGNORE INTO server(url) VALUES(\"$url\")";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1) {
    if ($id === 0)
      error("This server already exists");
    else
      error("Failed to update the server");
  }
  $answer = array();
  $answer['id'] = $mysqli->insert_id;
  $answer['url'] = $url;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
