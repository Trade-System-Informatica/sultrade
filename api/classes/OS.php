<?php
include_once "Database.php";    

class OS {
    private $database;

    public function __construct(){
        
    }

    public static function getOS($Empresa, $limit, $offset){
        $database = new Database();

        if ($limit) {
            $limit = " LIMIT ".$limit;
        } else {
            $limit = '';
        }
        if ($offset != null) {
            $offset = " OFFSET ".$offset;
        } else {
            $limit = '';
        }

        if ($Empresa == 0) {
            $result = $database->doSelect('os 
            LEFT JOIN os_navios ON os_navios.chave = os.chave_navio 
            LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN centros_custos ON centros_custos.Chave = os.centro_custo
            LEFT JOIN os_tipos_servicos ON os_tipos_servicos.chave = os.chave_tipo_servico
            LEFT JOIN os_portos ON os_portos.Chave = os.porto',
                                          'os.*, 
                                          os_navios.nome AS navioNome, 
                                          pessoas.nome AS clienteNome, 
                                          os_portos.Descricao AS portoNome,
                                          centros_custos.Descricao AS centroCustoNome,
                                          os_tipos_servicos.descricao AS tipoServicoNome',
                                          "1 = 1 ORDER BY chave DESC".$limit.$offset
                                        );
        } else {
            $result = $database->doSelect('os 
            LEFT JOIN os_navios ON os_navios.chave = os.chave_navio 
            LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN centros_custos ON centros_custos.Chave = os.centro_custo
            LEFT JOIN os_tipos_servicos ON os_tipos_servicos.chave = os.chave_tipo_servico
            LEFT JOIN os_portos ON os_portos.Chave = os.porto',
                    'os.*, 
                    os_navios.nome AS navioNome, 
                    pessoas.nome AS clienteNome, 
                    os_portos.Descricao AS portoNome,
                    centros_custos.Descricao AS centroCustoNome,
                    os_tipos_servicos.descricao AS tipoServicoNome',
            "empresa = '".$Empresa."' ORDER BY chave DESC".$limit.$offset
          );
        }

        $database->closeConection();
        return $result;

    }

