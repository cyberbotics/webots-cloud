<?php

include '../php/token.php';

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
    echo 'Error: could not accept invitation';
  else
    echo 'Success: invitation accepted';
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
function check_participant_token($github_token, $participant_repo) {
  $participant = explode('/', $participant_repo)[0];
  $http_code = 0;
  $json = github_api('repos/' . $participant_repo, $github_token, $http_code, $custom_request = 'DELETE');
  if ($http_code == 403 && $json['message'] == 'Resource not accessible by integration')
    return true;
  echo 'HTTP code for https://api.github.com/repos' . $participant_repo . ': ' . $http_code . "\n";
  print_r($json);
  return false;
}

if (isset($_POST['organizer']))
  $organizer = $_POST['organizer'];
elseif (isset($_GET['organizer']))
  $organizer = $_GET['organizer'];

if (isset($_POST['participant']))
  $participant = $_POST['participant'];
elseif (isset($_GET['participant']))
  $participant = $_GET['participant'];

accept_invitation(check_invitation($organizer));

if (check_participant_token($_POST['token'], $participant))
  repository_dispatch($organizer, $participant);

?>
