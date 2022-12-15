<?php

include '../php/token.php';

function repository_dispatch($organizer_repository, $participant_repository) {
  global $token;
  $curl = curl_init();
  $url = 'https://api.github.com/repos/' . $organizer_repository . '/dispatches';
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_USERAGENT, 'webots.cloud');
  curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: token ' . $token,
    'Accept: application/vnd.github.everest-preview+json'
  ]);
  curl_setopt($curl, CURLOPT_POST, 1);
  curl_setopt($curl, CURLOPT_POSTFIELDS,'{"event_type": "run_trigger", "client_payload": {"repository": "'. $participant_repository .'"}}');
  $content = curl_exec($curl);
  if ($answer = curl_getinfo($curl, CURLINFO_HTTP_CODE) != 204)  # 204: no answer
    echo('Unexpected answer: ' . $answer. ' on ' . $url . '<br><br>' . $content);
  else
    echo 'OK';
  curl_close($curl);
}

repository_dispatch($_GET['organizer'], $_GET['participant']);

?>
