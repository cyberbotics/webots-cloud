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
  $branch = basename(dirname(__FILE__, 4));
  if (isset($data->parent) && $data->parent!= '') {
    $parent = $mysqli->escape_string($data->parent);
    $query = "SELECT child.name FROM proto LEFT JOIN proto_keywordmap on proto.id = proto_keywordmap.proto_id LEFT JOIN proto_keyword AS child ON proto_keywordmap.keyword_id=child.keyword_id LEFT JOIN proto_keyword AS parent ON child.parent_id=parent.keyword_id WHERE parent.name=\"$parent\" AND branch=\"$branch\" GROUP BY proto_keywordmap.keyword_id ORDER BY COUNT(*), child.name DESC";
    $result = $mysqli->query($query) or error($mysqli->error);
    $protos = array();
    while($row = $result->fetch_array(MYSQLI_ASSOC))
      array_push($protos, $row);
    die(json_encode($protos));
  }
 ?>
