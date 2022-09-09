<?php # This script list available servers
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
  $branch = "main";#basename(dirname(dirname(dirname(dirname(__FILE__)))));
  $extra_condition = "branch=\"$branch\"";
  $query = "SELECT * FROM server WHERE $extra_condition ORDER BY `share` - `load` DESC LIMIT $limit OFFSET $offset";
  $result = $mysqli->query($query) or error($mysqli->error);
  $servers = array();
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    settype($row['id'], 'integer');
    settype($row['load'], 'float');
    settype($row['share'], 'float');
    array_push($servers, $row);
  }
  $result = $mysqli->query("SELECT COUNT(*) AS count FROM server WHERE $extra_condition") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $answer = new StdClass;
  $answer->servers = $servers;
  $answer->total = intval($count['count']);
  die(json_encode($answer));
 ?>
