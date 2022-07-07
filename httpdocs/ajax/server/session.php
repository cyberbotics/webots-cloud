<?php
function error($message) {
  die("Error: $message");
}
function return_url($url) {
  if (substr($url, 0, 8) === "https://")
    die('wss://' . substr($url, 8));
  elseif (substr($url, 0, 7) === "http://")
    die('ws://' . substr($url, 7));
  else
    error("wrong URL protocol in $url");
}
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$url = $mysqli->escape_string($_GET['url']);
# search for a dedicated server first
$query = "SELECT url FROM server WHERE `load` < 100 AND id IN (SELECT server FROM repository WHERE \"$url%\" LIKE CONCAT(url, '%')) ORDER BY `load` LIMIT 1";
$result = $mysqli->query($query) or error($mysqli->error);
if ($row = $result->fetch_array(MYSQLI_ASSOC))
  return_url($row['url']);
# no available dedicated server found, reverting to a public server
$query = "SELECT url FROM server WHERE `share` > 0 AND `share` - `load` > 0 ORDER BY `share` - `load` DESC LIMIT 1";
$result = $mysqli->query($query) or error($mysqli->error);
if ($row = $result->fetch_array(MYSQLI_ASSOC))
  return_url($row['url']);
# no public server currently available
error('no simulation server available at the moment.');
?>
