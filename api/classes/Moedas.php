<?php
include_once "Database.php";    

class Moedas {
    private $database;

    public function __construct(){
        
    }

    public static function getMoedas(){
        $database = new Database();

        $result = $database->doSelect('moedas',
                                      'moedas.*'
                                    );
        $database->closeConection();
        return $result;

    }

}
?>