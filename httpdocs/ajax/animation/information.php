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

  $query = "SELECT MIN(uploaded) AS firstUpload FROM animation WHERE user=$user";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $firstUpload = $row['firstUpload'];
  }

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user=$user AND duration>0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalAnimations = $row['counter'];
  }

  $query = "SELECT COUNT(*) AS counter FROM animation WHERE user=$user AND duration=0";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalScenes = $row['counter'];
  }

  $query = "SELECT SUM(viewed) AS totalViews FROM animation WHERE user=$user";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $totalViews = $row['totalViews'];
  }

  $query = "SELECT title, id, viewed FROM animation WHERE user=$user ORDER BY viewed DESC";
  $result = $mysqli->query($query) or error($mysqli->error);
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $topTitle = $row['title'];
    $topId = $row['id'];
    $topViews = $row['viewed'];
    break;
  }

  error("Top Project: $topTitle");

  $answer = array();
  $answer['topTitle'] = "Bioloid Dog";//$topTitle;
  $answer['topId'] = "Acdx3l6";//$topId;
  $answer['topViews'] = 1110;//$topViews;
  $answer['firstUpload'] = $firstUpload;
  $answer['totalScenes'] = $totalScenes;
  $answer['totalAnimations'] = $totalAnimations;
  $answer['totalViews'] = $totalViews;
  die(json_encode($answer));
 ?>
