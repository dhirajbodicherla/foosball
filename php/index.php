<?php

header("Context-type: text/json");

require('helpers.php');

extract($_REQUEST);

$response = array('status' => '', 'message' => '', 'data' => '');

$country_id = Helpers::getCountryId($country_name);

if( isset($country_name) && $country_id == -1 ){

	$response['status'] = 0;
	$response['message'] = "Country not found. Please try again";
	$response['data'] = '';

	echo json_encode($response);
	return;

}

$dbh = Helpers::dbConnect();

$sql_get_player_info = "SELECT * 
						FROM player 
						WHERE country_id_pla = :country_id_pla
						ORDER BY RAND()
						LIMIT 1";

$sql_params = array();
$sql_params['country_id_pla'] = $country_id;

$stmt = Helpers::executeQuery($sql_get_player_info, $sql_params, 'bad request');

$player_object = $stmt->fetch();

$response['status'] = 1;
$response['data'] = $player_object;

echo json_encode($response);

?>