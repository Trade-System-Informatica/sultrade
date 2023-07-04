<?php
include_once "Database.php";

class OS
{
    private $database;

    public function __construct()
    {
    }

    public static function getOS($Empresa, $limit, $offset)
    {
        $database = new Database();

        if ($limit) {
            $limit = " LIMIT " . $limit;
        } else {
            $limit = '';
        }
        if ($offset != null) {
            $offset = " OFFSET " . $offset;
        } else {
            $limit = '';
        }

        if ($Empresa == 0) {
            $result = $database->doSelect(
                'os 
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
                "1 = 1 ORDER BY chave DESC" . $limit . $offset
            );
        } else {
            $result = $database->doSelect(
                'os 
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
                "empresa = '" . $Empresa . "' ORDER BY chave DESC" . $limit . $offset
            );
        }

        $database->closeConection();
        return $result;
    }

    public static function getOSUma($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os',
            'os.*',
            'Chave =' . $chave_os
        );
        $database->closeConection();
        return $result;
    }

    public static function getOSConta($codigo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os LEFT JOIN contas_aberto ON contas_aberto.Centro_Custo = os.centro_custo',
            'os.*, contas_aberto.chave as conta',
            "codigo = '$codigo'"
        );

        if (!$result[0]) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.chave as conta',
                "os_manual = '$codigo'"
            );
        }

        $database->closeConection();
        return $result;
    }

    public static function getCodigos($tipo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'codigos',
            'codigos.*',
            "tipo = '" . $tipo . "'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getServicosItens($offset, $empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'os_servicos_itens 
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
                "1=1 ORDER BY chave DESC LIMIT 101 OFFSET " . $offset
            );
        } else {
            $result = $database->doSelect(
                'os_servicos_itens 
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
                "os.empresa = '" . $empresa . "' ORDER BY chave DESC LIMIT 101 OFFSET " . $offset
            );
        }

        $database->closeConection();
        return $result;
    }

    public static function getServicosItensOs($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_servicos_itens LEFT JOIN pessoas ON pessoas.chave = os_servicos_itens.fornecedor LEFT JOIN moedas ON moedas.chave = os_servicos_itens.moeda LEFT JOIN contas_aberto ON contas_aberto.Docto_Origem = os_servicos_itens.chave',
            'os_servicos_itens.*, 
            pessoas.nome AS fornecedorNome,
            moedas.Sigla,
            contas_aberto.chave AS conta',
            "os_servicos_itens.chave_os = '" . $chave_os . "' ORDER BY os_servicos_itens.ordem"
        );
        $database->closeConection();
        return $result;
    }

    public static function getSolicitacoesOS($pesquisa, $Empresa)
    {
        $database = new Database();

        if ($pesquisa == "") {
            $result = $database->doSelect(
                'os LEFT JOIN os_navios ON os_navios.chave = os.chave_navio LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_portos ON os_portos.Chave = os.porto',
                'os.*, os_navios.nome AS navioNome, pessoas.nome AS clienteNome, os_portos.Descricao AS portoNome',
                "os.empresa = '" . $Empresa . "' ORDER BY os.chave DESC"
            );
        } else {
            $result = $database->doSelect(
                'os LEFT JOIN os_navios ON os_navios.chave = os.chave_navio LEFT JOIN pessoas ON pessoas.chave = os.chave_cliente
            LEFT JOIN os_portos ON os_portos.Chave = os.porto
            LEFT JOIN os_servicos_itens ON os_servicos_itens.chave_os = os.chave',
                'os.*, os_navios.nome AS navioNome, pessoas.nome AS clienteNome, os_portos.Descricao AS portoNome',
                "os.empresa = '" . $Empresa . "' AND os_servicos_itens.chave LIKE '%" . $pesquisa . "%' AND os_servicos_itens.cancelada = 0 GROUP BY os.chave ORDER BY os.chave DESC"
            );
        }

        $database->closeConection();
        return $result;
    }

    public static function getOSPesquisa($where, $Empresa)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os 
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
            "os.empresa = '" . $Empresa . "' AND " . $where . " ORDER BY os.chave DESC"
        );

        $database->closeConection();
        return $result;
    }

    public static function getDocumentosOS($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_documentos LEFT JOIN os ON os_documentos.chave_os = os.chave LEFT JOIN os_servicos_itens ON os_documentos.chave_os_itens = os_servicos_itens.chave',
            'os_documentos.*',
            'os_documentos.chave_os = ' . $chave_os
        );
        $database->closeConection();
        return $result;
    }

    public static function getDocumentosOSI($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_documentos LEFT JOIN os ON os_documentos.chave_os = os.chave LEFT JOIN os_servicos_itens ON os_documentos.chave_os_itens = os_servicos_itens.chave',
            'os_documentos.*',
            'os_documentos.chave_os_itens = ' . $chave
        );
        $database->closeConection();
        return $result;
    }

    public static function getSolicitacao($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_servicos_itens
        LEFT JOIN os ON os.chave = os_servicos_itens.chave_os 
        LEFT JOIN os_taxas ON os_taxas.chave = os_servicos_itens.taxa
        LEFT JOIN os_taxas_portos ON os_taxas_portos.taxa = os_taxas.chave AND os_taxas_portos.porto = os.porto
        LEFT JOIN os_navios ON os.chave_navio = os_navios.chave
        LEFT JOIN pessoas as cliente ON os.Chave_Cliente = cliente.chave
        LEFT JOIN pessoas ON os_servicos_itens.fornecedor = pessoas.chave
        LEFT JOIN pessoas as fornecedor_custeio ON os_servicos_itens.fornecedor_custeio = fornecedor_custeio.chave',
            'os_servicos_itens.*, 
                                      os_taxas_portos.conta as contaTaxa, 
                                      cliente.Conta_Faturar as contaCliente, 
                                      pessoas.Conta_Provisao as contaFornecedor, 
                                      fornecedor_custeio.Conta_Provisao as contaFornecedorCusteio, 
                                      os.centro_custo AS centroCusto, 
                                      pessoas.Nome AS fornecedorNome, 
                                      fornecedor_custeio.Nome as fornecedorCustioNome,
                                      os_navios.nome AS navioNome',
            'os_servicos_itens.chave = ' . $chave
        );
        $database->closeConection();
        return $result;
    }

    public static function getEventoComplementar($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_servicos_itens_complementar',
            'os_servicos_itens_complementar.*',
            'os_servicos_itens_complementar.evento = ' . $chave
        );
        $database->closeConection();
        return $result;
    }

    public static function testEventoFornecedor($chave, $fornecedor)
    {
        $database = new Database();

        $evento = $database->doSelect(
            'os_servicos_itens',
            'os_servicos_itens.fornecedor',
            "os_servicos_itens.chave = '$chave'"
        );

        if ($evento[0]["fornecedor"] == $fornecedor) {
            $result = true;
        } else {
            $result = false;
        }
        $database->closeConection();
        return $result;
    }

    public static function getCentrosCustos()
    {
        $database = new Database();

        $result = $database->doSelect(
            'centros_custos
        LEFT JOIN pessoas ON centros_custos.cliente = pessoas.chave',
            'centros_custos.*, pessoas.Nome as pessoaNome',
            '1 = 1 ORDER BY centros_custos.chave DESC'
        );
        $database->closeConection();
        return $result;
    }

    public static function getCentrosCustosAtivos()
    {
        $database = new Database();

        $result = $database->doSelect(
            'centros_custos
        LEFT JOIN pessoas ON centros_custos.cliente = pessoas.chave',
            'centros_custos.*, pessoas.Nome as pessoaNome',
            "Encerrado IS NULL OR Encerrado = '0000-00-00' ORDER BY centros_custos.codigo DESC"
        );
        $database->closeConection();
        return $result;
    }

    public static function getCentrosCustosLivres($os_chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'centros_custos
        LEFT JOIN pessoas ON centros_custos.cliente = pessoas.chave LEFT JOIN os ON centros_custos.chave ON os.centro_custo',
            'centros_custos.*, pessoas.Nome as pessoaNome',
            "(Encerrado IS NULL OR Encerrado = '0000-00-00') AND (os.chave IS NULL OR os.chave = '$os_chave') ORDER BY centros_custos.codigo DESC"
        );

        $database->closeConection();
        return $result;
    }

    public static function getOrdem($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_servicos_itens',
            'os_servicos_itens.*',
            "chave_os = '" . $chave_os . "' ORDER BY ordem DESC LIMIT 1"
        );
        $database->closeConection();
        return $result;
    }

    public static function getDescricaoPadrao()
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_descricao_padrao',
            'os_descricao_padrao.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getTiposDocumento()
    {
        $database = new Database();

        $result = $database->doSelect(
            'tipos_docto',
            'tipos_docto.*',
            '1 = 1 ORDER BY chave ASC'
        );
        $database->closeConection();
        return $result;
    }

    public static function getTiposLancamento()
    {
        $database = new Database();

        $result = $database->doSelect(
            'tipos_docto',
            'tipos_docto.*',
            '1 = 1 ORDER BY chave ASC'
        );
        $database->closeConection();
        return $result;
    }

    public static function getUltimoDocumento($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_documentos',
            'os_documentos.*',
            "os_documentos.chave_os = '" . $chave_os . "'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getCusteiosSubagentes($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'custeios_subagentes LEFT JOIN os_servicos_itens ON os_servicos_itens.chave = custeios_subagentes.evento LEFT JOIN pessoas ON os_servicos_itens.fornecedor = pessoas.chave',
            'custeios_subagentes.grupo,
            GROUP_CONCAT(custeios_subagentes.chave) as chave,
            custeios_subagentes.os,
            GROUP_CONCAT(custeios_subagentes.evento) as evento,
            SUM(os_servicos_itens.valor1) as valor,
            custeios_subagentes.chave as chave_grupo,
            pessoas.nome as fornecedorNome,
            os_servicos_itens.tipo_sub as tipo,
            custeios_subagentes.contabilizado',
            "custeios_subagentes.os = '" . $chave_os . "' GROUP BY custeios_subagentes.grupo"
        );
        $database->closeConection();
        return $result;
    }

    public static function getValoresOS($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os 
        left join os_servicos_itens on os.chave=os_servicos_itens.chave_os',

            'os.bankCharges,
            os.governmentTaxes,
        os_servicos_itens.valor,
        os_servicos_itens.moeda',

            "os.chave = '" . $chave . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0
            ORDER BY os_servicos_itens.ordem ASC"
        );
        $database->closeConection();
        return $result;
    }

    public static function getEventosIrmaos($os)
    {
        $database = new Database();

        $result = $database->doSelect("os_servicos_itens AS eventos
        LEFT JOIN os ON os.chave = eventos.chave_os
        LEFT JOIN os_taxas AS taxas ON taxas.chave = eventos.taxa 
        LEFT JOIN os_subgrupos_taxas AS subgrupos ON subgrupos.chave = taxas.sub_grupo 
        LEFT JOIN os_subgrupos_taxas_campos AS campos ON campos.subgrupo = subgrupos.chave
        ", "eventos.*, GROUP_CONCAT(campos.nome SEPARATOR '@.@') AS campos", "
        os.codigo = '$os' GROUP BY eventos.chave");

        $database->closeConection();
        return $result;
    }

    public static function gerarRelatorioOS($where)
    {
        $database = new Database();

        if ($where != "") {
            $result = $database->doSelect(
                "os
                LEFT JOIN os_navios ON os.chave_navio = os_navios.chave
                LEFT JOIN os_portos ON os.porto = os_portos.chave
                LEFT JOIN pessoas ON os.Chave_Cliente = pessoas.chave
                LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os
                LEFT JOIN os_tipos_servicos ON os.chave_tipo_servico = os_tipos_servicos.chave",
                "os.codigo,
                os_navios.nome AS navioNome,
                os_portos.Descricao AS portoNome,
                os.eta AS ETA,
                os.etb AS ETB,
                os.data_saida AS ETS,
                ((IFNULL((SELECT SUM(os_servicos_itens.valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND os_servicos_itens.moeda = 5 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0) / os.ROE) + IFNULL((SELECT SUM(os_servicos_itens.valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND moeda = 6 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0)) as valor,
                ((IFNULL((SELECT SUM(os_servicos_itens.desconto_valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND os_servicos_itens.moeda = 5 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0) / os.ROE) + IFNULL((SELECT SUM(os_servicos_itens.desconto_valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND moeda = 6 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0)) as desconto,
                pessoas.Nome AS pessoaNome,
                pessoas.Nome_Fantasia AS pessoaNomeFantasia,
                os_tipos_servicos.descricao AS tipoServicoNome",
                "$where GROUP BY os.chave"
            );
            $database->closeConection();
        } else {
            $result = $database->doSelect(
                "os
                LEFT JOIN os_navios ON os.chave_navio = os_navios.chave
                LEFT JOIN os_portos ON os.porto = os_portos.chave
                LEFT JOIN pessoas ON os.Chave_Cliente = pessoas.chave
                LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os
                LEFT JOIN os_tipos_servicos ON os.chave_tipo_servico = os_tipos_servicos.chave",
                "os.codigo,
                os_navios.nome AS navioNome,
                os_portos.Descricao AS portoNome,
                os.eta AS ETA,
                os.etb AS ETB,
                os.atb AS ETS,
                ((IFNULL((SELECT SUM(os_servicos_itens.valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND os_servicos_itens.moeda = 5 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0) / os.ROE) + IFNULL((SELECT SUM(os_servicos_itens.valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND moeda = 6 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0)) as valor,
                ((IFNULL((SELECT SUM(os_servicos_itens.desconto_valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND os_servicos_itens.moeda = 5 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0) / os.ROE) + IFNULL((SELECT SUM(os_servicos_itens.desconto_valor) FROM os_servicos_itens WHERE os_servicos_itens.chave_os = os.chave AND moeda = 6 AND os_servicos_itens.cancelada = 0 GROUP BY os.chave),0)) as desconto,
                pessoas.Nome AS pessoaNome,
                pessoas.Nome_Fantasia AS pessoaNomeFantasia,
                os_tipos_servicos.descricao AS tipoServicoNome",
                "GROUP BY os.chave"
            );
        }
        return $result;
    }

    public static function insertOS($values, $codigo, $tipo, $navio = null, $tipoServico = null, $cliente = null, $porto = null, $chaveCliente)
    {
        $database = new Database();


        if ($codigo >= 5850 && $navio && $tipoServico && $cliente && $porto) {
            $centroCusto = $database->doSelect('centros_custos', 'Chave', "Codigo = '$codigo'");

            if (!$centroCusto[0]) {
                $valuesCentroCusto = "'$codigo', '$codigo', 'ST$codigo $navio - $tipoServico - $cliente - $porto', '$chaveCliente'";
                $centroCusto = $database->doInsert('centros_custos', 'Chave, Codigo, Descricao, Cliente', $valuesCentroCusto);

                $database->doUpdate('codigos', "Proximo = '" . ($codigo + 1) . "'", "Tipo = 'CC'");
            }
            $cols = 'Operador_Inclusao, Descricao, codigo, Chave_Cliente, chave_navio, Data_Abertura, Data_Chegada, Data_Saida, chave_tipo_servico, viagem, porto, encerradoPor, faturadoPor, Empresa, eta, atb, etb, governmentTaxes, bankCharges, operador, envio, centro_custo';
            $result = $database->doInsert('os', $cols, $values . ", '" . $centroCusto[0]["Chave"] . "'");
        } else {
            $cols = 'Operador_Inclusao, Descricao, codigo, Chave_Cliente, chave_navio, Data_Abertura, Data_Chegada, Data_Saida, chave_tipo_servico, viagem, porto, encerradoPor, faturadoPor, Empresa, eta, atb, etb, governmentTaxes, bankCharges, operador, envio';
            $result = $database->doInsert('os', $cols, $values);
        }


        if ($result) {
            $query = "Proximo = '" . ($codigo + 1) . "'";
            $database->doUpdate('codigos', $query, "Tipo = '" . $tipo . "'");
        }
        $database->closeConection();
        return $result;
    }

    public static function insertServicoItem($values)
    {
        $database = new Database();

        $cols = 'chave_os, data, fornecedor, taxa, descricao, ordem, tipo_sub, Fornecedor_Custeio, remarks, Moeda, valor, valor1, repasse';

        $result = $database->doInsert('os_servicos_itens', $cols, $values);

        $database->closeConection();
        return $result;
    }

    public static function insertServicoItemBasico($values, $codigo, $tipo, $chave_os, $ordem)
    {
        $database = new Database();

        $cols = 'chave_os, data, fornecedor, taxa, descricao, tipo_sub, Fornecedor_Custeio, remarks, Moeda, valor, valor1, repasse, ordem';
        $values .= ", '$ordem'";

        if ($chave_os) {
            $os = $database->doSelect("os_servicos_itens", "os_servicos_itens.*", "chave_os = $chave_os");

            foreach ($os as $item) {
                if ($item["ordem"] >= $ordem) {
                    $item["ordem"]++;

                    $database->doUpdate("os_servicos_itens", "os_servicos_itens.ordem = '" . $item["ordem"] . "'", "chave = '" . $item["chave"] . "'");
                }
            }
        }

        $result = $database->doInsert('os_servicos_itens', $cols, $values);

        if ($result) {
            $result = $database->doSelect('os_servicos_itens', 'os_servicos_itens.*', "1=1 ORDER BY chave DESC LIMIT 1");
        }
        $database->closeConection();
        return $result;
    }

    public static function insertEventoCampos($values, $evento)
    {
        $database = new Database();

        $cols = 'subgrupo_campo, valor, evento';

        foreach ($values as $key => $value) {
            $insert = "'" . $value->{"chave"} . "', '" . $value->{"valor"} . "', '$evento'";

            $database->doInsert('os_servicos_itens_complementar', $cols, $insert);
        }

        $database->closeConection();
        return;
    }

    public static function insertCentroCusto($values, $codigo)
    {
        $database = new Database();

        $cols = 'Descricao, Data, Cliente, Codigo, Chave';

        $centrosCustosTeste = $database->doSelect('centros_custos', '*', "codigo = '$codigo'");

        if ($centrosCustosTeste[0]) {
            return ["error" => "Repetição de códigos"];
        }

        $result = $database->doInsert('centros_custos', $cols, $values . ", '$codigo'");

        if ($result) {
            $query = "Proximo = '" . ($codigo + 1) . "'";
            $database->doUpdate('codigos', $query, "Tipo = 'CC'");
        }

        $database->closeConection();
        return $result;
    }

    public static function insertCentroCustoBasico($values, $codigo)
    {
        $database = new Database();

        $cols = 'Descricao, Data, Cliente, Codigo, Chave';

        $centrosCustosTeste = $database->doSelect('centros_custos', '*', "codigo = '$codigo'");

        if ($centrosCustosTeste[0]) {
            return ["error" => "Repetição de códigos"];
        }

        $result = $database->doInsert('centros_custos', $cols, $values . ", '$codigo'");

        if ($result) {
            $query = "Proximo = '" . ($codigo + 1) . "'";
            $database->doUpdate('codigos', $query, "Tipo = 'CC'");
        }

        $database->closeConection();
        return $result;
    }

    public static function insertDocumento($chave_os, $chave_osi, $descricao, $tipo, $ext)
    {
        $database = new Database();

        $values = "'" . $chave_os . "', '" . $chave_osi . "', '" . $descricao . "', '" . $tipo . "'";
        $cols = 'chave_os, chave_os_itens, descricao, tipo_docto';

        $result = $database->doInsert('os_documentos', $cols, $values);

        $chave = $database->doSelect('os_documentos', 'os_documentos.*', '1=1 ORDER BY chave DESC');

        if ($chave_osi == 0) {
            $pai = "OS_" . $chave_os . "_";
        } else {
            $pai = "OSI_" . $chave_osi . "_";
        }

        if (strlen($chave[0]['chave']) == 1) {
            $pai .= '00' . $chave[0]['chave'];
        } else if (strlen($chave[0]['chave']) == 2) {
            $pai .= '0' . $chave[0]['chave'];
        } else {
            $pai .= $chave[0]['chave'];
        }


        $query = "caminho = '" . $pai . '.' . $ext . "'";

        $result = $database->doUpdate('os_documentos', $query, 'chave = ' . $chave[0]['chave']);

        $database->closeConection();
        return $pai;
    }

    public static function insertTipoDocumento($values)
    {
        $database = new Database();

        $cols = 'Descricao';

        $result = $database->doInsert('tipos_docto', $cols, $values);

        $database->closeConection();
        return $result;
    }

    public static function insertCusteioSubagente($os, $eventos)
    {
        $database = new Database();

        $cols = 'grupo, os, evento';

        $grupos = $database->doSelect('custeios_subagentes', 'custeios_subagentes.grupo', "custeios_subagentes.os = '$os' GROUP BY grupo");

        foreach ($eventos as $evento) {
            $values = (count($grupos) + 1) . ", $os, $evento";
            $database->doInsert('custeios_subagentes', $cols, $values);
        }

        $database->closeConection();
        return true;
    }

    public static function insertEventosCamposCopiados($campos, $eventos)
    {
        $database = new Database();
        $cols = "subgrupo_campo, valor, evento";

        foreach ($eventos as $key => $evento) {
            foreach ($campos as $key => $campo) {
                $campo_titulo = $database->doSelect('os_subgrupos_taxas_campos', 'nome', "chave = ".$campo->{"subgrupo_campo"});
                if ($campo_titulo[0]) {
                    $campo_titulo = $campo_titulo[0]["nome"];
                    
                    $campo_evento = $database->doSelect('os_servicos_itens 
                    LEFT JOIN os_taxas ON os_taxas.chave = os_servicos_itens.taxa
                    LEFT JOIN os_subgrupos_taxas ON os_subgrupos_taxas.chave = os_taxas.sub_grupo
                    LEFT JOIN os_subgrupos_taxas_campos ON os_subgrupos_taxas_campos.subgrupo_campo = os_subgrupos_taxas.chave',
                    'os_subgrupos_taxas_campos.subgrupo_campo AS subgrupo_campo', "os_subgrupos_taxas_campos = '$campo_titulo' AND os_servicos_itens.chave = $evento");
                    
                    if ($campo_evento[0]) {
                        $values = "'" . $campo_evento[0]["subgrupo_campo"] . "', '" . $campo->{"valor"} . "', " . $evento;
                        
                        $database->doInsert('os_servicos_itens_complementar', $cols, $values);
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        $database->closeConection();
        return true;
    }

    public static function checkAndDeleteContaOS($os)
    {
        $database = new Database();


        if ($os) {
            $database->doDelete('contas_aberto', "os_origem = $os");
        }

        $database->closeConection();
        return true;
    }

    public static function contabilizaCusteioSubagente($grupos)
    {
        $database = new Database();

        foreach ($grupos as $grupo) {
            $lote = $database->doSelect('codigos', 'codigos.Proximo', "Tipo = 'LT'");
            $database->doUpdate('codigos', 'Proximo = ' . ($lote[0]["Proximo"] + 1), "Tipo = 'LT'");
            $lote = $lote[0]["Proximo"];
            $colsLancto = "Data, TipoDocto, CentroControle, Historico_Padrao, Pessoa, Usuario_Inclusao, Usuario_Alteracao, Data_Inclusao, Data_Alteracao, Deletado, tipo, atualizado, Lote, Historico, ChavePr, Valor, ContaDebito, ContaCredito";
            $colsConta = 'Lancto, Tipo, Pessoa, Conta_Contabil, RepCodBar, Centro_Custo, Historico, Conta_Desconto, Parc_Ini, Parc_Fim, Vencimento, Vencimento_Original, Conta_Provisao, Operador, Empresa, Docto, tipodocto, meio_pagamento, docto_origem, Valor, Saldo, grupo_origem';
            $colsDarf = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";
            $colsRet = "chave_conta, complemento, tipo, valor, chave_conta_aberto";

            $valuesLancto = $grupo->{"valuesLancto"} . ", '$lote'";
            $valuesConta = $grupo->{"valuesConta"};
            $valuesDarf = $grupo->{"valuesDarf"};

            $contaDesconto = "";
            $contaINSS = "";
            $contaIR = "";
            $contaISS = "";
            $contaCRF = "";

            $cplDesconto = "";
            $cplINSS = "";
            $cplIR = "";
            $cplISS = "";
            $cplCRF = "";

            $valorTotal = $grupo->{"vcp"};
            $valorDesconto = 0;
            $valorINSS = 0;
            $valorIR = 0;
            $valorISS = 0;
            $valorCRF = 0;

            $eventos = $grupo->{"eventos"};
            foreach ($eventos as $evento) {

                if ($evento->{"desconto_valor"} && $evento->{"desconto_valor"} != "0.00") {
                    $valorDesconto += $evento->{"desconto_valor"};
                    $contaDesconto = $evento->{"desconto_conta"};
                    $cplDesconto = $evento->{"desconto_cpl"};
                }

                if ($evento->{"retencao_inss_valor"} && $evento->{"retencao_inss_valor"} != "0.00") {
                    $valorINSS += $evento->{"retencao_inss_valor"};
                    $contaINSS = $evento->{"retencao_inss_conta"};
                    $cplINSS = $evento->{"retencao_inss_cpl"};
                }

                if ($evento->{"retencao_ir_valor"} && $evento->{"retencao_ir_valor"} != "0.00") {
                    $valorIR += $evento->{"retencao_ir_valor"};
                    $contaIR = $evento->{"retencao_ir_conta"};
                    $cplIR = $evento->{"retencao_ir_cpl"};
                }

                if ($evento->{"retencao_iss_valor"} && $evento->{"retencao_iss_valor"} != "0.00") {
                    $valorISS += $evento->{"retencao_iss_valor"};
                    $contaISS = $evento->{"retencao_iss_conta"};
                    $cplISS = $evento->{"retencao_iss_cpl"};
                }

                if ($evento->{"retencao_csll_valor"} && $evento->{"retencao_csll_valor"} != "0.00") {
                    $valorCRF += $evento->{"retencao_csll_valor"};
                    $contaCRF = $evento->{"retencao_csll_conta"};
                    $cplCRF = $evento->{"retencao_csll_cpl"};
                }
            }
            $valorTotal -= ($valorDesconto + $valorINSS + $valorIR + $valorISS + $valorCRF);

            $contaNova = $database->doInsert("contas_aberto", $colsConta, $valuesConta . ", '$valorTotal', '$valorTotal', '" . $grupo->{"chave"} . "'");
            $contaNova = $contaNova[0]["Chave"];
            if ($valuesDarf) {
                $valuesDarf .= "'$contaNova'";
                $database->doInsert("contas_aberto_complementar", $colsDarf, $valuesDarf);
            }

            if ($contaDesconto) {
                $database->doInsert("contas_aberto_cc", $colsRet, "'$contaDesconto', '$cplDesconto', 'DESC', '$valorDesconto', '$contaNova'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '$cplDesconto', '$contaNova','$valorDesconto', '0', $contaDesconto");
            }
            if ($contaINSS) {
                $database->doInsert("contas_aberto_cc", $colsRet, "'$contaINSS', '$cplINSS', 'INSS', '$valorINSS', '$contaNova'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '$cplINSS', '$contaNova','$valorINSS', '0', $contaINSS");
            }
            if ($contaIR) {
                $database->doInsert("contas_aberto_cc", $colsRet, "'$contaIR', '$cplIR', 'IR', '$valorIR', '$contaNova'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '$cplIR', '$contaNova','$valorIR', '0', $contaIR");
            }
            if ($contaISS) {
                $database->doInsert("contas_aberto_cc", $colsRet, "'$contaISS', '$cplISS', 'ISS', '$valorISS', '$contaNova'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '$cplISS', '$contaNova','$valorISS', '0', $contaISS");
            }
            if ($contaCRF) {
                $database->doInsert("contas_aberto_cc", $colsRet, "'$contaCRF', '$cplCRF', 'CRF', '$valorCRF', '$contaNova'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '$cplCRF', '$contaNova','$valorCRF', '0', $contaCRF");
            }

            if ($valorTotal == $grupo->{"vcp"}) {
                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '" . $grupo->{"historico"} . "', '$contaNova', '$valorTotal', '" . $grupo->{"contaDebito"} . "', '" . $grupo->{"contaCredito"} . "'");
            } else {
                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '" . $grupo->{"historico"} . "', '$contaNova', '" . $grupo->{"vcp"} . "', '" . $grupo->{"contaDebito"} . "', '" . $grupo->{"contaCredito"} . "'");

                $database->doInsert("lancamentos", $colsLancto, "$valuesLancto, '" . $grupo->{"historico"} . "', '$contaNova', '$valorTotal', '" . $grupo->{"contaDebito"} . "', '0'");
            }
        }

        $database->closeConection();
        return true;
    }


    public static function updateOS($Chave, $Descricao, $Chave_Cliente, $chave_navio, $Data_Abertura, $Data_Chegada, $chave_tipo_servico, $viagem, $porto, $Data_Saida, $Data_Encerramento, $Data_Faturamento, $centro_custo, $ROE, $Comentario_Voucher, $encerradoPor, $faturadoPor, $Empresa, $eta, $atb, $etb, $governmentTaxes, $bankCharges, $operador, $envio)
    {
        $database = new Database();

        $query = "Descricao = '" . $Descricao . "', Chave_Cliente = '" . $Chave_Cliente . "', chave_navio = '" . $chave_navio . "', Data_Abertura = '" . $Data_Abertura . "', Data_Chegada = '" . $Data_Chegada . "', chave_tipo_servico = '" . $chave_tipo_servico . "', viagem = '" . $viagem . "', porto = '" . $porto . "', Data_Saida = '" . $Data_Saida . "', Data_Encerramento = '" . $Data_Encerramento . "', Data_Faturamento = '" . $Data_Faturamento . "', centro_custo = '" . $centro_custo . "', ROE = '" . $ROE . "', Comentario_Voucher = '" . $Comentario_Voucher . "', encerradoPor = '" . $encerradoPor . "', faturadoPor = '" . $faturadoPor . "',Empresa = '" . $Empresa . "', eta = '" . $eta . "', atb = '" . $atb . "', etb = '" . $etb . "', governmentTaxes = '" . $governmentTaxes . "', bankCharges = '" . $bankCharges . "', operador = '$operador', envio = '$envio'";

        $result = $database->doUpdate('os', $query, 'Chave = ' . $Chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateOSCabecalho($Chave, $cabecalho)
    {
        $database = new Database();

        $query = "cabecalho = '$cabecalho'";

        $result = $database->doUpdate('os', $query, 'Chave = ' . $Chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateServicoItem($chave, $chave_os, $data, $fornecedor, $taxa, $descricao, $ordem, $tipo_sub, $Fornecedor_Custeio, $remarks, $Moeda, $valor, $valor1, $repasse)
    {
        $database = new Database();

        $query = "chave_os = '" . $chave_os . "', data = '" . $data . "', fornecedor = '" . $fornecedor . "', taxa = '" . $taxa . "', descricao = '" . $descricao . "', ordem = '" . $ordem . "', tipo_sub = '" . $tipo_sub . "', Fornecedor_Custeio = '" . $Fornecedor_Custeio . "', remarks = '" . $remarks . "', Moeda = '$Moeda', valor = '$valor', valor1 = '$valor1', repasse = '$repasse'";

        $eventos = $database->doSelect("os_servicos_itens", "os_servicos_itens.*", "chave_os = $chave_os");

        foreach ($eventos as $evento) {
            if ($evento["ordem"] >= $ordem) {
                $evento["ordem"]++;

                $database->doUpdate("os_servicos_itens", "ordem = '" . $evento["ordem"] . "'", "chave = '" . $evento["chave"] . "'");
            }
        }

        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = ' . $chave);

        $result = $database->doSelect('os_servicos_itens', "os_servicos_itens.*", 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateServicoItemFinanceiro($chave, $Moeda, $valor, $valor1, $repasse, $emissao, $vencimento, $documento, $tipo_documento, $desconto_valor, $desconto_cpl, $desconto_conta, $retencao_inss_valor, $retencao_inss_cpl, $retencao_inss_conta, $retencao_ir_valor, $retencao_ir_cpl, $retencao_ir_conta, $retencao_iss_valor, $retencao_iss_cpl, $retencao_iss_conta, $retencao_pis_valor, $retencao_pis_cpl, $retencao_pis_conta, $retencao_cofins_valor, $retencao_cofins_cpl, $retencao_cofins_conta, $retencao_csll_valor, $retencao_csll_cpl, $retencao_csll_conta, $complemento)
    {
        $database = new Database();

        $query = "Moeda = '" . $Moeda . "', valor = '" . $valor . "', valor1 = '" . $valor1 . "', repasse = '" . $repasse . "', emissao = '" . $emissao . "', vencimento = '" . $vencimento . "', documento = '$documento', tipo_documento = '$tipo_documento', desconto_valor = '" . $desconto_valor . "', desconto_cpl = '" . $desconto_cpl . "', desconto_conta = '" . $desconto_conta . "', retencao_inss_valor = '" . $retencao_inss_valor . "', retencao_inss_cpl = '" . $retencao_inss_cpl . "', retencao_inss_conta = '" . $retencao_inss_conta . "', retencao_ir_valor = '" . $retencao_ir_valor . "', retencao_ir_cpl = '" . $retencao_ir_cpl . "', retencao_ir_conta = '" . $retencao_ir_conta . "', retencao_iss_valor = '" . $retencao_iss_valor . "', retencao_iss_cpl = '" . $retencao_iss_cpl . "', retencao_iss_conta = '" . $retencao_iss_conta . "', retencao_pis_valor = '" . $retencao_pis_valor . "', retencao_pis_cpl = '" . $retencao_pis_cpl . "', retencao_pis_conta = '" . $retencao_pis_conta . "', retencao_cofins_valor = '" . $retencao_cofins_valor . "', retencao_cofins_cpl = '" . $retencao_cofins_cpl . "', retencao_cofins_conta = '" . $retencao_cofins_conta . "', retencao_csll_valor = '" . $retencao_csll_valor . "', retencao_csll_cpl = '" . $retencao_csll_cpl . "', retencao_csll_conta = '" . $retencao_csll_conta . "', complemento = '" . $complemento . "'";

        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateSolicitacaoValor($chave, $Moeda, $valor)
    {
        $database = new Database();

        $query = "Moeda = '" . $Moeda . "', valor = '" . $valor . "'";

        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = ' . $chave);

        $result = $database->doSelect('os_servicos_itens', "os_servicos_itens.*", 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateEventoCampos($values, $evento)
    {
        $database = new Database();
        $usedKeys = [];

        foreach ($values as $key => $value) {
            array_push($usedKeys, $value->{"chave"});

            $query = "valor = '" . $value->{"valor"} . "'";
            $database->doUpdate('os_servicos_itens_complementar', $query, 'chave = ' . $value->{"chave"});
        }

        if ($usedKeys[0]) {
            $database->doDelete("os_servicos_itens_complementar", "chave NOT IN (" . join(",", $usedKeys) . ") AND evento = '$evento'");
        } else {
            $database->doDelete("os_servicos_itens_complementar", "evento = '$evento'");
        }

        $database->closeConection();
        return true;
    }

    public static function updateCentroCusto($Chave, $Descricao, $Data, $Encerrado, $Cliente, $Codigo)
    {
        $database = new Database();

        $query = "Descricao = '" . $Descricao . "', Data = '" . $Data . "', Encerrado = '" . $Encerrado . "', Cliente = '" . $Cliente . "', Codigo = '" . $Codigo . "'";

        $result = $database->doUpdate('centros_custos', $query, 'Chave = ' . $Chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateCentroCustoFromOS($Descricao, $Cliente, $OSCodigo)
    {
        $database = new Database();

        $query = "Descricao = '" . $Descricao . "', Cliente = '" . $Cliente . "'";

        $result = $database->doUpdate('centros_custos', $query, 'Codigo = ' . $OSCodigo);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateDocumento($chave, $descricao, $tipo)
    {
        $database = new Database();

        $query = "descricao = '" . $descricao . "', tipo_docto = '" . $tipo . "'";

        $result = $database->doUpdate('os_documentos', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTipoDocumento($Chave, $Descricao)
    {
        $database = new Database();

        $query = "Descricao = '" . $Descricao . "'";

        $result = $database->doUpdate('tipos_docto', $query, 'Chave = ' . $Chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateCusteioSubagente($os, $grupo, $eventos)
    {
        $database = new Database();

        $grupos = $database->doSelect('custeios_subagentes', 'custeios_subagentes.*', "custeios_subagentes.os = '$os' AND custeios_subagentes.grupo = '$grupo'");

        foreach ($grupos as $item) {
            if (!in_array($item["evento"], $eventos)) {
                $database->doDelete('custeios_subagentes', "grupo = '$grupo' AND os = '$os' AND evento = '" . $item['evento'] . "'");
            }
        }

        foreach ($eventos as $evento) {
            $grupoExistente = $database->doSelect('custeios_subagentes', 'custeios_subagentes.grupo', "grupo = '$grupo' AND os = '$os' AND evento = '$evento'");

            if (!$grupoExistente[0]) {
                $database->doInsert('custeios_subagentes', "grupo, os, evento", "'$grupo', '$os', '$evento'");
            }
        }

        $database->closeConection();
        return true;
    }

    public static function trocaDocumento($chave, $descricao, $tipo, $ext, $caminho)
    {
        $database = new Database();
        $query = "descricao = '" . $descricao . "', tipo_docto = '" . $tipo . "', caminho = '" . $caminho . "'";

        $result = $database->doUpdate('os_documentos', $query, 'chave = ' . $chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function registraEmails($email_enviado, $data_email, $chave)
    {
        $database = new Database();
        $query = "email_enviado = '" . $email_enviado . "', data_email = '" . $data_email . "'";

        $result = $database->doUpdate('os_servicos_itens', $query, 'chave = ' . $chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteOS($chave, $canceladaPor)
    {
        $database = new Database();

        $result = $database->doUpdate('os', "cancelada = 1, canceladoPor = '" . $canceladaPor . "'", 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteServicoItem($chave, $canceladoPor)
    {
        $database = new Database();

        $result = $database->doUpdate('os_servicos_itens', "cancelada = 1, canceladaPor = '" . $canceladoPor . "'", 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteCentroCusto($chave)
    {
        $database = new Database();

        $result = $database->doDelete('centros_custos', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteDocumento($chave)
    {
        $database = new Database();

        $result = $database->doDelete('os_documentos', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteTipoDocumento($chave)
    {
        $database = new Database();

        $result = $database->doDelete('tipos_docto', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteCusteioSubagente($grupo, $os)
    {
        $database = new Database();

        $result = $database->doDelete('custeios_subagentes', "grupo = '$grupo' AND os = '$os'");
        $database->closeConection();
        return $result;
    }
}
