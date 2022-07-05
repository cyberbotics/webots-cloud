<?php # This script list available projects
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
  if (isset($data->url)) {
    $query1 = "SELECT DISTINCT url FROM project";
    $result1 = $mysqli->query($query1) or error($mysqli->error);
    $values = "";
    while($row = $result1->fetch_array(MYSQLI_ASSOC)) {
      $tempUrl = $row['url'];
      $query = "UPDATE project SET viewed = 5 WHERE url LIKE $tempUrl";
      $values .= $row['url'];
      $values .= " ";
    }
    error("Values: $values");
    $url = $data->url;
    $query = "UPDATE project SET viewed = viewed + 1 WHERE url LIKE $url";
    $mysqli->query($query) or error($mysqli->error);
    die('{"status":"updated"}');
  }
  $offset = isset($data->offset) ? intval($data->offset) : 0;
  $limit = isset($data->limit) ? intval($data->limit) : 10;
  $query = "SELECT * FROM project ORDER BY stars DESC LIMIT $limit OFFSET $offset";
  $result = $mysqli->query($query) or error($mysqli->error);
  $projects = array();
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    settype($row['id'], 'integer');
    settype($row['viewed'], 'integer');
    settype($row['stars'], 'integer');
    settype($row['competitors'], 'integer');
    $row['title'] = htmlentities($row['title']);
    $row['description'] = htmlentities($row['description']);
    $row['version'] = htmlentities($row['version']);
    array_push($projects, $row);
  }
  $result = $mysqli->query("SELECT COUNT(*) AS count FROM project") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $answer = new StdClass;
  $answer->projects = $projects;
  $answer->total = intval($count['count']);
  die(json_encode($answer));
 ?>
