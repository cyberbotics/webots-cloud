<?php

include '../php/token.php';

function repository_dispatch($organizer_repository, $participant_repository, $participant_token) {
  global $webots_cloud_token;
  $curl = curl_init();
  $url = 'https://api.github.com/repos/' . $organizer_repository . '/dispatches';
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_USERAGENT, 'webots.cloud');
  curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: token ' . $webots_cloud_token,
    'Accept: application/vnd.github.everest-preview+json'
  ]);
  curl_setopt($curl, CURLOPT_POST, 1);
  curl_setopt($curl, CURLOPT_POSTFIELDS,'{"event_type": "run_trigger", "client_payload": {"repository": "'. $participant_repository .'", "token": "' . $participant_token . '"}}');
  $content = curl_exec($curl);
  if ($answer = curl_getinfo($curl, CURLINFO_HTTP_CODE) != 204)  # 204: no answer
    echo('Error: unexpected answer: ' . $answer. ' on ' . $url . '<br><br>' . $content);
  else
    echo 'Success: sent repository dispatch to https://github.com/' . $organizer_repository. '/actions';
  curl_close($curl);
}

// should be used with a GH_TOKEN, not a Personal Access Token (PAT)
function check_participant_token($github_token, $participant_repo) {
  $participant = explode('/', $participant_repo)[0]; 
  $curl = curl_init();
  $url = 'https://api.github.com/repos/' . $participant_repo;
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_USERAGENT, 'webots.cloud');
  curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
  curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $github_token,
    'Accept: application/vnd.github+json'
  ]);
  $content = curl_exec($curl);
  $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
  curl_close($curl);
  if ($content == '') {
    echo 'Empty answer from ' . $url;
    return false;
  }
  $json = json_decode($content, true);

  // when requesting the repo with the GH_TOKEN from outside, we are getting this answer which is fine
  if ($http_code == 403 && $json['message'] == 'Resource not accessible by integration')
    return true;

  // in case the token is wrong we should get a 404 answer for a private repo and a 201 answer for a public repo
  echo "HTTP code for " . $url . ": " . $http_code . "\n";
  print_r($json);
  return false;
}

if (check_participant_token($_POST['token'], $_POST['participant']))
  repository_dispatch($_POST['organizer'], $_POST['participant'], $_POST['token']);  # FIXME: token is useless here

?>
