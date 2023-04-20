<?php

ini_set('display_errors',1);
ini_set('display_startup_erros',1);
error_reporting(E_ALL);
header ( 'Access-Control-Allow-Headers: Content-Type');
header ( 'Access-Control-Allow-Origin: *');
header ( 'Access-Control-Allow-Credentials: true');
header ( 'Access-Control-Allow-Methods: *');   
header ( 'Access-Control-Allow-Headers: *');
//header ( 'Content-type: application/json; charset=UTF-8' );
header ('Access-Control-Request-Headers: Content-Type');
// session_start();

//require '../../vendor/autoload.php';
//use Curl\Curl;

header ( 'Content-type: text/html; charset=ISO-8859-1' );
//header ( 'Content-type: text/html; charset=UTF-8' );
require "../../config.php";
$NOME_IMPRESSORA = "reservaandroid";

//"SIACDROID" = ""SIACDROID"";
$p_db = $_POST ['db'];
$p_host = $_POST ['host'];
$p_user = $_POST ['user'];
$p_pw = $_POST ['pw'];

 //Config::$database = $p_db ? $p_db : "dbweb";
 //Config::$db_host = $p_host ? $p_host : "server";
 //Config::$db_user = $p_user ? $p_user : "webtrade";
 //Config::$db_password = $p_pw ? $p_pw : "T3760S";
// Config::$defaultApp = "droid";

Config::$database = $p_db ? $p_db : "dbtachar";
Config::$db_host = $p_host ? $p_host : "127.0.0.1";
Config::$db_user = $p_user ? $p_user : "webtrade";
Config::$db_password = $p_pw ? $p_pw : "T3760S";
Config::$defaultApp = "droid";

Config::setParam("grupos_excuidos", array(35,36,37));

$empresaPadrao = Config::$empresa_padrao;
echo 'EMpresa padrao: ' . $empresaPadrao;

Import::Components ( "*" );
Import::classe ( "movimentacao" );
Import::classe ( "produto" );
Import::classe ( "estoque" );
Import::classe ( "movimentacao_itens" );
Import::classe ( "operador" );
Import::classe ( "controle" );
Import::classe ( "codigo" );
Import::classe ("model");
Import::classe ("kardex");
Import::classe ( "palm_config" );
Import::Classe ( "natureza" );
Import::Classe ( "formulario" );
Import::Classe ( "condicao" );
Import::classe ( "contas_em_aberto" );
Import::classe ("grupo");


ini_set('memory_limit', '-1');
	

Router::loadParams ();
Config::start ();

function configHeaders(){
	return $configApi['headers'] = ([
		'Accept' => 'application/json',
		'Content-Type' => 'multipart/form-data; boundary=' . $delimiter,
		'Content-Length', strlen($data)
	]);
}

/**** 01 ****/
function sendImagesToEndpoint($productID, $fileUrl){
	
	$boundary = uniqid();
	$delimiter = '-------------' . $boundary;
	$data = buildFiles($boundary, $fileUrl);

	$configApi['headers'] = ([
		'Accept' => 'application/json',
		'Content-Type' => 'multipart/form-data; boundary=' . $delimiter,
		'Content-Length', strlen($data)
	]);

	$envio = postImagesWithName($productID, $data);
	debug($envio);
	die();
}

/**** 02 ****/
function buildFiles($boundary, $file){
	
	$data = '';
	$eol = "\r\n";
	$cont = 1;
	$delimiter = '-------------' . $boundary;
	$extension = explode('.', $file)[1];
	$content = file_get_contents($file);

	$filename = "image$cont.$extension";
	//die($filename);

	$data = '--' . $delimiter . $eol
		. 'Content-Disposition: form-data; name="' . 'images[]' . '"; filename="' . $filename . '"' . $eol
		. 'Content-Transfer-Encoding: binary' . $eol;
	$data .= $eol;
	$data .= $content . $eol;
	$data .= "--" . $delimiter . "--" . $eol;
	//print $data;
	//die();
	return $data;
}

/***** 03 ******/
function postImagesWithName($id, $dados){
	$endpoint = "https://api.plataformarocky.com.br/products";
	return executeRequest('POST', "$endpoint/$id/images", [CURLOPT_POSTFIELDS => $dados]);
}

/******* 04 *******/

function executeRequest($type, $endpoint, $options = []){
	try{
		//setRequest($type, $endpoint);
		$apirocky = "https://api.plataformarocky.com.br/products";
		$URI = $endpoint;
		$token = '411e26c41584f2cebf983e05efb2204f';
		$boundary = uniqid();
		$delimiter = '-------------' . $boundary;
		try{
			$curl = new Curl();
		}catch(Exception $e){
			throw new Exception("Falha ao instanciar Curl. $e");
		}
		$curl->setHeader('Authorization', 'Bearer '. trim($token));
		
		$curl->setHeader('Accept', 'application/json');		
		$curl->setHeader('Content-Type', 'multipart/form-data; boundary=' . $delimiter);
		$curl->setHeaders();
		$curl->setOpt(CURLOPT_CUSTOMREQUEST, $type);
		$curl->setUrl($URI);
		if(!empty($options)){
			//echo "aqui";
			//die();
			$curl->setOpts($options);
		}
		$response = $curl->exec();
		print_r($response);
		die();
		$curl->close();

		return !$response ? $curl->getCurlErrorMessage() : $response;
	}catch(Exception $e){
		throw new Exception("Falha ao executar a request. $e");
	}
}

