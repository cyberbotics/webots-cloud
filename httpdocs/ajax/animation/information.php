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

  $query = "SELECT title FROM animation WHERE user=$user";
  $result = $mysqli->query($query) or error($mysqli->error);
  $titles = "";
  $i = 1;
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    $titles .= strval($i) . $row['title'] . "   ";
    $i += 1;
  }
  error($titles);

  $answer = array();
  $answer['animation'] = $animations[0];
  $answer['uploadMessage'] = $uploadMessage;
  die(json_encode($answer));
 ?>
