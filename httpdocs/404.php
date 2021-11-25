<?php
if (strlen($_SERVER['REQUEST_URI']) == 8 && in_array($_SERVER['REQUEST_URI'][1], array('A', 'S')))
  $found = file_exists('storage' . $_SERVER['REQUEST_URI']);
elseif (in_array($_SERVER['REQUEST_URI'], array('/settings', '/scene', '/animation', '/demo', '/server')))
  $found = true;
else
  $found = false;
http_response_code($found ? 200 : 404);
readfile('index.html');
?>
