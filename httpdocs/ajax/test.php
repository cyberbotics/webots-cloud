<?php
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP']]]);
  $info_json = file_get_contents("https://api.github.com/repos/cyberbotics/webots", false, $context);
  print($info_json);
?>
