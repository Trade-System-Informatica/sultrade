<?php
include_once "Database.php";    

class NotaFiscal {
    private $database;

    public function __construct(){
        
    }

    public static function getNotaFiscal($chave){
        $database = new Database();

        $result = $database->doSelect("faturas 
        LEFT JOIN controle ON controle.chave = faturas.empresa
        LEFT JOIN pessoas ON faturas.cliente = pessoas.chave
        LEFT JOIN pessoas_contatos AS pessoas_fone ON pessoas_fone.chave_pessoa = pessoas.chave AND (pessoas_fone.tipo = 'F1' OR pessoas_fone.tipo = 'F2' OR pessoas_fone.tipo = 'CE')
        LEFT JOIN pessoas_contatos AS pessoas_email ON pessoas_email.chave_pessoa = pessoas.chave AND pessoas_email.tipo = 'EM'
        LEFT JOIN pessoas_contatos AS pessoas_IM ON pessoas_IM.chave_pessoa = pessoas.chave AND pessoas_IM.tipo = 'IM'
        LEFT JOIN pessoas_enderecos ON pessoas_enderecos.chave_pessoa = pessoas.chave AND pessoas_enderecos.tipo = 0
        LEFT JOIN cidades ON cidades.Chave = pessoas_enderecos.Cidade",
                                      "faturas.discriminacaoservico AS descricaoNF, 
                                      faturas.chave AS id_sis_legado,
                                      faturas.vencto AS vencimento,
                                      faturas.emissao AS emissao,
                                      faturas.Fatura AS nota,
                                      pessoas.cnpj_cpf AS tomador_cnpj, 
                                      pessoas_email.campo1 AS tomador_email,
                                      pessoas.nome AS tomador_razao,
                                      pessoas.nome_fantasia AS tomador_fantasia,
                                      pessoas.Inscricao_Municipal AS tomador_im,
                                      pessoas_enderecos.endereco AS tomador_endereco,
                                      pessoas_enderecos.numero AS tomador_numero,
                                      pessoas_enderecos.complemento AS tomador_complemento,
                                      pessoas_enderecos.bairro AS tomador_bairro,
                                      pessoas_enderecos.cep AS tomador_CEP,
                                      cidades.Codigo_Ibge AS tomador_cod_cidade,
                                      GROUP_CONCAT(pessoas_fone.campo1 SEPARATOR '@.@') AS tomador_fone,
                                      controle.im AS im,
                                      controle.senha_sigss AS senha,
                                      controle.aliq_simples AS aliquota_simples,
                                      controle.crc AS crc,
                                      controle.crc_estado AS crc_estado,
                                      controle.cnpj AS cnpj,
                                      faturas.atividade AS servico, 
                                      faturas.valor AS valor,
                                      faturas.valor AS base
                                      ",
                                       "faturas.chave= '".$chave."'"
                                    );
        $database->closeConection();
        return $result;

    }

    public static function getControle($empresa){
        $database = new Database();

        $result = $database->doSelect("controle.*,
        pessoas.codigo as codigo_contador,
        cidades.codigo_ibge,
        estados.codigo_ibge as codestado",
                                      "controle 
                                      inner join cidades on controle.cod_cidade=cidades.chave 
                                      inner join estados on cidades.estado=estados.chave  
                                      left join pessoas on contador=pessoas.chave",
                                       "empresa='".$empresa."'"
                                    );
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
