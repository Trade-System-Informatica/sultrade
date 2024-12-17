<?php
include_once "Database.php";    

class Operadores {
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

    public static function getOperadores($empresa){
        $database = new Database();

        if ($empresa != 0) {
            $result = $database->doSelect('operadores',
                                          'operadores.*',
                                          "empresa = '".$empresa."' OR empresa = 0 ORDER BY Codigo"
                                        );
        } else {
            $result = $database->doSelect('operadores',
                                          'operadores.*', "1 ORDER BY Codigo"
          );
        }
        $database->closeConection();
        return $result;
    }

    public static function getOperadoresBase($empresa)
    {
        $database = new Database();

        if ($empresa != 0) {
            $result = $database->doSelect(
                'operadores',
                'operadores.Codigo, operadores.Nome',
                "empresa = '" . $empresa . "' OR empresa = 0"
            );
        } else {
            $result = $database->doSelect(
                'operadores',
                'operadores.Codigo, operadores.Nome'
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getOperador($codigo)
    {
        $database = new Database();

            $result = $database->doSelect(
                'operadores',
                'operadores.Nome, operadores.empresa, operadores.Codigo',
                "Codigo = '" . $codigo . "'"
            );

            $database->closeConection();
        return $result;
    }

    public static function getControle(){
        $database = new Database();

        $result = $database->doSelect('controle',
                                      'controle.*'
                                    );
        $database->closeConection();
        return $result;
    }

    public static function getControleDados($empresa){
        $database = new Database();

        $result = $database->doSelect('controle',
                                      'controle.*',
                                      "controle.Chave = $empresa"
                                    );
        $database->closeConection();
        return $result;
    }

    public static function testaNome($Nome){
        $database = new Database();

        $result = $database->doSelect('operadores',
                                      'operadores.*',
                                      "operadores.Nome = '".$Nome."'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getPermissoes(){
        $database = new Database();

        $result = $database->doSelect('permissoes',
                                      'permissoes.*, acessos.*',
                                      '1=1',
                                      'INNER JOIN acessos ON permissoes.Acessos = acessos.Chave'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getPermissao($Usuario, $Acessos){
        $database = new Database();

        $grupoResult = $database->doSelect(
            'operadores',
            'grupo',
            'Codigo = ' . $Usuario
        );

        $grupo = $grupoResult[0]['grupo'];

        $permissoesUsuario = $database->doSelect('permissoes',
            'permissoes.*, acessos.*',
            'Usuario = '.$Usuario.' AND Acessos = '.$Acessos,
            'INNER JOIN acessos ON permissoes.Acessos = acessos.Chave'
          );

        if ($grupo == 0) {
            return $permissoesUsuario;
        } else {
            // Obter permissões dos usuários do grupo
            $permissoesGrupo = $database->doSelect('permissoes',
            'permissoes.*, acessos.*',
            'Usuario = '.$grupo.' AND Acessos = '.$Acessos,
            'INNER JOIN acessos ON permissoes.Acessos = acessos.Chave'
          );

        $permissaoFinal = '';
        $permissaoUsuario = $permissoesUsuario[0]['Liberacao'];
        $permissaoGrupo = $permissoesGrupo[0]['Liberacao'];

        // Mescla as permissões bit a bit
        for ($i = 0; $i < strlen($permissaoUsuario); $i++) {
            // Se qualquer um dos dois tem permissão (1), mantém a permissão
            $permissaoFinal .= (($permissaoUsuario[$i] == '1') || ($permissaoGrupo[$i] == '1')) ? '1' : '0';
        }

        // Atualiza a permissão do usuário
        $permissoesUsuario[0]['Liberacao'] = $permissaoFinal;

        $database->closeConection();
        return $permissoesUsuario;
        }
    }

    public static function getLogs($Tabela, $ChaveAux){
        $database = new Database();

        $result = $database->doSelect('logs LEFT JOIN operadores ON operadores.Codigo = logs.Operador',
                                      'logs.*, operadores.Nome as operadorNome',
                                      "Tabela = '".$Tabela."' AND ChaveAux = '".$ChaveAux."' ORDER BY Data ASC"
                                    );
        $database->closeConection();
        return $result;

    }

    /*
    public static function getLogsOS($chaveOS, $chaveSI){
        $database = new Database();
        if (!isset($chaveSI) || $chaveSI == ''){
            $result = $database->doSelect('logs 
                                    LEFT JOIN operadores ON operadores.Codigo = logs.Operador',
                                    'logs.*, operadores.Nome as operadorNome',
                                    "(Tabela = 'os' AND ChaveAux = '".$chaveOS."') ORDER BY Data ASC"
        );
        } else{
            $result = $database->doSelect('logs 
                                        LEFT JOIN operadores ON operadores.Codigo = logs.Operador',
                                        'logs.*, operadores.Nome as operadorNome',
                                        "(Tabela = 'os' AND ChaveAux = '".$chaveOS."') OR (Tabela = 'os_servicos_itens' AND ChaveAux = '".$chaveSI."') ORDER BY Data ASC"
        );
        };

        $database->closeConection();
        return $result;

    }
    */
    public static function getLogsOS($chaveOS, $chaveSI){
        $condicoes = "";
        foreach ($chaveSI as $chave) {
            $condicoes .= "(Tabela = 'os_servicos_itens' AND ChaveAux = '".$chave."') OR ";
        }

        $condicoes = rtrim($condicoes, " OR ");
        $database = new Database();
        if (!isset($condicoes) || $condicoes == ''){
            $result = $database->doSelect('logs 
                                    LEFT JOIN operadores ON operadores.Codigo = logs.Operador',
                                    'logs.*, operadores.Nome as operadorNome',
                                    "(Tabela = 'os' AND ChaveAux = '".$chaveOS."') ORDER BY Data ASC"
        );
        } else{
            $result = $database->doSelect('logs 
                                        LEFT JOIN operadores ON operadores.Codigo = logs.Operador',
                                        'logs.*, operadores.Nome as operadorNome',
                                        "(Tabela = 'os' AND ChaveAux = '".$chaveOS."') OR ".$condicoes." ORDER BY Data ASC"
        );
        };

        $database->closeConection();
        return $result;

    }


    public static function getAllLogs($Tabela, $Empresa){
        $database = new Database();

        
        $join = "";
        $where = "logs.Tabela = '".$Tabela."'";
        if ($Tabela == "os") {
            $join = "LEFT JOIN os ON os.chave = logs.chaveAux";
            $where .= " AND (os.empresa = '".$Empresa."' OR isNull(os.chave))";
        } else if ($Tabela == "os_servicos_itens") {
            $join = "LEFT JOIN os_servicos_itens ON os_servicos_itens.chave = logs.chaveAux LEFT JOIN os ON os.chave = os_servicos_itens.chave_os";
            $where .= " AND (os.empresa = '".$Empresa."' OR isNull(os.chave))";
        } else if ($Tabela == "contas_aberto") {
            $join = "LEFT JOIN contas_aberto ON contas_aberto.chave = logs.chaveAux";
            $where .= " AND (contas_aberto.empresa = '".$Empresa."' OR isNull(contas_aberto.chave))";
        } else if ($Tabela == "transacoes") {
            $join = "LEFT JOIN transacoes ON transacoes.chave = logs.chaveAux LEFT JOIN contas_aberto ON contas_aberto.chave = chave_contas_aberto";
            $where .= " AND (contas_aberto.empresa = '".$Empresa."' OR isNull(contas_aberto.chave))";
        } else if ($Tabela == "operadores") {
            $join = "LEFT JOIN operadores ON operadores.codigo = logs.chaveAux";
            $where .= " AND (operadores.empresa = '".$Empresa."' OR isNull(operadores.codigo))";
        }

        $result = $database->doSelect('logs '.$join,'logs.*',$where
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getParametros($empresa){
        $database = new Database();
        
        $result = $database->doSelect('parametros',
                                      'parametros.*',
                                      "Empresa = '".$empresa."'"
                                    );
        $database->closeConection();
        return $result;

    }


    public static function checkToken($token){
         return 'true';
          
    }

    public static function approveLogin( $Codigo, $Senha ){
        $database = new Database();

        $result = $database->doSelect('operadores',
                                      'Codigo',
                                      "Codigo = '".$Codigo."'AND Senha = '". $Senha. "' AND ativo = 1");

        if($result == NULL){
            $database->closeConection();
            return 'false';
        } else {
        
            $result[0]['token'] = $result[0]['id'];
           
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
           
            $database->closeConection();
            return $result;
        }
    }

    public static function insertOperador($values){
        $database = new Database();

        $cols = 'Nome, Senha, Empresa';

        $result = $database->doInsert('operadores', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertPermissao($values){
        $database = new Database();

        $cols = 'Usuario, Empresa, Acessos, Liberacao';

        $result = $database->doInsert('permissoes', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function salvaLogs($values){
        $database = new Database();
        
        $cols = 'Tabela, Operador, Data, Campos, ChaveAux';

        $result = $database->doInsert('logs', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function updateOperador($Codigo, $Nome, $Senha){
        $database = new Database();

        if ($Senha == "") {
            $query = "Nome = '".$Nome."'";
        } else {
            $query = "Nome = '" . $Nome . "', Senha = '" . $Senha . "'";
        }
        
        $result = $database->doUpdate('operadores', $query, 'Codigo = '.$Codigo);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updatePermissoes($Usuario, $Empresa, $Acessos, $Liberacao){
        $database = new Database();

        $query = "Liberacao = '".$Liberacao."'";
        $result = $database->doUpdate('permissoes', $query, "Usuario = '".$Usuario."' AND Acessos = '".$Acessos."' AND Empresa = '".$Empresa."'");
        
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTipoConta($codigo, $tipoConta){
        $database = new Database();

        $result = $database->doUpdate('operadores', "grupo = $tipoConta", "Codigo = $codigo");
        
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateParametros($Empresa, $conta_desconto, $conta_retencao_inss, $conta_retencao_ir, $conta_retencao_iss, $conta_retencao_pis, $conta_retencao_cofins, $conta_retencao_csll, $bank_charges){
        $database = new Database();

        $query = "conta_desconto = '".$conta_desconto."', conta_retencao_inss = '".$conta_retencao_inss."', conta_retencao_ir = '".$conta_retencao_ir."', conta_retencao_iss = '".$conta_retencao_iss."', conta_retencao_pis = '".$conta_retencao_pis."', conta_retencao_cofins = '".$conta_retencao_cofins."', conta_retencao_csll = '".$conta_retencao_csll."', bank_charges = '$bank_charges'";
        $result = $database->doUpdate('parametros', $query, "Empresa = '".$Empresa."'");
        
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteOperador($chave){
        $database = new Database();
    
        $result = $database->doUpdate('operadores', "ativo = 0",'Codigo = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteLog($chave){
        $database = new Database();
    
        $result = $database->doDelete('logs', 'chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteLogs($dataInicio, $dataFim, $tabela){
        $database = new Database();
    
        $result = $database->doDelete('logs', "Data >= '".$dataInicio."' AND Data <= '".$dataFim."' AND Tabela = '".$tabela."'");
        $database->closeConection();
        return $result;
    }
    
}
?>