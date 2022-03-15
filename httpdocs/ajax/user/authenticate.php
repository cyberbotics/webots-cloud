<?php
  // This script authenticates a user from its email and password (hashed)
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  @$mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  if (mysqli_connect_errno())
    error(sprintf("[%d] %s", mysqli_connect_errno(), mysqli_connect_error()));
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  $password = $mysqli->escape_string($data->{'password'});
  $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"")
    or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error("This e-mail address is not registered. $email");
  if ($user['password'] != $password)
    error("The password you entered is wrong.");
  $uploads = $data->{'uploads'};
  if (count($uploads)) {
    $query = "UPDATE animation SET user=$user[id] WHERE user=0 AND id IN ($uploads[0]";
    foreach(array_slice($uploads, 1) as $upload)
      $query .= ", $upload";
    $query .= ")";
    $mysqli->query($query) or error($mysqli->error);
  }
  die("{\"id\": $user[id]}");
 ?>
