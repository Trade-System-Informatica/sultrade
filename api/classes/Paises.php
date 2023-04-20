<?php
include_once "Database.php";    

class Paises {
    private $database;

    public function __construct(){
        
    }

    public static function getPaises(){
        $database = new Database();

        $result = $database->doSelect('paises',
                                      'paises.*'
                                    );
        $database->closeConection();
        return $result;

    }

}
?>