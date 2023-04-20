<?php
include_once "Database.php";    

class ClientToken {
    private $database;

    public function __construct(){
        
    }   
    
    public function getStatistics(){
        $database = new Database();

        #select year, sum(shipment) as total, cargos.nome as cargo
        #from ships
        #inner join cargos on cargos.id = ships.cargo
        #group by cargo, year
        $result = $database->doSelect('cargos', 'cargos.nome as cargo, cargos.cor as cor, sum(ships.shipment) as total, ships.year', '1 group by year, cargo', 'INNER JOIN ships ON ships.cargo = cargos.id');
        $database->closeConection();
        return $result;
    }

    public static function getClientsToken(){
        $database = new Database();

        $result = $database->doSelect('client_token', '*', '1');
        $database->closeConection();
        return $result;
    }

    public static function getClientToken($token){
        $database = new Database();

        $result = $database->doSelect('client_token', 'token', "token = '". $token . "'");
        $database->closeConection();
        return $result;
    }

    public static function insertClientToken($values){
        $database = new Database();

        $cols = 'token, client_id';
    
        $result = $database->doInsert('client_token', $cols, $values);
        $database->closeConection();
        return $result;
    }
	
	public static function updateCargo($id, $nome, $porto, $descricao){
        $database = new Database();
        $query = "nome = '" . $nome . "', porto = '" . $porto . "', descricao = '" . $descricao . "'";
		$result = $database->doUpdate('terminais', $query, 'id = '.$id);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateNewsPicture($id, $nome){
        $database = new Database();

        $query = "imagem = '" . $nome . "'";
		$result = $database->doUpdate('news', $query, 'id = '.$id);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteTerminal($id_item){
        $database = new Database();
    
        $result = $database->doDelete('news', 'id = '.$id_item);
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
