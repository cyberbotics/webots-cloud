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
  if (isset($data->id)) {
    $query = "SELECT child.name, parent.name FROM proto_keywordmap LEFT JOIN proto_keyword AS child ON proto_keywordmap.keyword_id=child.keyword_id LEFT JOIN proto_keyword AS parent ON child.parent_id=parent.keyword_id WHERE proto_keywordmap.proto_id=$data->id";
    $mysqli->query($query) or error($mysqli->error);
    $protos = array();
    while($row = $result->fetch_array(MYSQLI_ASSOC)) {
      array_push($protos, $row);
    }
    die(json_encode($protos));
  }
 ?>
