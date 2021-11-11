<?php
die(substr($_SERVER['REQUEST_URI'], 1));

if (substr($_SERVER['REQUEST_URI'], 10) == '/storage/A')
  $found = file_exists(substr($_SERVER['REQUEST_URI'], 1));
else
  $found = false;
http_response_code($found ? 200 : 404);
readfile('index.html');
?>
