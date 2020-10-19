<?php # This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../php/database.php';
  require '../../php/simulation.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $url = $mysqli->escape_string($data->url);
  $id = isset($data->id) ? intval($data->id) : 0;
  $check_url = simulation_check_url($url);
  if (!is_array($check_url))
    error($check_url);
  list($username, $repository, $tag_or_branch, $folder, $world) = $check_url;
  $world_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch" . "$folder/worlds/$world";
  $world_content = @file_get_contents($world_url);
  if ($world_content === false)
    error("Failed to fetch world file at $world_url");
  # retrieve the title from the WorldInfo node (assuming the default tabulation from a Webots saved world file)
  $n = strpos($world_content, "\nWorldInfo {\n");
  if ($n === false)
    error("Missing WorldInfo in $world world file");
  $n = strpos($world_content, "\n  title \"", $n);
  if ($n === false)
    error("Missing WorldInfo.title in $world world file");
  $n += 10;
  $m = strpos($world_content, "\"\n", $n);
  if ($m === false)
    error("Missing closing double quote for WorldInfo.title in $world world file");
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP']]]);
  $info_json = @file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
  $info = json_decode($info_json);
  $stars = $info->{'stargazers_count'};
  $language = $info->{'language'};
  $parent = 0;
  $title = substr($world_content, $n, $m - $n);
  if ($id === 0)
    $query = "INSERT IGNORE INTO project(url, stars, parent, title, language) "
            ."VALUES(\"$url\", $stars, $parent, \"$title\", \"$language\")";
  else
    $query = "UPDATE project SET stars=$stars, parent=$parent, title=\"$title\", language=\"$language\" WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1) {
    if ($id === 0)
      error("This simulation already exists");
    else
      error("Unable to synchronize simulation");
  }
  $answer = array();
  $answer['id'] = $mysqli->insert_id;
  $answer['url'] = $url;
  $answer['stars'] = $stars;
  $answer['parent'] = $parent;
  $answer['title'] = $title;
  $answer['language'] = $language;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
