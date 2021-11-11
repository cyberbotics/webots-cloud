<?php
if (strlen($_SERVER['REQUEST_URI']) == 8 && $_SERVER['REQUEST_URI'][1] == 'A')
  $found = file_exists('storage/' . substr($_SERVER['REQUEST_URI'], 1));
else
  $found = false;
http_response_code($found ? 200 : 404);
readfile('index.html');
?>
