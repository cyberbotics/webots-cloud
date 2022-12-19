<?php

require '../php/token.php';
require '../php/database.php';

function github_api($api, $token, &$http_code = false, $custom_request = false, $payload = '') {
  $url = 'https://api.github.com/' . $api;
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_USERAGENT, 'webots.cloud');
  curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.github+json'
  ]);
  if (!empty($payload)) {
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
  }
  if ($custom_request !== false)
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $custom_request);
  $content = curl_exec($curl);
  $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
  curl_close($curl);
  if ($http_code !== false)
    $http_code = $code;
  if ($content == '' && $code != 204) {
    print('Error: ' . $url . ' returned ' . $code . " HTTP code with an empty response\n");
    return null;
  }
  return json_decode($content, true);
}

function repository_dispatch($organizer_repository, $participant_repository) {
  global $webots_cloud_token;
  $http_code = 0;
  $json = github_api('repos/' . $organizer_repository . '/dispatches', $webots_cloud_token, $http_code, false,
                     '{"event_type": "run_trigger", "client_payload": {"repository": "'. $participant_repository .'"}}');
  if ($http_code == 204)
    echo 'Success: sent repository dispatch to https://github.com/' . $organizer_repository. '/actions';
  else {
    echo 'Error: failed to send repository dispatch to https://github.com/' . $organizer_repository. '/actions';
    print_r($json);
  }
}

function accept_invitation($invitation) {
  if ($invitation == 0)
    return;
  global $webots_cloud_token;
  $http_response = 0;
  github_api('user/repository_invitations/' . $invitation, $webots_cloud_token, $http_response, 'PATCH');
  if ($http_response != 204)
    echo "Error: could not accept invitation\n";
  else
    echo "Success: invitation accepted\n";
}

function check_invitation($organizer_repository) {
  global $webots_cloud_token;
  $json = github_api('user/repository_invitations', $webots_cloud_token);
  if ($json === null || empty($json))  // error or no invitation
    return 0;
  foreach($json as $invitation) {
    if ($invitation['repository']['full_name'] == $organizer_repository)
      return $invitation['id'];
  }
  return 0;  // no invitation for the organizer repository
}

// should be used with a GH_TOKEN, not a Personal Access Token (PAT)
function check_repo_token($github_token, $participant_repo) {
  $participant = explode('/', $participant_repo)[0];
  $http_code = 0;
  $json = github_api('repos/' . $participant_repo, $github_token, $http_code, $custom_request = 'DELETE');
  if ($http_code == 403 && $json['message'] == 'Resource not accessible by integration')
    return true;
  echo 'HTTP code for https://api.github.com/repos' . $participant_repo . ': ' . $http_code . "\n";
  print_r($json);
  return false;
}

$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  die("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$mysqli->query("LOCK TABLES queue WRITE, project READ") or die($mysqli->error);

if (!isset($_POST['organizer']))
  die("Error: missing organizer parameter.");

if (!isset($_POST['participant']))
  die("Error: missing participant parameter.");

$organizer = $_POST['organizer'];
$participant = $_POST['participant'];

$query = "SELECT id FROM project WHERE `url` LIKE 'https://github.com/$organizer/%'";
$result = $mysqli->query($query) or die($mysqli->error);
$project = $result->fetch_array(MYSQLI_ASSOC);
$project_id = $project['id'];

if (isset($_POST['organizer_repo_token'])) {
  if (!check_repo_token($_POST['organizer_repo_token'], $organizer))
    die("Error: wrong organizer repository token.");
  $query = "DELETE FROM queue WHERE queue.project=$project_id AND queue.participant = 'R:$participant'";
  $mysqli->query($query) or die($mysqli->error);
  if ($mysqli->affected_rows === 0)
    die("Error: could not delete repository dispatch queue for $participant");
  $query = "SELECT participant FROM queue WHERE project=$project_id ORDER BY `date` ASC";  # pick the oldest entry from the queue (FIFO)
  $result = $mysqli->query($query) or die($mysqli->error);
  $next = $result->fetch_array(MYSQLI_ASSOC);
  $participant = $next['participant'];
  if ($next) {
    repository_dispatch($organizer, $participant);
    $query = "UPDATE queue SET participant='R:$participant' WHERE project=$project_id AND participant='$participant'";  # mark it running (R:)
    $mysqli->query($query) or die($mysqli->error);
    die("Success: running next job from queue: " . $participant);
  } else
    die("Success: no further participant in queue.");
}

accept_invitation(check_invitation($organizer));

if (!check_repo_token($_POST['token'], $participant))
  die("Error: wrong participant repository token.");

$query = "SELECT COUNT(*) AS count FROM queue WHERE project=$project_id";
$result = $mysqli->query($query) or die($mysqli->error);
$count = $result->fetch_array(MYSQLI_ASSOC);
$total = intval($count['count']);
$result->free();
if ($total == 0)
  $running = 'R:';
else
  $running = '';
$query = "INSERT IGNORE INTO queue(project, participant) VALUES((SELECT id FROM project WHERE url LIKE 'https://github.com/$organizer/%'), '$running$participant')";
$mysqli->query($query) or die($mysqli->error);

if ($total == 0)
  repository_dispatch($organizer, $participant);
elseif $mysqli->affected_rows == 1
  die("Success: job added to the repository dispatch queue.");
else
  die("Success: job already in the repository dispatch queue.");
?>
