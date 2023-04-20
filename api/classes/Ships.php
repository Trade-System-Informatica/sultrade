<?php
include_once "Database.php";

class Ships
{
    private $database;

    public function __construct()
    {
    }

    public static function setShip($id_ship, $query)
    {
        $database = new Database();

        $result = $database->doUpdate('vessel', $query, 'id = ' . $id_ship);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function getShips($token = null)
    {
        $database = new Database();

        if ($token != null) {
            $result = $database->doSelect(
                'vessel',
                'vessel.*, clients.username',
                "tokens.token = '" . $token . "'",
                "ORDER BY ETB ASC",
                "INNER JOIN clients on vessel.cargo = clients.id"
            );
        } else {
            $result = $database->doSelect('vessel', 'vessel.*, terminais.nome as nome_terminal, clients.username as user, seaport.name as berth, cargos.siglapdf as cargo_nome ', '1 ORDER BY ETB asc', 'left JOIN clients on vessel.cargo = clients.id  left JOIN terminais ON vessel.terminal = terminais.id left JOIN seaport ON vessel.id_seaport = seaport.id left JOIN cargos ON vessel.cargo_real = cargos.id');
        }

        $database->closeConection();
        return $result;
    }

    public static function getAllShips()
    {
        $database = new Database();

            $result = $database->doSelect(
                "vessel",
                "vessel.*",
                "1 ORDER BY ETB ASC",
                "",
                ""
            );

        $database->closeConection();
        return $result;
    }

    public static function getShipsMobile($name_user)
    {
        $database = new Database();

            $result = $database->doSelect(
                "vessel",
                "vessel.*, clients.username, cargos.nome AS cargoNome, terminais.nome AS terminalNome, seaport.name AS seaportNome",
                "clients.username = '" . $name_user . "'".
                " ORDER BY ETB ASC",
                "INNER JOIN clients ON vessel.cargo = clients.id LEFT JOIN cargos ON cargos.id = vessel.cargo_real LEFT JOIN terminais on terminais.id = vessel.terminal LEFT JOIN seaport ON seaport.id = vessel.id_seaport"
            );

        $database->closeConection();
        return $result;
    }

    public static function getClient($id)
    {
        $database = new Database();

        $result = $database->doSelect(
            'clients',
            'clients.*',
            "vessel.id = " . $id,
            "INNER JOIN vessel on vessel.cargo = clients.id"
        );

        $database->closeConection();
        return $result;
    }

    public static function getAdminShips($token = null)
    {
        $database = new Database();

        if ($token != null) {
            $result = $database->doSelect(
                'vessel',
                'vessel.*,',
                "tokens.token = '" . $token . "'",
                "
                                       LEFT JOIN tokens ON tokens.id_client = clients_ships.id_client"
            );
        } else {
            $result = $database->doSelect('vessel', 'vessel.*, terminais.nome as nome_terminal, seaport.id as porto', '1 ORDER BY ETB asc', 'INNER JOIN terminais ON vessel.terminal = terminais.id inner join seaport on terminais.porto = seaport.id');
        }

        $database->closeConection();
        return $result;
    }


    public static function getVesselPSP($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('vessel_psp', 'vessel_psp.*', '1', '');


        $database->closeConection();

        return $result;
    }


    public static function getAgents($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('agents', 'agents.*', '1 order by nome asc', '');


        $database->closeConection();

        return $result;
    }

    public static function updateAgents($chave, $nome, $nome_pdf)
    {

        $database = new Database();

        $query = "nome = '" . $nome . "', nome_pdf = '" . $nome_pdf . "'";
        $result = $database->doUpdate('agents', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteAgents($chave)
    {
        $database = new Database();

        $result = $database->doDelete('agents', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }



    


    public static function insertAgents($values)
    {
        $database = new Database();

        $cols = 'nome, nome_pdf';

        $result = $database->doInsert('agents', $cols, $values);
        $database->closeConection();
        return $result;
    }



    public static function getEmpresas($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('empresas', 'empresas.*', '1', '');


        $database->closeConection();

        return $result;
    }

    public static function getVesselSurvey($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('vessel_survey', 'vessel_survey.*', '1', '');


        $database->closeConection();

        return $result;
    }

    public static function getVesselStatus($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('vessel_status', 'vessel_status.*', '1 order by nome asc', '');


        $database->closeConection();

        return $result;
    }


    public static function getShipsClient($id_client) {
        $database = new Database();

      
         $result = $database->doSelect('vessel', 'vessel.*, terminais.nome as nome_terminal, clients.username as user, seaport.name as berth, cargos.siglapdf as cargo_nome ', ' cargo = '.$id_client.' ORDER BY ETB asc', 'left JOIN clients on vessel.cargo = clients.id  left JOIN terminais ON vessel.terminal = terminais.id left JOIN seaport ON vessel.id_seaport = seaport.id left JOIN cargos ON vessel.cargo_real = cargos.id');
        

        $database->closeConection();
        return $result;


    }

    public static function getVesselStatus2($token = null)
    {
        $database = new Database();

        $result = $database->doSelect('vessel_status', 'vessel_status.*', '1 order by ordem asc', '');


        $database->closeConection();

        return $result;
    }


    public static function deleteRelationShips($id_ship)
    {
        $database = new Database();

        $result = $database->doDelete('clients_ships', 'id_ship = ' . $id_ship);
        $database->closeConection();
        return $result;
    }

    public static function deleteShip($id_ship)
    {
        $database = new Database();

        $result = $database->doDelete('vessel', 'id = ' . $id_ship);
        $database->closeConection();
        return $result;
    }

    
    public static function deleteEmpresa($id_ship)
    {
        $database = new Database();

        $result = $database->doDelete('empresas', 'chave = ' . $id_ship);
        $database->closeConection();
        return $result;
    }


    public static function deleteStatus($chave)
   
    {
        $database = new Database();

        $result = $database->doDelete('vessel_status', 'id = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function insertShip($values, $name)
    {
        $database = new Database();

        $cols = 'nome, bandeira';

        $result = $database->doInsert('os_navios', $cols, $values);

        $database->closeConection();
        return $result;
    }

    public static function insertStatus($values)
    {
        $database = new Database();

        $cols = 'nome, tipo';

        $result = $database->doInsert('vessel_status', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertEmpresas($name)
    {
        $database = new Database();

        $cols = 'name';

        $result = $database->doInsert('empresas', $cols,"'".$name."'");
        $database->closeConection();
        return $result;
    }

    public static function updateShip($id_ship, $name, $shipment, $cargo, $cargo_real, $seaport_origin, $terminal, $type, $status, $ETA,$ETB,$ETS, $agent, $data_hora)
    {
        $database = new Database();
        $query = "name = '" . $name . "', type = '" . $type . "'";
        $query .= ", shipment = " . $shipment . ", cargo = " . $cargo . ", cargo_real = " . $cargo_real;
        $query .= ", seaport_orig = '" . $seaport_origin;
        $query .= "', terminal = " . $terminal . ", ultima_atualizacao = '" . $data_hora . "', status ='" . $status . "' , ETA = '" . $ETA . "' , ETB = '" . $ETB . "' , ETS = '" . $ETS . "' , agent = '" . $agent . "'";

        $result = $database->doUpdate('vessel', $query, 'id = ' . $id_ship);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateStatus($chave, $nome, $tipo)
    {

        $database = new Database();

        $query = "nome = '" . $nome . "', tipo = '" . $tipo . "'";
        $result = $database->doUpdate('vessel_status', $query, 'id = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateEmpresas($chave, $nome)
    {

        $database = new Database();

        $query = "name = '" . $nome . "'";
        $result = $database->doUpdate('empresas', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }




    public static function updateTerminal($id, $nome, $descricao, $porto)
    {
        $database = new Database();
        $query = "nome = '" . $nome . "', porto = '" . $porto . "', descricao = '" . $descricao . "'";
        $result = $database->doUpdate('terminais', $query, 'id = ' . $id);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }



    public static function getSeaportShips($id_seaport)
    {
        $database = new Database();

        $result = $database->doSelect('vessel', null, 'id_seaport = ' . $id_seaport);

        $database->closeConection();
        return $result;
    }
}
