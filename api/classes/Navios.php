<?php
include_once "Database.php";

class Navios
{
    private $database;

    public function __construct()
    {
    }

    public static function getNavios()
    {
        $database = new Database();

        $result = $database->doSelect('os_navios', 'os_navios.*', '1 = 1');


        $database->closeConection();
        return $result;
    }

    public static function getNavio($chave)
    {
        $database = new Database();

        $result = $database->doSelect('os_navios', 'os_navios.*', 'chave = ' . $chave);


        $database->closeConection();
        return $result;
    }

    public static function getCloseToReal($codigo)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os 
        left join os_servicos_itens on os.chave=os_servicos_itens.chave_os
        left join os_taxas on os_servicos_itens.taxa=os_taxas.chave
        left join os_tipos_servicos on os.tipo_servico=os_tipos_servicos.chave
        left join os_navios on os.chave_navio=os_navios.chave
        left join os_subgrupos_taxas on os_taxas.sub_grupo = os_subgrupos_taxas.chave
        left join os_portos on os.porto = os_portos.chave
        left join pessoas on os.chave_cliente = pessoas.chave
        left join pessoas_enderecos on pessoas.chave = pessoas_enderecos.chave_pessoa AND pessoas_enderecos.tipo = 0
        left join estados ON pessoas_enderecos.uf = estados.chave
        left join paises ON pessoas_enderecos.pais = paises.chave',

            'os.chave,
            os.bankCharges,
            os.governmentTaxes,
            os.centro_custo,
            os.cabecalho,
            os.roe,
            os.codigo,
            os.encerradoPor,
            os_navios.nome as nomeNavio,
            os_navios.bandeira AS bandeira,
            os_portos.descricao as nomePorto,
            pessoas.nome_fantasia AS cliente,

            os.eta AS data_chegada,
            os.data_saida,
            os.data_faturamento,
            os_taxas.descricao as descTaxa,
            os_taxas.chave as chavTaxa,
            os_subgrupos_taxas.descricao as descSubgrupo,
            os_servicos_itens.descricao as descos,
            os_servicos_itens.valor,
            os_servicos_itens.moeda,
            os_servicos_itens.tipo_sub AS tipo,
            pessoas_enderecos.endereco AS rua,
            pessoas_enderecos.numero AS numero,
            pessoas_enderecos.cidade_descricao AS cidade,
            pessoas_enderecos.cep AS cep,
            estados.codigo AS estado,
            paises.nome AS pais,
            pessoas_enderecos.complemento AS complemento',

