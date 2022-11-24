<?php
include_once "Database.php";

class Contas
{
    private $database;

    public function __construct()
    {
    }

    public static function getPlanosContas()
    {
        $database = new Database();

        $result = $database->doSelect(
            'planocontas',
            'planocontas.*',
            '1 = 1 ORDER BY codigo '
        );
        $database->closeConection();
        return $result;
    }

    public static function getContasAbertas($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto 
            LEFT JOIN planocontas ON contas_aberto.Conta_Desconto = planocontas.Chave
            LEFT JOIN contas ON planocontas.ContaCorrente = contas.Chave
            LEFT JOIN pessoas ON contas_aberto.pessoa = pessoas.chave
            LEFT JOIN meios_pagamentos ON contas_aberto.meio_pagamento = meios_pagamentos.chave',
                'contas_aberto.*, 
                                          contas.chave AS contaCorrente, 
                                          (SELECT transacoes.status AS status FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS status, 
                                          (SELECT transacoes.id_status AS statusId FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS statusId, 
                                          (SELECT transacoes.id_transacao AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao, 
                                            pessoas.Nome AS pessoaNome, 
                                            pessoas.Cnpj_Cpf AS pessoaCPF, 
                                            meios_pagamentos.acao AS meioPagamento, 
                                            (SELECT transacoes.chave AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao_chave, 
                                            (SELECT transacoes.data_hora_envio AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS data_hora_envio, 
                                            (SELECT transacoes.liberado AS liberado FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS liberado, 
                                            (SELECT transacoes.operador_envio AS operador_envio FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS operador_envio, 
                                            contas.compe AS compe, 
                                          contas.ispb AS ispb,
                                          meios_pagamentos.codigo_tipo_pagamento AS tipoPagamento,
                                          meios_pagamentos.finalidade_docto AS finalidadeDocto',
                "contas_aberto.Saldo > 0 GROUP BY contas_aberto.chave"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto
            LEFT JOIN planocontas ON contas_aberto.Conta_Desconto = planocontas.Chave
            LEFT JOIN contas ON planocontas.ContaCorrente = contas.Chave
            LEFT JOIN pessoas ON contas_aberto.pessoa = pessoas.chave
            LEFT JOIN meios_pagamentos ON contas_aberto.meio_pagamento = meios_pagamentos.chave',
                'contas_aberto.*, 
                                        contas.chave AS contaCorrente, 
                                        (SELECT transacoes.status AS status FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS status, 
                                        (SELECT transacoes.id_status AS statusId FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS statusId, 
                                        (SELECT transacoes.id_transacao AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao, 
                                        pessoas.Nome AS pessoaNome, 
                                        pessoas.Cnpj_Cpf AS pessoaCPF, 
                                        meios_pagamentos.acao AS meioPagamento, 
                                        (SELECT transacoes.chave AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao_chave, 
                                            (SELECT transacoes.data_hora_envio AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS data_hora_envio, 
                                            (SELECT transacoes.liberado AS liberado FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS liberado, 
                                            (SELECT transacoes.operador_envio AS operador_envio FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS operador_envio, 
                                            contas.compe AS compe, 
                                        contas.ispb AS ispb,
                                        meios_pagamentos.codigo_tipo_pagamento AS tipoPagamento,
                                        meios_pagamentos.finalidade_docto AS finalidadeDocto',
                "contas_aberto.Saldo > 0 AND empresa = '" . $empresa . "' GROUP BY contas_aberto.chave"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasReceber($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 0"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 0 AND empresa = '" . $empresa . "'"
            );
        }

        $database->closeConection();
        return $result;
    }

    public static function getContasPagar($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 1"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 1 AND empresa = '" . $empresa . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasLiquidadas($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0 AND empresa = '" . $empresa . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasRecebidas($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0 AND contas_aberto.Tipo = 0"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0 AND contas_aberto.Tipo = 0 AND empresa = '" . $empresa . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasPagas($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0 AND contas_aberto.Tipo = 1"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo = 0 AND contas_aberto.Tipo = 0 AND empresa = '" . $empresa . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasComplementar($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas_aberto_complementar',
            'contas_aberto_complementar.*',
            "contas_aberto_complementar.chave_contas_aberto = '" . $chave . "'"
        );


        $database->closeConection();
        return $result;
    }

    public static function getPlanoContaCodigo($codigo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'planocontas',
            'planocontas.*',
            "planocontas.Codigo LIKE '" . $codigo . "%'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getPlanoContaNivel($nivel)
    {
        $database = new Database();

        $result = $database->doSelect(
            'planocontas',
            'planocontas.*',
            "planocontas.Nivel = '" . $nivel . "%'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getPlanosContasAnaliticas()
    {
        $database = new Database();

        $result = $database->doSelect(
            'planocontas',
            'planocontas.*',
            "planocontas.Indicador = 'A' ORDER BY codigo "
        );
        $database->closeConection();
        return $result;
    }

    public static function getBancos()
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas',
            'contas.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getTransacoes($chaves)
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes 
            LEFT JOIN contas_aberto ON contas_aberto.chave = transacoes.chave_contas_aberto
            LEFT JOIN meios_pagamentos ON meios_pagamentos.chave = contas_aberto.meio_pagamento',
            'contas_aberto.',
            "chave IN (" . implode(',', $chaves) . ")"
        );
        $database->closeConection();
        return $result;
    }

    public static function getTransacoesPagas($empresa)
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas_aberto
        LEFT JOIN planocontas ON contas_aberto.Conta_Desconto = planocontas.Chave
        LEFT JOIN contas ON planocontas.ContaCorrente = contas.Chave
        LEFT JOIN pessoas ON contas_aberto.pessoa = pessoas.chave
        LEFT JOIN meios_pagamentos ON contas_aberto.meio_pagamento = meios_pagamentos.chave',
            'contas_aberto.*, 
                                    contas.chave AS contaCorrente, 
                                    (SELECT transacoes.status AS status FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS status, 
                                    (SELECT transacoes.id_status AS statusId FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS statusId, 
                                    (SELECT transacoes.id_transacao AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao, 
                                    pessoas.Nome AS pessoaNome, 
                                    pessoas.Cnpj_Cpf AS pessoaCPF, 
                                    meios_pagamentos.acao AS meioPagamento, 
                                    (SELECT transacoes.chave AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao_chave, 
                                    (SELECT transacoes.data_hora_envio AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS data_hora_envio, 
                                    (SELECT transacoes.liberado AS liberado FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS liberado, 
                                    (SELECT transacoes.operador_envio AS operador_envio FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS operador_envio, 
                                    contas.compe AS compe, 
                                    contas.ispb AS ispb,
                                    meios_pagamentos.codigo_tipo_pagamento AS tipoPagamento,
                                    meios_pagamentos.finalidade_docto AS finalidadeDocto',
            "contas_aberto.Saldo = 0 AND empresa = '" . $empresa . "' AND contas_aberto.tipo = 1 GROUP BY contas_aberto.chave"
        );
        $database->closeConection();
        return $result;
    }

    public static function getTransacoesRecebidas($empresa)
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas_aberto
        LEFT JOIN planocontas ON contas_aberto.Conta_Desconto = planocontas.Chave
        LEFT JOIN contas ON planocontas.ContaCorrente = contas.Chave
        LEFT JOIN pessoas ON contas_aberto.pessoa = pessoas.chave
        LEFT JOIN meios_pagamentos ON contas_aberto.meio_pagamento = meios_pagamentos.chave',
            'contas_aberto.*, 
                                    contas.chave AS contaCorrente, 
                                    (SELECT transacoes.status AS status FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS status, 
                                    (SELECT transacoes.id_status AS statusId FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS statusId, 
                                    (SELECT transacoes.id_transacao AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao, 
                                    pessoas.Nome AS pessoaNome, 
                                    pessoas.Cnpj_Cpf AS pessoaCPF, 
                                    meios_pagamentos.acao AS meioPagamento, 
                                    (SELECT transacoes.chave AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS transacao_chave, 
                                            (SELECT transacoes.data_hora_envio AS transacao FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS data_hora_envio, 
                                            (SELECT transacoes.liberado AS liberado FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS liberado, 
                                            (SELECT transacoes.operador_envio AS operador_envio FROM transacoes WHERE transacoes.chave_contas_aberto = contas_aberto.chave ORDER BY transacoes.chave DESC LIMIT 1) AS operador_envio, 
                                            contas.compe AS compe, 
                                        contas.ispb AS ispb,
                                    meios_pagamentos.codigo_tipo_pagamento AS tipoPagamento,
                                    meios_pagamentos.finalidade_docto AS finalidadeDocto',
            "contas_aberto.Saldo = 0 AND empresa = '" . $empresa . "' AND contas_aberto.tipo = 0 GROUP BY contas_aberto.chave"
        );
        $database->closeConection();
        return $result;
    }

    public static function getTransacoesTipo($tipo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes LEFT JOIN contas_aberto ON contas_aberto.chave = transacoes.chave_contas_aberto LEFT JOIN meios_pagamentos ON meios_pagamentos.chave = contas_aberto.meio_pagamento',
            'transacoes.*',
            "meios_pagamentos.acao = '" . $tipo . "' ORDER BY id_transacao DESC"
        );
        $database->closeConection();
        return $result;
    }

    public static function getMeiosPagamentos()
    {
        $database = new Database();

        $result = $database->doSelect(
            'meios_pagamentos',
            'meios_pagamentos.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getCodigosBB()
    {
        $database = new Database();

        $result = $database->doSelect(
            'codigos_bb',
            'codigos_bb.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getLote()
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes',
            '(transacoes.lote + 1) AS lote',
            "1=1 ORDER BY lote DESC LIMIT 1"
        );
        $database->closeConection();
        return $result;
    }

    public static function getUltimaTransacao()
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes',
            '(transacoes.id_transacao + 1) AS transacao',
            "1=1 ORDER BY id_transacao DESC LIMIT 1"
        );
        $database->closeConection();
        return $result;
    }

    public static function getUltimaTransacaoConta($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes',
            'transacoes.*',
            "transacoes.chave_contas_aberto = $chave ORDER BY transacoes.chave DESC LIMIT 1"
        );
        $database->closeConection();
        return $result;
    }

    public static function getContaSolicitacao($Docto_Origem)
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas_aberto',
            'contas_aberto.*',
            "contas_aberto.Docto_Origem = '" . $Docto_Origem . "'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getContaTransacao($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'transacoes',
            'transacoes.*',
            "transacoes.chave_contas_aberto = '" . $chave . "' ORDER BY chave DESC"
        );
        $database->closeConection();
        return $result;
    }

    public static function getInformacoesBancarias($empresa, $tipo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'informacoes_bancarias',
            'informacoes_bancarias.*',
            "informacoes_bancarias.empresa = '" . $empresa . "' AND informacoes_bancarias.tipo = " . $tipo
        );
        $database->closeConection();
        return $result;
    }

    public static function getFaturas($empresa)
    {
        $database = new Database();

        $result = $database->doSelect(
            'faturas LEFT JOIN pessoas ON faturas.Cliente = pessoas.chave',
            'faturas.*, pessoas.Nome AS clienteNome',
            "faturas.empresa = '" . $empresa . "'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getFormularios()
    {
        $database = new Database();

        $result = $database->doSelect(
            'formularios',
            'formularios.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getBearer($basic)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://oauth.bb.com.br/oauth/token");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded', "Authorization: $basic"));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_ENCODING, "");
        curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

        $return = curl_exec($ch);
        return $return;
    }

    public static function getBearerSandbox($basic)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://oauth.sandbox.bb.com.br/oauth/token");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded', "Authorization: $basic"));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_ENCODING, "");
        curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

        $return = curl_exec($ch);
        return $return;
    }


    public static function insertPlanoConta($values, $codigo, $chave)
    {
        $database = new Database();

        $cols = 'Chave, Codigo, Codigo_Red, Nivel, Indicador, Descricao, Conta_Inativa, grupo';

        $result = $database->doInsert('planocontas', $cols, $values);

        if ($result) {
            $query = "Proximo = '" . ($codigo + 1) . "'";
            $result2 = $database->doUpdate('codigos', $query, "Tipo = 'PR'");

            $query = "Proximo = '" . ($chave + 1) . "'";
            $result2 = $database->doUpdate('codigos', $query, "Tipo = 'PL'");
        }

        $database->closeConection();
        return $result;
    }

    public static function insertContaCliente($values, $meioPagamento, $valuesDarf)
    {
        $database = new Database();

        $cols = 'Lancto, Tipo, Pessoa, Conta_Contabil, Centro_Custo, Conta_Desconto, Historico, Parc_Ini, Parc_Fim, RepCodBar, Valor, Vencimento, Vencimento_Original, Conta_Provisao, Saldo, Operador, Empresa, Docto, tipodocto, meio_pagamento';

        $result = $database->doInsert('contas_aberto', $cols, $values);

        if ($result && ($meioPagamento == 'DARF' || $meioPagamento == 'GPS' || $meioPagamento == 'GRU')) {
            $chave = $database->doSelect('contas_aberto', 'contas_aberto.*', '1=1 ORDER BY chave DESC');

            $values2 = $valuesDarf . ", '" . $chave[0]['Chave'] . "'";
            $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";
            if ($meioPagamento == 'GRU') {
                $cols = "contribuinte, chave_contas_aberto";
            }

            $result2 = $database->doInsert('contas_aberto_complementar', $cols, $values2);
        }

        $database->closeConection();
        return $result;
    }

    public static function insertContaFornecedor($values, $meioPagamento, $valuesDarf)
    {
        $database = new Database();

        $cols = 'Lancto, Tipo, Pessoa, Conta_Contabil, RepCodBar, Centro_Custo, Historico, Conta_Desconto, Parc_Ini, Parc_Fim, Valor, Vencimento, Vencimento_Original, Conta_Provisao, Saldo, Operador, Empresa, Docto, tipodocto, meio_pagamento, docto_origem';

        $result = $database->doInsert('contas_aberto', $cols, $values);

        if ($result && ($meioPagamento == 'DARF' || $meioPagamento == 'GPS' || $meioPagamento == 'GRU')) {
            $chave = $database->doSelect('contas_aberto', 'contas_aberto.*', '1=1 ORDER BY chave DESC');

            $values2 = $valuesDarf . ", '" . $chave[0]['Chave'] . "'";
            $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";
            if ($meioPagamento == 'GRU') {
                $cols = "contribuinte, chave_contas_aberto";
            }


            $result2 = $database->doInsert('contas_aberto_complementar', $cols, $values2);
        }

        $database->closeConection();
        return $result;
    }

    public static function insertTransacao($values, $meio)
    {
        $database = new Database();


        $cols = 'data_hora_envio, lote, id_transacao, chave_contas_aberto, status, id_status, operador_envio';

        $result = $database->doInsert('transacoes', $cols, $values);

        $codigo = $database->doSelect('codigos', 'codigos.*', "codigos.Tipo = 'TR'");

        $result2 = $database->doUpdate('codigos', "Proximo = '" . ($codigo[0]['Proximo'] + 1) . "'", "Tipo = 'TR'");


        $database->closeConection();
        return $result;
    }

    public static function insertFatura($values, $formulario)
    {
        $database = new Database();

        $cols = 'Fatura, Emissao, Vencto, Praca_Pagto, Cliente, Valor, Obs, Formulario, Cobranca, discriminacaoservico, empresa';

        $result = $database->doInsert('faturas', $cols, $values);

        $database->doUpdate('formularios', "Proximo_Numero = Proximo_Numero + 1", "chave = '" . $formulario . "'");

        $database->closeConection();
        return $result;
    }

    public static function pagarManual($values, $chave, $valor, $saldo, $data_pagto)
    {
        $database = new Database();

        $cols = 'data_hora_envio, lote, id_transacao, chave_contas_aberto, status, id_status';

        $result = $database->doInsert('transacoes', $cols, $values);

        $result2 = $database->doUpdate('contas_aberto', "Saldo = '" . ($saldo - $valor) . "', Valor_Pago = '" . $valor . "', Data_Pagto = '" . $data_pagto . "'", "Chave = '" . $chave . "'");

        $database->closeConection();
        return $chave;
    }

    public static function updatePlanoConta($Chave, $Codigo, $Nivel, $Indicador, $Descricao, $Conta_Inativa, $grupo)
    {
        $database = new Database();

        $query = "Codigo = '" . $Codigo . "', Nivel = '" . $Nivel . "', Indicador = '" . $Indicador . "', Descricao = '" . $Descricao . "', Conta_Inativa = '" . $Conta_Inativa . "', grupo = '" . $grupo . "'";

        $result = $database->doUpdate('planocontas', $query, 'Chave = ' . $Chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateContaCliente($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $Centro_Custo, $Conta_Desconto, $Historico, $Parc_Ini, $Parc_Fim, $RepCodBar, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento)
    {
        $database = new Database();

        $query = "Lancto = '" . $Lancto . "', Tipo = '" . $Tipo . "', Pessoa = '" . $Pessoa . "', Conta_Contabil = '" . $Conta_Contabil . "', Centro_Custo = '" . $Centro_Custo . "', Conta_Desconto = '" . $Conta_Desconto . "', Historico = '" . $Historico . "', Parc_Ini = '" . $Parc_Ini . "', Parc_Fim = '" . $Parc_Fim . "', RepCodBar = '" . $RepCodBar . "', Valor = '" . $Valor . "', Saldo = '" . $Saldo . "', Vencimento = '" . $Vencimento . "', Vencimento_Original =  '" . $Vencimento_Original . "', Conta_Provisao = '" . $Conta_Provisao . "', Empresa = '" . $Empresa . "', Docto = '" . $Docto . "', tipodocto = '" . $tipodocto . "', meio_pagamento = '" . $meioPagamento . "'";

        $result = $database->doUpdate('contas_aberto', $query, 'Chave = ' . $Chave);

        if ($meioPagamentoNome == "DARF" || $meioPagamento == "GPS" || $meioPagamento == "GRU") {
            $chave_complementar = $database->doSelect('contas_aberto_complementar', 'contas_aberto_complementar.*', "chave_contas_aberto = '" . $Chave . "'");

            if ($chave_complementar) {
                $query = "codigo_receita = '" . $codigo_receita . "', contribuinte = '" . $contribuinte . "', codigo_identificador_tributo = '" . $codigo_identificador_tributo . "', mes_compet_num_ref = '" . $mes_compet_num_ref . "', data_apuracao = '" . $data_apuracao . "', valor = '" . $darfValor . "', valor_multa = '" . $darfMulta . "', valor_juros = '" . $darfJuros . "', valor_outros = '" . $darfOutros . "', valor_pagamento = '" . $darfPagamento . "'";

                if ($meioPagamento == 'GRU') {
                    $query = "contribuinte = '" . $contribuinte . "'";
                }

                $result = $database->doUpdate('contas_aberto_complementar', $query, 'chave = ' . $chave_complementar[0]['chave']);
            } else {
                $values2 = "'" . $codigo_receita . "', '" . $contribuinte . "', '" . $codigo_identificador_tributo . "', '" . $mes_compet_num_ref . "', '" . $data_apuracao . "', '" . $darfValor . "', '" . $darfMulta . "', '" . $darfJuros . "', '" . $darfOutros . "', '" . $darfPagamento . "', '" . $Chave . "'";
                $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";

                if ($meioPagamento == 'GRU') {
                    $values2 = "'" . $contribuinte . "'";
                    $cols = "contribuinte";
                }

                $result = $database->doInsert('contas_aberto_complementar', $cols, $values2);
            }
        }


        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateContaFornecedor($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $RepCodBar, $Centro_Custo, $Historico, $Conta_Desconto, $Parc_Ini, $Parc_Fim, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento)
    {
        $database = new Database();

        $query = "Lancto = '" . $Lancto . "', Tipo = '" . $Tipo . "', Pessoa = '" . $Pessoa . "', Conta_Contabil = '" . $Conta_Contabil . "', RepCodBar = '" . $RepCodBar . "', Centro_Custo = '" . $Centro_Custo . "', Historico = '" . $Historico . "', Conta_Desconto = '" . $Conta_Desconto . "', Parc_Ini = '" . $Parc_Ini . "', Parc_Fim = '" . $Parc_Fim . "', Valor = '" . $Valor . "', Saldo = '" . $Saldo . "', Vencimento = '" . $Vencimento . "', Vencimento_Original =  '" . $Vencimento_Original . "', Conta_Provisao = '" . $Conta_Provisao . "', Empresa = '" . $Empresa . "', Docto = '" . $Docto . "', tipodocto = '" . $tipodocto . "', meio_pagamento = '" . $meioPagamento . "'";

        $result = $database->doUpdate('contas_aberto', $query, 'Chave = ' . $Chave);


        if ($meioPagamentoNome == "DARF" || $meioPagamento == "GPS" || $meioPagamento == "GRU") {
            $chave_complementar = $database->doSelect('contas_aberto_complementar', 'contas_aberto_complementar.*', "chave_contas_aberto = '" . $Chave . "'");

            if ($chave_complementar) {
                $query = "codigo_receita = '" . $codigo_receita . "', contribuinte = '" . $contribuinte . "', codigo_identificador_tributo = '" . $codigo_identificador_tributo . "', mes_compet_num_ref = '" . $mes_compet_num_ref . "', data_apuracao = '" . $data_apuracao . "', valor = '" . $darfValor . "', valor_multa = '" . $darfMulta . "', valor_juros = '" . $darfJuros . "', valor_outros = '" . $darfOutros . "', valor_pagamento = '" . $darfPagamento . "'";

                if ($meioPagamento == 'GRU') {
                    $query = "contribuinte = '" . $contribuinte . "'";
                }
                $result = $database->doUpdate('contas_aberto_complementar', $query, 'chave = ' . $chave_complementar[0]['chave']);
            } else {
                $values2 = "'" . $codigo_receita . "', '" . $contribuinte . "', '" . $codigo_identificador_tributo . "', '" . $mes_compet_num_ref . "', '" . $data_apuracao . "', '" . $darfValor . "', '" . $darfMulta . "', '" . $darfJuros . "', '" . $darfOutros . "', '" . $darfPagamento . "', '" . $Chave . "'";
                $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";

                if ($meioPagamento == 'GRU') {
                    $values2 = "'" . $contribuinte . "'";
                    $cols = "contribuinte";
                }
                $result = $database->doInsert('contas_aberto_complementar', $cols, $values2);
            }
        }


        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function pagarConta($chave, $status, $transacao, $valor, $saldo, $data_pagto, $id_status)
    {
        $database = new Database();

        if ($id_status == 3) {
            $query = "saldo = '" . ($saldo - $valor) . "', valor_pago = '" . $valor . "', data_pagto = '" . $data_pagto . "'";
            $result = $database->doUpdate('contas_aberto', $query, 'Chave = ' . $chave);
        }


        $query = "status = '" . $status . "', id_status = '" . $id_status . "'";

        $result = $database->doUpdate('transacoes', $query, 'id_transacao = ' . $transacao . "");

        $result = $database->doSelect('transacoes', 'transacoes.*', "id_transacao = '" . $transacao . "'");

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTransacao($chave, $id_transacao, $lote, $status)
    {
        $database = new Database();

        $query = "id_transacao = '" . $id_transacao . "', lote = '" . $lote . "', status = '" . $status . "'";

        $result = $database->doUpdate('transacoes', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTransacaoLiberada($chave, $operador)
    {
        $database = new Database();

        $query = "id_status = 3, liberado = 1, operador_liberacao = $operador";

        $result = $database->doUpdate('transacoes', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateFatura($Chave, $Fatura, $Emissao, $Vencto, $Praca_Pagto, $Cliente, $Valor, $Obs, $Cobranca, $discriminacaoservico)
    {
        $database = new Database();

        $query = "Fatura = '" . $Fatura . "', Emissao = '" . $Emissao . "', Vencto = '" . $Vencto . "', Praca_Pagto = '" . $Praca_Pagto . "', Cliente = '" . $Cliente . "', Valor = '" . $Valor . "', Obs = '" . $Obs . "', Cobranca = '" . $Cobranca . "', discriminacaoservico = '" . $discriminacaoservico . "'";

        $result = $database->doUpdate('faturas', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateFaturaNotaEnviada($Chave, $protocolonfe, $chavenfe, $serie)
    {
        $database = new Database();

        $query = "protocolonfe = '" . $protocolonfe . "', chavenfe = '" . $chavenfe . "', serie = '" . $serie . "'";

        $result = $database->doUpdate('faturas', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deleteConta($chave)
    {
        $database = new Database();

        $result = $database->doDelete('contas_aberto', 'Chave = ' . $chave);
        $result = $database->doDelete('contas_aberto_complementar', 'chave_contas_aberto = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deletePlanoConta($chave)
    {
        $database = new Database();

        $result = $database->doDelete('planocontas', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteFatura($chave, $data)
    {
        $database = new Database();

        $result = $database->doUpdate('faturas', "Cancelada = 1, Data_Cancelamento = '" . $data . "'", 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function gerarRelatorioContas($where, $groupBy, $tipo_sub)
    {
        $database = new Database();

        if ($where != "") {
            $result = $database->doSelect(
                'contas_aberto 
            LEFT JOIN pessoas ON pessoas.chave = contas_aberto.pessoa
            LEFT JOIN os_tp_docto ON os_tp_docto.chave = contas_aberto.tipodocto',
                "GROUP_CONCAT(contas_aberto.Docto SEPARATOR '@.@') AS documento, 
                                          GROUP_CONCAT(pessoas.nome SEPARATOR '@.@') AS pessoa, 
                                          GROUP_CONCAT(contas_aberto.vencimento SEPARATOR '@.@') AS vencimento,
                                          GROUP_CONCAT(contas_aberto.chave SEPARATOR '@.@') AS conta_chave,
                                          GROUP_CONCAT(contas_aberto.data_pagto SEPARATOR '@.@') AS dataPagamento,
                                          GROUP_CONCAT(contas_aberto.historico SEPARATOR '@.@') AS historico,
                                          GROUP_CONCAT(os_tp_docto.descricao SEPARATOR '@.@') AS tipoDocumento,
                                          GROUP_CONCAT(contas_aberto.lancto SEPARATOR '@.@') AS lancamento,
                                          GROUP_CONCAT(contas_aberto.saldo SEPARATOR '@.@') AS saldo,
                                          GROUP_CONCAT(contas_aberto.valor SEPARATOR '@.@') AS valor,
                                          GROUP_CONCAT((SELECT codigo FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os,
                                          GROUP_CONCAT((SELECT data_saida FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS sailed,
                                          GROUP_CONCAT((SELECT ROE FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS ROE,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '$tipo_sub' ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS FDA,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '3'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS discount,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '2'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS recieved,
                                          GROUP_CONCAT((SELECT os_servicos_itens.Moeda FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os_moeda,
                                          GROUP_CONCAT((SELECT os_navios.nome FROM os LEFT JOIN os_navios ON os.chave_navio = os_navios.chave WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio,
                                          GROUP_CONCAT((SELECT os_portos.Descricao FROM os LEFT JOIN os_portos ON os.porto = os_portos.chave WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto",
                $where . " " . $groupBy
            );
            $database->closeConection();
        } else {
            $result = $database->doSelect(
                'contas_aberto 
            LEFT JOIN pessoas ON pessoas.chave = contas_aberto.pessoa
            LEFT JOIN os_tp_docto ON os_tp_docto.chave = contas_aberto.tipodocto',
                "GROUP_CONCAT(contas_aberto.Docto SEPARATOR '@.@') AS documento, 
                        GROUP_CONCAT(pessoas.nome SEPARATOR '@.@') AS pessoa, 
                        GROUP_CONCAT(contas_aberto.chave SEPARATOR '@.@') AS conta_chave,
                        GROUP_CONCAT(contas_aberto.vencimento SEPARATOR '@.@') AS vencimento,
                        GROUP_CONCAT(contas_aberto.data_pagto SEPARATOR '@.@') AS dataPagamento,
                        GROUP_CONCAT(contas_aberto.historico SEPARATOR '@.@') AS historico,
                        GROUP_CONCAT(os_tp_docto.descricao SEPARATOR '@.@') AS tipoDocumento,
                        GROUP_CONCAT(contas_aberto.lancto SEPARATOR '@.@') AS lancamento,
                        GROUP_CONCAT(contas_aberto.saldo SEPARATOR '@.@') AS saldo,
                        GROUP_CONCAT(contas_aberto.valor SEPARATOR '@.@') AS valor,
                        GROUP_CONCAT((SELECT codigo FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os,
                        GROUP_CONCAT((SELECT data_saida FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS sailed,
                        GROUP_CONCAT((SELECT ROE FROM os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS ROE,
                        GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '$tipo_sub' ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS FDA,
                        GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '3'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS discount,
                        GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor1) FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '2'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS recieved,
                        GROUP_CONCAT((SELECT os_servicos_itens.Moeda FROM os LEFT JOIN os_servicos_itens ON os.chave = os_servicos_itens.chave_os WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os_moeda,
                        GROUP_CONCAT((SELECT os_navios.nome FROM os LEFT JOIN os_navios ON os.chave_navio = os_navios.chave WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio,
                        GROUP_CONCAT((SELECT os_portos.Descricao FROM os LEFT JOIN os_portos ON os.porto = os_portos.chave WHERE os.centro_custo = contas_aberto.centro_custo ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto",
                "1=1 " . $groupBy
            );
        }
        return $result;
    }
}
