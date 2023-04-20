<?php

include_once "Database.php";    

class Servicos {
    private $database;

    public function __construct(){
        
    }    

    public static function getServicos(){
        $database = new Database();

        $result = $database->doSelect('os_servicos_itens', '*', '1 = 1 ORDER BY data DESC LIMIT 50');
        $database->closeConection();
        return $result;
    }

    public static function getTiposServicos(){
        $database = new Database();

        $result = $database->doSelect('os_tipos_servicos', '*');
        $database->closeConection();
        return $result;
    }

    public static function getMaxService(){
        $database = new Database();

        $result = $database->loadMax('services');
        $database->closeConection();
        return $result;
    }

    public static function insertTiposServicos($values){
        $database = new Database();

        $cols = 'descricao, prazo';
    
        $result = $database->doInsert('os_tipos_servicos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertTiposServicosBasico($values){
        $database = new Database();

        $cols = 'descricao, prazo';
    
        $result = $database->doInsert('os_tipos_servicos', $cols, $values);

        $result = $database->doSelect('os_tipos_servicos','os_tipos_servicos.*','1=1 ORDER BY chave DESC');
        
        $database->closeConection();
        return $result;
    }
	
	public static function updateService($id_service, $titulo, $link, $inativo){
        $database = new Database();

        $query = "titulo = '" . $titulo . "', link = '" . $link . "', inativo = " . $inativo;
		$result = $database->doUpdate('services', $query, 'id= '.$id_service);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTipoServico($chave, $descricao, $prazo){
        $database = new Database();

        $query = "descricao = '" . $descricao . "', prazo = '" . $prazo . "'";
		$result = $database->doUpdate('os_tipos_servicos', $query, 'chave= '.$chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateServicePicture($id, $nome){
        $database = new Database();

        $query = "imagem = '" . $nome . "'";
		$result = $database->doUpdate('services', $query, 'id = '.$id);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteService($id_item){
        $database = new Database();
    
        $result = $database->doDelete('services', 'id = '.$id_item);
        $database->closeConection();
        return $result;
    }

    public static function deleteTipoServico($chave){
        $database = new Database();
    
        $result = $database->doDelete('os_tipos_servicos', 'chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function getLog($id_item = null){
        $database = new Database();
        if($id_item == null || $id_item == 'null'){
            $result = $database->doSelect('log_storage', 'log_storage.*, employees.name AS employee, employees.username AS picture', null,
                                         'LEFT JOIN employees ON employees.id = log_storage.id_employee');
        } else {
            $result = $database->doSelect('log_storage', 'log_storage.*, employees.name AS employee, employees.username AS picture','id_storage = ' . $id_item,
                                            'LEFT JOIN employees ON employees.id = log_storage.id_employee');
        }
        $database->closeConection();
        return $result;
    }

    public static function setPutItem($token, $id_item, $put, $amount, $invoice){
        $database = new Database();

        $result = $database->doSelect('tokens', 'id_employee', "token = '" . $token . "'");
        $id_employee = $result[0]['id_employee'];

        $query = "amount = '" . $amount . "'";
        $result = $database->doUpdate('storage', $query, 'id = '.$id_item);

        if($result == true){
            $cols = 'status, id_storage, amount, invoice, id_employee';
            $values = "'Put'," . $id_item . ",'" . $put . "','" . $invoice . "'," . $id_employee;

            $result = $database->doInsert('log_storage', $cols, $values);

            $database->closeConection();
            return $result;
        } else {
            $database->closeConection();
            return 'false';
        }
    }

    public static function setRemItem($token, $id_item, $rem, $amount, $shipname){
        $database = new Database();

        $result = $database->doSelect('tokens', 'id_employee', "token = '" . $token . "'");
        $id_employee = $result[0]['id_employee'];

        $query = "amount = '" . $amount . "'";
        $result = $database->doUpdate('storage', $query, 'id = '.$id_item);

        if($result == true){
            $cols = 'status, id_storage, amount, shipname, id_employee';
            $values = "'Remove'," . $id_item . ",'" . $rem . "','" . $shipname . "'," . $id_employee;

            $result = $database->doInsert('log_storage', $cols, $values);

            $database->closeConection();
            return $result;
        } else {
            $database->closeConection();
            return 'false';
        }
    }
}
?>

