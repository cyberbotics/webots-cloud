<?php # This script lists the current evaluation queue for a competition
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
  if (!isset($data->url))
    error("Missing url parameter.");
  $url = $mysqli->escape_string($data->url);

  $branch = basename(dirname(__FILE__, 4));
  $query = "SELECT queue.participant FROM queue JOIN project ON project.id=queue.project AND project.branch=\"$branch\" AND project.url LIKE \"$url\" ORDER BY queue.date ASC";
  $result = $mysqli->query($query) or error($mysqli->error);
  $participants = array();
  while ($participant = $result->fetch_array(MYSQLI_ASSOC))
    array_push($participants, $participant['participant']);
  $result->free();
  die(json_encode($participants));
 ?>
