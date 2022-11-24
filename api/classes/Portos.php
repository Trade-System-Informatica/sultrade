<?php
include_once "Database.php";    

class Portos {
    private $database;

    public function __construct(){
        
    }

    public static function getPortos(){
        $database = new Database();

        $result = $database->doSelect('os_portos',
                                      'os_portos.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function insertPorto($values){
        $database = new Database();

        $cols = 'Codigo, Descricao';

        $result = $database->doInsert('os_portos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertPortoBasico($values){
        $database = new Database();

        $cols = 'Codigo, Descricao';

        $result = $database->doInsert('os_portos', $cols, $values);

        $result = $database->doSelect('os_portos', 'os_portos.*', '1=1 ORDER BY Chave DESC');

        $database->closeConection();
        return $result;
    }

    public static function updatePorto($Chave, $Codigo, $Descricao){
        $database = new Database();
        $query = "Codigo = '".$Codigo."', Descricao = '".$Descricao."'";
           
        $result = $database->doUpdate('os_portos', $query, 'Chave = '.$Chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deletePorto($id_porto){
        $database = new Database();
    
        $result = $database->doDelete('os_portos', 'Chave = '.$id_porto);
        $database->closeConection();
        return $result;
    }
}
?>