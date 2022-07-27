<?php # This script list available animations (or scenes)
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
  $user = isset($data->user) ? intval($data->user) : false;
  if (!$user)
    error("User information error.");

  /* $query = "SELECT viewed SUM(*) AS views FROM animation WHERE user=$user AND duration>0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalViews = $row['views'];
  } */

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user=$user AND duration=0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalScenes = $row['counter'];
  }

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user=$user AND duration=0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalScenes = $row['counter'];
  }

  error("totalScenes: $totalScenes");

  $answer = array();
  $answer['totalScenes'] = $totalScenes;
  $answer['totalScenes'] = $uploadMessage;
  die(json_encode($answer));
 ?>