/******* 05 ********/
function setRequest($type, $endpoint){
	$apirocky = "https://api.plataformarocky.com.br";
	$URI = $apirocky . $endpoint;
	$token = '411e26c41584f2cebf983e05efb2204f';
	try{
		$curl = new Curl();
	}catch(Exception $e){
		throw new Exception("Falha ao instanciar Curl. $e");
	}
	$curl->setHeader('Authorization', 'Bearer '. trim($token));
	$curl->setHeaders();
	$curl->setOpt(CURLOPT_CUSTOMREQUEST, $type);
	$curl->setUrl($URI);

}

/*********** Inicio do código  **************/

	$apirocky = "https://api.plataformarocky.com.br";

	/***** Criar a consulta e receber os dados ******/
	/*
	$consulta = TradeFunction::query("SELECT produtos.chave, produtos.peso, produtos.unid_med, if(not isnull(gp1.descricao_web ),gp1.descricao_web,gp1.descricao) as descgp1,if(not isnull(gp2.descricao_web ),gp2.descricao_web,gp2.descricao) as descgp2,
	produtos.codigo,produtos.descricao,produto_web,disp_it, produtos.preco_venda, produtos.preco_venda1, produtos.preco_atacado, produtos.obs
	FROM produtos
	INNER JOIN controle on controle.chave=$empresaPadrao
	INNER JOIN estoques on chave_produto=produtos.chave and estoques.competencia=controle.competencia and estoques.empresa = 14
	LEFT JOIN grupos as gp1 on gp1.chave=produtos.grupo1
	LEFT JOIN grupos as gp2 on gp2.chave=produtos.grupo2
	WHERE produto_web=1 and disp_it>0 and controle.chave=$empresaPadrao
	GROUP BY produtos.chave");
	*/
	$consulta = TradeFunction::query("SELECT produtos.chave, produtos.peso, produtos.unid_med, if(not isnull(gp1.descricao_web ),gp1.descricao_web,gp1.descricao) as descgp1,if(not isnull(gp2.descricao_web ),gp2.descricao_web,gp2.descricao) as descgp2,
	produtos.codigo,produtos.descricao, produtos.descricao_web, produto_web,disp_it, produtos.preco_venda, produtos.preco_venda1, produtos.preco_atacado, produtos.obs
	FROM produtos
	INNER JOIN controle on controle.chave=$empresaPadrao
	INNER JOIN estoques on chave_produto=produtos.chave and estoques.competencia=controle.competencia and estoques.empresa = controle.empresa
	LEFT JOIN grupos as gp1 on gp1.chave=produtos.grupo1
	LEFT JOIN grupos as gp2 on gp2.chave=produtos.grupo2
	WHERE produto_web=1 and controle.chave=$empresaPadrao
	GROUP BY produtos.chave limit 100, 200");
	
	$contador = count($consulta);
	//echo $consulta;
	//echo $contador;
	//die();
	
	$tem = 0;
	$naotem = 0;
	$fotoinserida = 0;
	
	/**** Inicia o laço ****/
	
	if($consulta){
		//inicia conexão com o banco
		$ch = curl_init();
		foreach($consulta as &$produto){
		
			$url = $apirocky . "/products/ref/" . $produto->codigo . "";
			curl_setopt($ch, CURLOPT_URL, $url);

			$headers = [
				'Authorization: Bearer 411e26c41584f2cebf983e05efb2204f',
				'Content-Type: application/json',
				'Accept: application/json'
			];

			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
				
			curl_setopt($ch, CURLOPT_POST, 0);//define se o metodo é post(1) ou get (0)
			//curl_setopt($ch, CURLOPT_PUT, 0); //define se o método é put(1) ou não (0)
				
			//curl_setopt($ch, CURLOPT_POSTFIELDS,$vars);  //Post Fields
				
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			
			$server_output = curl_exec ($ch);

			if($server_output == '{"product":null}'){
				
				$naotem++;				
				
			}else{

				$tem++;
				$temarquivo = false;
				$resposta = json_decode($server_output);
				$chaveproduto = $resposta->product->id;
				
				$idproduto = str_pad($produto->chave, 6, '0', STR_PAD_LEFT);
				//echo 'id do produto: ' . $idproduto;
				//die();
				$file_url = '../../siacweb/arquivos/imagens/thumb_PD' . $idproduto.'.JPG';
				echo $file_url;
				$foto = file_get_contents($file_url);
				
				//verificar se existe o arquivo
				if($foto){
					$temarquivo = true;
				}else{
					$file_url = '../../siacweb/arquivos/imagens/PD' . $idproduto . '.JPG';
					$foto = file_get_contents($file_url);
					if($foto){
						$temarquivo = true;
					}
				}
				if($temarquivo){
					$token = "411e26c41584f2cebf983e05efb2204f";
					$url = $apirocky . "/products/" . $chaveproduto . "/images";
					$curl = curl_init();
					curl_setopt_array($curl, array(
						CURLOPT_URL => $url,
						CURLOPT_RETURNTRANSFER => TRUE,
						CURLOPT_ENCODING => "",
						CURLOPT_MAXREDIRS => 10,
						CURLOPT_TIMEOUT => 0,
						CURLOPT_FOLLOWLOCATION => true,
						CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
						CURLOPT_CUSTOMREQUEST => "POST",
						CURLOPT_POSTFIELDS => array('images[]' => new CURLFILE($file_url)),
						CURLOPT_HTTPHEADER => array(
							"Accept: application/json",
							"Authorization: Bearer $token",
							"Content-Type: multipart/form-data"
						),					
					));
					//print_r(curl_getinfo($curl));
					//die();
					$response = curl_exec($curl);
					$fotoinserida++;
					print $response;
					//die();
				}else{
					print "não tem arquivo";
				}		
			}		
		}

	curl_close($ch);
	}

print "Concluido. Tem: " . $tem . ", nao tem: " . $naotem . " - Inserida: " . $fotoinserida;		


?>