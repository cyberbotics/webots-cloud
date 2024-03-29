<?php # This script initializes a new proto
# get content
header('Content-Type: application/json');
require '../../../php/github_oauth.php';
require '../../../php/github_asset.php';
require '../../../php/database.php';
$json = file_get_contents('php://input');
$data = json_decode($json);
$url = $data->url;
$id = isset($data->id) ? intval($data->id) : 0;
$search = isset($data->search) ? $data->search : "";
$continue_on_error = false;
require '../../../php/create_or_update.php';
$answer = create_or_update_proto($url, $id, $search);
die(json_encode($answer));
?>
