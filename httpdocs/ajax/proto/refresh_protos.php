<?php # This script refresh all protos

require '../../../php/refresh_password.php';
if ($_GET['password'] === $refresh_password) {
  require '../../../php/github_oauth.php';
  require '../../../php/github_asset.php';
  require '../../../php/database.php';
  require '../../../php/create_or_update.php';

  # Refreshing a proto takes ~1 second of network wait (3-4 GitHub requests), so refreshing
  # all of them in one request exceeds the server's runtime limit and ends in a 503.
  # Instead, refresh the least recently updated protos for at most $time_budget seconds
  # and let a frequent cron job (e.g., hourly) cycle through the whole table.
  $time_budget = 45;  # seconds, keep below the PHP runtime limit
  ini_set('default_socket_timeout', 10);  # don't let a hung GitHub request eat the budget
  $start = time();
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $result = $mysqli->query('SELECT id, url FROM proto ORDER BY updated') or error($mysqli->error);
  $continue_on_error = true;
  $count = 0;
  while(time() - $start < $time_budget && ($row = $result->fetch_array(MYSQLI_ASSOC))) {
    create_or_update_proto($row['url'], $row['id'], '');
    $count++;
  }
  echo "{\"refreshed\":$count}";
}
?>
