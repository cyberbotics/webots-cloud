<?php # This script list available animations
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
  $offset = isset($data->offset) ? intval($data->offset) : 0;
  $limit = isset($data->limit) ? intval($data->limit) : 10;
  if (isset($data->id))
    $query = 'SELECT * FROM animation WHERE id="' + $mysqli->escape_string($data->id) + '"';
  else
    $query = "SELECT * FROM animation LIMIT $limit OFFSET $offset";
  $result = $mysqli->query($query) or error($mysqli->error);
  $answer = array();
  while($row = $result->fetch_array(MYSQLI_ASSOC))
    array_push($answer, $row);
  die(json_encode($answer));
 ?>
