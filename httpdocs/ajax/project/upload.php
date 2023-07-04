<?php

require '../../../php/github_api.php';

header('Content-Type: application/json');

$participant_repository = $_POST['repository'];
if (preg_match('/^[\w.-]+\/[\w.-]+$/', $participant_repository) != 1)
  die('Error: bad repository: ' . $participant_repository);
$participant = explode('/', $participant_repository)[0];
$json = github_api('repos/' . $participant_repository, $_POST['token'], $http_code);
if ($http_code != 200)
  die('Error while checking the GitHub token: HTTP code: ' . $http_code);
if (!$json['permissions']['push'])
  die('Error: GitHub token not allowed to push on this repository');
$path = explode('/', $_POST['path']);
$c = count($path);
$target_folder = '../../storage/competition/' . $participant_repository;
if ($c > 2)
  die('Error: path with too many folders');
elseif ($c == 2) {
  $folder = $path[0];
  $number = $folder[0] == 'f' ? substr($folder, 1) : $folder;
  if (!is_numeric($number) || intval($number) != $number || $number[0] == '-')
    die('Error: bad folder name: ' . $folder);
  $target_folder .= '/' . $folder;
}
if (!is_dir($target_folder) && !mkdir($target_folder, 0777, true))
  die('Error: failed to create folder in /storage/competition/');

if (isset($_FILES['participants'])) {
  $file = $_FILES['participants'];
  if ($file['name'] != 'participants.json')
    die('Error: participants file should be named participants.json');
  if ($c != 1)
    die('Error: participant.json should be stored at first folder level');
} elseif (isset($_FILES['animation'])) {
  $file = $_FILES['animation'];
  if ($file['name'] != 'animation.json')
    die('Error: uploaded animation should be named animation.json');
  if ($c != 2)
    die('Error: uploaded animation.json file should be stored at second folder level');
} else
  die('Error: unsupported file upload');

$target_file = $target_folder . '/' . $file['name'];
$max_file_size = 256 * 1024 * 1024;  // 256 MB
if ($file['size'] > $max_file_size)
  die('Error: file is too large: ' . $file['size'] . ' > ' . $max_file_size);
if (file_exists($target_file))  # if a previous exists, delete it
  unlink($target_file);

if (!move_uploaded_file($file['tmp_name'], $target_file))
  die('Error: could not move uploaded file');

die($file['name']. " was uploaded.");
?>