            "os.codigo = '" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0 AND (((os_servicos_itens.tipo_sub = 0 OR os_servicos_itens.tipo_sub = 1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.fornecedor_custeio != 0)) OR (os_servicos_itens.tipo_sub = 2 OR os_servicos_itens.tipo_sub = 3))
            ORDER BY os_servicos_itens.ordem ASC"
/*            "(os_taxas.tipo='R' OR os_servicos_itens.repasse= 1 OR (os_servicos_itens.fornecedor_custeio != '0' AND os_servicos_itens.fornecedor_custeio != '')) AND os.codigo = '" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0
            ORDER BY os_servicos_itens.ordem ASC"*/
        );


        $database->closeConection();
        return $result;
    }

    public static function getCapaVoucher($codigo)
    {
        $database = new Database();

        $result = $database->doSelect(
            "os 
        left join os_servicos_itens on os.chave=os_servicos_itens.chave_os
        left join os_taxas on os_servicos_itens.taxa=os_taxas.chave
        left join os_subgrupos_taxas on os_taxas.sub_grupo = os_subgrupos_taxas.chave
        left join os_grupos_taxas on os_subgrupos_taxas.chave_grupo = os_grupos_taxas.chave
        left join os_tipos_servicos on os.tipo_servico=os_tipos_servicos.chave
        left join os_navios on os.chave_navio=os_navios.chave
        left join os_portos on os.porto = os_portos.chave
        left join pessoas on os.chave_cliente = pessoas.chave
        left join pessoas_contatos as pessoas_bk on pessoas_bk.chave_pessoa = pessoas.chave AND pessoas_bk.tipo = 'BK'
        left join pessoas_contatos as pessoas_gt on pessoas_gt.chave_pessoa = pessoas.chave AND pessoas_gt.tipo = 'GT'
        left join pessoas_enderecos on pessoas.chave = pessoas_enderecos.chave_pessoa AND pessoas_enderecos.tipo = 0
        left join estados ON pessoas_enderecos.uf = estados.chave
        left join paises ON pessoas_enderecos.pais = paises.chave",

            'os.chave,
            os.roe,
            os.cabecalho,
            os.codigo,
            os.faturadoPor,
            os.encerradoPor,
            os.governmentTaxes,
            os.bankCharges,
            pessoas_bk.campo1 as BK,
            pessoas_gt.campo1 AS GT,
            os_navios.nome as nomeNavio,
            os_portos.descricao as nomePorto,
            pessoas.nome_fantasia AS cliente,
            os.eta AS data_chegada,
            os.data_saida,
            os.data_faturamento,
            os_taxas.descricao as descTaxa,
            os_subgrupos_taxas.codigo as chavTaxa,
            os_subgrupos_taxas.descricao as descSubgrupo,
            os_grupos_taxas.descricao as descGrupo,
            os_servicos_itens.descricao as descos,
            os_servicos_itens.valor as valor,
            os_servicos_itens.moeda,
            os_servicos_itens.tipo_sub AS tipo,
            os_servicos_itens.repasse AS repasse,
            os_servicos_itens.Fornecedor_Custeio AS fornecedorCusteio,
            pessoas_enderecos.endereco AS rua,
            pessoas_enderecos.numero AS numero,
            pessoas_enderecos.cidade_descricao AS cidade,
            pessoas_enderecos.cep AS cep,
            estados.codigo AS estado,
            paises.nome AS pais,
            pessoas_enderecos.complemento AS complemento',

            "os.codigo = '" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0 && (os_servicos_itens.tipo_sub = 2 || os_servicos_itens.tipo_sub = 3 || (os_servicos_itens.repasse = 1 || os_servicos_itens.Fornecedor_Custeio != '')) GROUP BY os_servicos_itens.chave ORDER BY os_subgrupos_taxas.codigo ASC LIMIT 100"
    );


        $database->closeConection();
        return $result;
    }

    public static function relatorioVoucher($codigo)
    {
        $database = new Database();

        $result['itens'] = $database->doSelect(
            "os
        left join os_servicos_itens on os.chave = os_servicos_itens.chave_os
        left join os_taxas on os_servicos_itens.taxa = os_taxas.chave
        left join os_subgrupos_taxas on os_taxas.sub_grupo = os_subgrupos_taxas.chave
        left join os_grupos_taxas on os_subgrupos_taxas.chave_grupo = os_grupos_taxas.chave
        left join os_navios on os_navios.chave = os.chave_navio
        left join os_portos on os_portos.chave = os.porto
        left join pessoas as clientes on clientes.chave = os.chave_cliente
        left join pessoas on pessoas.chave = os_servicos_itens.fornecedor_custeio
        left join pessoas as fornecedores on fornecedores.chave = os_servicos_itens.fornecedor
        left join pessoas_enderecos on clientes.chave = pessoas_enderecos.chave_pessoa
        left join moedas on moedas.chave=os_servicos_itens.moeda",
            "os_taxas.tipo as tipo_op, 
        pessoas_enderecos.pais, 
        os_taxas.sub_grupo as codsubgrupo_taxas,
        os_subgrupos_taxas.codigo as codsubgrupo,
        os_servicos_itens.tipo_sub as codsubit, 
        os_grupos_taxas.codigo, 
        os.*,
        os_servicos_itens.chave as chsub,
        pessoas.nome as fornecedor_custeio, 
        fornecedores.nome as fornecedor,
        os_servicos_itens.descricao as descricao_item, 
        os_servicos_itens.valor as valor_item, 
        os_servicos_itens.moeda as moeda_item,
        os_servicos_itens.repasse as repasse, 
        os_servicos_itens.fornecedor_custeio as chavefornecedor,
        os_grupos_taxas.descricao as grupos, 
        os_subgrupos_taxas.descricao as subgrupos, 
        clientes.nome as company,
        pessoas_enderecos.endereco as address, 
        os_portos.descricao as name_of_port,
        os_navios.nome as vessel_name",
            "os.codigo='" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0 AND (os_servicos_itens.tipo_sub = 0 OR os_servicos_itens.tipo_sub = 1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') GROUP BY os_servicos_itens.chave ORDER BY os_servicos_itens.ordem ASC"
        );

        $result['chaves'] = $database->doSelect(
            "os
        left join os_servicos_itens on os.chave = os_servicos_itens.chave_os
        left join os_taxas on os_servicos_itens.taxa = os_taxas.chave
        left join os_subgrupos_taxas on os_taxas.sub_grupo = os_subgrupos_taxas.chave
        left join os_grupos_taxas on os_subgrupos_taxas.chave_grupo = os_grupos_taxas.chave
        left join os_navios on os_navios.chave = os.chave_navio
        left join os_portos on os_portos.chave = os.porto
        left join pessoas as clientes on clientes.chave = os.chave_cliente
        left join pessoas on pessoas.chave = os_servicos_itens.fornecedor_custeio
        left join pessoas as fornecedores on fornecedores.chave = os_servicos_itens.fornecedor
        left join pessoas_enderecos on clientes.chave = pessoas_enderecos.chave_pessoa
        left join moedas on moedas.chave=os_servicos_itens.moeda",
            "os_taxas.tipo as tipo_op, 
            pessoas_enderecos.pais, 
            os_taxas.sub_grupo as codsubgrupo_taxas,
            os_subgrupos_taxas.codigo as codsubgrupo,
            os_servicos_itens.tipo_sub as codsubit, 
            os_grupos_taxas.codigo, 
            os.*,
            os_servicos_itens.chave as chsub,
            pessoas.nome as fornecedor_custeio, 
            fornecedores.nome as fornecedor,
            os_servicos_itens.descricao as descricao_item, 
            os_servicos_itens.valor as valor_item, 
            os_servicos_itens.moeda as moeda_item,
            os_servicos_itens.repasse as repasse, 
            os_servicos_itens.fornecedor_custeio as chavefornecedor,
            os_grupos_taxas.descricao as grupos, 
            os_subgrupos_taxas.descricao as subgrupos, 
            clientes.nome as company,
            pessoas_enderecos.endereco as address, 
            os_portos.descricao as name_of_port,
            os_navios.nome as vessel_name",
            "os.codigo='" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0 AND (os_servicos_itens.tipo_sub = 0 OR os_servicos_itens.tipo_sub = 1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.Fornecedor_Custeio != '') GROUP BY os_subgrupos_taxas.chave ORDER BY os_servicos_itens.ordem ASC"
        );

        $result['campos'] = $database->doSelect("os
        left join os_servicos_itens as eventos on os.chave = eventos.chave_os
        left join os_servicos_itens_complementar as complementos ON eventos.chave = complementos.evento
        left join os_subgrupos_taxas_campos as campos ON complementos.subgrupo_campo = campos.chave",
        "eventos.chave as chaveEvento,
        complementos.valor as complemento,
        campos.nome as campo,
        campos.tipo as tipoCampo,
        campos.subgrupo as chaveSubgrupo",
            "os.codigo='" . $codigo . "' AND complementos.valor IS NOT NULL AND os.cancelada = 0 AND eventos.cancelada = 0 AND (eventos.tipo_sub = 0 OR eventos.tipo_sub = 1) AND (eventos.repasse = 1 OR eventos.Fornecedor_Custeio != '') ORDER BY eventos.ordem ASC");

        $database->closeConection();
        return $result;
    }

    public static function faturamentoCusteio($codigo)
    {
        $database = new Database();

        $result = $database->doSelect(
            "os
        left join os_servicos_itens on os.chave = os_servicos_itens.chave_os
        left join os_navios on os_navios.chave = os.chave_navio
        left join pessoas on os_servicos_itens.Fornecedor_Custeio = pessoas.chave
        left join pessoas_enderecos on pessoas_enderecos.Chave_Pessoa = pessoas.Chave AND tipo = 0
        left join os_taxas_portos on os_taxas_portos.taxa = os_servicos_itens.taxa AND os_taxas_portos.porto = os.porto
        left join planocontas on planocontas.chave = os_taxas_portos.conta
        left join planocontas AS planocontas_estrangeiras ON planocontas_estrangeiras.chave = os_taxas_portos.conta_estrangeira
        left join moedas on moedas.chave=os_servicos_itens.moeda",
            "os.*,
            os_servicos_itens.descricao as evento, 
            planocontas.Descricao as contaNome, 
            planocontas.Codigo_Red as contaCod, 
            planocontas_estrangeiras.Descricao as contaEstrangeiraNome, 
            planocontas_estrangeiras.Codigo_Red as contaEstrangeiraCod, 
            os_servicos_itens.valor as valor_cobrar, 
            os_servicos_itens.valor1 as valor_pago, 
            os_servicos_itens.repasse as repasse, 
            os_servicos_itens.moeda as moeda, 
            pessoas.nome as fornecedor_custeio, 
            pessoas.chave as fornecedor_custeioCodigo, 
            pessoas_enderecos.uf AS UF,
            os_navios.nome as nome_navio",
            "os.codigo='" . $codigo . "' AND os.cancelada = 0 AND os_servicos_itens.cancelada = 0 AND (os_servicos_itens.tipo_sub = 0 OR os_servicos_itens.tipo_sub = 1) AND (os_servicos_itens.repasse = 1 OR os_servicos_itens.fornecedor_custeio != 0) ORDER BY os_servicos_itens.ordem ASC"
        );

        $database->closeConection();
        return $result;
    }

    public static function deleteNavio($id_ship)
    {
        $database = new Database();

        $result = $database->doDelete('os_navios', 'chave = ' . $id_ship);
        $database->closeConection();
        return $result;
    }

    public static function insertNavio($values)
    {
        $database = new Database();

        $cols = 'nome, bandeira, imo';

        $result = $database->doInsert('os_navios', $cols, $values);

        $database->closeConection();
        return $result;
    }

    public static function insertNavioBasico($values)
    {
        $database = new Database();

        $cols = 'nome, bandeira, imo';

        $result = $database->doInsert('os_navios', $cols, $values);

        $result = $database->doSelect('os_navios', 'os_navios.*', '1=1 ORDER BY chave DESC');

        $database->closeConection();
        return $result;
    }

    public static function updateNavio($chave, $nome, $bandeira, $imo)
    {
        $database = new Database();
        $query = "nome = '" . $nome . "', bandeira = '" . $bandeira . "', imo = '" . $imo . "'";

        $result = $database->doUpdate('os_navios', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateNavioBasico($chave, $nome, $bandeira)
    {
        $database = new Database();
        $query = "nome = '" . $nome . "', bandeira = '" . $bandeira . "'";

        $result = $database->doUpdate('os_navios', $query, 'chave = ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }
}
