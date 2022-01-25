<?php # This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function remove($message) {
    global $mysqli, $url;
    $mysqli->query("DELETE FROM server WHERE url=\"$url\"") or error($mysqli->error);
    error($message);
  }
  function get_server_from_url($url) {
    $start = strpos($url, '://') + 3;
    $slash = strpos($url, '/', $start);
    $colon = strpos($url, ':', $start);
    if (!$slash && !$colon)
      return substr($url, $start);
    if (!$slash)
      $length = $colon - $start;
    elseif (!$colon)
      $length = $slash - $start;
    else
      $length = min($colon, $slash) - $start;
    return substr($url, $start, $length);
  }
  header('Content-Type: application/json');
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  if (isset($_POST['url']))
    $url = $mysqli->escape_string($_POST['url']);
  else
    error('Missing url parameter.' . $json);
  $server = get_server_from_url($url);
  $remote  = $_SERVER['REMOTE_ADDR'];  # IP address of the client machine
  $ips = gethostbynamel($server);
  $found = False;
  if (is_array($ips))
    foreach ($ips as $ip)
      if ($ip === $remote) {
        $found = true;
        break;
      }
  if (!$found) {
    $host = gethostbyaddr($_SERVER['REMOTE_ADDR']);
    $found = ($server === $host);
    if (!$found) {
      $ip_addresses = '';
      foreach ($ips as $ip)
        $ip_addresses .= $ip . ", ";
      if (strlen($ip_addresses > 2))
        $ip_addresses = substr($ip_addresses, 0, -2);
      error("Server name mismatch: \"$host\" != \"$server\" and $remote not in ($ip_addresses).");
    }
  }
  if (isset($_POST['currentLoad'])) {
    $load = floatval($_POST['currentLoad']);
    $query = "UPDATE server SET load=$load WHERE url=\"$url\"";
    $result = $mysqli->query($query) or error($mysqli->error);
    die("OK: $load");
  }
  if (isset($_POST['shareIdleTime']))
    $share = floatval($_POST['shareIdleTime']);
  else
    error('Missing shareIdleTime parameter.');
  if (!isset($_POST['allowedRepositories']))
    error('Missing allowedRepositories parameter.');
  $allowedRepositories = explode($_POST['allowedRepositories'], ',');
  $query = "INSERT INTO server(url, share) VALUES(\"$url\", $share) ON DUPLICATE KEY UPDATE share=$share";
  $result = $mysqli->query($query) or error($mysqli->error);
  $server_id = $mysqli->insert_id;
  foreach($allowedRepositories as $repository) {
    $repo = $mysqli->escape_string($repository);
    $query = "INSERT INTO repository(server, url) VALUES($server_id, \"$repo\")";
    $result = $mysqli->query($query) or error($mysqli->error);
  }
  die("OK: $share");
 ?>
