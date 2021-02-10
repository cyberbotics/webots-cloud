<?php # This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function generate_random_string($length = 11) {
    $characters = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $random_string = '';
    $end = strlen($characters) - 1;
    for ($i = 0; $i < $length; $i++) {
      if ($i == 0 || $i == $length - 1)
        $start = 2;
      else
        $start = 0;
      $random_string .= $characters[rand($start, $end)];
    }
    return $random_string;
  }
  $animation_filename = $_FILES['animation-file']['name'];
  $model_filename = $_FILES['model-file']['name'];
  $size = $_FILES['animation-file']['size'] + $_FILES['model-file']['size'];
  $total = count($_FILES['texture']['name']);
  for($i = 0; $i < $total; $i++) {
    $size += $_FILES['texture']['size'][$i];
  }
  header('Content-Type: application/json');
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  do $folder = '../../animations/' . generate_random_string(); while(file_exists($folder));
  mkdir($folder);
  if (!move_uploaded_file($_FILES['animation-file']['tmp_name'], "$folder/animation.json"))
    error('Cannot move animation file.');
  if (!move_uploaded_file($_FILES['model-file']['tmp_name'], "$folder/model.x3d"))
    error('Cannot move model file.');
  mkdir("$folder/textures");
  for($i = 0; $i < $total; $i++) {
    $target = $_FILES['textures']['name'][$i];
    if ($target == '')
      continue;
    if (!move_uploaded_file($_FILES['texture']['tmp_name'][$i], "$folder/textures/$target"))
      error("Cannot move $total $target");
  }
  $url = "https://webots.cloud/animations/$folder/";
  $title = 'noname';
  $duration = 0;
  /*
  if ($id === 0)
    $query = "INSERT IGNORE INTO animation(url, title, duration, size) "
            ."VALUES(\"$url\", \"$title\", $duration, $size)";
  else
    $query = "UPDATE animation SET title=\"$title\", duration=$duration, size=$size, updated=NOW() "
            ."WHERE url=\"$url\" AND id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1) {
    if ($id === 0)
      error("This animation already exists");
    else
      error("Failed to update the animation");
  }
  */
  $answer = array();
  // $answer['id'] = ($id === 0) ? $mysqli->insert_id : $id;
  $answer['url'] = $url;
  $answer['title'] = $title;
  $answer['duration'] = $duration;
  $answer['size'] = $size;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
