<?php # This script deletes a simulation from both the database and file system
function error($message) {
  die("{\"error\":\"$message\"}");
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);

foreach ($json['items'] as $address)
{
    echo "items:". $address['address'] ."\n";
};

if (!isset($data->simulation))
  error('Missing simulation id');
require '../../../php/simulation.php';
delete_simulation($simulation);
die("{\"status\":1}");
?>