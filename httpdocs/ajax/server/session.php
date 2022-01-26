<?php
require '../../../php/database.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$url = $mysqli->escape_string($_GET['url']);
$query = "SELECT url FROM server WHERE `share` > 0 AND `share` - `load` > 0 AND id IN (SELECT server FROM repository WHERE url=\"$url\") ORDER BY `share` - `load` DESC LIMIT 1";
$result = $mysqli->query($query) or error($mysqli->error);
if ($row = $result->fetch_array(MYSQLI_ASSOC)) {
  if (substr($row['url'], 0, 8) === "https://")
    die('wss://' + substr($row['url'], 8));
  elseif (substr($row['url'], 0, 7) === "http://")
    die('ws://' + substr($row['url'], 7));
  else
    die("Wrong URL protocol in $row");
}
die('No simulation server available.');
?>
