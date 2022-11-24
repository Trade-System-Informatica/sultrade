<?php
include_once "Database.php";    

class Employees {
    private $database;

    public function __construct(){
        
    }

    public static function getEmployeeByToken($token){
        $database = new Database();

        $result = $database->doSelect('tokens',
                                      null,
                                      "token = '".$token."'");
                                      
        $database->closeConection();
        return $result;

    }

    public static function getEmployeeByLogin($username){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      'employees.*',
                                      "username = '".$username."'");
                                      
        $database->closeConection();
        return $result;

    }

    public static function getEmployee($id_employee){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      null,
                                      'id = '.$id_employee);
        $database->closeConection();
        return $result;

    }

    public static function getAllEmployees(){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      'employees.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function checkToken($token){
         return 'true';
          
    }

    public static function approveLogin( $username, $password ){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      'concat(ships,",",cargos,",", agents,",", empresas,",", terminais,",", clients,",", admin) AS permissoes, id',
                                      "username = '".$username."'AND password = '". $password. "'");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
        
            $result[0]['token'] = $result[0]['id'];
           
           /* $result = $database->doSelect('tokens',
                                          null,
                                          "id_employee = ".$id_employee);

            if($result == NULL){
                $today = date('y-m-d');
                $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                $token = generateRandonToken();

                $values = "'".$token."', '".$ttl."',".$id_employee;

                $database->doInsert('tokens',
                                    'token, ttl, id_employee',
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
    
                    $values = "'".$token."', '".$ttl."',".$id_employee;
    
                    $database->doInsert('tokens',
                                        'token, ttl, id_employee',
                                        $values);
                }
            }*/
            $database->closeConection();
            return $result;
        }
    }

    public static function checkPermissions( $username){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      'concat(ships,",", seaports,",", cargos,",", agents,",", empresas,",", terminais,",", clients,",", admin) AS permissoes',
                                      "username = '".$username."'");

        $database->closeConection();
        return $result;
    }

    public static function approveLogin2( $username, $password ){
        $database = new Database();

        $result = $database->doSelect('employees',
                                      'id',
                                      "username = '".$username."'AND password = '". $password. "'");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
        
            $result[0]['token'] = $result[0]['id'];
           
           /* $result = $database->doSelect('tokens',
                                          null,
                                          "id_employee = ".$id_employee);

            if($result == NULL){
                $today = date('y-m-d');
                $ttl = date('y-m-d', strtotime($today. ' + 60 days'));
                $token = generateRandonToken();

                $values = "'".$token."', '".$ttl."',".$id_employee;

                $database->doInsert('tokens',
                                    'token, ttl, id_employee',
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
    
                    $values = "'".$token."', '".$ttl."',".$id_employee;
    
                    $database->doInsert('tokens',
                                        'token, ttl, id_employee',
                                        $values);
                }
            }*/
            $database->closeConection();
            return $result;
        }
    }

    public static function insertEmployee($values){
        $database = new Database();

        $cols = 'username, name, email, phone, password';

        $result = $database->doInsert('employees', $cols, $values);
        $database->closeConection();
        return $result;
    }
}
?>