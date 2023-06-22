<?php

include_once "Database.php";

class Taxas
{
    private $database;

    public function __construct()
    {
    }

    public static function getServicos()
    {
        $database = new Database();

        $result = $database->doSelect('os_servicos_itens', '*', '1 = 1 ORDER BY data DESC LIMIT 50');
        $database->closeConection();
        return $result;
    }

    public static function getSubgrupos()
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_subgrupos_taxas',
            'os_subgrupos_taxas.*, 
            os_grupos_taxas.descricao AS grupo',
            '1 = 1',
            'INNER JOIN os_grupos_taxas ON os_grupos_taxas.chave = os_subgrupos_taxas.chave_grupo'
        );
        $database->closeConection();
        return $result;
    }

    public static function getGrupos()
    {
        $database = new Database();

        $result = $database->doSelect('os_grupos_taxas', 'os_grupos_taxas.*');
        $database->closeConection();
        return $result;
    }


    public static function getMoedas()
    {
        $database = new Database();

        $result = $database->doSelect('moedas', 'moedas.*');
        $database->closeConection();
        return $result;
    }

    public static function getTaxas()
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_taxas',
            'os_taxas.*, 
                os_subgrupos_taxas.descricao AS subgrupo, 
                moedas.sigla AS moeda_sigla,
                planocontas.Descricao AS contaContabilNome,
                historicos.Descricao AS historicoPadraoNome',
            '1 = 1',
            'LEFT JOIN os_subgrupos_taxas ON os_subgrupos_taxas.chave = os_taxas.sub_grupo 
            LEFT JOIN moedas ON moedas.Chave = os_taxas.Moeda
            LEFT JOIN planocontas ON os_taxas.Conta_Contabil = planocontas.chave
            LEFT JOIN historicos ON os_taxas.historico_padrao = historicos.Chave'
        );
        $database->closeConection();
        return $result;
    }

    public static function getTaxa($chave)
    {
        $database = new Database();

        $result = $database->doSelect(
            'os_taxas',
            'os_taxas.*',
            "chave = '$chave'"
        );
        $database->closeConection();
        return $result;
    }

    public static function getHistoricos()
    {
        $database = new Database();

        $result = $database->doSelect('historicos', 'historicos.*');
        $database->closeConection();
        return $result;
    }

    public static function getDescricoesPadrao()
    {
        $database = new Database();

        $result = $database->doSelect('os_descricao_padrao', 'os_descricao_padrao.*');
        $database->closeConection();
        return $result;
    }

    public static function getTaxasPortos($taxa)
    {
        $database = new Database();

        $result = $database->doSelect('os_taxas_portos', 'os_taxas_portos.*', "taxa = $taxa");
        $database->closeConection();
        return $result;
    }

    public static function getCamposSubgrupos($subgrupo)
    {
        $database = new Database();

        $result = $database->doSelect('os_subgrupos_taxas_campos', 'os_subgrupos_taxas_campos.*', "subgrupo = '$subgrupo'");
        $database->closeConection();
        return $result;
    }

    public static function getCamposFromTaxa($taxa)
    {
        $database = new Database();

        $result = $database->doSelect('os_subgrupos_taxas_campos LEFT JOIN os_subgrupos_taxas ON os_subgrupos_taxas.chave = os_subgrupos_taxas_campos.subgrupo LEFT JOIN os_taxas ON os_taxas.sub_grupo = os_subgrupos_taxas.chave', 'os_subgrupos_taxas_campos.*', "os_taxas.chave = '$taxa'");
        $database->closeConection();
        return $result;
    }

    public static function getMaxService()
    {
        $database = new Database();

        $result = $database->loadMax('services');
        $database->closeConection();
        return $result;
    }

    public static function insertSubgrupo($values)
    {
        $database = new Database();

        $cols = 'descricao, chave_grupo';

        $result = $database->doInsert('os_subgrupos_taxas', $cols, $values);

        $chave = $result[0]['chave'];
        if (strlen($chave) == 1) {
            $codigo = "00" . $chave;
        } else if (strlen($chave) == 2) {
            $codigo = "0" . $chave;
        } else {
            $codigo = $chave;
        }

        $database->doUpdate('os_subgrupos_taxas', "codigo = '" . $codigo . "'", "chave = '" . $chave . "'");

        $database->closeConection();
        return $result;
    }

    public static function insertGrupo($values)
    {
        $database = new Database();

        $cols = 'descricao';

        $result = $database->doInsert('os_grupos_taxas', $cols, $values);

        $chave = $result[0]['chave'];
        if (strlen($chave) == 1) {
            $codigo = "0" . $chave;
        } else {
            $codigo = $chave;
        }

        $database->doUpdate('os_grupos_taxas', "codigo = '" . $codigo . "'", "chave = '" . $chave . "'");

        $database->closeConection();
        return $result;
    }

    public static function insertSubgrupoBasico($values)
    {
        $database = new Database();

        $cols = 'descricao, chave_grupo';

        $result = $database->doInsert('os_subgrupos_taxas', $cols, $values);

        $result = $database->doSelect('os_subgrupos_taxas', 'os_subgrupos_taxas.*', '1=1 ORDER BY chave DESC');
        $database->closeConection();
        return $result;
    }

    public static function insertSubgrupoCampos($values, $subgrupo)
    {
        $database = new Database();

        $cols = 'nome, tipo, obrigatorio, subgrupo';

        foreach ($values as $key => $value) {
            $insert = "'" . $value->{"nome"} . "', '" . $value->{"tipo"} . "', '" . $value->{"obrigatorio"} . "', '$subgrupo'";

            $database->doInsert('os_subgrupos_taxas_campos', $cols, $insert);
        }

        $database->closeConection();
        return true;
    }

    public static function insertCamposCopiados($campos, $subgrupos)
    {
        $database = new Database();
        $cols = "nome, tipo, obrigatorio, subgrupo";

        foreach ($subgrupos as $key => $subgrupo) {
            foreach ($campos as $key => $campo) {
                $checkCampo = $database->doSelect('os_subgrupos_taxas_campos', 'os_subgrupos_taxas_campos.*', 
                    "subgrupo = $subgrupo AND nome = '".$campo->{"nome"}."'"
                );
                
                if (!$checkCampo[0]) {
                    $values = "'".$campo->{"nome"}."', '".$campo->{"tipo"}."', ".$campo->{"obrigatorio"}.", $subgrupo";

                    $database->doInsert('os_subgrupos_taxas_campos', $cols, $values);
                }
            }
        }

        $database->closeConection();
        return true;
    }

    public static function insertMoeda($values, $values2, $search)
    {
        $database = new Database();

        $chave = $database->doSelect('moedas', 'Codigo', "1 = 1 ORDER BY Codigo DESC Limit 1");
        $chave[0]['Codigo'] = ((int)($chave[0]['Codigo']) + 1);
        $values = "'" . $chave[0]['Codigo'] . "', " . $values;


        $cols = 'Codigo, Descricao, Sigla, plural, Ultima_Cotacao';
        $result = $database->doInsert('moedas', $cols, $values);

        $chave2 = $database->doSelect('moedas', 'Chave', $search);
        $cols2 = 'Codigo, Data, Valor';
        $values2 = "'" . $chave2[0]['Chave'] . "', " . $values2;
        $database->doInsert('moedas_cotacoes', $cols2, $values2);

        $database->closeConection();
        return $result;
    }

    public static function insertTaxa($values)
    {
        $database = new Database();

        $cols = 'descricao, valor, variavel, Moeda, Tipo, Conta_Contabil, historico_padrao, formula_ate, sub_grupo';

        $result = $database->doInsert('os_taxas', $cols, $values);
        $database->closeConection();
        return $result;
    }

    public static function insertHistorico($values)
    {
        $database = new Database();

        $cols = 'Descricao';

        $result = $database->doInsert('historicos', $cols, $values);

        $result = $database->doSelect('historicos', 'historicos.*', '1=1 ORDER BY chave DESC LIMIT 1');

        $database->closeConection();
        return $result;
    }

    public static function insertDescricaoPadrao($values)
    {
        $database = new Database();

        $cols = 'Descricao';

        $result = $database->doInsert('os_descricao_padrao', $cols, $values);

        $result = $database->doSelect('os_descricao_padrao', 'os_descricao_padrao.*', '1=1 ORDER BY chave DESC LIMIT 1');

        $database->closeConection();
        return $result;
    }

    public static function updateService($id_service, $titulo, $link, $inativo)
    {
        $database = new Database();

        $query = "titulo = '" . $titulo . "', link = '" . $link . "', inativo = " . $inativo;
        $result = $database->doUpdate('services', $query, 'id= ' . $id_service);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateSubgrupo($chave, $descricao, $grupo)
    {
        $database = new Database();

        $query = "descricao = '" . $descricao . "', chave_grupo = '" . $grupo . "'";
        $result = $database->doUpdate('os_subgrupos_taxas', $query, 'chave= ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateSubgrupoCampos($values, $subgrupo)
    {
        $database = new Database();
        $usedKeys = [];

        foreach ($values as $key => $value) {
            array_push($usedKeys, $value->{"chave"});

            $query = "nome = '" . $value->{"nome"} . "', tipo = '" . $value->{"tipo"} . "', obrigatorio = '" . $value->{"obrigatorio"} . "', subgrupo = '" . $subgrupo . "'";
            $database->doUpdate('os_subgrupos_taxas_campos', $query, 'chave = ' . $value->{"chave"});
        }

        if ($usedKeys[0]) {
            $database->doDelete("os_subgrupos_taxas_campos", "chave NOT IN (" . join(",", $usedKeys) . ") AND subgrupo = '$subgrupo'");
        } else {
            $database->doDelete("os_subgrupos_taxas_campos", "subgrupo = '$subgrupo'");
        }

        $database->closeConection();
        return true;
    }

    public static function updateGrupo($chave, $descricao)
    {
        $database = new Database();

        $query = "descricao = '" . $descricao . "'";
        $result = $database->doUpdate('os_grupos_taxas', $query, 'chave= ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateMoeda($chave, $Descricao, $Sigla, $plural, $Ultima_Cotacao, $data)
    {
        $database = new Database();

        $result = $database->doSelect('moedas_cotacoes', 'moedas_cotacoes.*', "Codigo = '" . $chave . "' AND Data = '" . $data . "'");

        if ($result) {
            $query = "Valor = '" . $Ultima_Cotacao . "'";
            $result = $database->doUpdate('moedas_cotacoes', $query, "Codigo = '" . $chave . "' AND Data = '" . $data . "'");
        } else {
            $values = "'" . $chave . "', '" . $data . "', '" . $Ultima_Cotacao . "'";
            $cols = "Codigo, Data, Valor";
            $result = $database->doInsert('moedas_cotacoes', $cols, $values);
        }


        if ($result == NULL) {
            $database->closeConection();

            return 'false';
        } else {
            $query = "Descricao = '" . $Descricao . "', Sigla = '" . $Sigla . "', plural = '" . $plural . "', Ultima_Cotacao = '" . $Ultima_Cotacao . "'";
            $result = $database->doUpdate('moedas', $query, 'Chave= ' . $chave);

            $database->closeConection();
            return $result;
        }
    }

    public static function updateTaxa($chave, $descricao, $valor, $variavel, $Moeda, $Tipo, $Conta_Contabil, $historico_padrao, $formula_ate, $sub_grupo)
    {
        $database = new Database();

        $query = "descricao = '" . $descricao . "', valor = '" . $valor . "', variavel = '" . $variavel . "', Moeda = '" . $Moeda . "', Tipo = '" . $Tipo . "', Conta_Contabil = '" . $Conta_Contabil . "', historico_padrao = '" . $historico_padrao . "', formula_ate = '" . $formula_ate . "', sub_grupo = '" . $sub_grupo . "'";
        $result = $database->doUpdate('os_taxas', $query, 'chave= ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateHistorico($chave, $descricao)
    {
        $database = new Database();

        $query = "Descricao = '" . $descricao . "'";
        $result = $database->doUpdate('historicos', $query, 'chave= ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function updateDescricaoPadrao($chave, $descricao)
    {
        $database = new Database();

        $query = "Descricao = '" . $descricao . "'";
        $result = $database->doUpdate('os_descricao_padrao', $query, 'chave= ' . $chave);
        $database->closeConection();
        if ($result == NULL) {
            return 'false';
        } else {
            return $result;
        }
    }

    public static function setTaxasPortos($taxa, $chaves, $portos, $contas, $contas_est)
    {
        $database = new Database();

        if (count($chaves) != count($portos) || count($portos) != count($contas)) {
            return count($contas);
        }
        $result = "";

        for ($i = 0; $i < count($chaves); $i++) {
            if ($chaves[$i] == 0) {
                $values = "'$taxa', '" . $portos[$i] . "', '" . $contas[$i] . "', '" . $contas_est[$i] . "'";
                $cols = "taxa, porto, conta, conta_estrangeira";

                $result = $database->doInsert("os_taxas_portos", $cols, $values);
            } else {
                $query = "taxa = '$taxa', porto = '" . $portos[$i] . "', conta = '" . $contas[$i] . "', conta_estrangeira = '" . $contas_est[$i] . "'";

                $result = $database->doUpdate('os_taxas_portos', $query, 'chave = ' . $chaves[$i]);
            }
        }

        return $result;
    }

    public static function deleteSubgrupo($chave)
    {
        $database = new Database();

        $result = $database->doDelete('os_subgrupos_taxas', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteGrupo($chave)
    {
        $database = new Database();

        $result = $database->doDelete('os_grupos_taxas', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteMoeda($chave)
    {
        $database = new Database();

        $result = $database->doDelete('moedas', 'Chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteTaxa($chave)
    {
        $database = new Database();

        $result = $database->doDelete('os_taxas', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteHistorico($chave)
    {
        $database = new Database();

        $result = $database->doDelete('historicos', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }

    public static function deleteDescricaoPadrao($chave)
    {
        $database = new Database();

        $result = $database->doDelete('os_descricao_padrao', 'chave = ' . $chave);
        $database->closeConection();
        return $result;
    }
}
