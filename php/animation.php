<?php
function rrmdir($dir) {  # recursive rmdir, e.g., rm -rf
  if (!file_exists($dir))
    return;
  if (!is_dir($dir)) {
    unlink($dir);
    return;
  }
  $files = array_diff(scandir($dir), array('.','..'));
  foreach ($files as $file) {
    $path = "$dir/$file";
    (is_dir($path) && !is_link($path)) ? rrmdir($path) : unlink($path);
  }
  return rmdir($dir);
}

function delete_animation($type, $animation) {
  require_once 'mysql_id_string.php';
  $path = "../../storage/$type" . mysql_id_to_string($animation);
  rrmdir($path);
}

function delete_animations($type, $animations) {
  foreach($animations as &$animation)
    delete_animation($type, $animation);
}
?>
