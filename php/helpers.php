<?php

class Helpers {
	
	private static $dbh = null;

	static function checkParams($params, $REQ) {
		$request = array();

		foreach($params as $p){
			if(!isset($REQ[$p])){
				die("parameter not set");
			}
		}
	}

	/**
	 * Database connect
	 */

	static function dbConnect(){
		include('store.php');

		if(self::$dbh === null){

			try {
			    self::$dbh = new PDO('mysql:host='.$database["db_host"].';dbname='.$database["db_name"], $database["db_user"], $database["db_pass"]);
			} catch (PDOException $e) {
			    print "Error!: " . $e->getMessage() . "<br/>";
			    die();
			}

		}

		return self::$dbh;
	}

	/**
	 * To execute sql query
	 */

	static function executeQuery($sql, $sql_params, $errorMsg = null){
		try {
			$stmt = self::$dbh->prepare($sql);
			foreach ($sql_params as $key => $value) {
				$stmt->bindValue($key, $value);
			}
			$stmt->execute();
			return $stmt;

		} catch (PDOException $e) {
			die('sql dead');
		}
	}

	/**
	 * Close the connection once the operations are done
	 */

	static function dbConnectionClose() {
		self::$dbh = null;
	}

}


?>