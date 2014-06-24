<?php

header("Context-type: text/json");

require('helpers.php');

extract($_REQUEST);

$data = array(username, score, ip, country_id, timestamp, id_pla);
$response = array('status' => '', 'message' => '', 'data' => '');

$dbh = Helpers::dbConnect();

$sql_enter_user = "insert into leaderboard (username_lbo , score_lbo, ip_ldo, country_id_lbo, timestamp_lbo, id_pla_lbo) values (:username_lbo, :score_lbo, :ip_ldo, :country_id_lbo, :timestamp_lbo, :id_pla_lbo)";

$sql_params = array();
$sql_params['username_lbo'] = $data[0];
$sql_params['score_lbo'] =  $data[1];
$sql_params['ip_lbo'] =  $data[2];
$sql_params['country_id_lbo'] =  $data[3];
$sql_params['timestamp_lbo'] =  $data[4];
$sql_params['id_pla_lbo'] =  $data[5];

$stmt = Helpers::executeQuery($sql_enter_user, $sql_params, 'bad request');



$sql_get_users_info =  "SELECT * 
						FROM leaderboard
						ORDER BY  score_lbo
						LIMIT 5";

$stmt = self::$dbh->prepare($sql);
$stmt->execute();
$user_list = $stmt->fetch();

$response['status'] = 1;
$response['data'] = $user_list;

echo json_encode($response);

?>