    public static function getOSUma($chave_os){
        $database = new Database();

        $result = $database->doSelect('os',
                                      'os.*',
                                      'Chave ='.$chave_os 
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getCodigos($tipo){
        $database = new Database();

        $result = $database->doSelect('codigos',
                                      'codigos.*',
                                      "tipo = '".$tipo."'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getServicosItens($offset, $empresa){
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect('os_servicos_itens 
            LEFT JOIN os ON os.chave = os_servicos_itens.chave_os 
            LEFT JOIN os_navios ON os_navios.chave = os.chave_navio 
            LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_taxas ON os_taxas.chave = os_servicos_itens.taxa
            LEFT JOIN os_portos ON os_portos.chave = os.porto',
                                          'os_servicos_itens.*, 
                                          os_navios.nome AS navioNome, 
                                          os_navios.chave AS chave_navio, 
                                          os.viagem AS viagem, 
                                          pessoas.nome AS clienteNome, 
                                          os.codigo as osCodigo, 
                                          pessoas.Nome AS fornecedorNome, 
                                          os_taxas.Conta_Contabil as contaContabil, 
                                          os.centro_custo AS centroCusto, 
                                          os_portos.Codigo AS portoNome',
                                          "1=1 ORDER BY chave DESC LIMIT 101 OFFSET ".$offset
                                        );
        } else {
            $result = $database->doSelect('os_servicos_itens 
            LEFT JOIN os ON os.chave = os_servicos_itens.chave_os 
            LEFT JOIN os_navios ON os_navios.chave = os.chave_navio 
            LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_taxas ON os_taxas.chave = os_servicos_itens.taxa
            LEFT JOIN os_portos ON os_portos.chave = os.porto',
                'os_servicos_itens.*, 
                os_navios.nome AS navioNome, 
                os_navios.chave AS chave_navio, 
                os.viagem AS viagem, 
                pessoas.nome AS clienteNome, 
                os.codigo as osCodigo, 
                pessoas.Nome AS fornecedorNome, 
                os_taxas.Conta_Contabil as contaContabil, 
                os.centro_custo AS centroCusto, 
                os_portos.Codigo AS portoNome',
            "os.empresa = '".$empresa."' ORDER BY chave DESC LIMIT 101 OFFSET ".$offset
                                        );
        }

        $database->closeConection();
        return $result;

    }

    public static function getServicosItensOs($chave_os){
        $database = new Database();

        $result = $database->doSelect('os_servicos_itens LEFT JOIN pessoas ON pessoas.chave = os_servicos_itens.fornecedor LEFT JOIN moedas ON moedas.chave = os_servicos_itens.moeda',
                                      'os_servicos_itens.*, 
                                      pessoas.nome AS fornecedorNome,
                                      moedas.Sigla',
                                      "os_servicos_itens.chave_os = '".$chave_os."' ORDER BY os_servicos_itens.ordem"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getSolicitacoesOS($pesquisa, $Empresa){
        $database = new Database();

        if ($pesquisa == "") {
            $result = $database->doSelect('os LEFT JOIN os_navios ON os_navios.chave = os.chave_navio LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_portos ON os_portos.Chave = os.porto',
            'os.*, os_navios.nome AS navioNome, pessoas.nome AS clienteNome, os_portos.Descricao AS portoNome',
            "os.empresa = '".$Empresa."' ORDER BY os.chave DESC" 
            );
        } else {
            $result = $database->doSelect('os LEFT JOIN os_navios ON os_navios.chave = os.chave_navio LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_portos ON os_portos.Chave = os.porto
            LEFT JOIN os_servicos_itens ON os_servicos_itens.chave_os = os.chave',
            'os.*, os_navios.nome AS navioNome, pessoas.nome AS clienteNome, os_portos.Descricao AS portoNome',
            "os.empresa = '".$Empresa."' AND os_servicos_itens.chave LIKE '%".$pesquisa."%' AND os_servicos_itens.cancelada = 0 GROUP BY os.chave ORDER BY os.chave DESC" 
            );
        }

        $database->closeConection();
        return $result;

    }

    public static function getOSPesquisa($where, $Empresa){
        $database = new Database();

            $result = $database->doSelect('os 
            LEFT JOIN os_navios ON os_navios.chave = os.chave_navio 
            LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN centros_custos ON centros_custos.Chave = os.centro_custo
            LEFT JOIN os_tipos_servicos ON os_tipos_servicos.chave = os.chave_tipo_servico
            LEFT JOIN os_portos ON os_portos.Chave = os.porto',
                                          'os.*, 
                                          os_navios.nome AS navioNome, 
                                          pessoas.nome AS clienteNome, 
                                          os_portos.Descricao AS portoNome,
                                          centros_custos.Descricao AS centroCustoNome,
                                          os_tipos_servicos.descricao AS tipoServicoNome',
            "os.empresa = '".$Empresa."' AND ".$where." ORDER BY os.chave DESC" 
            );

        $database->closeConection();
        return $result;

    }

    public static function getDocumentosOS($chave_os){
        $database = new Database();

        $result = $database->doSelect('os_documentos LEFT JOIN os ON os_documentos.chave_os = os.chave LEFT JOIN os_servicos_itens ON os_documentos.chave_os_itens = os_servicos_itens.chave',
                                      'os_documentos.*',
                                      'os_documentos.chave_os = '.$chave_os
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getDocumentosOSI($chave){
        $database = new Database();

        $result = $database->doSelect('os_documentos LEFT JOIN os ON os_documentos.chave_os = os.chave LEFT JOIN os_servicos_itens ON os_documentos.chave_os_itens = os_servicos_itens.chave',
                                      'os_documentos.*',
                                      'os_documentos.chave_os_itens = '.$chave
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getSolicitacao($chave){
        $database = new Database();

        $result = $database->doSelect('os_servicos_itens
        LEFT JOIN os ON os.chave = os_servicos_itens.chave_os 
        LEFT JOIN os_taxas ON os_taxas.chave = os_servicos_itens.taxa
        LEFT JOIN os_navios ON os.chave_navio = os_navios.chave
        LEFT JOIN pessoas ON os_servicos_itens.fornecedor = pessoas.chave
        LEFT JOIN pessoas as fornecedor_custeio ON os_servicos_itens.fornecedor_custeio = pessoas.chave',
                                      'os_servicos_itens.*, 
                                      os_taxas.Conta_Contabil as contaContabil, 
                                      os.centro_custo AS centroCusto, 
                                      pessoas.Nome AS fornecedorNome, 
                                      fornecedor_custeio.Nome as fornecedorCustioNome,
                                      os_navios.nome AS navioNome',
                                      'os_servicos_itens.chave = '.$chave
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getCentrosCustos(){
        $database = new Database();

        $result = $database->doSelect('centros_custos
        LEFT JOIN pessoas ON centros_custos.cliente = pessoas.chave',
                                      'centros_custos.*, pessoas.Nome as pessoaNome'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getCentrosCustosAtivos(){
        $database = new Database();

        $result = $database->doSelect('centros_custos
        LEFT JOIN pessoas ON centros_custos.cliente = pessoas.chave',
                                      'centros_custos.*, pessoas.Nome as pessoaNome',
                                      "Encerrado IS NULL OR Encerrado = '0000-00-00'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getOrdem($chave_os){
        $database = new Database();

        $result = $database->doSelect('os_servicos_itens',
                                      'os_servicos_itens.*',
                                      "chave_os = '".$chave_os."' ORDER BY ordem DESC LIMIT 1"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getDescricaoPadrao(){
        $database = new Database();

        $result = $database->doSelect('os_descricao_padrao',
                                      'os_descricao_padrao.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getTiposDocumento(){
        $database = new Database();

        $result = $database->doSelect('os_tp_docto',
                                      'os_tp_docto.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getTiposLancamento(){
        $database = new Database();

        $result = $database->doSelect('tipos_docto',
                                      'tipos_docto.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getUltimoDocumento($chave_os){
        $database = new Database();

        $result = $database->doSelect('os_documentos',
                                      'os_documentos.*',
                                      "os_documentos.chave_os = '".$chave_os."'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function insertOS($values, $codigo, $tipo){
        $database = new Database();

        $cols = 'Operador_Inclusao, Descricao, codigo, Chave_Cliente, chave_navio, Data_Abertura, Data_Chegada, chave_tipo_servico, viagem, porto, encerradoPor, faturadoPor, Empresa, eta, atb, etb, governmentTaxes, bankCharges';

        $result = $database->doInsert('os', $cols, $values);

        if ($result) {
            $query = "Proximo = '".($codigo+1)."'";
            $result2 = $database->doUpdate('codigos', $query, "Tipo = '".$tipo."'");
        }
        $database->closeConection();
        return $result;
    }

    public static function insertServicoItem($values){
        $database = new Database();

        $cols = 'chave_os, data, fornecedor, taxa, descricao, ordem, tipo_sub, Fornecedor_Custeio, remarks';

        $result = $database->doInsert('os_servicos_itens', $cols, $values);

        $database->closeConection();
        return $result;
    }

    public static function insertServicoItemBasico($values){
        $database = new Database();

        $cols = 'chave_os, data, fornecedor, taxa, descricao, ordem, tipo_sub, Fornecedor_Custeio, remarks';

        $result = $database->doInsert('os_servicos_itens', $cols, $values);

        if ($result) {
            $result = $database->doSelect('os_servicos_itens','os_servicos_itens.*',"1=1 ORDER BY chave DESC LIMIT 1");
        }
        $database->closeConection();
        return $result;
    }

    public static function insertCentroCusto($values, $codigo){
        $database = new Database();

        $cols = 'Descricao, Data, Cliente, Codigo';

        $result = $database->doInsert('centros_custos', $cols, $values);

        if ($result) {
            $query = "Proximo = '".($codigo+1)."'";
            $result2 = $database->doUpdate('codigos', $query, "Tipo = 'CC'");
        }

        $database->closeConection();
        return $result;
    }

    public static function insertCentroCustoBasico($values, $codigo){
        $database = new Database();

        $cols = 'Descricao, Data, Cliente, Codigo';

        $result = $database->doInsert('centros_custos', $cols, $values);

        if ($result) {
            $query = "Proximo = '".($codigo+1)."'";
            $result = $database->doUpdate('codigos', $query, "Tipo = 'CC'");
        }
        
        $result = $database->doSelect('centros_custos', 'centros_custos.*', '1=1 ORDER BY Chave DESC');
        
        $database->closeConection();
        return $result;
    }

    public static function insertDocumento($chave_os, $chave_osi, $descricao, $tipo, $ext) {
        $database = new Database();

        $values = "'".$chave_os."', '".$chave_osi."', '".$descricao."', '".$tipo."'";
        $cols = 'chave_os, chave_os_itens, descricao, tipo_docto';

        $result = $database->doInsert('os_documentos', $cols, $values);

        $chave = $database->doSelect('os_documentos', 'os_documentos.*', '1=1 ORDER BY chave DESC');

        if ($chave_osi == 0) {
            $pai = "OS_".$chave_os."_";
        } else {
            $pai = "OSI_".$chave_osi."_";
        }

        if (strlen($chave[0]['chave']) == 1) {
            $pai .= '00'.$chave[0]['chave'];
        } else if (strlen($chave[0]['chave']) == 2) {
            $pai .= '0'.$chave[0]['chave'];
        } else {
            $pai .= $chave[0]['chave'];
        }
 
        
        $query = "caminho = '".$pai.'.'.$ext."'";

        $result = $database->doUpdate('os_documentos', $query, 'chave = '.$chave[0]['chave']);

        $database->closeConection();
        return $pai;
    }

    public static function insertTipoDocumento($values){
        $database = new Database();

        $cols = 'Descricao';

        $result = $database->doInsert('tipos_docto', $cols, $values);

        $database->closeConection();
        return $result;
    }

    
    public static function updateOS($Chave, $Descricao, $Chave_Cliente, $chave_navio, $Data_Abertura, $Data_Chegada, $chave_tipo_servico, $viagem, $porto, $Data_Saida, $Data_Encerramento, $Data_Faturamento, $centro_custo, $ROE, $Comentario_Voucher, $encerradoPor, $faturadoPor, $Empresa, $eta, $atb, $etb, $governmentTaxes, $bankCharges){
        $database = new Database();

        $query = "Descricao = '".$Descricao."', Chave_Cliente = '".$Chave_Cliente."', chave_navio = '".$chave_navio."', Data_Abertura = '".$Data_Abertura."', Data_Chegada = '".$Data_Chegada."', chave_tipo_servico = '".$chave_tipo_servico."', viagem = '".$viagem."', porto = '".$porto."', Data_Saida = '".$Data_Saida."', Data_Encerramento = '".$Data_Encerramento."', Data_Faturamento = '".$Data_Faturamento."', centro_custo = '".$centro_custo."', ROE = '".$ROE."', Comentario_Voucher = '".$Comentario_Voucher."', encerradoPor = '".$encerradoPor."', faturadoPor = '".$faturadoPor."',Empresa = '".$Empresa."', eta = '".$eta."', atb = '".$atb."', etb = '".$etb."', governmentTaxes = '".$governmentTaxes."', bankCharges = '".$bankCharges."'";
        
        $result = $database->doUpdate('os', $query, 'Chave = '.$Chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateServicoItem($chave, $chave_os, $data, $fornecedor, $taxa, $descricao, $ordem, $tipo_sub, $Fornecedor_Custeio, $remarks){
        $database = new Database();

        $query = "chave_os = '".$chave_os."', data = '".$data."', fornecedor = '".$fornecedor."', taxa = '".$taxa."', descricao = '".$descricao."', ordem = '".$ordem."', tipo_sub = '".$tipo_sub."', Fornecedor_Custeio = '".$Fornecedor_Custeio."', remarks = '".$remarks."'";
        
        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = '.$chave);

        $result = $database->doSelect('os_servicos_itens', "os_servicos_itens.*", 'chave = '.$chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateServicoItemFinanceiro($chave, $Moeda, $valor, $valor1, $repasse, $emissao, $vencimento, $desconto_valor, $desconto_cpl, $desconto_conta, $retencao_inss_valor, $retencao_inss_cpl, $retencao_inss_conta, $retencao_ir_valor, $retencao_ir_cpl, $retencao_ir_conta, $retencao_iss_valor, $retencao_iss_cpl, $retencao_iss_conta, $retencao_pis_valor, $retencao_pis_cpl, $retencao_pis_conta, $retencao_cofins_valor, $retencao_cofins_cpl, $retencao_cofins_conta, $retencao_csll_valor, $retencao_csll_cpl, $retencao_csll_conta, $complemento){
        $database = new Database();

        $query = "Moeda = '".$Moeda."', valor = '".$valor."', valor1 = '".$valor1."', repasse = '".$repasse."', emissao = '".$emissao."', vencimento = '".$vencimento."', desconto_valor = '".$desconto_valor."', desconto_cpl = '".$desconto_cpl."', desconto_conta = '".$desconto_conta."', retencao_inss_valor = '".$retencao_inss_valor."', retencao_inss_cpl = '".$retencao_inss_cpl."', retencao_inss_conta = '".$retencao_inss_conta."', retencao_ir_valor = '".$retencao_ir_valor."', retencao_ir_cpl = '".$retencao_ir_cpl."', retencao_ir_conta = '".$retencao_ir_conta."', retencao_iss_valor = '".$retencao_iss_valor."', retencao_iss_cpl = '".$retencao_iss_cpl."', retencao_iss_conta = '".$retencao_iss_conta."', retencao_pis_valor = '".$retencao_pis_valor."', retencao_pis_cpl = '".$retencao_pis_cpl."', retencao_pis_conta = '".$retencao_pis_conta."', retencao_cofins_valor = '".$retencao_cofins_valor."', retencao_cofins_cpl = '".$retencao_cofins_cpl."', retencao_cofins_conta = '".$retencao_cofins_conta."', retencao_csll_valor = '".$retencao_csll_valor."', retencao_csll_cpl = '".$retencao_csll_cpl."', retencao_csll_conta = '".$retencao_csll_conta."', complemento = '".$complemento."'";
        
        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = '.$chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateSolicitacaoValor($chave, $Moeda, $valor){
        $database = new Database();

        $query = "Moeda = '".$Moeda."', valor = '".$valor."'";
        
        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = '.$chave);

        $result = $database->doSelect('os_servicos_itens', "os_servicos_itens.*", 'chave = '.$chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateCentroCusto($Chave, $Descricao, $Data, $Encerrado, $Cliente, $Codigo){
        $database = new Database();

        $query = "Descricao = '".$Descricao."', Data = '".$Data."', Encerrado = '".$Encerrado."', Cliente = '".$Cliente."', Codigo = '".$Codigo."'";
        
        $result = $database->doUpdate('centros_custos', $query, 'Chave = '.$Chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateDocumento($chave, $descricao, $tipo){
        $database = new Database();

        $query = "descricao = '".$descricao."', tipo_docto = '".$tipo."'";
        
        $result = $database->doUpdate('os_documentos', $query, 'chave = '.$chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTipoDocumento($Chave, $Descricao){
        $database = new Database();

        $query = "Descricao = '".$Descricao."'";
        
        $result = $database->doUpdate('tipos_docto', $query, 'Chave = '.$Chave);
        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function trocaDocumento($chave, $descricao, $tipo, $ext, $caminho){
        $database = new Database();
        $query = "descricao = '".$descricao."', tipo_docto = '".$tipo."', caminho = '".$caminho."'";
        
        $result = $database->doUpdate('os_documentos', $query, 'chave = '.$chave);

        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function registraEmails($email_enviado, $data_email, $chave) {
        $database = new Database();
        $query = "email_enviado = '".$email_enviado."', data_email = '".$data_email."'";
        
        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = '.$chave);

        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteOS($chave, $canceladaPor){
        $database = new Database();
    
        $result = $database->doUpdate('os', "cancelada = 1, canceladoPor = '".$canceladaPor."'", 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteServicoItem($chave, $canceladoPor){
        $database = new Database();
    
        $result = $database->doUpdate('os_servicos_itens', "cancelada = 1, canceladaPor = '".$canceladoPor."'",'chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteCentroCusto($chave){
        $database = new Database();
    
        $result = $database->doDelete('centros_custos', 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteDocumento($chave){
        $database = new Database();
    
        $result = $database->doDelete('os_documentos', 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteTipoDocumento($chave){
        $database = new Database();
    
        $result = $database->doDelete('tipos_docto', 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }
}
?>