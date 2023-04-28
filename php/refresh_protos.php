<?php # This script refresh all protos
require 'github_oauth.php';
require 'github_asset.php';
require 'database.php';
require 'create_or_update.php';
$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
if ($mysqli->connect_errno)
  error("Can't connect to MySQL database: $mysqli->connect_error");
$mysqli->set_charset('utf8');
$result = $mysqli->query('SELECT id, url FROM proto where branch="proto"') or error($mysqli->error);
while($row = $result->fetch_array(MYSQLI_ASSOC)) {
  create_or_update_proto($row['url'], $row['id'], '');
}
?>
