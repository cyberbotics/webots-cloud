<?php # This script initializes a new protos
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
require '../../../php/github_asset.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$url = $mysqli->escape_string($data->url);
$id = isset($data->id) ? intval($data->id) : 0;

# check content
$check_url = proto_check_url($url);
if (!is_array($check_url))
  error($check_url);
list($username, $repository, $tag_or_branch, $folder, $proto) = $check_url;
$proto_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch$folder/protos/$proto";
$proto_content = @file_get_contents($proto_url);
if ($proto_content === false) {
  $query = "DELETE FROM proto WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows === 0)
    error("Failed to delete proto with proto file '$proto'");
  error("Failed to fetch proto file $proto");
}

# check and retrieve information from webots.yaml file
$check_yaml = github_check_yaml($check_url, true);
if (!is_array($check_yaml)) {
  $query = "DELETE FROM proto WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  error($check_yaml);
}

# retrieve the title and infos from the header.
$info = false;
$title = '';
$description = '';
$license = '';
$license_url = '';
$line = strtok($proto_content, "\r\n");
$version = $mysqli->escape_string(substr($line, 10, 6)); // "#VRML_SIM R2022b utf8" -> "R2022b"
$line = strtok("\r\n");
while ($line !== false) {
  $line == trim($line);
  if ($line[0] === '#') {
      $line = trim(str_replace('#', '', $line));
      if (strtolower(substr($line, 0, 8)) !== 'template' && strtolower(substr($line, 0, 17)) !== 'documentation url' && substr($line, 0, 4) !== 'VRML') {
        if(strtolower(substr($line, 0, 4)) !== 'tags') {
          if (strpos($line, 'deprecated') || strpos($line, 'hidden'))
            error("This proto is either deprecated or hidden and should not be added.");
        elseif (strtolower(substr($line, 0, 11)) === 'license url')
          $license_url = trim(preg_replace("/license url\s*:/", '', $line));
        elseif (strtolower(substr($line, 0, 7)) === 'license')
          $license = trim(preg_replace("/license\s*:/", '', $line));
        else {
          if ($description !== '')
            $description .= "\n";
          $description .= $mysqli->escape_string(substr($line, 2));
        }
      }
    }
  } elseif (substr($line, 0, 6) === 'PROTO ')
    $title = trim(substr($line, 6));
    if (!empty($title) && $title[-1] === '[')
      $title = trim(substr($title, 0, -1));
  $line = strtok("\r\n");
}

$auth = "Authorization: Basic " . base64_encode("$github_oauth_client_id:$github_oauth_client_secret");
$context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP', $auth]]]);
$info_json = @file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
$info = json_decode($info_json);
$stars = intval($info->{'stargazers_count'});
$competitors = 0;
$query = "SELECT viewed FROM proto WHERE url=\"$url\" AND id=$id";
$result = $mysqli->query($query) or error($mysqli->error);
$row = $result->fetch_array(MYSQLI_ASSOC);
$viewed = ($result && $row) ? $row['viewed'] : 0;
$branch = basename(dirname(__FILE__, 4));
if ($id === 0)
  $query = "INSERT IGNORE INTO proto(url, viewed, stars, title, description, version, branch, license_url, license) "
          ."VALUES(\"$url\", $viewed, $stars, \"$title\", \"$description\", \"$version\", \"$branch\", \"$license_url\", \"$license\")";
else
  $query = "UPDATE proto SET viewed=$viewed, stars=$stars, title=\"$title\", description=\"$description\", "
          ."version=\"$version\", updated=NOW() "
          ."WHERE url=\"$url\" AND id=$id";
$mysqli->query($query) or error($mysqli->error);
if ($mysqli->affected_rows != 1) {
  if ($id === 0)
    error("This proto already exists");
  else
    error("Failed to update the proto");
}

# return answer
$search = isset($data->search) ? $data->search : "";
$condition = "branch=\"$branch\"";
if ($search != "")
  $condition .= " AND LOWER(title) LIKE LOWER('%$search%')";

$result = $mysqli->query("SELECT COUNT(*) AS count FROM proto WHERE $condition") or error($mysqli->error);
$count = $result->fetch_array(MYSQLI_ASSOC);
$total = intval($count['count']);

$answer = array();
$answer['id'] = ($id === 0) ? $mysqli->insert_id : $id;
$answer['url'] = $url;
$answer['viewed'] = $viewed;
$answer['stars'] = $stars;
$answer['title'] = $title;
$answer['description'] = $description;
$answer['version'] = $version;
$answer['updated'] = date("Y-m-d H:i:s");
$answer['total'] = $total;
die(json_encode($answer));
?>
