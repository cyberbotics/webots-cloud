<?php # This script refresh all protos

require '../../../php/refresh_password.php';
if ($_GET['password'] === $refresh_password) {
  require '../../../php/github_oauth.php';
  require '../../../php/github_asset.php';
  require '../../../php/database.php';
  require '../../../php/create_or_update.php';

  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $result = $mysqli->query('SELECT id, url FROM proto where branch="proto"') or error($mysqli->error);
  $continue_on_error = true;
  while($row = $result->fetch_array(MYSQLI_ASSOC))
    create_or_update_proto($row['url'], $row['id'], '');
}
?>
