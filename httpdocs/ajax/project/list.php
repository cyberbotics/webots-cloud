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
  $type = isset($data->type) ? strtoupper($data->type[0]) : 'D';
  $branch = basename(dirname(__FILE__, 4));
  $condition = "branch=\"$branch\" AND ";
  if ($type == 'D') // demo
    $condition .= "type = \"demo\"";
  elseif ($type == 'C') // competition
    $condition .= "type = \"competition\"";
  if (isset($data->url)) {
    $url = $data->url;
    $query = "UPDATE project SET viewed = viewed + 1 WHERE url LIKE \"$url\"";
    $mysqli->query($query) or error($mysqli->error);
    die('{"status":"updated"}');
  }
  $sortBy = isset($data->sortBy) && $data->sortBy != "default" && $data->sortBy != "undefined" ?
    $mysqli->escape_string($data->sortBy) : "stars-desc";
  $parameter = explode("-", $sortBy)[0];
  $order = explode("-", $sortBy)[1];
  if ($parameter == "title" || $parameter == "Version") {
    if ($order == "asc")
      $order = "desc";
    else
      $order = "asc";
  }
  if (isset($data->search)) {
    $searchString = $mysqli->escape_string($data->search);
    $condition .= " AND LOWER(title) LIKE LOWER('%$searchString%')";
  }
  $offset = isset($data->offset) ? intval($data->offset) : 0;
  $limit = isset($data->limit) ? intval($data->limit) : 10;
  $query = "SELECT * FROM project WHERE $condition ORDER BY $parameter $order LIMIT $limit OFFSET $offset";
  $result = $mysqli->query($query) or error($mysqli->error);
  $projects = array();
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    settype($row['id'], 'integer');
    settype($row['viewed'], 'integer');
    settype($row['stars'], 'integer');
    settype($row['participants'], 'integer');
    $row['title'] = htmlentities($row['title']);
    $row['description'] = htmlentities($row['description']);
    $row['version'] = htmlentities($row['version']);
    array_push($projects, $row);
  }
  $result = $mysqli->query("SELECT COUNT(*) AS count FROM project WHERE $condition") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $answer = new StdClass;
  $answer->projects = $projects;
  $answer->total = intval($count['count']);
  die(json_encode($answer));
 ?>
