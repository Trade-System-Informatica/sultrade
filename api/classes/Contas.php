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

    public static function getContasAbertoOptions($empresa)
    {
        $database = new Database();

        if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Saldo > 0 GROUP BY contas_aberto.chave"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
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
                'contas_aberto LEFT JOIN os ON os.chave = contas_aberto.os_origem',
                'contas_aberto.*, os.codigo AS osCodigo',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 0"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto LEFT JOIN os ON os.chave = contas_aberto.os_origem',
                'contas_aberto.*, os.codigo AS osCodigo',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 0 AND contas_aberto.empresa = '" . $empresa . "'"
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
                'contas_aberto LEFT JOIN contas_aberto_cc ON contas_aberto_cc.chave_conta_aberto = contas_aberto.chave',
                'contas_aberto.*,
                SUM(contas_aberto_cc.valor) as valorDescontos',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 1 GROUP BY contas_aberto.chave"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto LEFT JOIN contas_aberto_cc ON contas_aberto_cc.chave_conta_aberto = contas_aberto.chave',
                'contas_aberto.*,
                SUM(contas_aberto_cc.valor) as valorDescontos',
                "contas_aberto.Saldo > 0 AND contas_aberto.Tipo = 1 AND empresa = '" . $empresa . "' GROUP BY contas_aberto.chave"
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
                "contas_aberto.Saldo = 0 AND contas_aberto.Tipo = 1 AND empresa = '" . $empresa . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContasCorrentes($empresa)
    {
        $database = new Database();

        /*if ($empresa == 0) {
            $result = $database->doSelect(
                'contas_correntes',
                'contas_correntes.*'
            );
        } else {
            $result = $database->doSelect(
                'contas_correntes',
                'contas_correntes.*',
                "empresa = '" . $empresa . "'"
            );
        }*/
        $result = [];
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

        $grupo = $database->doSelect(
            'custeios_subagentes',
            'custeios_subagentes.chave',
            "evento = $Docto_Origem"
        );

        if (!$grupo[0]) {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.Docto_Origem = '"
                    . $Docto_Origem . "'"
            );
        } else {
            $result = $database->doSelect(
                'contas_aberto',
                'contas_aberto.*',
                "contas_aberto.grupo_origem = '" . $grupo["chave"] . "'"
            );
        }
        $database->closeConection();
        return $result;
    }

    public static function getContaOS($chave_os)
    {
        $database = new Database();

        $result = $database->doSelect(
            'contas_aberto',
            'contas_aberto.*',
            "os_origem = $chave_os"
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

    public static function getLancamentos()
    {
        $database = new Database();


        $result = $database->doSelect(
            'lancamentos LEFT JOIN pessoas ON lancamentos.pessoa = pessoas.chave LEFT JOIN planocontas ContaDebito ON lancamentos.ContaDebito = ContaDebito.chave LEFT JOIN planocontas ContaCredito ON lancamentos.ContaCredito = ContaCredito.chave',
            'lancamentos.*, pessoas.nome AS pessoaNome, ContaDebito.Descricao AS conta_Debito, ContaCredito.Descricao AS conta_Credito',
            '1=1 ORDER BY Chave DESC LIMIT 200'
        );
        $database->closeConection();

        return $result;
    }

    public static function getLancamentosPorLote($lote)
    {
        $database = new Database();


        $result = $database->doSelect(
            'lancamentos LEFT JOIN pessoas ON lancamentos.pessoa = pessoas.chave',
            'lancamentos.*, pessoas.nome AS pessoaNome',
            "lote = '$lote' ORDER BY Chave DESC LIMIT 200"
        );
        $database->closeConection();

        return $result;
    }


    public static function getLancamentosLotes()
    {
        $database = new Database();


        $result = $database->doSelect(
            'lancamentos LEFT JOIN pessoas ON lancamentos.pessoa = pessoas.chave',
            'lancamentos.*, pessoas.nome AS pessoaNome',
            '1=1 GROUP BY lote LIMIT 200'
        );
        $database->closeConection();

        return $result;
    }

    public static function getLancamentoConta($chavePr)
    {
        $database = new Database();


        $result = $database->doSelect(
            'lancamentos LEFT JOIN pessoas ON lancamentos.pessoa = pessoas.chave',
            'lancamentos.*, pessoas.nome AS pessoaNome',
            "lancamentos.ChavePr = '$chavePr' ORDER BY Chave DESC LIMIT 200"
        );
        $database->closeConection();

        return $result;
    }

    public static function getContasDescontos($chave_conta_aberto)
    {
        $database = new Database();

        $result = $database->doSelect(
            "contas_aberto_cc",
            "contas_aberto_cc.*",
            "chave_conta_aberto = '$chave_conta_aberto'"
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

    public static function insertContaCliente($values, $meioPagamento, $valuesDarf, $dadosManuais = null)
    {
        $database = new Database();

        $cols = 'Lancto, Tipo, Pessoa, Conta_Contabil, Centro_Custo, Conta_Desconto, Historico, Parc_Ini, Parc_Fim, RepCodBar, Valor, Vencimento, Vencimento_Original, Conta_Provisao, Saldo, Operador, Empresa, Docto, tipodocto, meio_pagamento, envio';

        if ($dadosManuais) {
            $values = $values . ", " . $dadosManuais;
            $cols .= ", os_manual, navio_manual, porto_manual, roe_manual, discount_manual, received_manual, sailed_manual";
        }

        $result = $database->doInsert('contas_aberto', $cols, $values);
        $conta = $result[0];

        if ($result && ($meioPagamento == 'DARF' || $meioPagamento == 'GPS' || $meioPagamento == 'GRU' || $meioPagamento == "PIX")) {
            $chave = $conta;

            $values2 = $valuesDarf . ", '" . $chave[0]['Chave'] . "'";
            $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";
            if ($meioPagamento == 'GRU') {
                $cols = "contribuinte, chave_contas_aberto";
            } else if ($meioPagamento == 'PIX') {
                $cols = "tipo_pix, chave_contas_aberto";
            }

            $result2 = $database->doInsert('contas_aberto_complementar', $cols, $values2);
        }

        if ($conta["os_manual"]) {
            $saldoNovo = $conta["Saldo"];
            if ($conta["received_manual"]) {
                $saldoNovo -= $conta['received_manual'];
            }
            if ($conta["discount_manual"]) {
                $saldoNovo -= $conta['discount_manual'];
            }

            if ($conta["received_manual"] || $conta["discount_manual"]) {
                $database->doUpdate('contas_aberto', "Saldo = '$saldoNovo'", "Chave = " . $conta["Chave"]);
            }
        }

        $database->closeConection();
        return $result;
    }

    public static function insertContaFornecedor($values, $meioPagamento, $valuesDarf, $valuesRet = null, $dadosManuais = null)
    {
        $database = new Database();

        $cols = 'Lancto, Tipo, Pessoa, Conta_Contabil, RepCodBar, Centro_Custo, Historico, Conta_Desconto, Parc_Ini, Parc_Fim, Valor, Vencimento, Vencimento_Original, Conta_Provisao, Saldo, Operador, Empresa, Docto, tipodocto, meio_pagamento, docto_origem, envio';

        if ($dadosManuais) {
            $values = $values . ", " . $dadosManuais;
            $cols .= ", os_manual, navio_manual, porto_manual, roe_manual, discount_manual, received_manual, sailed_manual";
        }

        $result = $database->doInsert('contas_aberto', $cols, $values);
        $conta = $result[0];

        if ($result && ($meioPagamento == 'DARF' || $meioPagamento == 'GPS' || $meioPagamento == 'GRU' || $meioPagamento == "PIX")) {
            $chave = $conta;

            $values2 = $valuesDarf . ", '" . $chave[0]['Chave'] . "'";
            $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";
            if ($meioPagamento == 'GRU') {
                $cols = "contribuinte, chave_contas_aberto";
            } else if ($meioPagamento == 'PIX') {
                $cols = "tipo_pix, chave_contas_aberto";
            }

            $database->doInsert('contas_aberto_complementar', $cols, $values2);
        }

        if ($result && $valuesRet) {
            $chave = $database->doSelect('contas_aberto', 'contas_aberto.*', '1=1 ORDER BY chave DESC');

            foreach ($valuesRet as $ret) {
                $values3 = $chave[0]['Chave'] . ", $ret";
                $cols = "chave_conta_aberto, chave_conta, valor, complemento, tipo";

                $database->doInsert('contas_aberto_cc', $cols, $values3);
            }
        }

        if ($conta["os_manual"]) {
            $saldoNovo = $conta["Saldo"];
            if ($conta["received_manual"]) {
                $saldoNovo -= $conta['received_manual'];
            }
            if ($conta["discount_manual"]) {
                $saldoNovo -= $conta['discount_manual'];
            }

            if ($conta["received_manual"] || $conta["discount_manual"]) {
                $database->doUpdate('contas_aberto', "Saldo = '$saldoNovo'", "Chave = " . $conta["Chave"]);
            }
        }

        $database->closeConection();
        return $result;
    }

    public static function insertContaOS($values, $valuesRet, $os)
    {
        $database = new Database();
        if ($os) {
            $database->doDelete('contas_aberto', "os_origem = $os");
        }

        $cols = 'os_origem, Lancto, Tipo, Pessoa, Conta_Contabil, RepCodBar, Centro_Custo, Historico, Conta_Desconto, Parc_Ini, Parc_Fim, Valor, Saldo, Vencimento, Vencimento_Original, Conta_Provisao, Operador, Empresa, Docto, tipodocto, meio_pagamento, docto_origem';

        $result = $database->doInsert('contas_aberto', $cols, $values);

        if ($result && $valuesRet) {
            $values2 = $result[0]['Chave'] . ", $valuesRet";
            $cols = "chave_conta_aberto, chave_conta, valor, complemento, tipo";

            $database->doInsert('contas_aberto_cc', $cols, $values2);
        }

        $database->closeConection();
        return $result;
    }

    public static function insertContaDescontos($chave_conta_aberto, $chave_conta, $complemento, $valor, $tipo)
    {
        $database = new Database();

        $contaDesconto = $database->doSelect('contas_aberto_cc', 'contas_aberto_cc.*', "chave_conta_aberto = '$chave_conta_aberto' AND tipo = '$tipo'");

        $result = true;
        if ($contaDesconto[0]) {
            if (!$chave_conta && !$complemento && !$valor) {
                $result = $database->doDelete('contas_aberto_cc', "chave = '" . $contaDesconto[0]["chave"] . "'");
            } else {
                $query = "chave_conta = '$chave_conta', complemento = '$complemento', valor = '$valor'";
                $result = $database->doUpdate('contas_aberto_cc', $query, "chave = '" . $contaDesconto[0]["chave"] . "'");
            }
        } else {
            $values = "'$chave_conta_aberto', '$chave_conta', '$complemento', '$valor', '$tipo'";
            $cols = "chave_conta_aberto, chave_conta, complemento, valor, tipo";
            $result = $database->doInsert('contas_aberto_cc', $cols, $values);
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

        $cols = 'Emissao, Vencto, Praca_Pagto, Cliente, Valor, Obs, Formulario, Cobranca, discriminacaoservico, empresa, atividade';

        $result = $database->doInsert('faturas', $cols, $values);

        $database->doUpdate('formularios', "Proximo_Numero = Proximo_Numero + 1", "chave = '" . $formulario . "'");

        $database->closeConection();
        return $result;
    }

    public static function insertLancamento($values, $lote_inicial)
    {
        $database = new Database();

        if ($lote_inicial) {
            $lote = $lote_inicial;
        } else {
            $lote = $database->doSelect('codigos', 'codigos.Proximo', "Tipo = 'LT'");
            $database->doUpdate('codigos', 'Proximo = ' . ($lote[0]["Proximo"] + 1), "Tipo = 'LT'");
            $lote = $lote[0]["Proximo"];
        }

        $values .= ", '" . $lote . "'";
        $cols = 'Data, ContaDebito, ContaCredito, TipoDocto, CentroControle, Historico_Padrao, Historico, Pessoa, Valor, ChavePr, Usuario_Inclusao, Usuario_Alteracao, Data_Inclusao, Data_Alteracao, Conciliado, atualizado, Lote';

        $result = $database->doInsert('lancamentos', $cols, $values);


        $database->closeConection();
        return $result;
    }

    public static function insertLotesLancamentos($repasse, $tipoEvento, $tipo, $values, $historico, $chave_evento, $chave_taxa, $contaDebito)
    {
        $database = new Database();

        $contaCredito = 0;
        $lote = $database->doSelect('codigos', 'codigos.Proximo', "Tipo = 'LT'");
        $database->doUpdate('codigos', 'Proximo = ' . ($lote[0]["Proximo"] + 1), "Tipo = 'LT'");
        $lote = $lote[0]["Proximo"];

        $evento = $database->doSelect('os_servicos_itens', 'os_servicos_itens.*', "os_servicos_itens.chave = '$chave_evento'");
        $evento = $evento[0];

        $result = [];

        $valor = $evento["valor1"];

        $cols = "Data, TipoDocto, CentroControle, Historico_Padrao, Pessoa, ChavePr, Usuario_Inclusao, Usuario_Alteracao, Data_Inclusao, Data_Alteracao, Historico, Lote, ContaDebito, ContaCredito, Valor, Deletado, tipo, atualizado";


        if ($evento["desconto_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["desconto_cpl"] . "', '$lote', '0', '" . $evento["desconto_conta"] . "', '" . $evento['desconto_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["desconto_valor"];
        }
        if ($evento["retencao_inss_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_inss_cpl"] . "', '$lote', '0', '" . $evento["retencao_inss_conta"] . "', '" . $evento['retencao_inss_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_inss_valor"];
        }
        if ($evento["retencao_ir_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_ir_cpl"] . "', '$lote', '0', '" . $evento["retencao_ir_conta"] . "', '" . $evento['retencao_ir_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_ir_valor"];
        }
        if ($evento["retencao_iss_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_iss_cpl"] . "', '$lote', '0', '" . $evento["retencao_iss_conta"] . "', '" . $evento['retencao_iss_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_iss_valor"];
        }
        if ($evento["retencao_pis_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_pis_cpl"] . "', '$lote', '0', '" . $evento["retencao_pis_conta"] . "', '" . $evento['retencao_pis_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_pis_valor"];
        }
        if ($evento["retencao_cofins_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_cofins_cpl"] . "', '$lote', '0', '" . $evento["retencao_cofins_conta"] . "', '" . $evento['retencao_cofins_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_cofins_valor"];
        }
        if ($evento["retencao_csll_valor"] != 0) {
            $valuesNew = $values . ", '" . $evento["retencao_csll_cpl"] . "', '$lote', '0', '" . $evento["retencao_csll_conta"] . "', '" . $evento['retencao_csll_valor'] . "', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
            $valor -= $evento["retencao_csll_valor"];
        }

        if ($repasse == false) {
            $fornecedor = $database->doSelect("pessoas", "pessoas.*", "pessoas.chave = '" . $evento["fornecedor"] . "'");

            $contaCredito = $fornecedor[0]["Conta_Provisao"];
        } else if ($repasse == true) {
            $fornecedor = $database->doSelect("pessoas", "pessoas.*", "pessoas.chave = '" . $evento["fornecedor"] . "'");

            $contaCredito = $fornecedor[0]["Conta_Provisao"];
        }
        /*
        if ($tipoEvento == 2) {
            $taxa = $database->doSelect("os_taxas", "os_taxas.*", "os_taxas.chave = $chave_taxa");
            $taxa = $taxa[0];

            $contaCredito = $taxa["Conta_Contabil"];
        }*/

        if (count($result) == 0) {
            $valuesNew = $values . ", '$historico', '$lote', '$contaDebito', '$contaCredito', '" . $evento["valor1"] . "', 0, 0, 0";
        } else {
            $valuesNew = $values . ", '$historico', '$lote', '0', '$contaCredito', '$valor', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);

            $valuesNew = $values . ", '$historico', '$lote', '$contaDebito', '0', '" . $evento["valor1"] . "', 0, 0, 0";
        }

        $result[count($result)] = $database->doInsert('lancamentos', $cols, $valuesNew);
        $database->doUpdate('codigos', 'Proximo = ' . ($lote[0]["Proximo"] + 1), "Tipo = 'LT'");

        return $result;
    }

    public static function contabilizaContasAberto($chave_conta, $data, $conta_credito, $conta_debito, $tipo_documento, $centro_custo, $historico_padrao, $historico, $pessoa, $valor, $chavePr, $usuario_inclusao, $usuario_alteracao, $data_inclusao, $data_alteracao, $extras)
    {
        $database = new Database();

        $lote = $database->doSelect('codigos', 'codigos.Proximo', "Tipo = 'LT'");
        $lote = $lote[0]["Proximo"];

        $result = [];

        $valorTotal = $valor;

        $cols = "Data, TipoDocto, CentroControle, Historico_Padrao, Pessoa, ChavePr, Usuario_Inclusao, Usuario_Alteracao, Data_Inclusao, Data_Alteracao, Historico, Lote, ContaDebito, ContaCredito, Valor, Deletado, tipo, atualizado";
        $baseValues = "'$data', '$tipo_documento', '$centro_custo', '$historico_padrao', '$pessoa', '$chavePr', '$usuario_inclusao', '$usuario_alteracao', '$data_inclusao', '$data_alteracao'";

        foreach ($extras as $item) {
            if ($item->{"check"}) {
                $values = $baseValues . ", '" . $item->{"complemento"} . "', '$lote', 0, '" . $item->{"conta"} . "', '" . $item->{"valor"} . "', 0, 0, 0";
                $result[count($result)] = $database->doInsert('lancamentos', $cols, $values);
                $valorTotal -= $item->{"valor"};
            }
        }

        if (count($result) == 0) {
            $values = $baseValues . ", '$historico', '$lote', '$conta_debito', '$conta_credito', '$valorTotal', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $values);
        } else {
            $values = $baseValues . ", '$historico', '$lote', '0', '$conta_credito', '$valorTotal', 0, 0, 0";
            $result[count($result)] = $database->doInsert('lancamentos', $cols, $values);

            if ($conta_debito) {
                $values = $baseValues . ", '$historico', '$lote', '$conta_debito', '0', '$valor', 0, 0, 0";
                $result[count($result)] = $database->doInsert('lancamentos', $cols, $values);
            }
        }

        $database->doUpdate('codigos', 'Proximo = ' . ($lote[0]["Proximo"] + 1), "Tipo = 'LT'");

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

    public static function updateContaCliente($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $Centro_Custo, $Conta_Desconto, $Historico, $Parc_Ini, $Parc_Fim, $RepCodBar, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento, $tipo_pix, $envio, $os_manual = null, $navio_manual = null, $porto_manual = null, $roe_manual = null, $discount_manual = null, $received_manual = null, $sailed_manual = null)
    {
        $database = new Database();

        if ($Saldo != 0) {
            $Saldo = $Valor;
            if ($received_manual) {
                $Saldo = $Saldo - $received_manual;
            }
            if ($discount_manual) {
                $Saldo = $Saldo - $discount_manual;
            }
        }

        $query = "Lancto = '" . $Lancto . "', Tipo = '" . $Tipo . "', Pessoa = '" . $Pessoa . "', Conta_Contabil = '" . $Conta_Contabil . "', Centro_Custo = '" . $Centro_Custo . "', Conta_Desconto = '" . $Conta_Desconto . "', Historico = '" . $Historico . "', Parc_Ini = '" . $Parc_Ini . "', Parc_Fim = '" . $Parc_Fim . "', RepCodBar = '" . $RepCodBar . "', Valor = '" . $Valor . "', Saldo = '" . $Saldo . "', Vencimento = '" . $Vencimento . "', Vencimento_Original =  '" . $Vencimento_Original . "', Conta_Provisao = '" . $Conta_Provisao . "', Empresa = '" . $Empresa . "', Docto = '" . $Docto . "', tipodocto = '" . $tipodocto . "', meio_pagamento = '" . $meioPagamento . "', envio = '" . $envio . "'";

        if ($os_manual) {
            $query = $query . ", os_manual = '$os_manual'";
        }
        if ($navio_manual) {
            $query = $query . ", navio_manual = '$navio_manual'";
        }
        if ($porto_manual) {
            $query = $query . ", porto_manual = '$porto_manual'";
        }
        if ($roe_manual) {
            $query = $query . ", roe_manual = '$roe_manual'";
        }
        if ($discount_manual) {
            $query = $query . ", discount_manual = '$discount_manual'";
        }
        if ($received_manual) {
            $query = $query . ", received_manual = '$received_manual'";
        }
        if ($sailed_manual) {
            $query = $query . ", sailed_manual = '$sailed_manual'";
        }

        $result = $database->doUpdate('contas_aberto', $query, 'Chave = ' . $Chave);

        if ($meioPagamentoNome == "DARF" || $meioPagamentoNome == "GPS" || $meioPagamentoNome == "GRU" || $meioPagamentoNome == "PIX") {
            $chave_complementar = $database->doSelect('contas_aberto_complementar', 'contas_aberto_complementar.*', "chave_contas_aberto = '" . $Chave . "'");

            if ($chave_complementar) {
                $query = "codigo_receita = '" . $codigo_receita . "', contribuinte = '" . $contribuinte . "', codigo_identificador_tributo = '" . $codigo_identificador_tributo . "', mes_compet_num_ref = '" . $mes_compet_num_ref . "', data_apuracao = '" . $data_apuracao . "', valor = '" . $darfValor . "', valor_multa = '" . $darfMulta . "', valor_juros = '" . $darfJuros . "', valor_outros = '" . $darfOutros . "', valor_pagamento = '" . $darfPagamento . "'";

                if ($meioPagamentoNome == 'GRU') {
                    $query = "contribuinte = '" . $contribuinte . "'";
                } else if ($meioPagamentoNome == "PIX") {
                    $query = "tipo_pix = '$tipo_pix'";
                }

                $database->doUpdate('contas_aberto_complementar', $query, 'chave = ' . $chave_complementar[0]['chave']);
            } else {
                $values2 = "'" . $codigo_receita . "', '" . $contribuinte . "', '" . $codigo_identificador_tributo . "', '" . $mes_compet_num_ref . "', '" . $data_apuracao . "', '" . $darfValor . "', '" . $darfMulta . "', '" . $darfJuros . "', '" . $darfOutros . "', '" . $darfPagamento . "', '" . $Chave . "'";
                $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";

                if ($meioPagamentoNome == 'GRU') {
                    $values2 = "'" . $contribuinte . "', '$Chave'";
                    $cols = "contribuinte, chave_contas_aberto";
                } else if ($meioPagamentoNome == "PIX") {
                    $values2 = "'$tipo_pix', '$Chave'";
                    $cols = "tipo_pix, chave_contas_aberto";
                }

                $database->doInsert('contas_aberto_complementar', $cols, $values2);
            }
        }


        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateContaFornecedor($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $RepCodBar, $Centro_Custo, $Historico, $Conta_Desconto, $Parc_Ini, $Parc_Fim, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento, $tipo_pix, $envio, $os_manual = null, $navio_manual = null, $porto_manual = null, $roe_manual = null, $discount_manual = null, $received_manual = null, $sailed_manual = null)
    {
        $database = new Database();

        if ($Saldo != 0) {
            $Saldo = $Valor;
            if ($received_manual) {
                $Saldo = $Saldo - $received_manual;
            }
            if ($discount_manual) {
                $Saldo = $Saldo - $discount_manual;
            }
        }

        $query = "Lancto = '" . $Lancto . "', Tipo = '" . $Tipo . "', Pessoa = '" . $Pessoa . "', Conta_Contabil = '" . $Conta_Contabil . "', RepCodBar = '" . $RepCodBar . "', Centro_Custo = '" . $Centro_Custo . "', Historico = '" . $Historico . "', Conta_Desconto = '" . $Conta_Desconto . "', Parc_Ini = '" . $Parc_Ini . "', Parc_Fim = '" . $Parc_Fim . "', Valor = '" . $Valor . "', Saldo = '" . $Saldo . "', Vencimento = '" . $Vencimento . "', Vencimento_Original =  '" . $Vencimento_Original . "', Conta_Provisao = '" . $Conta_Provisao . "', Empresa = '" . $Empresa . "', Docto = '" . $Docto . "', tipodocto = '" . $tipodocto . "', meio_pagamento = '" . $meioPagamento . "', envio = '" . $envio . "'";

        if ($os_manual) {
            $query = $query . ", os_manual = '$os_manual'";
        }
        if ($navio_manual) {
            $query = $query . ", navio_manual = '$navio_manual'";
        }
        if ($porto_manual) {
            $query = $query . ", porto_manual = '$porto_manual'";
        }
        if ($roe_manual) {
            $query = $query . ", roe_manual = '$roe_manual'";
        }
        if ($discount_manual) {
            $query = $query . ", discount_manual = '$discount_manual'";
        }
        if ($received_manual) {
            $query = $query . ", received_manual = '$received_manual'";
        }
        if ($sailed_manual) {
            $query = $query . ", sailed_manual = '$sailed_manual'";
        }

        $result = $database->doUpdate('contas_aberto', $query, 'Chave = ' . $Chave);


        if ($meioPagamentoNome == "DARF" || $meioPagamentoNome == "GPS" || $meioPagamentoNome == "GRU" || $meioPagamentoNome == "PIX") {
            $chave_complementar = $database->doSelect('contas_aberto_complementar', 'contas_aberto_complementar.*', "chave_contas_aberto = '" . $Chave . "'");

            if ($chave_complementar) {
                $query = "codigo_receita = '" . $codigo_receita . "', contribuinte = '" . $contribuinte . "', codigo_identificador_tributo = '" . $codigo_identificador_tributo . "', mes_compet_num_ref = '" . $mes_compet_num_ref . "', data_apuracao = '" . $data_apuracao . "', valor = '" . $darfValor . "', valor_multa = '" . $darfMulta . "', valor_juros = '" . $darfJuros . "', valor_outros = '" . $darfOutros . "', valor_pagamento = '" . $darfPagamento . "'";

                if ($meioPagamentoNome == 'GRU') {
                    $query = "contribuinte = '" . $contribuinte . "'";
                } else if ($meioPagamentoNome == "PIX") {
                    $query = "tipo_pix = '$tipo_pix'";
                }

                $database->doUpdate('contas_aberto_complementar', $query, 'chave = ' . $chave_complementar[0]['chave']);
            } else {
                $values2 = "'" . $codigo_receita . "', '" . $contribuinte . "', '" . $codigo_identificador_tributo . "', '" . $mes_compet_num_ref . "', '" . $data_apuracao . "', '" . $darfValor . "', '" . $darfMulta . "', '" . $darfJuros . "', '" . $darfOutros . "', '" . $darfPagamento . "', '" . $Chave . "'";
                $cols = "codigo_receita, contribuinte, codigo_identificador_tributo, mes_compet_num_ref, data_apuracao, valor, valor_multa, valor_juros, valor_outros, valor_pagamento, chave_contas_aberto";

                if ($meioPagamentoNome == 'GRU') {
                    $values2 = "'" . $contribuinte . "', '$Chave'";
                    $cols = "contribuinte, chave_contas_aberto";
                } else if ($meioPagamentoNome == "PIX") {
                    $values2 = "'$tipo_pix', '$Chave'";
                    $cols = "tipo_pix, chave_contas_aberto";
                }

                $database->doInsert('contas_aberto_complementar', $cols, $values2);
            }
        }


        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateContaOS($chave_conta, $Lancto, $Pessoa, $Centro_Custo, $Valor, $Saldo, $Empresa, $Operador, $valuesRet)
    {
        $database = new Database();

        $query = "Lancto = '" . $Lancto . "', Pessoa = '" . $Pessoa . "', Centro_Custo = '" . $Centro_Custo . "', Valor = '" . $Valor . "', Saldo = '" . $Saldo . "', Operador = '" . $Operador . "', Empresa = '" . $Empresa . "'";
        
        $database->doUpdate('contas_aberto', $query, 'chave = ' . $chave_conta);

        $conta = $database->doSelect('contas_aberto LEFT JOIN contas_aberto_cc ON contas_aberto_cc.chave_conta_aberto = contas_aberto.chave LEFT JOIN os ON contas_aberto.os_origem = os.chave', 'contas_aberto.chave AS chave, os.codigo AS codigo, contas_aberto_cc.chave as chave_cc', 'contas_aberto.chave = ' . $chave_conta . ' AND contas_aberto_cc.tipo = "DESCONTO"');
        $contaBase = $database->doSelect('contas_aberto LEFT JOIN os ON contas_aberto.os_origem = os.chave', 'contas_aberto.chave AS chave, os.codigo AS codigo', "contas_aberto.chave = '" . $chave_conta . "'");

        if ($conta[0] && $conta[0]["chave"]) {
            $database->doUpdate("contas_aberto_cc", "valor = '$valuesRet'", "contas_aberto_cc.chave = " . $conta[0]["chave_cc"]);
        } else {
            $database->doInsert("contas_aberto_cc", "chave_conta_aberto, valor, complemento, tipo", "'" . $contaBase[0]["chave"] . "', '$valuesRet', 'Desconto de " . $contaBase[0]["codigo"] . "', 'DESCONTO'");
        }

        $database->closeConection();
        return $conta[0];
    }

    public static function pagarConta($chave, $status, $transacao, $valor, $saldo, $data_pagto, $id_status)
    {
        $database = new Database();

        if ($id_status == 4) {
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

    public static function fazerBaixaConta($chave, $saldo, $recebimento)
    {
        $database = new Database();

        $query = "saldo = '$saldo', received_manual = '$recebimento'";

        $result = $database->doUpdate('contas_aberto', $query, 'chave = ' . $chave . "");

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

    public static function updateFatura($Chave, $Emissao, $Vencto, $Praca_Pagto, $Cliente, $Valor, $Obs, $Cobranca, $discriminacaoservico, $atividade)
    {
        $database = new Database();

        $query = "Emissao = '" . $Emissao . "', Vencto = '" . $Vencto . "', Praca_Pagto = '" . $Praca_Pagto . "', Cliente = '" . $Cliente . "', Valor = '" . $Valor . "', Obs = '" . $Obs . "', Cobranca = '" . $Cobranca . "', discriminacaoservico = '" . $discriminacaoservico . "', atividade = '$atividade'";

        $result = $database->doUpdate('faturas', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateFaturaNotaEnviada($Chave, $protocolonfe, $chavenfe, $urlqrcode, $serie)
    {
        $database = new Database();

        $query = "fatura = '$chavenfe', protocolonfe = '" . $protocolonfe . "', chavenfe = '" . $chavenfe . "', urlqrcode = '$urlqrcode', serie = '" . $serie . "'";

        $result = $database->doUpdate('faturas', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateLancamento($Chave, $Data, $ContaDebito, $ContaCredito, $TipoDocto, $CentroControle, $Historico_Padrao, $Historico, $Pessoa, $Valor, $ChavePr, $Usuario_Alteracao, $Data_Alteracao, $Conciliado, $atualizado)
    {
        $database = new Database();

        $query = "Data = '$Data', ContaDebito = '$ContaDebito', ContaCredito = '$ContaCredito', TipoDocto = '$TipoDocto', CentroControle = '$CentroControle', Historico_Padrao = '$Historico_Padrao', Historico = '$Historico', Pessoa = '$Pessoa', Valor = '$Valor', ChavePr = '$ChavePr', Usuario_Alteracao = '$Usuario_Alteracao', Data_Alteracao = '$Data_Alteracao', Conciliado = '$Conciliado', atualizado = '$atualizado'";

        $result = $database->doUpdate('lancamentos', $query, 'Chave = ' . $Chave);

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

    public static function checkAndDeleteContaDesconto($chave_conta_aberto, $tipo)
    {
        $database = new Database();

        $contaDesconto = $database->doSelect('contas_aberto_cc', 'contas_aberto_cc.*', "chave_conta_aberto = '$chave_conta_aberto' AND tipo = '$tipo'");

        $result = true;
        if ($contaDesconto[0] && $contaDesconto[0]["chave"]) {
            $result = $database->doDelete('contas_aberto_cc', "chave = '" . $contaDesconto[0]["chave"] . "'");
        }
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

    public static function eraseFatura($chave)
    {
        $database = new Database();

        $result = $database->doDelete('faturas', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteLancamento($chave)
    {
        $database = new Database();

        $result = $database->doUpdate('lancamentos', "Deletado = 1", 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function gerarRelatorioContas($where, $groupBy, $tipo_sub)
    {
        $database = new Database();
        $tipo = 1;
        if ($tipo_sub == 1) {
            $tipo = 0;
        }

        if ($where != "") {
            $result = $database->doSelect(
                'contas_aberto 
            INNER JOIN pessoas ON pessoas.chave = contas_aberto.pessoa
            INNER JOIN os_tp_docto ON os_tp_docto.chave = contas_aberto.tipodocto
            INNER JOIN os ON os.chave = contas_aberto.os_origem',
                "
                                          pessoas.nome  AS pessoa2, 
                                          contas_aberto.chave  AS conta_chave2,
                                          GROUP_CONCAT(contas_aberto.chave SEPARATOR '@.@') AS conta_chave,
                                          GROUP_CONCAT(pessoas.nome SEPARATOR '@.@') AS pessoa, 
                                          GROUP_CONCAT(contas_aberto.Docto SEPARATOR '@.@') AS documento, 
                                          GROUP_CONCAT(contas_aberto.vencimento SEPARATOR '@.@') AS vencimento,
                                          GROUP_CONCAT(contas_aberto.data_pagto SEPARATOR '@.@') AS dataPagamento,
                                          GROUP_CONCAT(contas_aberto.historico SEPARATOR '@.@') AS historico,
                                          GROUP_CONCAT(os_tp_docto.descricao SEPARATOR '@.@') AS tipoDocumento,
                                          GROUP_CONCAT(contas_aberto.lancto SEPARATOR '@.@') AS lancamento,
                                          GROUP_CONCAT(os.envio SEPARATOR '@.@') AS envio,
                                          GROUP_CONCAT(contas_aberto.centro_custo SEPARATOR '@.@') AS CC,
                                          GROUP_CONCAT(contas_aberto.saldo SEPARATOR '@.@') AS saldo,
                                          GROUP_CONCAT(contas_aberto.valor SEPARATOR '@.@') AS valor,
                                          GROUP_CONCAT((SELECT contas_aberto_cc.valor FROM contas_aberto_cc WHERE contas_aberto_cc.tipo = 'DESCONTO' AND contas_aberto_cc.chave_conta_aberto = contas_aberto.chave LIMIT 1) SEPARATOR '@.@') AS desconto,
                                          GROUP_CONCAT(os.codigo SEPARATOR '@.@') AS os,
                                          GROUP_CONCAT(os.governmentTaxes SEPARATOR '@.@') AS governmentTaxes,
                                          GROUP_CONCAT(os.bankCharges SEPARATOR '@.@') AS bankCharges,
                                          GROUP_CONCAT(os.data_saida SEPARATOR '@.@') AS sailed,
                                          GROUP_CONCAT(os.ROE SEPARATOR '@.@') AS ROE,
                                          
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.moeda SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub IN (0,1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_moeda,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(Ordem.codigo SEPARATOR '@.@') FROM os AS Ordem INNER JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub IN (0,1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_valor_st,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.valor SEPARATOR '@.@') FROM os AS Ordem INNER JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub IN (0,1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_valor,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.qntd SEPARATOR '@.@') FROM os AS Ordem INNER JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub IN (0,1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_qntd,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(Ordem.codigo SEPARATOR '@.@') FROM os AS Ordem INNER JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub IN (0,1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_os,
                                          
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.moeda SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 2 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_moeda_received,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.valor SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 2 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_valor_received,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.qntd SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 2 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_qntd_received,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(Ordem.codigo SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 2 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_os_received,
                                          
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.moeda SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 3 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_moeda_discount,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.valor SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 3 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_valor_discount,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(os_servicos_itens.qntd SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 3 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_qntd_discount,
                                          GROUP_CONCAT((SELECT GROUP_CONCAT(Ordem.codigo SEPARATOR '@.@') FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = 3 ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS evento_os_discount,
                                          
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '$tipo_sub' ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS FDA,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '3'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS discount,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '2'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS received,
                                          GROUP_CONCAT((SELECT os_servicos_itens.Moeda FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os_moeda,
                                          GROUP_CONCAT((SELECT os_navios.nome FROM os AS Ordem LEFT JOIN os_navios ON Ordem.chave_navio = os_navios.chave WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio,
                                          GROUP_CONCAT((SELECT os_portos.Descricao FROM os AS Ordem LEFT JOIN os_portos ON Ordem.porto = os_portos.chave WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto,        

                                          GROUP_CONCAT((SELECT contas_aberto.valor FROM contas_aberto AS Cont LEFT JOIN os ON Cont.os_origem = os.chave WHERE Cont.chave = contas_aberto.chave AND os.chave IS NULL ORDER BY Cont.chave DESC LIMIT 1) SEPARATOR '@.@') AS valor_manual,                                        
                                          GROUP_CONCAT((SELECT os_navios.nome FROM contas_aberto AS Cont LEFT JOIN os_navios ON Cont.navio_manual = os_navios.chave WHERE Cont.chave = contas_aberto.chave ORDER BY Cont.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio_manual,                                        
                                          GROUP_CONCAT((SELECT os_portos.Descricao FROM contas_aberto AS Cont LEFT JOIN os_portos ON Cont.porto_manual = os_portos.chave WHERE Cont.chave = contas_aberto.chave ORDER BY Cont.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto_manual,
                                          GROUP_CONCAT(contas_aberto.os_manual SEPARATOR '@.@') AS os_manual,
                                          GROUP_CONCAT(contas_aberto.roe_manual SEPARATOR '@.@') AS roe_manual,
                                          GROUP_CONCAT(contas_aberto.envio SEPARATOR '@.@') AS envio_manual,
                                          GROUP_CONCAT(contas_aberto.sailed_manual SEPARATOR '@.@') AS sailed_manual,
                                          GROUP_CONCAT(contas_aberto.discount_manual SEPARATOR '@.@') AS discount_manual,
                                          GROUP_CONCAT(contas_aberto.received_manual SEPARATOR '@.@') AS received_manual",
                                          $where . " AND contas_aberto.Tipo = $tipo " . $groupBy
            );
            $database->closeConection();
        } else {
            $result = $database->doSelect(
                'contas_aberto 
            LEFT JOIN pessoas ON pessoas.chave = contas_aberto.pessoa
            LEFT JOIN os_tp_docto ON os_tp_docto.chave = contas_aberto.tipodocto
            LEFT JOIN os ON os.chave = contas_aberto.os_origem',
                "GROUP_CONCAT(contas_aberto.Docto SEPARATOR '@.@') AS documento, 
                                          GROUP_CONCAT(pessoas.nome SEPARATOR '@.@') AS pessoa, 
                                          GROUP_CONCAT(contas_aberto.vencimento SEPARATOR '@.@') AS vencimento,
                                          GROUP_CONCAT(contas_aberto.chave SEPARATOR '@.@') AS conta_chave,
                                          GROUP_CONCAT(contas_aberto.data_pagto SEPARATOR '@.@') AS dataPagamento,
                                          GROUP_CONCAT(contas_aberto.historico SEPARATOR '@.@') AS historico,
                                          GROUP_CONCAT(os_tp_docto.descricao SEPARATOR '@.@') AS tipoDocumento,
                                          GROUP_CONCAT(contas_aberto.lancto SEPARATOR '@.@') AS lancamento,
                                          GROUP_CONCAT(contas_aberto.centro_custo SEPARATOR '@.@') AS CC,
                                          GROUP_CONCAT(contas_aberto.saldo SEPARATOR '@.@') AS saldo,
                                          GROUP_CONCAT(contas_aberto.valor SEPARATOR '@.@') AS valor,
                                          GROUP_CONCAT((SELECT contas_aberto_cc.valor FROM contas_aberto_cc WHERE contas_aberto_cc.tipo = 'DESCONTO' AND contas_aberto_cc.chave_conta_aberto = contas_aberto.chave LIMIT 1) SEPARATOR '@.@') AS desconto,
                                          GROUP_CONCAT(os.codigo SEPARATOR '@.@') AS os,
                                          GROUP_CONCAT(os.data_saida SEPARATOR '@.@') AS sailed,
                                          GROUP_CONCAT(os.ROE SEPARATOR '@.@') AS ROE,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '$tipo_sub' ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS FDA,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '3'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS discount,
                                          GROUP_CONCAT((SELECT SUM(os_servicos_itens.valor * os_servicos_itens.qntd) FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave AND os_servicos_itens.cancelada != 1 AND os_servicos_itens.tipo_sub = '2'  ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS received,
                                          GROUP_CONCAT((SELECT os_servicos_itens.Moeda FROM os AS Ordem LEFT JOIN os_servicos_itens ON Ordem.chave = os_servicos_itens.chave_os WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS os_moeda,
                                          GROUP_CONCAT((SELECT os_navios.nome FROM os AS Ordem LEFT JOIN os_navios ON Ordem.chave_navio = os_navios.chave WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio,
                                          GROUP_CONCAT((SELECT os_portos.Descricao FROM os AS Ordem LEFT JOIN os_portos ON Ordem.porto = os_portos.chave WHERE Ordem.chave = os.chave ORDER BY os.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto,                                         
                                          GROUP_CONCAT((SELECT os_navios.nome FROM contas_aberto AS Cont LEFT JOIN os_navios ON Cont.navio_manual = os_navios.chave WHERE Cont.chave = contas_aberto.chave ORDER BY Cont.chave DESC LIMIT 1) SEPARATOR '@.@') AS navio_manual,                                        
                                          GROUP_CONCAT((SELECT os_portos.Descricao FROM contas_aberto AS Cont LEFT JOIN os_portos ON Cont.porto_manual = os_portos.chave WHERE Cont.chave = contas_aberto.chave ORDER BY Cont.chave DESC LIMIT 1) SEPARATOR '@.@') AS porto_manual
                                          GROUP_CONCAT(contas_aberto.os_manual SEPARATOR '@.@') AS os_manual,
                                          GROUP_CONCAT(contas_aberto.roe_manual SEPARATOR '@.@') AS roe_manual,
                                          GROUP_CONCAT(contas_aberto.sailed_manual SEPARATOR '@.@') AS sailed_manual,
                                          GROUP_CONCAT(contas_aberto.discount_manual SEPARATOR '@.@') AS discount_manual,
                                          GROUP_CONCAT(contas_aberto.received_manual SEPARATOR '@.@') AS received_manual",
                "contas_aberto.Tipo = '$tipo' " . $groupBy
            );
        }
        return $result;
    }

    public static function relatorioContasReceber($all, $chaves, $centro_custo, $situacao, $grupo, $faturada_ha_dias = null)
    {
        $database = new Database();
        
        // Construir WHERE clause
        $where_conditions = array();
        $where_conditions[] = "contas_aberto.Empresa = 1";
        $where_conditions[] = "contas_aberto.Saldo >= 1";
        $where_conditions[] = "contas_aberto.Tipo = 0";
        
        // Filtro por clientes específicos
        if (!$all && is_array($chaves) && count($chaves) > 0) {
            $chaves_string = "'" . implode("','", $chaves) . "'";
            $where_conditions[] = "pessoas.Chave IN ($chaves_string)";
        }
        
        // Filtro por centro de custo
        if ($centro_custo) {
            $where_conditions[] = "contas_aberto.Centro_Custo = '$centro_custo'";
        }
        
        // Filtro por grupo (subcategoria)
        if ($grupo) {
            $where_conditions[] = "pessoas.SubCategoria = '$grupo'";
        }
        
        $where_clause = implode(" AND ", $where_conditions);
        
        // Query principal para buscar contas
        $query = "
            SELECT 
                contas_aberto.*,
                pessoas.Chave as pessoa_chave,
                pessoas.Nome as pessoa_nome,
                pessoas.Nome_Fantasia as pessoa_nome_fantasia,
                pessoas.SubCategoria as pessoa_subcategoria,
                os.Chave as os_chave,
                os.ROE as os_roe,
                os.envio as os_envio,
                os.cancelada as os_cancelada,
                os.governmentTaxes as os_government_taxes,
                os.Data_Abertura as os_data_abertura,
                os.Data_Encerramento as os_data_encerramento,
                os.Data_Faturamento as os_data_faturamento,
                os.bankCharges as os_bank_charges,
                os.codigo as os_codigo,
                os.Data_Saida as os_data_saida,
                os_navios.nome as navio_nome,
                os_navios.chave as navio_chave,
                os_portos.Descricao as porto_descricao,
                os_portos.Chave as porto_chave,
                contas_navios.nome as manual_navio_nome,
                contas_navios.chave as manual_navio_chave,
                contas_portos.Descricao as manual_porto_descricao,
                contas_portos.Chave as manual_porto_chave
            FROM contas_aberto
            LEFT JOIN pessoas ON contas_aberto.Pessoa = pessoas.Chave
            LEFT JOIN os ON contas_aberto.os_origem = os.Chave
            LEFT JOIN os_navios ON os.chave_navio = os_navios.chave
            LEFT JOIN os_portos ON os.porto = os_portos.Chave
            LEFT JOIN os_navios as contas_navios ON contas_aberto.navio_manual = contas_navios.chave
            LEFT JOIN os_portos as contas_portos ON contas_aberto.porto_manual = contas_portos.Chave
            WHERE $where_clause
            ORDER BY pessoas.Nome ASC
        ";
        
        $contas_data = $database->doRawSelect($query);
        
        // Buscar contatos das pessoas para government taxes e bank charges
        $pessoas_chaves = array();
        foreach ($contas_data as $conta) {
            if ($conta['pessoa_chave'] && !in_array($conta['pessoa_chave'], $pessoas_chaves)) {
                $pessoas_chaves[] = $conta['pessoa_chave'];
            }
        }
        
        $contatos = array();
        if (count($pessoas_chaves) > 0) {
            $pessoas_string = implode(',', $pessoas_chaves);
            $contatos_query = "
                SELECT 
                    pessoas_contatos.*,
                    pessoas_contatos.Chave_Pessoa as pessoa_chave
                FROM pessoas_contatos 
                WHERE pessoas_contatos.Chave_Pessoa IN ($pessoas_string) 
                AND pessoas_contatos.Tipo IN ('GT', 'BK')
            ";
            $contatos_raw = $database->doRawSelect($contatos_query);
            foreach ($contatos_raw as $contato) {
                $pessoa_chave = $contato['pessoa_chave'];
                if (!isset($contatos[$pessoa_chave])) {
                    $contatos[$pessoa_chave] = array();
                }
                $contatos[$pessoa_chave][] = $contato;
            }
        }
        
        // Filtrar contas baseado na situação
        $contas_filtradas = array();
        foreach ($contas_data as $conta) {
            $incluir = true;
            
            if ($conta['os_chave']) {
                $data_encerramento = $conta['os_data_encerramento'];
                if ($data_encerramento && $data_encerramento !== '0000-00-00 00:00:00') {
                    if ($situacao === 'E') {
                        // Enviados - devem ter data de envio válida
                        $envio_date = $conta['os_envio'];
                        $incluir = $envio_date && 
                                  $envio_date !== '0000-00-00' && 
                                  $envio_date !== '0000-00-00 00:00:00';
                    } else if ($situacao === 'N') {
                        // Não enviados - não devem ter data de envio válida
                        $envio_date = $conta['os_envio'];
                        $incluir = !$envio_date || 
                                  $envio_date === '0000-00-00' || 
                                  $envio_date === '0000-00-00 00:00:00';
                    } else if ($situacao === 'F') {
                        // Faturados - devem ter data de faturamento válida
                        $faturamento_date = $conta['os_data_faturamento'];
                        $incluir = $faturamento_date && 
                                  $faturamento_date !== '0000-00-00 00:00:00';
                    }
                } else {
                    $incluir = false;
                }
            }
            
            // Filtrar por "Enviada há X dias"
            if ($incluir && $faturada_ha_dias !== null && is_numeric($faturada_ha_dias) && $conta['os_chave']) {
                $envio_date = $conta['os_data_envio'];
                if ($envio_date && $envio_date !== '0000-00-00 00:00:00') {
                    // Calcular a diferença em dias entre a data de envio e hoje
                    $data_envio = new DateTime($envio_date);
                    $data_hoje = new DateTime();
                    $diferenca_dias = $data_hoje->diff($data_envio)->days;
                    // Incluir apenas se a diferença for MAIOR que os dias especificados
                    $incluir = ($diferenca_dias >= intval($faturada_ha_dias));
                } else {
                    // Se não tem data de envio válida, não incluir
                    $incluir = false;
                }
            }
            
            if ($incluir) {
                $contas_filtradas[] = $conta;
            }
        }
        
        // Buscar serviços das OS
        $os_chaves = array();
        foreach ($contas_filtradas as $conta) {
            if ($conta['os_chave'] && !in_array($conta['os_chave'], $os_chaves)) {
                $os_chaves[] = $conta['os_chave'];
            }
        }
        
        $servicos = array();
        if (count($os_chaves) > 0) {
            $os_string = implode(',', $os_chaves);
            $servicos_query = "
                SELECT 
                    os_servicos_itens.*
                FROM os_servicos_itens 
                WHERE os_servicos_itens.chave_os IN ($os_string)
                AND os_servicos_itens.cancelada != 1
            ";
            $servicos_raw = $database->doRawSelect($servicos_query);
            foreach ($servicos_raw as $servico) {
                $os_chave = $servico['chave_os'];
                if (!isset($servicos[$os_chave])) {
                    $servicos[$os_chave] = array();
                }
                $servicos[$os_chave][] = $servico;
            }
        }
        
        // Processar dados
        $pessoas_resultado = array();
        $dados_manuais = array();
        $dados_normais = array();
        
        foreach ($contas_filtradas as $conta) {
            $pessoa_chave = $conta['pessoa_chave'];
            
            // Adicionar pessoa ao resultado se não existir
            if (!isset($pessoas_resultado[$pessoa_chave])) {
                $pessoas_resultado[$pessoa_chave] = array(
                    'pessoa' => array(
                        'chave' => $conta['pessoa_chave'],
                        'nome' => $conta['pessoa_nome'],
                        'nome_fantasia' => $conta['pessoa_nome_fantasia']
                    ),
                    'lancamento' => $conta['Lancto']
                );
            }
            
            // Processar conta manual ou normal
            if (!$conta['os_chave']) {
                // Conta manual
                $fda = floatval($conta['Valor']);
                $discount = floatval($conta['discount_manual']);
                $received = floatval($conta['received_manual']);
                $balance = $fda - $discount - $received;
                
                if ($balance > 0.01) {
                    $dados_manuais[] = array(
                        'ship' => $conta['manual_navio_nome'] ?: '',
                        'os' => $conta['os_manual'] ?: '',
                        'pessoa' => $pessoa_chave,
                        'port' => $conta['manual_porto_descricao'] ?: '',
                        'sailed' => $conta['sailed_manual'] ?: date('Y-m-d'),
                        'billing' => $conta['envio'] ?: date('Y-m-d'),
                        'roe' => floatval($conta['roe_manual']) ?: 5,
                        'governmentTaxes' => 0,
                        'bankCharges' => 0,
                        'moeda' => intval($conta['Moeda']) ?: 5,
                        'fda' => $fda,
                        'discount' => $discount,
                        'received' => $received,
                        'balance' => $balance
                    );
                }
            } else {
                // Conta normal (com OS)
                if ($conta['os_cancelada'] == 0) {
                    $pessoa_contatos = isset($contatos[$pessoa_chave]) ? $contatos[$pessoa_chave] : array();
                    
                    // Buscar contatos específicos
                    $gt_contact = null;
                    $bk_contact = null;
                    foreach ($pessoa_contatos as $contato) {
                        if ($contato['Tipo'] == 'GT') $gt_contact = $contato;
                        if ($contato['Tipo'] == 'BK') $bk_contact = $contato;
                    }
                    
                    // Verificar aplicação de taxas baseada na data limite
                    $aplicar_bank_charges = true;
                    $aplicar_government_taxes = true;
                    
                    if ($bk_contact && !empty($bk_contact['Campo2'])) {
                        $partes = explode('/', $bk_contact['Campo2']);
                        if (count($partes) == 3) {
                            $data_limite = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
                            $data_abertura = substr($conta['os_data_abertura'], 0, 10);
                            if ($data_abertura > $data_limite) {
                                $aplicar_bank_charges = false;
                            }
                        }
                    }
                    
                    if ($gt_contact && !empty($gt_contact['Campo2'])) {
                        $partes = explode('/', $gt_contact['Campo2']);
                        if (count($partes) == 3) {
                            $data_limite = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
                            $data_abertura = substr($conta['os_data_abertura'], 0, 10);
                            if ($data_abertura > $data_limite) {
                                $aplicar_government_taxes = false;
                            }
                        }
                    }
                    
                    $fda = 0;
                    $fda_dolar = 0;
                    $discount = 0;
                    $discount_dolar = 0;
                    $received = 0;
                    $received_dolar = 0;
                    
                    $os_chave = $conta['os_chave'];
                    $roe = floatval($conta['os_roe']) ?: 1;
                    
                    // Processar serviços da OS
                    if (isset($servicos[$os_chave])) {
                        foreach ($servicos[$os_chave] as $servico) {
                            $tipo_sub = intval($servico['tipo_sub']);
                            $moeda_servico = intval($servico['Moeda']);
                            $valor_servico = floatval($servico['valor']) * floatval($servico['qntd']);
                            $repasse = intval($servico['repasse']);
                            $fornecedor_custeio = intval($servico['Fornecedor_Custeio']);
                            
                            // Verificar se deve incluir o serviço
                            $incluir_servico = false;
                            if (($tipo_sub === 0 || $tipo_sub === 1) && ($repasse === 1 || $fornecedor_custeio !== 0)) {
                                $incluir_servico = true;
                            } else if ($tipo_sub === 2 || $tipo_sub === 3) {
                                $incluir_servico = true;
                            }
                            
                            if ($incluir_servico) {
                                if ($tipo_sub === 3) {
                                    // Desconto
                                    if ($moeda_servico === 5) {
                                        $discount += $valor_servico;
                                        $discount_dolar += $valor_servico / $roe;
                                    } else {
                                        $discount_dolar += $valor_servico;
                                        $discount += $valor_servico * $roe;
                                    }
                                } else if ($tipo_sub === 2) {
                                    // Recebido
                                    if ($moeda_servico === 5) {
                                        $received += $valor_servico;
                                        $received_dolar += $valor_servico / $roe;
                                    } else {
                                        $received_dolar += $valor_servico;
                                        $received += $valor_servico * $roe;
                                    }
                                } else {
                                    // FDA
                                    if ($moeda_servico === 5) {
                                        $fda += $valor_servico;
                                        $fda_dolar += $valor_servico / $roe;
                                    } else {
                                        $fda_dolar += $valor_servico;
                                        $fda += $valor_servico * $roe;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Adicionar government taxes e bank charges
                    $data_encerramento = $conta['os_data_encerramento'];
                    $aplicar_taxas_antigas = strtotime($data_encerramento) < strtotime('2024-01-25');
                    
                    $government_taxes = floatval($conta['os_government_taxes']);
                    $bank_charges = floatval($conta['os_bank_charges']);
                    
                    $gov_taxes_aplicar = ($aplicar_taxas_antigas || 
                                         (strtoupper(isset($gt_contact['Campo1']) ? $gt_contact['Campo1'] : '') === 'SIM')) && 
                                        $aplicar_government_taxes;
                    
                    $bank_charges_aplicar = ($aplicar_taxas_antigas || 
                                            (strtoupper(isset($bk_contact['Campo1']) ? $bk_contact['Campo1'] : '') === 'SIM')) && 
                                           $aplicar_bank_charges;
                    
                    $moeda_conta = intval($conta['Moeda']);
                    
                    if ($gov_taxes_aplicar && $government_taxes > 0) {
                        if ($moeda_conta === 5 || !$moeda_conta) {
                            $fda += $government_taxes;
                            $fda_dolar += $government_taxes / $roe;
                        } else {
                            $fda_dolar += $government_taxes;
                            $fda += $government_taxes * $roe;
                        }
                    }
                    
                    if ($bank_charges_aplicar && $bank_charges > 0) {
                        if ($moeda_conta === 5 || !$moeda_conta) {
                            $fda += $bank_charges;
                            $fda_dolar += $bank_charges / $roe;
                        } else {
                            $fda_dolar += $bank_charges;
                            $fda += $bank_charges * $roe;
                        }
                    }
                    
                    $balance = $fda - $discount - $received;
                    $balance_dolar = $fda_dolar - $discount_dolar - $received_dolar;
                    
                    if ($balance > 0.01) {
                        $dados_normais[] = array(
                            'ship' => $conta['navio_nome'] ?: '',
                            'os' => $conta['os_codigo'] ?: '',
                            'pessoa' => $pessoa_chave,
                            'port' => $conta['porto_descricao'] ?: '',
                            'sailed' => $conta['os_data_saida'] ?: date('Y-m-d'),
                            'billing' => $conta['os_envio'] ?: date('Y-m-d'),
                            'roe' => $roe,
                            'governmentTaxes' => $gov_taxes_aplicar ? $government_taxes : 0,
                            'bankCharges' => $bank_charges_aplicar ? $bank_charges : 0,
                            'moeda' => $moeda_conta ?: 5,
                            'fda' => $fda,
                            'discount' => $discount,
                            'received' => $received,
                            'balance' => $balance,
                            'balanceDolar' => $balance_dolar,
                            'receivedDOLAR' => $received_dolar,
                            'discountDOLAR' => $discount_dolar,
                            'FDADOLAR' => $fda_dolar
                        );
                    }
                }
            }
        }
        
        // Organizar resultado final
        $resultado_final = array();
        foreach ($pessoas_resultado as $pessoa_chave => $pessoa_data) {
            $contas_manuais = array_filter($dados_manuais, function($item) use ($pessoa_chave) {
                return $item['pessoa'] == $pessoa_chave;
            });
            
            $contas_normais = array_filter($dados_normais, function($item) use ($pessoa_chave) {
                return $item['pessoa'] == $pessoa_chave;
            });
            
            // Calcular total para verificar se deve incluir
            $total = 0;
            foreach ($contas_manuais as $conta) {
                $total += $conta['balance'];
            }
            foreach ($contas_normais as $conta) {
                $total += $conta['balance'];
            }
            
            if ($total > 0.01) {
                $resultado_final[] = array_merge($pessoa_data, array(
                    'contas_normais' => array_values($contas_normais),
                    'contas_manuais' => array_values($contas_manuais)
                ));
            }
        }
        
        $database->closeConection();
        return $resultado_final;
    }
}
