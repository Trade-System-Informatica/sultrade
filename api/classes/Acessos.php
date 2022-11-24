<?php
include_once "Database.php";    

class Acessos {
    private $database;

    public function __construct(){
        
    }

    public static function getTiposAcessos(){
        $database = new Database();

        $result = $database->doSelect('acessos',
                                      'acessos.*'
                                    );
        $database->closeConection();
        return $result;

    }

}
?>