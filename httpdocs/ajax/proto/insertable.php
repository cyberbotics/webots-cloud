<?php # This script list available protos
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  header("Access-Control-Allow-Origin: *");
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $base_types = $data->base_types;
  $branch = basename(dirname(__FILE__, 4));
  if (!$branch)
    $branch = "proto";
  $placeholders = implode(',', array_fill(0, count($base_types), '?'));
  $condition = "branch=\"$branch\" AND base_type IN ( $placeholders)";
  $query = $mysqli->prepare("SELECT * FROM proto WHERE $condition");
  $query->execute(('Transform', 'Robot', 'Solid'));
  $result = $query->get_result();
  $protos = array();
  $row = $result->fetch_assoc();
  // while() {
  //   settype($row['id'], 'integer');
  //   settype($row['viewed'], 'integer');
  //   settype($row['stars'], 'integer');
  //   $row['title'] = htmlentities($row['title']);
  //   $row['description'] = htmlentities($row['description']);
  //   $row['version'] = htmlentities($row['version']);
  //   array_push($protos, $row);
  // }
  $result->free();
  die(json_encode($row));
 ?>
