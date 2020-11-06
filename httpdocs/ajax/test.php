<?php
  $info_json = file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
  print($info_json);
?>
