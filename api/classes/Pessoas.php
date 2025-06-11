<?php
include_once "Database.php";

class Pessoas
{
    private $database;

    public function __construct()
    {
    }

    public static function getPessoas()
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*'
        );
        $database->closeConection();
        return $result;
    }

    public static function getPessoasCategoria($categoria)
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            "pessoas.Categoria LIKE '" . $categoria . "'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getFornecedores()
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            "Categoria LIKE '_1%'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getClientes()
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            "Categoria LIKE '1%'"
        );
        $database->closeConection();
        return $result;
    }
    
    public static function getIndicados()
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            "pessoas.Indicado != 0"
        );
        $database->closeConection();
        return $result;
    }

    public static function getPessoa($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            'pessoas.Chave =' . $chave
        );
        $database->closeConection();
        return $result;
    }

    public static function getCPF($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.Cnpj_Cpf AS cpf',
            'pessoas.Chave =' . $chave
        );
        $database->closeConection();
        return $result;
    }

    public static function testaCpf($Cnpj_Cpf)
    {
        $database = new Database();

        $result = $database->doSelect(
            'pessoas',
            'pessoas.*',
            'pessoas.Cnpj_Cpf =' . $Cnpj_Cpf
        );
        $database->closeConection();
        return $result;
    }

    public static function getLugares()
    {
        $database = new Database();

        $result['paises'] = $database->doSelect('paises', 'paises.*');

        $result['estados'] = $database->doSelect('estados', 'estados.*');

        $result['cidades'] = $database->doSelect('cidades', 'cidades.*');

        $database->closeConection();
        return $result;
    }

    public static function getEstadoCidade($estado, $cidade)
    {
        $database = new Database();

        $result['estado'] = $database->doSelect('estados', 'estados.*', "estados.Codigo = '" . $estado . "'");

        $result['cidade'] = $database->doSelect('cidades', 'cidades.*', "cidades.Descricao like '" . $cidade . "'");

        $database->closeConection();
        return $result;
    }

    public static function getContatos($pessoa)
    {
        $database = new Database();

        $result = $database->doSelect('pessoas_contatos', 'pessoas_contatos.*', 'pessoas_contatos.Chave_Pessoa = ' . $pessoa);

        $database->closeConection();
        return $result;
    }

    public static function getContatoEmail($pessoa)
    {
        $database = new Database();

        $result = $database->doSelect('pessoas_contatos', 'pessoas_contatos.*', 'pessoas_contatos.Chave_Pessoa = ' . $pessoa . ' and (pessoas_contatos.Tipo = "EM" OR pessoas_contatos.Tipo = "ER")');
                                                                                                                                 

        $database->closeConection();
        return $result;
    }

    public static function getTarifas()
    {
        $database = new Database();

        $result = $database->doSelect("tarifas LEFT JOIN pessoas ON tarifas.fornecedor = pessoas.chave LEFT JOIN os_portos ON tarifas.porto = os_portos.chave", "tarifas.fornecedor, tarifas.chave, GROUP_CONCAT(tarifas.porto SEPARATOR '@') as porto, tarifas.anexo, tarifas.vencimento, tarifas.servico, tarifas.observacao, tarifas.descricao, tarifas.email_enviado, tarifas.preferencial, tarifas.anexo2, pessoas.nome AS fornecedorNome, GROUP_CONCAT(os_portos.descricao SEPARATOR '@') AS portoNome", "1=1 GROUP BY tarifas.fornecedor, tarifas.vencimento, tarifas.servico, tarifas.preferencial ORDER BY tarifas.preferencial DESC");

        $database->closeConection();
        return $result;
    }

    public static function getAnexos($evento = null)
    {
        $database = new Database();

        if ($evento) {
            $result = $database->doSelect("anexos", "anexos.*", "evento = '$evento'");
        } else {
            $result = $database->doSelect("anexos LEFT JOIN pessoas ON pessoas.chave = anexos.fornecedor LEFT JOIN os_servicos_itens ON os_servicos_itens.chave = anexos.evento LEFT JOIN os ON os.chave = os_servicos_itens.chave_os LEFT JOIN os_navios ON os_navios.chave = os.chave_navio LEFT JOIN operadores ON operadores.chave = anexos.validadoPor", "anexos.*, pessoas.nome AS fornecedorNome, os.codigo AS osCodigo, os_navios.nome AS navioNome, operadores.nome AS operadorNome");
        }

        $database->closeConection();
        return $result;
    }

    public static function getAnexosTarifas($chave)
    {
        $database = new Database();

        $result = $database->doSelect("anexos_tarifas", "anexos_tarifas.*", "anexos_tarifas.chave_tarifa = $chave");

        $database->closeConection();
        return $result;
    }

    public static function getAnexosNaoValidados()
    {
        $database = new Database();

        $expiration = date("Y-m-d H:i:s", strtotime('-48 hours'));
        
        $database->doUpdate('anexos LEFT JOIN os_servicos_itens AS eventos ON eventos.chave = anexos.evento LEFT JOIN os ON os.chave = eventos.chave_os', "validado = 1, validadoPor = -1, validadoData = '" . date("Y-m-d H:i:s") . "'", "validado = 0 AND os.Data_Abertura <= '$expiration'");
        $database->doUpdate('anexos', "validado = 1, validadoPor = -1, validadoData = '" . date("Y-m-d H:i:s") . "'", "validado = 2 AND validadoData <= '$expiration'");

        $result = $database->doSelect("anexos LEFT JOIN os_servicos_itens evento ON evento.chave = anexos.evento LEFT JOIN os ON evento.chave_os = os.chave", "anexos.*, os.Data_Abertura AS data", "validado IN(0,2) ORDER BY envio DESC");
        
        $database->closeConection();
        return $result;
    }

    public static function getEventosNaoContabilizados()
    {
        $database = new Database();
        
        $result = $database->doSelect("os_servicos_itens LEFT JOIN os ON os.chave = os_servicos_itens.chave_os LEFT JOIN contas_aberto ON os_servicos_itens.chave = contas_aberto.Docto_Origem LEFT JOIN custeios_subagentes ON custeios_subagentes.evento = os_servicos_itens.chave", "os_servicos_itens.*, os.Data_Abertura AS data", "TIMESTAMPDIFF(HOUR,os.Data_Faturamento,NOW())<=48 AND (custeios_subagentes.chave IS NULL OR custeios_subagentes.contabilizado = 0) AND contas_aberto.chave IS NULL");
        
        $database->closeConection();
        return $result;
    }

    
    public static function getEnderecos($pessoa)
    {
        $database = new Database();

        $result = $database->doSelect('pessoas_enderecos', 'pessoas_enderecos.*', 'pessoas_enderecos.Chave_Pessoa = ' . $pessoa);

        $database->closeConection();
        return $result;
    }

    public static function getTiposComplementares()
    {
        $database = new Database();

        $result = $database->doSelect('tipos_dados_complementares', '*');

        $database->closeConection();
        return $result;
    }

    public static function anexosVencimentos()
    {
        $database = new Database();

        $dataAtual = date("Y-m-d");

        $result = $database->doSelect('tarifas LEFT JOIN pessoas ON pessoas.chave = tarifas.fornecedor', "tarifas.chave, tarifas.fornecedor, tarifas.anexo, tarifas.servico, tarifas.email_enviado, tarifas.preferencial, GROUP_CONCAT(tarifas.porto SEPARATOR '@') AS porto, pessoas.nome AS fornecedorNome", "tarifas.vencimento < '$dataAtual' AND tarifas.email_enviado = 0 GROUP BY fornecedor, servico, vencimento, preferencial");

        $database->closeConection();
        return $result;
    }

    public static function getFornecedoresAnexosInfo($chave)
    {
        $database = new Database();

        $result = $database->doSelect("tarifas LEFT JOIN pessoas ON pessoas.chave = tarifas.fornecedor LEFT JOIN pessoas_contatos as emails ON emails.chave_pessoa = tarifas.fornecedor AND emails.Tipo = 'EM'", 'tarifas.*, emails.Campo1 AS email, pessoas.nome AS nome', "tarifas.chave = '$chave'");

        $database->closeConection();
        return $result;
    }

    public static function anexosEnviados($chave)
    {
        $database = new Database();


        $result = $database->doUpdate("tarifas", "email_enviado = 1", "chave = '$chave'");

        $database->closeConection();
        return $result;
    }

    public static function insertPessoa($values)
    {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Inscricao_Municipal, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao, Conta_Faturar, Limite, Indicado';

        $result = $database->doInsert('pessoas', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertPessoaBasico($values)
    {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Inscricao_Municipal, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao, Conta_Faturar';

        $result = $database->doInsert('pessoas', $cols, $values);

        $result = $database->doSelect('pessoas', 'pessoas.*', '1=1 ORDER BY Chave DESC');

        $database->closeConection();
        return $result;
    }

    public static function insertContato($values)
    {
        $database = new Database();

        $cols = 'Tipo, Campo1, Campo2, Chave_Pessoa';

        $result = $database->doInsert('pessoas_contatos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertEndereco($values, $Tipo, $Chave_Pessoa)
    {
        $database = new Database();

        if ($Tipo == 0) {
            $query = "Tipo = 3";
            $result = $database->doUpdate('pessoas_enderecos', $query, 'Chave_Pessoa = ' . $Chave_Pessoa . " AND Tipo = 0");
        }

        $cols = 'Tipo, Endereco, Numero, Complemento, Cidade, Cep, UF, bairro, Cidade_Descricao, pais, Chave_Pessoa';

        $result = $database->doInsert('pessoas_enderecos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertTarifa($values, $portos)
    {
        $database = new Database();
        $cols = 'fornecedor, servico, vencimento, preferencial, observacao, porto'; #ALTERAÇÃO

        foreach ($portos as $porto) {
            $baseValues = $values . ", $porto";

            $result = $database->doInsert('tarifas', $cols, $baseValues);
        }
        $database->closeConection();
        return $result;
    }

    public static function insertTarifasAnexos($values)
    {
        $database = new Database();
        $cols = "anexo, chave_tarifa"; 
            
        $result = $database->doInsert('anexos_tarifas', $cols, $values);
        
        $database->closeConection();
        return $result;
    }

    public static function updateTarifasAnexos($value, $chave)
    {
        $database = new Database();
        $query = "anexo = '".$value."'";
        $result = $database->doUpdate('anexos_tarifas', $query, 'anexos_tarifas.chave = '.$chave);
        
        $database->closeConection();
        return $result;
    }

    public static function getTarifasLen() {
        $database = new Database();

        $result = $database->doSelect("tarifas", 'tarifas.chave', "","ORDER BY tarifas.chave DESC LIMIT 1");
        
        $database->closeConection();
        return $result;
    }

    public static function getAnexosTarifasLen() {
        $database = new Database();

        $result = $database->doSelect("anexos_tarifas", 'anexos_tarifas.chave', "","ORDER BY anexos_tarifas.chave DESC LIMIT 1");
        
        $database->closeConection();
        return $result;
    }

    public static function deleteAnexoTarifa($chave)
    {
        $database = new Database();

        $result = $database->doDelete('anexos_tarifas', 'anexos_tarifas.chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function insertAnexoFornecedor($fornecedor, $evento, $vencimento, $envio, $anexo)
    {
        $database = new Database();

        $cols = 'fornecedor, evento, vencimento, envio, anexo';
        $values = "'$fornecedor', '" . $evento . "', '$vencimento', '$envio', '$anexo'";
        
        $result = $database->doInsert("anexos", $cols, $values);
        $database->closeConection();

        return $result;
    }

    public static function updatePessoa($Chave, $Nome, $Nome_Fantasia, $Cnpj_Cpf, $Rg_Ie, $Inscricao_Municipal, $Nascimento_Abertura, $Inclusao, $Categoria, $Conta_Contabil, $Conta_Provisao, $Conta_Faturar, $Balance, $Indicado)
    {
        $database = new Database();

        $query = "Nome = '" . $Nome . "', Nome_Fantasia = '" . $Nome_Fantasia . "', Cnpj_Cpf = '" . $Cnpj_Cpf . "', Rg_Ie = '" . $Rg_Ie . "', Inscricao_Municipal = '$Inscricao_Municipal', Nascimento_Abertura = '" . $Nascimento_Abertura . "', Inclusao = '" . $Inclusao . "', Categoria = '" . $Categoria . "', Conta_Contabil = '" . $Conta_Contabil . "', Conta_Provisao = '" . $Conta_Provisao . "', Conta_Faturar = '" . $Conta_Faturar . "', Limite = '" . $Balance . "', Indicado = '" . $Indicado . "'";
        $result = $database->doUpdate('pessoas', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateContato($Chave, $Tipo, $Campo1, $Campo2, $Chave_Pessoa)
    {
        $database = new Database();

        $query = "Tipo = '" . $Tipo . "', Campo1 = '" . $Campo1 . "',  Campo2 = '" . $Campo2 . "', Chave_Pessoa = " . $Chave_Pessoa;
        $result = $database->doUpdate('pessoas_contatos', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateEndereco($Chave, $Tipo, $Endereco, $Numero, $Complemento, $Cidade, $Cep, $UF, $bairro, $Cidade_Descricao, $pais, $Chave_Pessoa)
    {
        $database = new Database();

        if ($Tipo == 0) {
            $query = "Tipo = 3";
            $result = $database->doUpdate('pessoas_enderecos', $query, 'Chave_Pessoa = ' . $Chave_Pessoa . " AND Tipo = 0");
        }

        $query = "Tipo = '" . $Tipo . "', Endereco = '" . $Endereco . "', Numero = '" . $Numero . "', Complemento = '" . $Complemento . "', Cidade = '" . $Cidade . "', Cep = '" . $Cep . "', UF = '" . $UF . "', bairro = '" . $bairro . "', Cidade_Descricao = '" . $Cidade_Descricao . "', pais = '" . $pais . "', Chave_Pessoa = " . $Chave_Pessoa;
        $result = $database->doUpdate('pessoas_enderecos', $query, 'Chave = ' . $Chave);

        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateTarifa($chave, $fornecedor, $portos, $servico, $vencimento, $preferencial, $portosDeletados, $observacao)
    {
        $database = new Database();

        foreach ($portos as $porto) {
            $itemExists = $database->doSelect('tarifas', "tarifas.chave", "porto = '$porto' AND fornecedor = '$fornecedor'");

            if ($itemExists[0]) {
                $query = "fornecedor = '" . $fornecedor . "', porto = '" . $porto . "', servico = '" . $servico . "', observacao = '" . $observacao . "', vencimento = '$vencimento', email_enviado = 0, preferencial = $preferencial";

                $result = $database->doUpdate('tarifas', $query, 'chave = ' . $chave);
            } else {
                $values = "'$fornecedor', '$porto', '$servico', '$observacao', '$vencimento', $preferencial";

                $cols = "fornecedor, porto, servico, observacao, vencimento, preferencial";

                $result = $database->doInsert('tarifas', $cols, $values);
            }
        }

        foreach ($portosDeletados as $porto) {
            $database->doDelete('tarifas', "porto = '$porto' AND fornecedor = '$fornecedor' AND servico = '$servico' AND vencimento = '$vencimento'");
        }


        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateDescricaoTarifa($chave, $descricao)
    {
        $database = new Database();

        $query = "descricao = '" . $descricao . "'";

        $result = $database->doUpdate('tarifas', $query, 'chave = ' . $chave);

        $result = $database->doSelect('tarifas', "tarifas.*", 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateAnexos($anexos, $validadoPor, $validadoData)
    {
        $database = new Database();

        foreach($anexos as $anexo) {
            if ($anexo->{"validado"} != "0") {
                $database->doUpdate('anexos', "validado = ".$anexo->{"validado"}.", validadoPor = '$validadoPor', validadoData = '$validadoData'", "chave = ".$anexo->{"chave"});
            } else {
                $database->doUpdate('anexos', "validado = " . $anexo->{"validado"}, "chave = " . $anexo->{"chave"});
            }
        }

        $database->closeConection();
        return true;
    }

    public static function updateAnexo($chave, $operador, $evento, $validado, $validadoData)
    {
        $database = new Database();

        if ($validado != "0") {
            $query = "evento = '$evento', validado = '$validado', validadoData = '$validadoData', validadoPor = '$operador'";
        } else{
            $query = "evento = '$evento', validado = '$validado'";
        }

        $database->doUpdate('anexos', $query, "chave = ".$chave);

        $database->closeConection();
        return true;
    }


    public static function deletePessoa($chave)
    {
        $database = new Database();

        $result = $database->doDelete('pessoas', 'Chave = ' . $chave);
        $result = $database->doDelete('pessoas_contatos', 'Chave_Pessoa = ' . $chave);
        $result = $database->doDelete('pessoas_enderecos', 'Chave_Pessoa = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteContato($chave)
    {
        $database = new Database();

        $result = $database->doDelete('pessoas_contatos', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteEndereco($chave)
    {
        $database = new Database();

        $result = $database->doDelete('pessoas_enderecos', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteTarifa($chave)
    {
        $database = new Database();

        $result = $database->doDelete('tarifas', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }
    
    public static function deleteAnexo($chave)
    {
        $database = new Database();

        $result = $database->doDelete('anexos', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function getGruposClientes()
    {
        $database = new Database();

        $result = $database->doSelect('subcategorias_pessoas', 'subcategorias_pessoas.*');
        $database->closeConection();
        return $result;
    }

    public static function insertGrupoCliente($values)
    {
        $database = new Database();

        $cols = 'descricao';

        $result = $database->doInsert('subcategorias_pessoas', $cols, $values);

        $database->closeConection();
        return $result;
    }
}
