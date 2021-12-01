<?php # This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/github_oauth.php';
  require '../../../php/database.php';
  require '../../../php/simulation.php';
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
  $world_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch$folder/worlds/$world";
  $world_content = @file_get_contents($world_url);
  if ($world_content === false)
    error("Failed to fetch world file at $world_url");

  # retrieve the title and info (description) from the WorldInfo node (assuming the default format from a Webots saved world file)
  $world_info = false;
  $info = false;
  $title = '';
  $description = '';
  $line = strtok($world_content, "\r\n");
  while ($line !== false) {
    if ($line == "WorldInfo {")
      $world_info = true;
    elseif ($world_info) {
      if ($line === '}')
        break;
      if (substr($line, 0, 9) === '  title "')
        $title = substr($line, 9, strrpos($line, '"') - 9);
      elseif ($line === '  info [')
        $info = true;
      elseif ($info) {
        if ($line === '  ]')
          $info = false;
        elseif (substr($line, 0, 5) === '    "') {
          if ($description !== '')
            $description .= "\n";
          $description .= substr($line, 5, strrpos($line, '"') - 5);
        }
      }
    }
    $line = strtok("\r\n");
  }
  if ($world_info === false)
    error("Missing WorldInfo in $world world file");

  $auth = "Authorization: Basic " . base64_encode("$github_oauth_client_id:$github_oauth_client_secret");
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP', $auth]]]);
  $info_json = @file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
  $info = json_decode($info_json);
  $stars = intval($info->{'stargazers_count'});
  $language = $info->{'language'};
  $parent = 0;
  /*
  if ($id === 0)
    $query = "INSERT IGNORE INTO project(url, stars, parent, title, description, language) "
            ."VALUES(\"$url\", $stars, $parent, \"$title\", \"$description\", \"$language\")";
  else
    $query = "UPDATE project SET stars=$stars, parent=$parent, title=\"$title\", description=\"$description\", language=\"$language\", updated=NOW() "
            ."WHERE url=\"$url\" AND id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1) {
    if ($id === 0)
      error("This simulation already exists");
    else
      error("Failed to update the simulation");
  }
  */
  $answer = array();
  $answer['id'] = ($id === 0) ? $mysqli->insert_id : $id;
  $answer['url'] = $url;
  $answer['stars'] = $stars;
  $answer['parent'] = $parent;
  $answer['title'] = $title;
  $answer['description'] = $description;
  $answer['language'] = $language;
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
