<?php

require('helpers.php');

extract($_REQUEST);
$response = array();

if(isset($country_id)){

    $dbh = Helpers::dbConnect();

    $sql_get_player_info = "SELECT * FROM player WHERE country_id_pla = :country_id_pla";

    $sql_params = array();
    $sql_params['country_id_pla'] = $country_id;

    $stmt = Helpers::executeQuery($sql_get_player_info, $sql_params, 'bad request');

    echo json_encode($stmt);

}else{
    echo json_encode(array("result" => "error"));
}

?>