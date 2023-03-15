<?php
include_once "Database.php";    

class Pessoas {
    private $database;

    public function __construct(){
        
    }

    public static function getPessoas(){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*'
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getPessoasCategoria($categoria){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*',
                                      "pessoas.Categoria LIKE '".$categoria."'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getFornecedores(){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*',
                                      "Categoria LIKE '_1%'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getClientes(){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*',
                                      "Categoria LIKE '1%'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getPessoa($chave){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*',
                                      'pessoas.Chave ='.$chave
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getCPF($chave){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.Cnpj_Cpf AS cpf',
                                      'pessoas.Chave ='.$chave
                                    );
        $database->closeConection();
        return $result;

    }

    public static function testaCpf($Cnpj_Cpf){
        $database = new Database();

        $result = $database->doSelect('pessoas',
                                      'pessoas.*',
                                      'pessoas.Cnpj_Cpf ='.$Cnpj_Cpf
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getLugares() {
        $database = new Database();

        $result['paises'] = $database->doSelect('paises', 'paises.*');
        
        $result['estados'] = $database->doSelect('estados', 'estados.*');

        $result['cidades'] = $database->doSelect('cidades', 'cidades.*');

        $database->closeConection();
        return $result;
    }

    public static function getEstadoCidade($estado, $cidade) {
        $database = new Database();

        $result['estado'] = $database->doSelect('estados', 'estados.*', "estados.Codigo = '".$estado."'");
        
        $result['cidade'] = $database->doSelect('cidades', 'cidades.*', "cidades.Descricao like '".$cidade."'");

        $database->closeConection();
        return $result;
    }

    public static function getContatos($pessoa) {
        $database = new Database();

        $result = $database->doSelect('pessoas_contatos', 'pessoas_contatos.*', 'pessoas_contatos.Chave_Pessoa = '.$pessoa);

        $database->closeConection();
        return $result;
    }
    
    public static function getAnexos() {
        $database = new Database();

        $result = $database->doSelect("fornecedor_anexos LEFT JOIN pessoas ON fornecedor_anexos.fornecedor = pessoas.chave LEFT JOIN os_portos ON fornecedor_anexos.porto = os_portos.chave", "fornecedor_anexos.fornecedor, fornecedor_anexos.chave, GROUP_CONCAT(fornecedor_anexos.porto SEPARATOR '@') as porto, fornecedor_anexos.anexo, fornecedor_anexos.vencimento, fornecedor_anexos.servico, fornecedor_anexos.email_enviado, fornecedor_anexos.preferencial, pessoas.nome AS fornecedorNome, GROUP_CONCAT(os_portos.descricao SEPARATOR '@') AS portoNome", "1=1 GROUP BY fornecedor_anexos.fornecedor, fornecedor_anexos.vencimento, fornecedor_anexos.servico, fornecedor_anexos.preferencial ORDER BY fornecedor_anexos.preferencial DESC");

        $database->closeConection();
        return $result;
    }

    public static function getEnderecos($pessoa) {
        $database = new Database();

        $result = $database->doSelect('pessoas_enderecos', 'pessoas_enderecos.*', 'pessoas_enderecos.Chave_Pessoa = '.$pessoa);

        $database->closeConection();
        return $result;
    }

    public static function getTiposComplementares() {
        $database = new Database();

        $result = $database->doSelect('tipos_dados_complementares', '*');

        $database->closeConection();
        return $result;
    }

    public static function anexosVencimentos() {
        $database = new Database();

        $dataAtual = date("Y-m-d");

        $result = $database->doSelect('fornecedor_anexos LEFT JOIN pessoas ON pessoas.chave = fornecedor_anexos.fornecedor', "fornecedor_anexos.fornecedor, fornecedor_anexos.anexo, fornecedor_anexos.servico, fornecedor_anexos.email_enviado, fornecedor_anexos.preferencial, GROUP_CONCAT(fornecedor_anexos.porto SEPARATOR '@') AS porto, pessoas.nome AS fornecedorNome", "fornecedor_anexos.vencimento < '$dataAtual' AND fornecedor_anexos.email_enviado = 0 GROUP BY fornecedor, servico, vencimento, preferencial");

        $database->closeConection();
        return $result;
    }

    public static function getFornecedoresAnexosInfo($chave) {
        $database = new Database();

        $result = $database->doSelect("fornecedor_anexos LEFT JOIN pessoas ON pessoas.chave = fornecedor_anexos.fornecedor LEFT JOIN pessoas_contatos as emails ON emails.chave_pessoa = fornecedor_anexos.fornecedor AND emails.Tipo = 'EM'",'fornecedor_anexos.*, emails.Campo1 AS email, pessoas.nome AS nome', "fornecedor_anexos.chave = '$chave'");

        $database->closeConection();
        return $result;        
    }

    public static function anexosEnviados($chave) {
        $database = new Database();

        
        $result = $database->doUpdate("fornecedor_anexos", "email_enviado = 1", "chave = '$chave'");

        $database->closeConection();
        return $result;        
    }

    public static function insertPessoa($values) {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Inscricao_Municipal, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao, Conta_Faturar';
    
        $result = $database->doInsert('pessoas', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertPessoaBasico($values) {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Inscricao_Municipal, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao, Conta_Faturar';
    
        $result = $database->doInsert('pessoas', $cols, $values);

        $result = $database->doSelect('pessoas', 'pessoas.*', '1=1 ORDER BY Chave DESC');

        $database->closeConection();
        return $result;
    }

    public static function insertContato($values) {
        $database = new Database();

        $cols = 'Tipo, Campo1, Campo2, Chave_Pessoa';
    
        $result = $database->doInsert('pessoas_contatos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertEndereco($values, $Tipo, $Chave_Pessoa) {
        $database = new Database();

        if ($Tipo == 0) {
            $query = "Tipo = 3";
            $result = $database->doUpdate('pessoas_enderecos', $query, 'Chave_Pessoa = '.$Chave_Pessoa." AND Tipo = 0");
        }

        $cols = 'Tipo, Endereco, Numero, Complemento, Cidade, Cep, UF, bairro, Cidade_Descricao, pais, Chave_Pessoa';
    
        $result = $database->doInsert('pessoas_enderecos', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertAnexo($values, $portos) {
        $database = new Database();
        $cols = 'fornecedor, servico, anexo, vencimento, preferencial, porto';

        foreach ($portos as $porto) {
            $baseValues = $values.", $porto";
            
            $result = $database->doInsert('fornecedor_anexos', $cols, $baseValues);
        }
        $database->closeConection();
        return $result;
    }

	public static function updatePessoa($Chave, $Nome, $Nome_Fantasia, $Cnpj_Cpf, $Rg_Ie, $Inscricao_Municipal, $Nascimento_Abertura, $Inclusao, $Categoria, $Conta_Contabil, $Conta_Provisao, $Conta_Faturar){
        $database = new Database();

        $query = "Nome = '" . $Nome . "', Nome_Fantasia = '" . $Nome_Fantasia . "', Cnpj_Cpf = '" . $Cnpj_Cpf . "', Rg_Ie = '".$Rg_Ie."', Inscricao_Municipal = '$Inscricao_Municipal', Nascimento_Abertura = '".$Nascimento_Abertura."', Inclusao = '".$Inclusao."', Categoria = '".$Categoria."', Conta_Contabil = '".$Conta_Contabil."', Conta_Provisao = '".$Conta_Provisao."', Conta_Faturar = '$Conta_Faturar'";
		$result = $database->doUpdate('pessoas', $query, 'Chave = '.$Chave);

        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

	public static function updateContato($Chave, $Tipo, $Campo1, $Campo2, $Chave_Pessoa){
        $database = new Database();

        $query = "Tipo = '" . $Tipo . "', Campo1 = '" . $Campo1 . "',  Campo2 = '" . $Campo2 . "', Chave_Pessoa = " . $Chave_Pessoa;
		$result = $database->doUpdate('pessoas_contatos', $query, 'Chave = '.$Chave);

        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateEndereco($Chave, $Tipo, $Endereco, $Numero, $Complemento, $Cidade, $Cep, $UF, $bairro, $Cidade_Descricao, $pais, $Chave_Pessoa){
        $database = new Database();

        if ($Tipo == 0) {
            $query = "Tipo = 3";
            $result = $database->doUpdate('pessoas_enderecos', $query, 'Chave_Pessoa = '.$Chave_Pessoa." AND Tipo = 0");
        }

        $query = "Tipo = '" . $Tipo . "', Endereco = '".$Endereco."', Numero = '".$Numero."', Complemento = '".$Complemento."', Cidade = '".$Cidade."', Cep = '".$Cep."', UF = '".$UF."', bairro = '".$bairro."', Cidade_Descricao = '".$Cidade_Descricao."', pais = '".$pais."', Chave_Pessoa = " . $Chave_Pessoa;
		$result = $database->doUpdate('pessoas_enderecos', $query, 'Chave = '.$Chave);

        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateAnexo($chave, $fornecedor, $anexo, $portos, $servico, $vencimento, $preferencial, $portosDeletados){
        $database = new Database();

        foreach ($portos as $porto) {
            $itemExists = $database->doSelect('fornecedor_anexos', "fornecedor_anexos.chave", "porto = '$porto' AND fornecedor = '$fornecedor'");

            if ($itemExists[0]) {
                $query = "fornecedor = '" . $fornecedor . "', porto = '" . $porto . "', servico = '".$servico."', vencimento = '$vencimento', email_enviado = 0, preferencial = $preferencial";
                
                if ($anexo) {
                    $query .= ", anexo = '$anexo'";
                }
                
                $result = $database->doUpdate('fornecedor_anexos', $query, 'chave = '.$chave);
            } else {

                if ($anexo) {   
                    $values = "'$fornecedor', '$porto', '$servico', '$anexo', '$vencimento', $preferencial";
                } else {
                    $brotherValue = $database->doSelect('fornecedor_anexos','fornecedor_anexos.anexo', "vencimento = '$vencimento' AND servico = '$servico' AND fornecedor = '$fornecedor'");
                    if ($brotherValue[0]) {
                        $values = "'$fornecedor', '$porto', '$servico', '".$brotherValue[0]["anexo"]."', '$vencimento', $preferencial";
                    } else {
                        $values = "'$fornecedor', '$porto', '$servico', '', '$vencimento', $preferencial";
                    }
                }


                $cols = "fornecedor, porto, servico, anexo, vencimento, preferencial";

                $result = $database->doInsert('fornecedor_anexos', $cols, $values);
            }
        }

        foreach ($portosDeletados as $porto) {
            $database->doDelete('fornecedor_anexos', "porto = '$porto' AND fornecedor = '$fornecedor' AND servico = '$servico' AND vencimento = '$vencimento'");
        }


        $database->closeConection();
        if($result == NULL){
            return 'false';
        } else {
            return $result;
        }
    }

    public static function deletePessoa($chave){
        $database = new Database();
    
        $result = $database->doDelete('pessoas', 'Chave = '.$chave);
        $result = $database->doDelete('pessoas_contatos', 'Chave_Pessoa = '.$chave);
        $result = $database->doDelete('pessoas_enderecos', 'Chave_Pessoa = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteContato($chave){
        $database = new Database();
    
        $result = $database->doDelete('pessoas_contatos', 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteEndereco($chave){
        $database = new Database();
    
        $result = $database->doDelete('pessoas_enderecos', 'Chave = '.$chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteAnexo($chave){
        $database = new Database();
    
        $result = $database->doDelete('fornecedor_anexos', 'chave = '.$chave);
        $database->closeConection();
        return $result;
    }
}
