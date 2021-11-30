<?php # This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function remove($message) {
    global $mysqli, $url;
    $mysqli->query("DELETE FROM server WHERE url=\"$url\"") or error($mysqli->error);
    error($message);
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
  if (substr($url, 0, 8) !== 'https://')
    remove("Malformed URL: $url");
  $session_content = @file_get_contents("$url/session");
  if ($session_content === false)
    remove("Cannot reach session server at $url");
  if (substr($session_content, 0, 6) !== 'wss://')
    remove("Bad answer from session server: $session_content");
  $query = "SELECT id FROM server WHERE url=\"$url\"";
  $result = $mysqli->query($query) or error($mysqli->error);
  $server = $result->fetch_array(MYSQLI_ASSOC);
  if ($server)
    $id = $server['id'];
  else {
    $query = "INSERT INTO server(url) VALUES(\"$url\")";
    $mysqli->query($query) or error($mysqli->error);
    $id = $mysqli->insert_id;
  }

  $answer = array();
  $answer['id'] = $id;
  $answer['url'] = $url;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
