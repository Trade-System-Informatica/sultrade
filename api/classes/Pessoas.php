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

    public static function insertPessoa($values) {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao';
    
        $result = $database->doInsert('pessoas', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertPessoaBasico($values) {
        $database = new Database();

        $cols = 'Nome, Nome_Fantasia, Cnpj_Cpf, Rg_Ie, Nascimento_Abertura, Inclusao, Categoria, Conta_Contabil, Conta_Provisao';
    
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

	public static function updatePessoa($Chave, $Nome, $Nome_Fantasia, $Cnpj_Cpf, $Rg_Ie, $Nascimento_Abertura, $Inclusao, $Categoria, $Conta_Contabil, $Conta_Provisao){
        $database = new Database();

        $query = "Nome = '" . $Nome . "', Nome_Fantasia = '" . $Nome_Fantasia . "', Cnpj_Cpf = '" . $Cnpj_Cpf . "', Rg_Ie = '".$Rg_Ie."', Nascimento_Abertura = '".$Nascimento_Abertura."', Inclusao = '".$Inclusao."', Categoria = '".$Categoria."', Conta_Contabil = '".$Conta_Contabil."', Conta_Provisao = '".$Conta_Provisao."'";
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

    public static function deletePessoa($chave){
        $database = new Database();
    
        $result = $database->doDelete('pessoas', 'Chave = '.$chave);
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

}
?>