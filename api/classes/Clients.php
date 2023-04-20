<?php
include_once "Database.php";   
include_once "../libraries/utils.php"; 

class Clients {
    private $database;

    public function __construct(){
        
    }

    public static function getClients(){
        $database = new Database();

        $result = $database->doSelect('clients',
                                      'id, username, name, email, cod_empresa, permissao');

        $database->closeConection();
        return $result;
    }

    public static function updateClient($id_client, $username, $name, $email, $password){
        if($password != '' || $password != null){
            $database = new Database();
            $query = "username = '" . $username . "', name = '" . $name . "', email = '" . $email . "', password = '" . $password . "'";
    		$result = $database->doUpdate('clients', $query, 'id = '.$id_client.'');
            $database->closeConection();
            if($result == NULL){
                return 'false';
            } else {
                return $result;
            }
        }else{
            $database = new Database();
            $query = "username = '" . $username . "', name = '" . $name . "', email = '" . $email . "'";
    		$result = $database->doUpdate('clients', $query, 'id = '.$id_client.'');
            $database->closeConection();
            if($result == NULL){
                return 'false';
            } else {
                return $result;
            }
        }
    }

    public static function approveLoginMobile( $username, $password ){
        $database = new Database();

        $result = $database->doSelect('clients',
                                      'id',
                                      "username = '".$username."' AND password = '". $password. "'");

        if($result == NULL){
            $database->closeConection();

            return 'false';
        } else {
            $database->closeConection();

            return 'true';
        }
    }

    public static function approveLogin( $username, $password ){
        $database = new Database();

        $result = $database->doSelect('clients',
                                      'id',
                                      "username = '".$username."'AND password = '". $password. "'");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
            $id_client = $result[0]['id'];

            $result = $database->doSelect('tokens',
                                          null,
                                          "id_client = ".$id_client);

            if($result == NULL){
                $today = date('y-m-d');
                $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                $token = generateRandonToken();

                $values = "'".$token."', '".$ttl."',".$id_client;

                $database->doInsert('tokens',
                                    'token, ttl, id_client',
                                    $values);           
            } else {
                $today = date('y-m-d');
                if(strtotime($today) < strtotime($result[0]['ttl'])){
                    $token = $result[0]['token'];
                } else {
                    $database->doDelete('tokens',
                                        'id = '.$result[0]['id']);
                    
                    $today = date('y-m-d');
                    $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                    $token = generateRandonToken();
    
                    $values = "'".$token."', '".$ttl."',".$id_client;
    
                    $database->doInsert('tokens',
                                        'token, ttl, id_client',
                                        $values);
                }
            }
            $database->closeConection();
            return $token;
        }
    }

    public static function approveLoginExpo( $username, $password ){
        $database = new Database();

        $result = $database->doSelect('clients',
                                      'id',
                                      "username = '".$username."'AND password = '". $password. "'");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
            $id_client = $result[0]['id'];

            $result = $database->doSelect('tokens',
                                          null,
                                          "id_client = ".$id_client);

            if($result == NULL){
                $today = date('y-m-d');
                $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                $token = generateRandonToken();

                $values = "'".$token."', '".$ttl."',".$id_client;

                $database->doInsert('tokens',
                                    'token, ttl, id_client',
                                    $values);           
            } else {
                $today = date('y-m-d');
                if(strtotime($today) < strtotime($result[0]['ttl'])){
                    $token = $result[0]['token'];
                } else {
                    $database->doDelete('tokens',
                                        'id = '.$result[0]['id']);
                    
                    $today = date('y-m-d');
                    $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                    $token = generateRandonToken();
    
                    $values = "'".$token."', '".$ttl."',".$id_client;
    
                    $database->doInsert('tokens',
                                        'token, ttl, id_client',
                                        $values);
                }
            }
            $database->closeConection();
            return $id_client;
        }
    }

    public static function checkToken($token){
        $database = new Database();

        $result = $database->doSelect('tokens',
                                      null,
                                      "token = '".$token."'");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
            $today = date('y-m-d');
            if(strtotime($today) < strtotime($result[0]['ttl'])){
                $database->closeConection();
                return 'true';
            } else {
                $database->doDelete('tokens',
                                    'id = '.$result[0]['id']);
                return 'false';
            }
        }
    }

    public static function setPassword ($id_client, $password){
        $database = new Database();

        $query = "password = '". $password . "'";

        $result = $database->doUpdate('clients', $query, 'id = '.$id_client);
        
        if($result == NULL){
            return 'false';
        } else {
            $result = $database->doDelete('tokens', 'id_client = '.$id_client);
            $database->closeConection();
            return $result;
        }
    }

    public static function deleteClient( $id_client ){
        $database = new Database();
        $result = $database->doDelete('clients', 'id = '.$id_client);
        $database->closeConection();
        return $result;
    }

    public static function insertClient($values, $email){
        $database = new Database();

        $cols = 'username, password, name, email';

        $result = $database->doInsert('clients', $cols, $values);
        if ($result == 'true'){
        
            //$result =  $database->doSelect("clients","*","email = '".$email."'");
        }
        $database->closeConection();
        return $result;
    }

    public static function insertAcessos($values){
        $database = new Database();

        $result = $database->doInsert('acessos', 'id_client', $values);
        $database->closeConection();
        return $result;
    }

    public static function getAcessos(){
        $database = new Database();

        $result = $database->doSelect('acessos','*');

        $database->closeConection();
        return $result;
    }

    public static function updateAcessos($id_client, $ultimo_acesso){
        $database = new Database();
        $query = "ultimo_acesso = '" . $ultimo_acesso . "'";
		$result = $database->doUpdate('acessos', $query, "id_client = ". $id_client);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }


    public static function insertAcessos_log($values){
        $database = new Database();
        
        $cols= 'plataforma, data, ip, logado, id_client';
        $result = $database->doInsert('acessos_log', $cols , $values);
        $database->closeConection();
        return $result;
    }




    public static function getRelations($id_client){
        $database = new Database();

        $result = $database->doSelect('ships',
                                      'id AS id_ship, name AS shipname');

        $ships = array();
        foreach ($result as $value) {
            $ship = array (
                'id_ship' => $value['id_ship'],
                'shipname' => $value['shipname'],
                'id' => '-1'
            );
            array_push($ships,$ship);
        }
        $result = $database->doSelect('clients_ships',
                                      'id, id_ship',
                                      'id_client = '. $id_client);

        $database->closeConection();

        foreach ($result as $relation) {
           foreach ($ships as $indice => $ship) {
               if($relation['id_ship'] == $ships[$indice]['id_ship']){
                   $ships[$indice]['id'] = $relation['id'];
               }
           }            
        }

        return $ships;        
    }

    public static function deleteRelation($id_relation){
        $database = new Database();
        $result = $database->doDelete('clients_ships', 'id = '.$id_relation);
        
        $database->closeConection();
        return $result;
    }

    public static function insertRelation($id_ship, $id_client){
        $database = new Database();

        $cols = 'id_client, id_ship';
        $values = $id_client . "," . $id_ship;

        $result = $database->doInsert('clients_ships', $cols, $values);
        $database->closeConection();
        return $result;
    }
}
?>