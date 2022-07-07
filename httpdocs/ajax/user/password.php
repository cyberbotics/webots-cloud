<?php
  // This script sets the password for a user
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
  $id = intval($data->{'id'});
  $token = $mysqli->escape_string($data->{'token'});
  if (!preg_match('/^[0-9a-f]{32}$/',$token))
    error('Wrong token format.');
  $password = $mysqli->escape_string($data->{'password'});
  if (!preg_match('/^[0-9a-f]{64}$/',$password))
    error('Wrong password format.');
  $mysqli->query("DELETE FROM user WHERE password='' AND token!='' AND updated < NOW() - INTERVAL 72 HOUR");
  $result = $mysqli->query("SELECT password, token FROM user WHERE id=$id");
  $request = $result->fetch_assoc();
  $result->free();
  if (!$request)
    error('User not found.');
  if ($request['token'] === '')
    error('No password set-up requested.');
  if ($request['token'] !== $token)
    error('Wrong token provided.');
  $mysqli->query("UPDATE user SET password=\"$password\", token='' WHERE id=$id AND token='$token'") or error($mysqli->error);
  if ($mysqli->affected_rows === 0)
    error('Failed to set-up password.');
  if ($request['password'] === '')
    $status = 0;
  else
    $status = 1;
  die("{\"status\": \"$status\"}");
?>
