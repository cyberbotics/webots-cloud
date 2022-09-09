
<?php # This script updates the status of a simulation server
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function remove($message) {
    global $mysqli, $url;
    $mysqli->query("DELETE FROM repository WHERE server IN (SELECT id FROM server WHERE url=\"$url\")") or error($mysqli->error);
    $mysqli->query("DELETE FROM server_branch WHERE id IN (SELECT id FROM server WHERE url=\"$url\") AND branch=\"main\"") or error($mysqli->error);
    $mysqli->query("DELETE FROM server WHERE url=\"$url\"") or error($mysqli->error);
    error($message);
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $url = $mysqli->escape_string($data->url);
  if (substr($url, 0, 8) !== 'https://')
    remove("Malformed URL: $url");
  $load_content = @file_get_contents("$url/load");
  if ($load_content === false)
    remove("Cannot reach simulation server at $url/load");
  if (!is_numeric($load_content))
    remove("Bad answer from simulation server: $load_content");
  $load = intval($load_content);
  $query = "SELECT id, share, started FROM server WHERE url=\"$url\"";
  $result = $mysqli->query($query) or error($mysqli->error);
  $server = $result->fetch_array(MYSQLI_ASSOC);
  $id = $server['id'];
  $share = $server['share'];
  $query = "UPDATE server SET `load`=$load WHERE id=$id";
  $mysqli->query($query) or error($mysqli->error);
  $answer = array();
  $answer['id'] = intval($id);
  $answer['url'] = $url;
  $answer['load'] = floatval($load);
  $answer['share'] = floatval($share);
  $answer['started'] = $server['started'];
  $answer['updated'] = date("Y-m-d H:i:s");
  die(json_encode($answer));
 ?>
