<?php
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP']]]);
  $info_json = file_get_contents("https://api.github.com/rate_limit", false, $context);
  // https://api.github.com/repos/cyberbotics/webots
  print($info_json);
?>
