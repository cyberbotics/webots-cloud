<?php # This script creates a new animation entry in the database
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function parse_sf_string($line, $parameter) {
    $n = 2;  // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter=", $n);
    $value = '';
    if ($start !== false) {
      $start += strlen($parameter) + 2;
      $quote = $line[$start];
      $end = $start;
      do { // skip escaped double quotes
        $end += 1;
        $end = strpos($line, $quote, $end);
      } while ($line[$end - 1] == '\\' && $end !== false);
      if ($end !== false)
        $value = str_replace("\\$quote", $quote, substr($line, $start + 1, $end - $start - 1));
    }
    return $value;
  }
  function parse_mf_string($line, $parameter) {
    $n = 2;  // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter='\"", $n);
    $value = array();
    if ($start !== false) {
      $start += strlen($parameter) + 3;
      while(true) {
        $end = $start;
        do { // skip escaped double quotes
          $end += 1;
          $end = strpos($line, '"', $end);
        } while ($line[$end - 1] == '\\' && $end !== false);
        if ($end !== false)
          array_push($value, str_replace('\\"', '"', substr($line, $start + 1, $end - $start - 1)));
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
  $animation = array_key_exists('animation-file', $_FILES);
  $size = $animation ? $_FILES['animation-file']['size'] : 0;
  $size += $_FILES['scene-file']['size'];
  $total = $_FILES['textures']['name'][0] ? count($_FILES['textures']['name']) : 0;
  for($i = 0; $i < $total; $i++)
    $size += $_FILES['textures']['size'][$i];
  $user = (isset($_POST['user'])) ? intval($_POST['user']) : 0;
  header('Content-Type: application/json');

  // determine title, info and version
  $file = fopen($_FILES['scene-file']['tmp_name'], 'r') or error('Unable to open scene file');
  $count = 0;
  $world_info = false;
  while (!feof($file)) {
    $line = fgets($file);
    if (substr($line, 0, 15) === "<WorldInfo id='") {
      $world_info = true;
      $title = parse_sf_string($line, 'title');
      $info = parse_mf_string($line, 'info');
      $description = implode("\n", $info);
    } else if (substr($line, 0, 30) == '<meta name="version" content="')
      $version = parse_sf_string($line, 'content');
  }
  fclose($file);
  if ($world_info === false)
    error('Missing WorldInfo title in x3d file');
  if (!isset($version))
    error('Missing version meta header node in x3d file')
  // determine duration
  if ($animation) {
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
  } else
    $duration = 0;
  // save entry in database
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $escaped_title = $mysqli->escape_string($title);
  $escaped_description = $mysqli->escape_string($description);
  $escaped_version = $mysqli->escape_string($version);
  if ($user !== 0) {
    $result = $mysqli->query("SELECT password from user WHERE id=$user") or error($mysqli->error);
    $password = $result->fetch_assoc();
    $result->free();
    if (!$password)
      error("Unknown user: $user.");
    if ($password['password'] !== $_POST['password'])
      error("Wrong password for user $user.");
  }
  $query = "INSERT INTO animation(title, description, version, duration, size, user) ".
           "VALUES(\"$escaped_title\", \"$escaped_description\", \"$escaped_version\", $duration, $size, $user)";
  $mysqli->query($query) or error($mysqli->error);
  $id = $mysqli->insert_id;

  // save files in new folder
  require '../../../php/mysql_id_string.php';
  $type = $animation ? 'A' : 'S';
  $uri = '/' . $type . mysql_id_to_string($mysqli->insert_id);
  $folder = "../../storage$uri";
  mkdir($folder);
  if ($animation && !move_uploaded_file($_FILES['animation-file']['tmp_name'], "$folder/animation.json"))
    error('Cannot move animation file.');
  if (!move_uploaded_file($_FILES['scene-file']['tmp_name'], "$folder/scene.x3d"))
    error('Cannot move scene file.');
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

  if ($type === 'S')  // scene
    $extra_condition = 'duration=0';
  else  // animation
    $extra_condition = 'duration>0';
  $result = $mysqli->query("SELECT COUNT(*) AS total FROM animation WHERE $extra_condition") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $total = intval($count['total']);

  $answer = array();
  $answer['id'] = $id;
  $answer['total'] = $total;
  $answer['url'] = 'https://' . $_SERVER['SERVER_NAME'] . $uri;
  $answer['title'] = $title;
  $answer['description'] = $description;
  $answer['version'] = $version;
  $answer['duration'] = $duration;
  $answer['size'] = $size;
  $answer['viewed'] = 0;
  $answer['user'] = $user;
  $answer['uploaded'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
