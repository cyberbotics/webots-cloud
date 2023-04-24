<?php # This script initializes a new proto
# exit and error message
function error($message) {
  die("{\"error\":\"$message\"}");
}

# get content
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
$url = $data->url;
$id = isset($data->id) ? intval($data->id) : 0;
$search = isset($data->search) ? $data->search : "";
require './create_or_update.php';
$answer = create_or_update_proto($url, $id, $search);
die(json_encode($answer));
?>
