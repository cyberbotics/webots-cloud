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
  if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    error('Wrong e-mail address.');
  $token = bin2hex(random_bytes(16));
  $mysqli->query("INSERT INTO user(email, token) VALUES(\"$email\", \"$token\")") or error($mysqli->error);
  $link = 'http';
  if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    $link .= 's';
  $link .= '://' . $_SERVER['SERVER_NAME'] . "/?id=$mysqli->insert_id&token=$token&email=$email";
  $subject = "webots.cloud sign up";
  $message = "<html><head><title>$subject</title></head>"
           . "<body><p>Hello,</p><p>Please click on this <a href=\"$link\">link</a> to set a password and "
           . "activate your account.</p>"
           . "<p>This link will expires in 72 hours.</p>"
           . "<p>Best regards,</p><p><a href=\"https://webots.cloud\">webots.cloud</a></p>\n";
  $messageId = time() . '-' . md5('info@webots.cloud' . $email) . '@webots.cloud';
  $header = "From: info@webots.cloud\r\n"
          . "Reply-To: Olivier.Michel@cyberbotics.com\r\n"
          . "Cc: Olivier.Michel@cyberbotics.com\r\n"
          . "MIME-Version: 1.0\r\n"
          . "Content-type: text/html;charset=UTF-8\r\n"
          . "Message-ID: $messageId\r\n";
  mail($email, $subject, $message, $header);
  echo json_encode($data);
?>
