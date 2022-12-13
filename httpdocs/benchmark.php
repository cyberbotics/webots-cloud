<?php
# curl -d '{"event_type": "run_trigger", "client_payload": {"repository": "${{ github.repository }}"}}' -H "Content-Type: application/json" -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.everest-preview+json" "https://api.github.com/repos/omichel/my-benchmark/dispatches"

function get_json($url){
  $base = "https://api.github.com";
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $base . '/' . $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_USERAGENT, 'webots.cloud');
  $content = curl_exec($curl);
  echo $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
  curl_close($curl);
  return $content;
}

echo get_json("users/omichel/repos");

?>
