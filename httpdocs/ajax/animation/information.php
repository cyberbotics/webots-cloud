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

  $query = "SELECT MIN(uploaded) AS firstUpload FROM animation WHERE user = $user";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $firstUpload = $row['firstUpload'];
  }

  if (!$firstUpload)
    die('{"status": "no uploads"}');

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user = $user AND duration>0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalAnimations = $row['counter'];
  }

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user = $user AND duration=0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalScenes = $row['counter'];
  }

  $query = "SELECT SUM(viewed) AS totalViews FROM animation WHERE user = $user";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalViews = $row['totalViews'];
  }

  require '../../../php/mysql_id_string.php';
  $query = "SELECT title, id, viewed, version, duration FROM animation WHERE user = $user ORDER BY viewed DESC";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $topTitle = $row['title'];
    $topViews = $row['viewed'];
    $topVersion = $row['version'];
    $topDuration = $row['duration'];
    $topType = $row['duration'] == 0 ? "S" : "A";
    $topId = $row['id'];
    $topUri = '/' . $type . mysql_id_to_string($row['id']);
    $topUrl = 'https://' . $_SERVER['SERVER_NAME'] . $topUri;
    break;
  }

  $answer = array();
  $answer['firstUpload'] = $firstUpload;
  $answer['totalScenes'] = $totalScenes;
  $answer['totalAnimations'] = $totalAnimations;
  $answer['totalViews'] = $totalViews;
  $answer['title'] = $topTitle;
  $answer['duration'] = $topDuration;
  $answer['url'] = $topUrl;
  $answer['views'] = $topViews;
  $answer['version'] = $topVersion;
  die(json_encode($answer));
 ?>
