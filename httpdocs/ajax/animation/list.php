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
  $offset = isset($data->offset) ? intval($data->offset) : 0;
  $limit = isset($data->limit) ? intval($data->limit) : 10;
  $type = isset($data->type) ? strtoupper($data->type[0]) : '';
  $user = isset($data->user) ? intval($data->user) : 0;
  require '../../../php/mysql_id_string.php';
  if ($type == 'S') // scene
    $extra_condition = "duration = 0";
  else if ($type == 'A') // animation
    $extra_condition = "duration > 0";
  else if ($user != 0) // my-projects
    $extra_condition = "user = ${user}";
  if (isset($data->url)) { // view request
    $url = $mysqli->escape_string($data->url);
    $uri = substr($url, strrpos($url, '/'));
    $uploadMessage = "?upload=webots";
    if (str_ends_with($uri, $uploadMessage))
      $uri = substr($uri, 0, strrpos($uri, '?'));
    $id = string_to_mysql_id(substr($uri, 2)); // skipping '/A'
    $query = "UPDATE animation SET viewed = viewed + 1 WHERE id=$id";
    $mysqli->query($query) or error($mysqli->error);
    $query = "SELECT * FROM animation WHERE id=$id AND $extra_condition";
  } else { // listing request
    // delete old and not popular animations
    $query = "SELECT id, duration FROM animation WHERE $extra_condition AND ((viewed = 0 AND uploaded < DATE_SUB(NOW(), INTERVAL 1 DAY)) OR (viewed <= 2 AND user = 0 AND uploaded < DATE_SUB(NOW(), INTERVAL 1 WEEK)) OR (uploading = 1 AND uploaded < DATE_SUB(NOW(), INTERVAL 1 DAY)))";
    $result = $mysqli->query($query) or error($mysqli->error);
    require '../../../php/animation.php';
    while($row = $result->fetch_array(MYSQLI_ASSOC)) {
      $id = intval($row['id']);
      $mysqli->query("DELETE FROM animation WHERE id=$id");
      if (intval($row['duration']) == 0)
        delete_animation('S', $id);
      else
        delete_animation('A', $id);
    }
    $sortBy = isset($data->sortBy) && $data->sortBy != "default" && $data->sortBy != "undefined" ?
      $mysqli->escape_string($data->sortBy) : "viewed-desc";
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
      $extra_condition = "$extra_condition AND LOWER(title) LIKE LOWER('%$searchString%')";
    }
    $query = "SELECT * FROM animation WHERE $extra_condition AND uploading = 0 ORDER BY $parameter $order, id ASC LIMIT $limit OFFSET $offset";
  }
  $result = $mysqli->query($query) or error($mysqli->error);
  $animations = array();
  while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    settype($row['id'], 'integer');
    settype($row['user'], 'integer');
    settype($row['duration'], 'integer');
    settype($row['size'], 'integer');
    settype($row['viewed'], 'integer');
    $row['title'] = htmlentities($row['title']);
    $row['description'] = htmlentities($row['description']);
    $row['version'] = htmlentities($row['version']);
    $uri = '/' . $type . mysql_id_to_string($row['id']);
    $row['url'] = 'https://' . $_SERVER['SERVER_NAME'] . $uri;
    array_push($animations, $row);
  }
  if (isset($data->url)) { // view request
    if (count($animations) === 0)
      error("Animation not found.");
    $answer = array();
    $answer['animation'] = $animations[0];
    $answer['uploadMessage'] = $uploadMessage;
    die(json_encode($answer));
  }
  $result = $mysqli->query("SELECT COUNT(*) AS count FROM animation WHERE $extra_condition AND uploading = 0") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $answer = new stdClass;
  $answer->animations = $animations;
  $answer->total = intval($count['count']);
  die(json_encode($answer));
 ?>
