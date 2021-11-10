<?php
if ($_SERVER['REQUEST_URI'][1] == 'a')
  $found = file_exists('animations/' . substr($_SERVER['REQUEST_URI'], 2));
else
  $found = false;
http_response_code($found ? 200 : 404);
readfile('index.html');
?>
