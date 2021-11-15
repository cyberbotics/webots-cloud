<?php # This script creates a new animation entry in the database
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function parse_sf_string($line, $parameter) {
    $n = 2;  // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter=\"", $n);
    $value = '';
    if ($start !== false) {
      $start += strlen($parameter) + 2;
      $end = $start;
      do { // skip escaped double quotes
        $end += 1;
        $end = strpos($line, '"', $end);
      } while ($line[$end - 1] == '\\' && $end !== false);
      if ($end !== false)
        $value = str_replace('\\"', '"', substr($line, $start + 1, $end - $start - 1));
    }
    return $value;
  }
  function parse_mf_string($line, $parameter) {
    $n = 2;  // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter='\"", $n);
    $value = array();
    if ($start !== false) {
      $start += strlen($parameter) + 2;
      $end = $start;
      while(true) {
        do { // skip escaped double quotes
          $end += 1;
          $end = strpos($line, '"', $end);
        } while ($line[$end - 1] == '\\' && $end !== false);
        if ($end !== false)
          array_push($value, append(str_replace('\\"', '"', substr($line, $start + 1, $end - $start - 1))));
        else
          break;
        if ($line[$end + 1] === ' ' && $line[$end + 2] === '"')
          $start = $end + 2;
        else
          break;
      }
    }
    return $value;
  }
  $size = $_FILES['animation-file']['size'] + $_FILES['model-file']['size'];
  $total = count($_FILES['textures']['name']);
  for($i = 0; $i < $total; $i++)
    $size += $_FILES['textures']['size'][$i];
  header('Content-Type: application/json');

  // determine title
  $file = fopen($_FILES['model-file']['tmp_name'], 'r') or error('Unable to open model file');
  $count = 0;
  $world_info = false;
  while (!feof($file)) {
    $line = fgets($file);
    if (substr($line, 0, 15) === "<WorldInfo id='") {
      $world_info = true;
      $title = parse_sf_string($line, 'title');
      $info = parse_mf_string($line, 'info');
    }
  }
  fclose($file);
  if ($world_info === false)
    error('Missing WorldInfo title in x3d file');

  // determine duration
  $duration = false;
  $content = file_get_contents($_FILES['animation-file']['tmp_name']);
  $start = strrpos($content, '{"time":');
  if ($start !== false) {
    $start += 8;
    $end = strpos($content, ',', $start);
    if ($end !== false)
      $duration = intval(substr($content, $start, $end - $start));
  }
  if ($duration === false)
    error('Missing duration');

  // save entry in database
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $escaped_title = $mysqli->escape_string($title);
  $query = "INSERT INTO animation(title, duration, size) VALUES(\"$escaped_title\", $duration, $size)";
  $mysqli->query($query) or error($mysqli->error);

  // save files in new folder
  require '../../../php/mysql_id_string.php';
  $uri = '/A' . mysql_id_to_string($mysqli->insert_id);
  $folder = "../../storage$uri";
  mkdir($folder);
  if (!move_uploaded_file($_FILES['animation-file']['tmp_name'], "$folder/animation.json"))
    error('Cannot move animation file.');
  if (!move_uploaded_file($_FILES['model-file']['tmp_name'], "$folder/model.x3d"))
    error('Cannot move model file.');
  if ($total > 0) {
    mkdir("$folder/textures");
    for($i = 0; $i < $total; $i++) {
      $target = basename($_FILES['textures']['name'][$i]);
      if ($target == '')
        continue;
      if (!move_uploaded_file($_FILES['textures']['tmp_name'][$i], "$folder/textures/$target"))
        error("Cannot move $total $target");
    }
  }

  $answer = array();
  $answer['url'] = 'https://' . $_SERVER['SERVER_NAME'] . $uri;
  $answer['title'] = $title;
  $answer['duration'] = $duration;
  $answer['size'] = $size;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
