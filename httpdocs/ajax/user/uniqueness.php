<?php
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  $query = "SELECT * FROM user WHERE email like \"$email\"";
  $result = $mysqli->query($query) or error($mysqli->error);
  $notunique = $result->fetch_assoc();
  if ($notunique)
    error("An account has already been created with this e-mail.");
  else {
    $status = 'OK';
    die("{\"status\": \"$status\"}");
  }
?>
