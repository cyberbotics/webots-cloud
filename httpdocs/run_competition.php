<?php

require '../php/token.php';
require '../php/database.php';
require '../php/github_api.php';

function repository_dispatch($organizer_repository, $participant_repository, $opponent_repository) {
  global $webots_cloud_token;
  $http_code = 0;
  $json = github_api('repos/' . $organizer_repository . '/dispatches', $webots_cloud_token, $http_code, false,
                     '{"event_type": "run_trigger", "client_payload": {"repository": "'. $participant_repository .
                     '", "opponent": "' . $opponent_repository . '"}}');
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

if (!isset($_POST['organizer']))
  die("Error: missing organizer parameter.");

if (!isset($_POST['participant']))
  die("Error: missing participant parameter.");

$organizer = $_POST['organizer'];
$participant = $_POST['participant'];

if ($organizer == $participant)
  die("Called by the organizer, ignored.");

$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  die("Error: Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$mysqli->query("LOCK TABLES queue WRITE, project READ") or die($mysqli->error);

$organizer = $mysqli->real_escape_string($organizer);
$participant = $mysqli->real_escape_string($participant);

if (substr_count($organizer, '/') != 1)
  die("Error: Wrong organizer: $organizer");

if (substr_count($participant, '/') != 1)
  die("Error: Wrong participant: $participant");

// checking for new entry from the same user
$participant_repository = explode('/', $participant);
$json = json_decode(file_get_contents("storage/competition/$organizer/participants.json"));
foreach($json->participants as $p) {
  $repository = explode('/', $p->repository);
  if ($p->private && $repository[0] == $participant_repository[0] && $repository[1] != $participant_repository[1])
    die("Error: Participant already has an entry in the competition: " . $p->repository);
  if (isset($_POST['opponent']) && $p->name == $_POST['opponent'])
    $opponent = $p->repository;
}

$branch = basename(dirname(__FILE__, 2));
$query = "SELECT id FROM project WHERE branch=\"$branch\" AND `url` LIKE 'https://github.com/$organizer/%'";
$result = $mysqli->query($query) or die($mysqli->error);
$project = $result->fetch_array(MYSQLI_ASSOC);
$project_id = intval($project['id']);

if (isset($_POST['organizer_repo_token'])) {
  if (!check_repo_token($_POST['organizer_repo_token'], $organizer))
    die("Error: wrong organizer repository token.");
  $query = "DELETE FROM queue WHERE project=$project_id AND participant='R:$participant'";
  $mysqli->query($query) or die($mysqli->error);
  if ($mysqli->affected_rows === 0)
    die("Error: could not delete repository dispatch queue for $participant");
  $query = "SELECT participant, opponent FROM queue WHERE project=$project_id ORDER BY `date` ASC";  # pick the oldest entry from the queue (FIFO)
  $result = $mysqli->query($query) or die($mysqli->error);
  $next = $result->fetch_array(MYSQLI_ASSOC);
  if ($next) {
    $participant = $next['participant'];
    repository_dispatch($organizer, $participant, $next['opponent']);
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
if (isset($opponent))
  $query = "INSERT IGNORE INTO queue(project, participant, opponent) VALUES($project_id, '$running$participant', '$opponent')";
else {
  $query = "INSERT IGNORE INTO queue(project, participant) VALUES($project_id, '$running$participant')";
  $opponent = '';
}
$mysqli->query($query) or die($mysqli->error);

if ($total == 0)
  repository_dispatch($organizer, $participant, $opponent);
elseif ($mysqli->affected_rows == 1)
  die("Success: job added to the repository dispatch queue.");
else
  die("Success: job already in the repository dispatch queue.");
?>
