<?php # This script initializes a new project
# exit and error message
function error($message) {
  die("{\"error\":\"$message\"}");
}

# get content
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

# check content
$check_url = simulation_check_url($url);
if (!is_array($check_url))
  error($check_url);
list($username, $repository, $tag_or_branch, $folder, $world) = $check_url;
$world_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch$folder/worlds/$world";
$world_content = @file_get_contents($world_url);
if ($world_content === false) {
  $query = "DELETE FROM project WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows === 0)
    error("Failed to delete simulation with world file '$world'");
  error("Failed to fetch world file $world");
}

# check and retrieve information from webots.yaml file
$check_yaml = simulation_check_yaml($check_url);
if (!is_array($check_yaml)) {
  $query = "DELETE FROM project WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  error($check_yaml);
}
list($type, $benchmark, $competition) = $check_yaml;

# retrieve the title and info (description) from the WorldInfo node (assuming the default format from a Webots saved world file)
$world_info = false;
$info = false;
$title = '';
$description = '';
$line = strtok($world_content, "\r\n");
$version = $mysqli->escape_string(substr($line, 10, 6)); // "#VRML_SIM R2022b utf8" -> "R2022b"
$line = strtok("\r\n");
while ($line !== false) {
  if ($line == "WorldInfo {")
    $world_info = true;
  elseif ($world_info) {
    if ($line === '}')
      break;
    if (substr($line, 0, 9) === '  title "')
      $title = $mysqli->escape_string(substr($line, 9, strrpos($line, '"') - 9));
    elseif ($line === '  info [')
      $info = true;
    elseif ($info) {
      if ($line === '  ]')
        $info = false;
      elseif (substr($line, 0, 5) === '    "') {
        if ($description !== '')
          $description .= "\n";
        $description .= $mysqli->escape_string(substr($line, 5, strrpos($line, '"') - 5));
      }
    }
  }
  $line = strtok("\r\n");
}

# update database
if ($world_info === false)
  error("Missing WorldInfo in $world world file");
$auth = "Authorization: Basic " . base64_encode("$github_oauth_client_id:$github_oauth_client_secret");
$context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP', $auth]]]);
$info_json = @file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
$info = json_decode($info_json);
$stars = intval($info->{'stargazers_count'});
$competitors = 0;
$query = "SELECT viewed FROM project WHERE url=\"$url\" AND id=$id";
$result = $mysqli->query($query) or error($mysqli->error);
$row = $result->fetch_array(MYSQLI_ASSOC);
$viewed = ($result && $row) ? $row['viewed'] : 0;
$branch = basename(dirname(__FILE__, 4));
if ($id === 0)
  $query = "INSERT IGNORE INTO project(url, viewed, stars, title, description, version, competitors, type, branch) "
          ."VALUES(\"$url\", $viewed, $stars, \"$title\", \"$description\", \"$version\", $competitors, \"$type\", \"$branch\")";
else
  $query = "UPDATE project SET viewed=$viewed, stars=$stars, title=\"$title\", description=\"$description\", "
          ."version=\"$version\", competitors=$competitors, type=\"$type\", updated=NOW() "
          ."WHERE url=\"$url\" AND id=$id";
$mysqli->query($query) or error($mysqli->error);
if ($mysqli->affected_rows != 1) {
  if ($id === 0)
    error("This simulation already exists");
  else
    error("Failed to update the simulation");
}

# return answer
$search = isset($data->search) ? $data->search : "";
$condition = "branch=\"$branch\"";
if ($search != "")
  $condition .= " AND LOWER(title) LIKE LOWER('%$search%')";

$result = $mysqli->query("SELECT COUNT(*) AS count FROM project WHERE $condition") or error($mysqli->error);
$count = $result->fetch_array(MYSQLI_ASSOC);
$total = intval($count['count']);

$answer = array();
$answer['id'] = ($id === 0) ? $mysqli->insert_id : $id;
$answer['url'] = $url;
$answer['viewed'] = $viewed;
$answer['stars'] = $stars;
$answer['title'] = $title;
$answer['type'] = $type;
$answer['description'] = $description;
$answer['version'] = $version;
$answer['competitors'] = $competitors;
$answer['updated'] = date("Y-m-d H:i:s");
$answer['total'] = $total;
die(json_encode($answer));
?>
