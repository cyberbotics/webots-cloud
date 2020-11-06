<?php
  $username = '6f8ecd5f0734091246c6';
  $password = 'f9037a2fe1617b4738e3a85edc1b4b6e6f7d0cad';
  $auth = "Authorization: Basic " . base64_encode("$username:$password");
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP', $auth]]]);
  $info_json = file_get_contents("https://api.github.com/rate_limit", false, $context);
  print($info_json);
  $info_json = file_get_contents("https://api.github.com/repos/cyberbotics/webots", false, $context);
  print($info_json);
?>
