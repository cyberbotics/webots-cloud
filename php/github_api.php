<?php

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
?>