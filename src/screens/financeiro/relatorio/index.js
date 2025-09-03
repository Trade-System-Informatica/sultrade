import React, { Component } from "react";
import "./styles.css";
import * as ReactDOMServer from "react-dom/server";
import { Formik, Field, Form } from "formik";
import Header from "../../../components/header";
import Rodape from "../../../components/rodape";
import util from "../../../classes/util";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { PDFExport } from "@progress/kendo-react-pdf";
import { drawDOM, exportPDF } from "@progress/kendo-drawing";
import { apiEmployee } from "../../../services/apiamrg";
import loader from "../../../classes/loader";
import moment from "moment";
import Select from "react-select";
import Skeleton from '../../../components/skeleton'
import Modal from "@material-ui/core/Modal";
import apiHeroku from "../../../services/apiHeroku";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const estadoInicial = {
  por: "",
  conta: "",
  centroCusto: "",
  pessoa: "",
  clientes: [],
  periodoInicial: moment().startOf("month").format("YYYY-MM-DD"),
  periodoFinal: moment().endOf("month").format("YYYY-MM-DD"),
  lancamentoInicial: moment("1900-1-1").format("YYYY-MM-DD"),
  lancamentoFinal: moment("2100-12-31").format("YYYY-MM-DD"),
  excluirTipos: false,
  tiposDocumentos: [],
  moeda: 5,
  totalBalance: 0,

  moedasOptions: [],
  moedasOptionsTexto: "",

  categoria: "",

  porOptions: [],
  planosContas: [],
  planosContasOptions: [],
  planosContasOptionsTexto: "",
  centrosCustos: [],
  centrosCustosOptions: [],
  centrosCustosOptionsTexto: "",  pessoas: [],
  pessoasOptions: [],
  pessoasOptionsTexto: "",
  tiposDocumentoOptions: [],

  grupo: "",
  grupos: [],
  gruposOptions: [],
  gruposOptionsTexto: "",

  bloqueado: false,

  relatorio: [],
  pdfgerado: [],
  pdfContent: [],
  pdfNome: "",
  pdfsSeparadosGerados: [],

  pdfEmail: "",
  emails: [],
  temEmail: false,
  failures: [],
  successes: [],
  emailModal: "",

  situacao: 'T',
  situacaoOptions: [
    {value: "T", label: "Todas"},
    {value: "F", label: "Faturadas"},
    {value: "E", label: "Enviadas"},
    {value: "N", label: "Não Enviadas"},
],

  pdfsSeparados: false,
  downloadZipAutomatico: false,
};

class Relatorio extends Component {
  constructor(props) {
    super(props);
    this.pdfExportComponent = React.createRef(null);
  }

  state = {
    ...estadoInicial,
    usuarioLogado: this.props.user,
  };

  componentDidMount = async () => {
    // Adicionar CSS para animações
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    if (this.state.usuarioLogado.empresa != 0) {
      await this.setState({ empresa: this.state.usuarioLogado.empresa });
    }
    let porOptions = [];
    if (this.props.location.state.backTo) {
      if (
        this.props.location.state.backTo == "contasPagas" ||
        this.props.location.state.backTo == "contasPagar"
      ) {
        porOptions.push({ label: "Por Fornecedor", value: "porCliente" });
        this.setState({ categoria: "_1%" });
      } else {
        porOptions.push({ label: "Por Cliente", value: "porCliente" });
        this.setState({ categoria: "1%" });
      }

      if (this.props.location.state.backTo == "contasPagar") {
        porOptions.push({ label: "Por Vencimento", value: "porVencimento" });
        this.setState({ tipo: "aberto" });
      } else if (this.props.location.state.backTo == "contasReceber") {
        porOptions.push({ label: "Por Lançamento", value: "porLancamento" });
        this.setState({ tipo: "aberto" });
      } else {
        porOptions.push({ label: "Por Data de Recebimento", value: "porData" });
        this.setState({ tipo: "liquidado" });
      }
      await this.setState({ porOptions });
    } else {
      this.setState({ redirect: true });
    }

    await this.getPlanosContas();
    await this.getCentrosCustos();
    await this.getPessoasCategorias();
    await this.getTiposDocumento();
    await this.getGrupos();
    await this.loadAll();
  };

  loadAll = async () => {
    await this.setState({
      acessos: await loader.getBase("getTiposAcessos.php"),
      permissoes: await loader.getBase("getPermissoes.php"),
      moedasOptions: await loader.getBaseOptions(
        "getMoedas.php",
        "Descricao",
        "Chave"
      ),
    });

    await this.setState({
      acessosPermissoes: await loader.testaAcesso(
        this.state.acessos,
        this.state.permissoes,
        this.state.usuarioLogado
      ),
      loading: false,
    });
  };

  getPlanosContas = async () => {
    await apiEmployee
      .post(`getPlanosContasAnaliticas.php`, {
        token: true,
      })
      .then(
        async (res) => {
          await this.setState({ planosContas: res.data });

          const options = this.state.planosContas.map((e) => ({
            label: e.Descricao,
            value: e.Chave,
          }));

          await this.setState({ planosContasOptions: options });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getCentrosCustos = async () => {
    await apiEmployee
      .post(`getCentrosCustos.php`, {
        token: true,
      })
      .then(
        async (res) => {
          await this.setState({ centrosCustos: res.data });

          const options = this.state.centrosCustos.map((e) => ({
            label: e.Descricao,
            value: e.Chave,
          }));

          await this.setState({ centrosCustosOptions: options });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getPessoasCategorias = async () => {
    await apiEmployee
      .post(`getPessoasCategoria.php`, {
        token: true,
        categoria: this.state.categoria,
      })
      .then(
        async (res) => {
          await this.setState({ pessoas: res.data });

          const options = this.state.pessoas.map((e) => {
            return {
              label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${
                e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""
              }`,
              value: e.Chave,
            };
          });

          await this.setState({ pessoasOptions: options });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getTiposDocumento = async () => {
    await apiEmployee
      .post(`getTiposLancamento.php`, {
        token: true,
      })
      .then(
        async (res) => {
          const tiposDocumentos = res.data.map((e) => ({
            ...e,
            checked: false,
          }));

          await this.setState({ tiposDocumentoOptions: tiposDocumentos });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getGrupos = async () => {
    await apiEmployee
      .post(`getGruposClientes.php`, {
        token: true,
      })
      .then(
        async (res) => {
          await this.setState({ grupos: res.data });

          const options = this.state.grupos.map((e) => ({
            label: e.descricao,
            value: e.chave,
          }));

          await this.setState({ gruposOptions: options });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  setTipoDocumento = async (chave, index) => {
    let filtro = "";
    let check = this.state.tiposDocumentoOptions;
    check[index].checked = !check[index].checked;

    await this.setState({ tiposDocumentoOptions: check });
    if (this.state.tiposDocumentos.includes(chave)) {
      filtro = this.state.tiposDocumentos.filter((e) => e != chave);
      await this.setState({ tiposDocumentos: filtro });
    } else {
      this.state.tiposDocumentos.push(chave);
    }
  };

  gerarRelatorio = async (validForm) => {
    this.setState({ loading: true, pdfsSeparadosGerados: [] });
    if (!validForm) {
      return;
    }
    const empresa = `contas_aberto.Empresa = ${this.state.empresa}`;
    const abertas =
      this.state.tipo == "aberto"
        ? `contas_aberto.Saldo >= 1`
        : `contas_aberto.Saldo = 0`;
    const conta = this.state.conta
      ? `contas_aberto.Conta_Contabil = '${this.state.conta}'`
      : "";
    const centroCusto = this.state.centroCusto
      ? `contas_aberto.Centro_Custo = '${this.state.centroCusto}'`
      : "";
    const pessoa = this.state.clientes[0]
      ? `contas_aberto.pessoa IN ('${this.state.clientes.join("','")}')`
      : "";
    const situacao = this.state.situacao == this.state.situacao == "E" ? `os.cancelada != 1 AND (os.envio != "" AND os.envio != "0000-00-00" AND (os.envio = "" OR os.envio = "0000-00-00"))` : this.state.situacao == "F" ? `os.cancelada != 1 AND (os.Data_Faturamento != "" AND os.Data_Faturamento != "0000-00-00 00:00:00")` : ``;
    let periodoInicial = "1=1"; //this.state.periodoInicial ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : `contas_aberto.data_pagto >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : '';
    let periodoFinal = "1=1"; //this.state.periodoFinal ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : `contas_aberto.data_pagto <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : '';
    const lancamentoInicial = "1=1"; //this.state.lancamentoInicial ? `contas_aberto.lancto >= '${moment(this.state.lancamentoInicial).format('YYYY-MM-DD')}'` : '';
    const lancamentoFinal = "1=1"; //this.state.lancamentoFinal ? `contas_aberto.lancto <= '${moment(this.state.lancamentoFinal).format('YYYY-MM-DD')}'` : '';
    const exclusao = "1=1"; //(this.state.excluirTipos || this.state.tiposDocumentos[0]) ? 'NOT' : '';
    const tiposDocumento = "1=1"; //this.state.tiposDocumentos[0] ? `contas_aberto.tipodocto ${exclusao} IN (${this.state.tiposDocumentos.join(',')})` : ``;

    let tipo_sub = 0;
    if (this.props.location.state.backTo) {
      if (
        this.props.location.state.backTo == "contasPagas" ||
        this.props.location.state.backTo == "contasPagar"
      ) {
        tipo_sub = 0;
      } else {
        tipo_sub = 1;
        periodoInicial = "1 = 1";
        periodoFinal = "1 = 1";
      }
    }

    if (this.state.clientes[0] && !this.state.clientes[1]) {
      await apiEmployee
        .post(`getContatos.php`, {
          token: true,
          pessoa: this.state.clientes[0],
        })
        .then(async (res) => {
          if (res.data[0]) {
            const email = res.data.find((e) => e.Tipo == "EM")?.Campo1;

            if (email) {
              await this.setState({ emails: email.split("; ") });
              await this.setState({ temEmail: true });
            } else {
                const email2 = res.data.find((e) => e.Tipo == "ER")?.Campo1;
                if (email2){
                  await this.setState({ emails: email2.split("; ") })
                  await this.setState({ temEmail: true });
                }
            }
          }
        });
    }

    let por = this.state.por;
    if (por == "porCliente") {
      por = "GROUP BY contas_aberto.pessoa ORDER BY pessoas.nome";
    } else if (por == "porVencimento") {
      por =
        "GROUP BY contas_aberto.vencimento ORDER BY contas_aberto.vencimento";
    } else if (por == "porLancamento") {
      por = "GROUP BY contas_aberto.Lancto ORDER BY contas_aberto.Lancto";
    } else if (por == "porData") {
      por =
        "GROUP BY contas_aberto.data_pagto ORDER BY contas_aberto.data_pagto";
    }

    let where = [
      empresa,
      abertas,
      conta,
      centroCusto,
      pessoa,
      periodoInicial,
      periodoFinal,
      lancamentoInicial,
      lancamentoFinal,
      tiposDocumento,
      situacao,
    ];
    where = where.filter((e) => e.trim() != "");
    console.log(where.join(" AND "));
    console.log({
      clientes: this.state.clientes,
      centroCusto: this.state.centroCusto,
    });    if (this.props.location.state.backTo == "contasReceber") {
      // Para contas a receber, sempre gerar o relatório primeiro para visualização
      await apiHeroku
        .post("/relatorio/receber", {
          all: !this.state.clientes[0] ? true : false,
          chaves: this.state.clientes,
          centro_custo: this.state.centroCusto || false,
          situacao: this.state.situacao || 'T',
          grupo: this.state.grupo || false,
        })
        .then(async (res) => {
          await this.setState({ relatorio: res.data });
          
          // Se for PDFs separados, preparar a lista e marcar para download automático
          if (this.state.pdfsSeparados) {
            await this.prepararPDFsSeparados();
          }
          
          this.relatorio();
        })
        .catch((err) => {
          console.log('Erro na API:', err?.response?.data);
          
          // Verificar se é erro 503 (Service Unavailable)
          if (err?.response?.status === 503) {
            alert('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
          } else {
            console.log('Erro completo:', err);
            alert('Erro ao gerar relatório. Tente novamente em alguns instantes.');
          }
          
          // Parar o loading
          this.setState({ loading: false });
        });
    } else {
      await apiEmployee
        .post(`gerarRelatorioContas.php`, {
          token: true,
          where: where.join(" AND "),
          groupBy: por,
          tipo_sub,
        })
        .then(
          async (res) => {
            await this.setState({ relatorio: res.data });
            this.relatorio();
          },
          async (err) => {
            this.erroApi(JSON.stringify(err));
          }
        );
      this.setState({ loading: false });
    } 
  };

  prepararPDFsSeparados = async () => {
    console.log('=== PREPARANDO PDFs SEPARADOS ===');
    
    // Verificar se o relatório existe
    if (!this.state.relatorio || !Array.isArray(this.state.relatorio)) {
      console.log('Relatório não está disponível ou não é um array');
      alert('Erro: Dados do relatório não disponíveis. Tente gerar o relatório novamente.');
      return;
    }
    
    // Se nenhum cliente selecionado, buscar todos os clientes do relatório
    let clientesParaPDF = [];
    if (!this.state.clientes[0]) {
      console.log('Nenhum cliente selecionado, extraindo todos do relatório...');
      // Extrair clientes únicos do relatório
      const clientesUnicos = new Set();
      
      this.state.relatorio.forEach(item => {
        // Verificar se tem pessoa no nível principal (item.pessoa.chave)
        if (item.pessoa && item.pessoa.chave) {
          clientesUnicos.add(item.pessoa.chave.toString());
        }
        
        // Verificar nas contas normais
        if (item.contas_normais && Array.isArray(item.contas_normais)) {
          item.contas_normais.forEach(conta => {
            if (conta.pessoa) {
              // O campo pessoa pode ser apenas o ID ou um objeto
              if (typeof conta.pessoa === 'object' && conta.pessoa.chave) {
                clientesUnicos.add(conta.pessoa.chave.toString());
              } else if (typeof conta.pessoa === 'number' || typeof conta.pessoa === 'string') {
                clientesUnicos.add(conta.pessoa.toString());
              }
            }
          });
        }
        
        // Verificar nas contas manuais
        if (item.contas_manuais && Array.isArray(item.contas_manuais)) {
          item.contas_manuais.forEach(conta => {
            if (conta.pessoa) {
              // O campo pessoa pode ser apenas o ID ou um objeto
              if (typeof conta.pessoa === 'object' && conta.pessoa.chave) {
                clientesUnicos.add(conta.pessoa.chave.toString());
              } else if (typeof conta.pessoa === 'number' || typeof conta.pessoa === 'string') {
                clientesUnicos.add(conta.pessoa.toString());
              }
            }
          });
        }
      });
      
      clientesParaPDF = Array.from(clientesUnicos);
      console.log('Clientes extraídos do relatório:', clientesParaPDF);
    } else {
      clientesParaPDF = [...this.state.clientes];
      console.log('Clientes selecionados:', clientesParaPDF);
    }
    
    if (clientesParaPDF.length === 0) {
      console.log('Nenhum cliente encontrado para gerar PDFs');
      this.mostrarMensagem('Nenhum cliente encontrado para gerar PDFs separados.', 'warning');
      return;
    }
    
    console.log('Clientes para PDF:', clientesParaPDF);
    
    const pdfsSeparados = [];
    
    for (const clienteAtual of clientesParaPDF) {
      const nomeCliente = this.state.pessoas.find(p => p.Chave == clienteAtual)?.Nome || `Cliente_${clienteAtual}`;
      
      pdfsSeparados.push({
        clienteId: clienteAtual,
        nomeCliente: nomeCliente.replaceAll(".", ""),
        pdfNome: `SOA (${moment().format("DD-MM-YYYY")}) - ${nomeCliente.replaceAll(".", "")}`
      });
    }
    
    await this.setState({ 
      pdfsSeparadosGerados: pdfsSeparados,
      downloadZipAutomatico: true // Flag para indicar download automático
    });
    
    console.log('PDFs separados preparados:', pdfsSeparados);
  };

  gerarPDFsSeparados = async () => {
    console.log('=== INICIANDO GERAÇÃO DE PDFs SEPARADOS ===');
    console.log('Clientes selecionados:', this.state.clientes);
    
    let clientesParaProcessar = [...this.state.clientes];
    
    // Se nenhum cliente foi selecionado, buscar todos os clientes
    if (clientesParaProcessar.length === 0) {
      console.log('Nenhum cliente selecionado, buscando todos...');
      
      // Buscar todos os clientes do relatório primeiro para obter a lista
      await apiHeroku
        .post("/relatorio/receber", {
          all: true,
          chaves: [],
          centro_custo: this.state.centroCusto || false,
          situacao: this.state.situacao || 'T',
          grupo: this.state.grupo || false,
        })
        .then(async (res) => {
          console.log('Dados do relatório para todos os clientes:', res.data);
          
          // Extrair lista única de clientes do relatório
          const clientesUnicos = new Set();
          res.data.forEach(item => {
            if (item.contas_normais) {
              item.contas_normais.forEach(conta => {
                if (conta.pessoa && conta.pessoa.chave) {
                  clientesUnicos.add(conta.pessoa.chave);
                }
              });
            }
            if (item.contas_manuais && Array.isArray(item.contas_manuais)) {
              item.contas_manuais.forEach(conta => {
                if (conta.pessoa && conta.pessoa.chave) {
                  clientesUnicos.add(conta.pessoa.chave);
                }
              });
            }
          });
          
          clientesParaProcessar = Array.from(clientesUnicos);
          console.log('Clientes encontrados no relatório:', clientesParaProcessar);
          
          await this.setState({ relatorio: res.data });
        })
        .catch((res) => {
          console.log("Erro ao buscar todos os clientes:", res?.response?.data);
        });
    } else {
      // Gerar o relatório unificado para ter os dados
      await apiHeroku
        .post("/relatorio/receber", {
          all: false,
          chaves: clientesParaProcessar,
          centro_custo: this.state.centroCusto || false,
          situacao: this.state.situacao || 'T',
          grupo: this.state.grupo || false,
        })
        .then(async (res) => {
          console.log('Dados do relatório para clientes selecionados:', res.data);
          await this.setState({ relatorio: res.data });
        })
        .catch((res) => {
          console.log("Erro ao gerar relatório:", res?.response?.data);
        });
    }
    
    // Preparar a lista de PDFs para serem gerados
    const pdfsSeparados = [];
    for (const clienteAtual of clientesParaProcessar) {
      const nomeCliente = this.state.pessoas.find(p => p.Chave == clienteAtual)?.Nome || `Cliente_${clienteAtual}`;
      
      pdfsSeparados.push({
        clienteId: clienteAtual,
        nomeCliente: nomeCliente.replaceAll(".", ""),
        pdfNome: `SOA (${moment().format("DD-MM-YYYY")}) - ${nomeCliente.replaceAll(".", "")}`
      });
    }
    
    await this.setState({ 
      pdfsSeparadosGerados: pdfsSeparados,
      loading: false 
    });
    
    console.log('PDFs separados preparados:', pdfsSeparados);
    
    // Gerar e baixar o ZIP automaticamente
    await this.gerarZipPDFs();
  };

  gerarZipPDFs = async () => {
    console.log('=== INICIANDO GERAÇÃO DO ZIP COM PDFs ===');
    this.mostrarMensagem(`Gerando ${this.state.pdfsSeparadosGerados.length} PDFs...`, 'info');
    
    const zip = new JSZip();
    let pdfsGerados = 0;
    
    try {
      for (const pdfData of this.state.pdfsSeparadosGerados) {
        console.log(`Processando PDF para cliente ${pdfData.clienteId}...`);
        
        // Buscar o elemento DOM específico do cliente
        const elementoPDF = document.getElementById(`pdfDiv_${pdfData.clienteId}`);
        
        if (!elementoPDF) {
          console.log(`Elemento DOM não encontrado para cliente ${pdfData.clienteId}`);
          continue;
        }
        
        console.log(`Elemento DOM encontrado para cliente ${pdfData.clienteId}, gerando PDF...`);
        
        // Gerar o PDF usando o drawDOM e exportPDF
        const base64 = await drawDOM(elementoPDF, {
          paperSize: "A4",
          margin: "0.5cm",
          scale: 0.6,
          portrait: true,
        })
        .then((group) => {
          return exportPDF(group);
        })
        .then((dataUri) => {
          // Remover o prefixo data:application/pdf;base64,
          return dataUri.split(',')[1];
        });
        
        if (base64 && base64.length > 100) { // Verificar se o PDF não está vazio
          zip.file(`${pdfData.pdfNome}.pdf`, base64, { base64: true });
          pdfsGerados++;
          console.log(`PDF gerado com sucesso para cliente ${pdfData.clienteId}`);
        } else {
          console.log(`PDF vazio gerado para cliente ${pdfData.clienteId}`);
        }
      }
      
      if (pdfsGerados > 0) {
        // Gerar e baixar o arquivo ZIP
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const nomeZip = `SOAs_${moment().format("DD-MM-YYYY")}_${pdfsGerados}_clientes.zip`;
        
        // Baixar o arquivo
        saveAs(zipBlob, nomeZip);
        
        this.mostrarMensagem(`✅ ZIP gerado com sucesso: ${nomeZip}`, 'success');
        console.log(`ZIP gerado com sucesso: ${nomeZip}`);
        
        // Voltar para a tela anterior após alguns segundos
        setTimeout(() => {
          this.setState({ 
            pdfView: false, 
            pdfsSeparadosGerados: [], 
            downloadZipAutomatico: false,
            mensagemElegante: null
          });
        }, 3000);
        
      } else {
        this.mostrarMensagem('❌ Erro: Nenhum PDF foi gerado com sucesso.', 'error');
      }
      
    } catch (error) {
      console.error('Erro ao gerar ZIP:', error);
      this.mostrarMensagem('❌ Erro ao gerar arquivo ZIP. Tente novamente.', 'error');
    }
  };

  mostrarMensagem = (mensagem, tipo = 'info') => {
    const notificacao = document.createElement('div');
    
    let cor = '#17a2b8'; // info (azul)
    if (tipo === 'success') cor = '#28a745'; // verde
    if (tipo === 'error') cor = '#dc3545'; // vermelho
    if (tipo === 'warning') cor = '#ffc107'; // amarelo
    
    notificacao.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${cor};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 400px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-out;
    `;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
      notificacao.style.opacity = '1';
      notificacao.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após alguns segundos
    const tempo = tipo === 'error' ? 7000 : 4000;
    setTimeout(() => {
      notificacao.style.opacity = '0';
      notificacao.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notificacao.parentNode) {
          notificacao.remove();
        }
      }, 300);
    }, tempo);
  };

  renderPDFContent = (relatorioFiltrado, clienteId) => {
    console.log(`=== RENDERIZANDO PDF PARA CLIENTE ${clienteId} ===`);
    console.log('Relatório filtrado recebido:', relatorioFiltrado);
    console.log('Quantidade de itens:', relatorioFiltrado.length);
    
    let totalBalance = 0;
    
    // Calcular totais antes de renderizar
    let totaisGerais = {
      fda: 0,
      discount: 0,
      received: 0,
      balance: 0
    };

    // Percorrer os dados para calcular totais
    relatorioFiltrado.forEach(e => {
      if (e.contas_normais && Array.isArray(e.contas_normais)) {
        e.contas_normais.forEach(f => {
          let FDA2 = f?.fda;
          let DISCONT2 = f?.discount;
          let RECEIVED2 = f?.received;
          let BALANCE2 = f?.balance;
          
          if (this.state.moeda) {
            if (parseInt(this.state.moeda) !== parseInt(f?.moeda)) {
              FDA2 = f?.FDADOLAR ? f?.FDADOLAR : FDA2 / f?.roe;
              DISCONT2 = f?.discountDOLAR ? f?.discountDOLAR : DISCONT2 / f?.roe;
              RECEIVED2 = f?.receivedDOLAR ? f.receivedDOLAR : RECEIVED2 / f?.roe;
              BALANCE2 = f?.balanceDolar ? f?.balanceDolar : BALANCE2 / f?.roe;
            }
          }
          
          if (parseFloat(BALANCE2) > 0) {
            totaisGerais.fda += parseFloat(FDA2);
            totaisGerais.discount += parseFloat(DISCONT2);
            totaisGerais.received += parseFloat(RECEIVED2);
            totaisGerais.balance += parseFloat(BALANCE2);
          }
        });
      }
      
      if (e.contas_manuais && Array.isArray(e.contas_manuais)) {
        e.contas_manuais.forEach(f => {
          let FDA2 = f?.fda;
          let DISCONT2 = f?.discount;
          let RECEIVED2 = f?.received;
          let BALANCE2 = f?.balance;
          
          if (this.state.moeda) {
            if (parseInt(this.state.moeda) !== parseInt(f?.moeda)) {
              FDA2 = FDA2 / f.roe;
              DISCONT2 = DISCONT2 / f?.roe;
              RECEIVED2 = RECEIVED2 / f?.roe;
              BALANCE2 = BALANCE2 / f?.roe;
            }
          }
          
          if (parseFloat(BALANCE2) > 0) {
            totaisGerais.fda += parseFloat(FDA2);
            totaisGerais.discount += parseFloat(DISCONT2);
            totaisGerais.received += parseFloat(RECEIVED2);
            totaisGerais.balance += parseFloat(BALANCE2);
          }
        });
      }
    });

    const pdfContent = (
      <div style={{ zoom: 1 }} id={`pdfDiv_${clienteId}`}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            className="img-fluid"
            src="https://i.ibb.co/vmKJkx4/logo.png"
            alt="logo-Strade"
            border="0"
            style={{ width: "30%", height: "150px", maxWidth: "100%" }}
          />
          <h4>SOA - Statement of Accounts</h4>
          <p>Issued on {moment().format("MMM Do YYYY")}</p>
        </div>
        <hr />
        <div className="pdfContent">
          {relatorioFiltrado.map((e, index) => {
            console.log(`Processando item ${index} para cliente ${clienteId}:`, e);
            
            if (this.props.location.state.backTo === "contasReceber") {
              const rows = [];
              
              // Processar contas normais igual ao original
              if (e.contas_normais && Array.isArray(e.contas_normais)) {
                e.contas_normais.forEach((f) => {
                  let FDA2 = f?.fda;
                  let DISCONT2 = f?.discount;
                  let RECEIVED2 = f?.received;
                  let BALANCE2 = f?.balance;
                  
                  if (this.state.moeda) {
                    if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                    } else {
                      FDA2 = f?.FDADOLAR ? f?.FDADOLAR : FDA2 / f?.roe;
                      DISCONT2 = f?.discountDOLAR ? f?.discountDOLAR : DISCONT2 / f?.roe;
                      RECEIVED2 = f?.receivedDOLAR ? f.receivedDOLAR : RECEIVED2 / f?.roe;
                      BALANCE2 = f?.balanceDolar ? f?.balanceDolar : BALANCE2 / f?.roe;
                    }
                  }
                  
                  const row = {
                    ship: f?.ship || "",
                    os: f?.os || "",
                    port: f?.port || "",
                    moeda: f?.moeda || 5,
                    sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                    billing: (() => {
                      const date = moment(f?.billing);
                      return date.isValid()
                        ? date.format("YY") === "99"
                          ? "N/A"
                          : date.format("YYYY-MM-DD")
                        : moment().format("YYYY-MM-DD");
                    })(),
                    roe: f?.roe || 5,
                    fda: FDA2,
                    discount: DISCONT2,
                    received: RECEIVED2,
                    balance: BALANCE2,
                  };
                  rows.push(row);
                });
              }

              // Processar contas manuais igual ao original
              if (e.contas_manuais && Array.isArray(e.contas_manuais)) {
                e.contas_manuais.forEach((f) => {
                  let FDA2 = f?.fda;
                  let DISCONT2 = f?.discount;
                  let RECEIVED2 = f?.received;
                  let BALANCE2 = f?.balance;
                  
                  if (this.state.moeda) {
                    if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                    } else {
                      FDA2 = f?.FDADOLAR ? f?.FDADOLAR : FDA2 / f?.roe;
                      DISCONT2 = f?.discountDOLAR ? f?.discountDOLAR : DISCONT2 / f?.roe;
                      RECEIVED2 = f?.receivedDOLAR ? f.receivedDOLAR : RECEIVED2 / f?.roe;
                      BALANCE2 = f?.balanceDolar ? f?.balanceDolar : BALANCE2 / f?.roe;
                    }
                  }
                  
                  const row = {
                    ship: f?.ship || "",
                    os: f?.os || "",
                    port: f?.port || "",
                    moeda: f?.moeda || 5,
                    sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                    billing: (() => {
                      const date = moment(f?.billing);
                      return date.isValid()
                        ? date.format("YY") === "99"
                          ? "N/A"
                          : date.format("YYYY-MM-DD")
                        : moment().format("YYYY-MM-DD");
                    })(),
                    roe: f?.roe || 5,
                    fda: FDA2,
                    discount: DISCONT2,
                    received: RECEIVED2,
                    balance: BALANCE2,
                  };
                  rows.push(row);
                });
              }

              console.log(`Cliente ${clienteId} - Total rows:`, rows);

              let totalFDAPorGrupo = 0;
              let totalDiscountPorGrupo = 0;
              let totalReceivedPorGrupo = 0;
              let totalBalancePorGrupo = 0;

              const hasDiscount = rows.some(row => parseFloat(row.discount) > 0.00);

              return (
                <div key={index}>
                  <table className="pdfTable">
                    <tr>
                      <th colSpan={hasDiscount ? 9 : 8}>
                        <span style={{ fontSize: 15 }}>
                          {e.pessoa?.nome || ""}
                        </span>
                      </th>
                    </tr>
                    <tr style={{ fontSize: 13 }}>
                      <th>SHIP'S NAME</th>
                      <th>PO</th>
                      <th>PORT OF CALL</th>
                      <th>SAILED</th>
                      <th>BILLING</th>
                      <th>ROE</th>
                      <th>FDA</th>
                      {hasDiscount && <th>DISCOUNT</th>}
                      <th>RECEIVED</th>
                      <th>BALANCE</th>
                    </tr>
                    {rows
                      .sort((a, b) => moment(a.sailed).diff(moment(b.sailed)))
                      .map((row, rowIndex) => {
                        if (parseFloat(row.balance) > 0.01) {
                          totalFDAPorGrupo += parseFloat(row.fda);
                          totalDiscountPorGrupo += parseFloat(row.discount);
                          totalReceivedPorGrupo += parseFloat(row.received);
                          totalBalancePorGrupo += parseFloat(row.balance);
                          
                          return (
                            <tr key={rowIndex} style={{ fontSize: 12 }} className="SOA_row">
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 135,
                                minWidth: 135,
                              }}>
                                {row.ship}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 55,
                                minWidth: 55,
                              }}>
                                {row.os}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 85,
                                minWidth: 85,
                              }}>
                                {row.port}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 60,
                                minWidth: 60,
                              }}>
                                {moment(row.sailed).format("MMM Do YYYY")}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 60,
                                minWidth: 60,
                              }}>
                                {row.billing !== "N/A" ? moment(row.billing).format("MMM Do YYYY") : "N/A"}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 45,
                                minWidth: 45,
                              }}>
                                {parseFloat(row?.roe || 5).toFixed(4)}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 80,
                                minWidth: 80,
                              }}>
                                {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(row.fda)}
                              </td>
                              {hasDiscount && (
                                <td style={{
                                  backgroundColor: "inherit",
                                  whiteSpace: "nowrap",
                                  maxWidth: 80,
                                  minWidth: 80,
                                }}>
                                  {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.discount)}
                                </td>
                              )}
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 80,
                                minWidth: 80,
                              }}>
                                {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(row.received)}
                              </td>
                              <td style={{
                                backgroundColor: "inherit",
                                whiteSpace: "nowrap",
                                maxWidth: 80,
                                minWidth: 80,
                              }}>
                                {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(row.balance)}
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    <tr style={{ fontSize: 13 }}>
                      <td colSpan='6' style={{ fontWeight: "bold" }}>{"Total ->"}</td>
                      <td
                        style={{
                          paddingRight: "15px",
                          borderTop: "1px solid black",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                        {totalFDAPorGrupo.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      {hasDiscount && (
                        <td style={{
                          paddingRight: "15px",
                          borderTop: "1px solid black",
                          whiteSpace: "nowrap",
                        }}>
                          {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                          {totalDiscountPorGrupo.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      )}
                      <td style={{
                        paddingRight: "15px",
                        borderTop: "1px solid black",
                        whiteSpace: "nowrap",
                      }}>
                        {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                        {totalReceivedPorGrupo.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{
                        paddingRight: "15px",
                        borderTop: "1px solid black",
                        whiteSpace: "nowrap",
                      }}>
                        {this.state.moeda === 5 ? "R$" : "USD"}{" "}
                        {totalBalancePorGrupo.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </table>
                </div>
              );
            }
            return null;
          })}

          <br></br>
          <div style={{ border: "1px solid #dee2e6" }}></div>
          <br></br>
          
          {/* Tabela de totais gerais igual ao PDF original - mesmo valor do primeiro total */}
          <table className="totalTablePDF">
            <tr style={{ fontSize: 13 }}>
              <th></th>
              <th style={{ borderBottom: "1px solid black" }}>FDA</th>
              <th style={{ borderBottom: "1px solid black" }}>DISCOUNT</th>
              <th style={{ borderBottom: "1px solid black" }}>RECEIVED</th>
              <th style={{ borderBottom: "1px solid black" }}>BALANCE</th>
            </tr>
            <tr style={{ fontSize: 12 }}>
              <th style={{ textAlign: "left" }}>{"Total ->"}</th>
              <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totaisGerais.fda)}
              </td>
              <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totaisGerais.discount)}
              </td>
              <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totaisGerais.received)}
              </td>
              <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totaisGerais.balance)}
              </td>
            </tr>
          </table>
          
          {/* Banking Details */}
          <br />
          <br />
          <br />
          <h5 style={{ width: "100%", textAlign: "center" }}>BANKING DETAILS</h5>
          <table style={{ width: "80%", marginLeft: "5%" }}>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco Santander
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>SWIFT code:</b> BSCHBRSPXXX
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>IBAN:</b> BR8290400888032720130031839C1
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Branch's number:</b> 3272
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Account number:</b> 130031839
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Sender's correspondent:</b> Standard Chartered Bank
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Sender's correspondent - SWIFT:</b> SCBLUS33XXX
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Address:</b> 161 Andrade Neves Street
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
    
    console.log(`=== PDF FINAL PARA CLIENTE ${clienteId} ===`);
    console.log('Conteúdo completo do PDF:', pdfContent);
    
    return pdfContent;
  };

  gerarPDFIndividual = async () => {
    const relatorio = this.state.relatorio;
    console.log('=== GERAÇÃO PDF INDIVIDUAL ===');
    console.log('Relatório recebido:', relatorio);
    console.log('Cliente atual:', this.state.clientes);
    console.log('Props location:', this.props.location.state.backTo);
    let totalBalance = 0;

    let pdf = (
      <div style={{ zoom: 1 }} id={`pdfDiv_${this.state.clientes[0]}`} key={`pdf_${this.state.clientes[0]}_${Date.now()}`}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            className="img-fluid"
            src="https://i.ibb.co/vmKJkx4/logo.png"
            alt="logo-Strade"
            border="0"
            style={{ width: "30%", height: "150px", maxWidth: "100%" }}
          />
          <h4>SOA - Statement of Accounts</h4>
          <p>Issued on {moment().format("MMM Do YYYY")}</p>
        </div>
        <hr />
        <div className="pdfContent">
          {relatorio.map((e, index) => {
            console.log(`Processando item ${index}:`, e);
            if (this.props.location.state.backTo == "contasReceber") {
              console.log('Entrando no bloco contasReceber');
              const rows = [];
              console.log('Contas normais:', e.contas_normais);
              console.log('Contas manuais:', e.contas_manuais);
              
              if (!e.contas_normais && !e.contas_manuais) {
                console.log('PROBLEMA: Nem contas normais nem manuais estão disponíveis!');
                return null;
              }
              
              if (e.contas_normais && Array.isArray(e.contas_normais)) {
                e.contas_normais.forEach((f) => {
              let FDA2 = f?.fda;
              let DISCONT2 = f?.discount;
              let RECEIVED2 = f?.received;
              let BALANCE2 = f?.balance;
              
              if (this.state.moeda) {
                if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                } else {
                  FDA2 = f?.FDADOLAR ? f?.FDADOLAR : FDA2 / f?.roe;
                  DISCONT2 = f?.discountDOLAR ? f?.discountDOLAR : DISCONT2 / f?.roe;
                  RECEIVED2 = f?.receivedDOLAR ? f.receivedDOLAR : RECEIVED2 / f?.roe;
                  BALANCE2 = f?.balanceDolar ? f?.balanceDolar : BALANCE2 / f?.roe;
                }
              }
              
              const row = {
                ship: f?.ship || "",
                os: f?.os || "",
                port: f?.port || "",
                moeda: f?.moeda || 5,
                sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                billing: (() => {
                  const date = moment(f?.billing);
                  return date.isValid()
                    ? date.format("YY") === "99" 
                      ? "N/A" 
                      : date.format("YYYY-MM-DD") 
                    : moment().format("YYYY-MM-DD"); 
                })(),
                roe: f?.roe || 5,
                fda: FDA2,
                discount: DISCONT2,
                received: RECEIVED2,
                balance: BALANCE2,
              };
              rows.push(row);
            });
            }

            if (e.contas_manuais && Array.isArray(e.contas_manuais)) {
              e.contas_manuais.forEach((f) => {
              let FDA2 = f?.fda;
              let DISCONT2 = f?.discount;
              let RECEIVED2 = f?.received;
              let BALANCE2 = f?.balance;
              
              if (this.state.moeda) {
                if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                } else {
                  FDA2 = FDA2 / f.roe;
                  DISCONT2 = DISCONT2 / f?.roe;
                  RECEIVED2 = RECEIVED2 / f?.roe;
                  BALANCE2 = BALANCE2 / f?.roe;
                }
              }
              
              const row = {
                ship: f?.ship || "",
                os: f?.os || "",
                port: f?.port || "",
                moeda: f?.moeda || 5,
                sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                billing: (() => {
                  const date = moment(f?.billing);
                  return date.isValid()
                    ? date.format("YY") === "99" 
                      ? "N/A" 
                      : date.format("YYYY-MM-DD") 
                    : moment().format("YYYY-MM-DD"); 
                })(),
                roe: f?.roe || 5,
                fda: FDA2,
                discount: DISCONT2,
                received: RECEIVED2,
                balance: BALANCE2,
              };
              rows.push(row);
            });
            }

            let totalFDAPorGrupo = 0;
            let totalDiscountPorGrupo = 0;
            let totalReceivedPorGrupo = 0;
            let totalBalancePorGrupo = 0;

            const hasDiscount = rows.some(row => parseFloat(row.discount) > 0.00);

            return (
              <div key={e.pessoa?.codigo || Math.random()}>
                <table className="pdfTable">
                  <tr>
                    <th colSpan={hasDiscount ? 9 : 8}>
                      <span style={{ fontSize: 15 }}>
                        {e.pessoa?.nome || ""}
                      </span>
                    </th>
                  </tr>
                  <tr style={{ fontSize: 13 }}>
                    <th>SHIP'S NAME</th>
                    <th>PO</th>
                    <th>PORT OF CALL</th>
                    <th>SAILED</th>
                    <th>BILLING</th>
                    <th>ROE</th>
                    <th>FDA</th>
                    {hasDiscount && <th>DISCOUNT</th>}
                    <th>RECEIVED</th>
                    <th>BALANCE</th>
                  </tr>
                  {rows
                    .sort((a, b) => moment(a.sailed).diff(moment(b.sailed)))
                    .map((row, index) => {
                      if (parseFloat(row.balance) > 0.01) {
                        totalFDAPorGrupo += parseFloat(row.fda);
                        totalDiscountPorGrupo += parseFloat(row.discount);
                        totalReceivedPorGrupo += parseFloat(row.received);
                        totalBalancePorGrupo += parseFloat(row.balance);
                        totalBalance += parseFloat(row.balance);
                        
                        return (
                          <tr style={{ fontSize: 12 }} className="SOA_row" key={index}>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 135, minWidth: 135 }}>
                              {row.ship}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 55, minWidth: 55 }}>
                              {row.os}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 105, minWidth: 105 }}>
                              {row.port}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>
                              {moment(row.sailed).format("MMM Do YYYY")}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>
                              {row.billing === "N/A" ? "N/A" : moment(row.billing).format("MMM Do YYYY")}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 65, minWidth: 65 }}>
                              {parseFloat(row?.roe || 5).toFixed(4)}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>
                              {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(row.fda)}
                            </td>
                            {hasDiscount && (
                              <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>
                                {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(row.discount)}
                              </td>
                            )}
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>
                              {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(row.received)}
                            </td>
                            <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap" }}>
                              {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(row.balance)}
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  <tr style={{ fontSize: 13 }}>
                    <th colSpan="6">{"Total ->"}</th>
                    <td style={{ paddingRight: "15px", borderTop: "1px solid black", whiteSpace: "nowrap" }}>
                      {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totalFDAPorGrupo)}
                    </td>
                    {hasDiscount && (
                      <td style={{ paddingRight: "15px", borderTop: "1px solid black", whiteSpace: "nowrap" }}>
                        {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(totalDiscountPorGrupo)}
                      </td>
                    )}
                    <td style={{ paddingRight: "15px", borderTop: "1px solid black", whiteSpace: "nowrap" }}>
                      {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totalReceivedPorGrupo)}
                    </td>
                    <td style={{ paddingRight: "15px", borderTop: "1px solid black", whiteSpace: "nowrap" }}>
                      {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totalBalancePorGrupo)}
                    </td>
                  </tr>
                </table>
                <hr />
              </div>
            );
            }
            console.log('Não é contasReceber, retornando null');
            return null; // Para outros tipos de relatório
          })}

          <br />
          <br />
          <br />

          <h5 style={{ width: "100%", textAlign: "center" }}>BANKING DETAILS</h5>
          <table style={{ width: "80%", marginLeft: "5%" }}>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco Santander
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>SWIFT code:</b> BSCHBRSPXXX
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>IBAN:</b> BR8290400888032720130031839C1
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Branch's number:</b> 3272
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Account number:</b> 130031839
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Sender's correspondent:</b> Standard Chartered Bank
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Sender's correspondent - SWIFT:</b> SCBLUS33XXX
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Address:</b> 161 Andrade Neves Street
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                <b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75
              </td>
            </tr>
          </table>
        </div>
      </div>
    );

    console.log('PDF final gerado:', pdf);
    console.log('Total balance:', totalBalance);
    return { pdf, totalBalance };
  };

  enviarEmail = async (validFormEmail) => {
    await this.setState({ successes: [] });
    if (!validFormEmail) {
      return;
    }
    let gridElement = document.getElementById("pdfDiv");

    const base64 = await drawDOM(gridElement, {
      paperSize: "A4",
      margin: "0.5cm",
      scale: 0.6,
      portrait: true,
    })
      .then((group) => {
        return exportPDF(group);
      })
      .then((dataUri) => {
        return dataUri;
      });

    await this.setState({ emailBloqueado: true, loading: true });
    await apiEmployee
      .post(`enviaRelatorioEmail.php`, {
        token: true,
        emails: this.state.emails.map((e) => e?.trim()),
        mensagem: base64,
        nomeCliente: this.state.pessoas
          .find((p) => p.Chave == this.state.clientes[0])
          ?.Nome.replaceAll(".", ""),
        balance: `${
          this.state.moeda == 5 ? "R$" : "USD"
        } ${new Intl.NumberFormat("pt-BR", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(this.state.totalBalance)}`,
        clientId: parseInt(this.state.clientes[0]),
        salvar: !this.state.temEmail,
      })
      .then(
        async (res) => {
          console.log(res);
          const { failures, successes } = res.data;

          await this.setState({ successes, failures, emails: [] });

          if (!failures[0]) {
            await this.setState({ email: false });
          }
        },
        async (res) => await console.log(`Erro: ${JSON.stringify(res)}`)
      );
    await this.setState({ emailBloqueado: false, loading: false });
  };

  erroApi = async (res) => {
    alert(res);
  };

  filterSearch = (e, state) => {
    if (e == "") {
      return true;
    }

    const text = state.toUpperCase();
    return e.label.toUpperCase().includes(text);
  };

  relatorio = async () => {
    this.setState({ loading: true });

    const relatorio = this.state.relatorio;
    console.log(relatorio);
    let map = [];
    let titulo = "contas ";

    titulo +=
      this.props.location.state.backTo == "contasPagar"
        ? "a pagar"
        : this.props.location.state.backTo == "contasReceber"
        ? "a receber"
        : this.props.location.state.backTo == "contasPagas"
        ? "pagas"
        : "recebidas";

    titulo +=
      this.state.por == "porCliente" &&
      (this.props.location.state.backTo == "contasPagar" ||
        this.props.location.backTo == "contasPagas")
        ? " por fornecedor"
        : this.state.por == "porCliente"
        ? " por cliente"
        : this.state.por == "porVencimento"
        ? " por vencimento"
        : " por Data de Pagamento;";

    titulo += this.state.periodoInicial
      ? ` - No período de ${moment(this.state.periodoInicial).format(
          "DD/MM/YYYY"
        )}`
      : this.state.periodoFinal
      ? ` - De um período até ${moment(this.state.periodoFinal).format(
          "DD/MM/YYYY"
        )}`
      : "";

    titulo +=
      this.state.periodoFinal && this.state.periodoInicial
        ? ` a ${moment(this.state.periodoFinal).format("DD/MM/YYYY")}`
        : "";

    let totalFDA = 0;
    let totalDiscount = 0;
    let totalReceived = 0;
    this.setState({ totalBalance: 0 });

    let checkBalance = 0;

    let totalValor = 0;
    let totalSaldo = 0;

    let totalValorPorGrupo = 0;
    let totalSaldoPorGrupo = 0;

    if (
      this.props.location.state.backTo != "contasPagas" &&
      this.props.location.state.backTo != "contasPagar"
    ) {
      this.setState({
        pdfNome: `SOA (${moment().format("DD-MM-YYYY")})${
          this.state.clientes[0] && !this.state.clientes[1]
            ? ` - ${this.state.pessoas
                .find((e) => e.Chave == this.state.clientes[0])
                ?.Nome?.replaceAll(".", "")}`
            : ""
        }`,
      });
    } else {
      if (this.props.location.state.backTo == "contasPagas") {
        this.setState({
          pdfNome: `Relatório de contas pagas (${moment().format(
            "DD-MM-YYYY"
          )})`,
        });
      } else if (this.props.location.state.backTo == "contasPagar") {
        this.setState({
          pdfNome: `Relatório de contas à pagar (${moment().format(
            "DD-MM-YYYY"
          )})`,
        });
      }
    }

    let pdf = (
      <div style={{ zoom: 1 }} id="pdfDiv" key={546546554654}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            className="img-fluid"
            src="https://i.ibb.co/vmKJkx4/logo.png"
            alt="logo-Strade"
            border="0"
            style={{ width: "30%", height: "150px", maxWidth: "100%" }}
          />
          {this.props.location.state.backTo == "contasPagas" ||
            (this.props.location.state.backTo == "contasPagar" && (
              <h4>{titulo}</h4>
            ))}
          {this.props.location.state.backTo != "contasPagas" &&
            this.props.location.state.backTo != "contasPagar" && (
              <>
              <h4>SOA - Statement of Accounts</h4>
              <p>Issued on {moment().format("MMM Do YYYY")}</p>
              </>
            )}
        </div>
        <hr />
        {this.props.location.state.backTo != "contasPagas" &&
          this.props.location.state.backTo != "contasPagar" && (
            <div className="pdfContent">
              {relatorio.map((e) => {
                if (this.props.location.state.backTo == "contasReceber") {
                  const rows = [];
                  if (e.contas_normais && Array.isArray(e.contas_normais)) {
                    e.contas_normais.forEach((f) => {
                    let FDA2 = f?.fda;
                    let DISCONT2 = f?.discount;
                    let RECEIVED2 = f?.received;
                    let BALANCE2 = f?.balance;
                    console.log({
                        FDA2,
                        DISCONT2,
                        RECEIVED2,
                        BALANCE2,
                        roe: f?.roe || 1,
                    },'valores em real');
                    console.log(this.state.moeda);
                    if (this.state.moeda) {
                      if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                      } else {
                        FDA2 = f?.FDADOLAR ? f?.FDADOLAR : FDA2 / f?.roe;
                        DISCONT2 =  f?.discountDOLAR ? f?.discountDOLAR : DISCONT2 / f?.roe;
                        RECEIVED2 = f?.receivedDOLAR ? f.receivedDOLAR : RECEIVED2 /f?.roe;
                        BALANCE2 = f?.balanceDolar ? f?.balanceDolar : BALANCE2 / f?.roe;
                        console.log({
                            FDA2,
                            DISCONT2,
                            RECEIVED2,
                            BALANCE2,
                            roe: f?.roe || 1,
                        },'valores em dolar');
                      }
                    }
                    const row = {
                      ship: f?.ship || "",
                      os: f?.os || "",
                      port: f?.port || "",
                      moeda: f?.moeda || 5,
                      sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                      billing: (() => {
                        const date = moment(f?.billing);
                        return date.isValid()
                          ? date.format("YY") === "99" // Verifica se o ano é 99
                            ? "N/A" // Se o ano for 99, define como "N/A"
                            : date.format("YYYY-MM-DD") // Caso contrário, formata normalmente
                          : moment().format("YYYY-MM-DD"); // Caso f.billing seja inválido, usa a data atual
                      })(),
                      roe: f?.roe || 5,
                      fda: FDA2,
                      discount: DISCONT2,
                      received: RECEIVED2,
                      balance: BALANCE2,
                    };
                    rows.push(row);

                    return f;
                  });
                  }
                  if (e.contas_manuais && Array.isArray(e.contas_manuais)) {
                    e.contas_manuais.forEach((f) => {
                    let FDA2 = f?.fda;
                    let DISCONT2 = f?.discount;
                    let RECEIVED2 = f?.received;
                    let BALANCE2 = f?.balance;
                    console.log({
                        FDA2,
                        DISCONT2,
                        RECEIVED2,
                        BALANCE2,
                        roe: f?.roe || 1,
                    },'valores em real');
                    console.log(this.state.moeda);
                    if (this.state.moeda) {
                      if (parseInt(this.state.moeda) === parseInt(f?.moeda)) {
                      } else {
                        FDA2 = FDA2 / f.roe;
                        DISCONT2 = DISCONT2 / f?.roe;
                        RECEIVED2 = RECEIVED2 /f?.roe;
                        BALANCE2 = BALANCE2 / f?.roe;
                        console.log({
                            FDA2,
                            DISCONT2,
                            RECEIVED2,
                            BALANCE2,
                            roe: f?.roe || 1,
                        },'valores em dolar');
                      }
                    }
                    const row = {
                      ship: f?.ship || "",
                      os: f?.os || "",
                      port: f?.port || "",
                      moeda: f?.moeda || 5,
                      sailed: f?.sailed || moment().format("YYYY-MM-DD"),
                      billing: (() => {
                        const date = moment(f?.billing);
                        return date.isValid()
                          ? date.format("YY") === "99" // Verifica se o ano é 99
                            ? "N/A" // Se o ano for 99, define como "N/A"
                            : date.format("YYYY-MM-DD") // Caso contrário, formata normalmente
                          : moment().format("YYYY-MM-DD"); // Caso f.billing seja inválido, usa a data atual
                      })(),
                      roe: f?.roe || 5,
                      fda: FDA2,
                      discount: DISCONT2,
                      received: RECEIVED2,
                      balance: BALANCE2,
                    };
                    rows.push(row);

                    return f;
                  });
                  }

                  console.log(rows, "rows");
                  let totalFDAPorGrupo = 0;
                  let totalDiscountPorGrupo = 0;
                  let totalReceivedPorGrupo = 0;
                  let totalBalancePorGrupo = 0;

                  const hasDiscount = rows.some(row => parseFloat(row.discount) > 0.00);

                  return (
                    <div>
                      <table className="pdfTable">
                        <tr>
                        <th colSpan={hasDiscount ? 9 : 8}>
                            <span style={{ fontSize: 15 }}>
                              {this.state.por == "porCliente" && e.pessoa?.nome
                                ? e?.pessoa?.nome
                                : this.state.por == "porVencimento" &&
                                  e.lancamento
                                ? moment(e.lancamento).format("DD/MM/YYYY")
                                : e.lancamento
                                ? moment(e.lancamento).format("DD/MM/YYYY")
                                : ""}
                            </span>
                          </th>
                        </tr>
                        <tr style={{ fontSize: 13 }}>
                          <th>SHIP'S NAME</th>
                          <th>PO</th>
                          <th>PORT OF CALL</th>
                          <th>SAILED</th>
                          <th>BILLING</th>
                          <th>ROE</th>
                          <th>FDA</th>
                          {hasDiscount && <th>DISCOUNT</th>}
                          <th>RECEIVED</th>
                          <th>BALANCE</th>
                        </tr>
                        {rows
                          .sort((a, b) =>
                            moment(a.sailed).diff(moment(b.sailed))
                          )
                          .map((row, index) => {
                            if (parseFloat(row.balance) > 0.01) {
                                totalFDA += parseFloat(row.fda);
                                totalDiscount += parseFloat(row.discount);
                                totalReceived += parseFloat(row.received);
                                this.setState({
                                  totalBalance:
                                    this.state.totalBalance +
                                    parseFloat(row.balance),
                                });
    
                                totalFDAPorGrupo += parseFloat(row.fda);
                                totalDiscountPorGrupo += parseFloat(row.discount);
                                totalReceivedPorGrupo += parseFloat(row.received);
                                totalBalancePorGrupo += parseFloat(row.balance);
                              return (
                                <tr
                                  style={{ fontSize: 12 }}
                                  className="SOA_row"
                                >
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 135,
                                      minWidth: 135,
                                    }}
                                  >
                                    {row.ship}
                                  </td>
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 55,
                                      minWidth: 55,
                                    }}
                                  >
                                    {row.os}
                                  </td>
                                  {!this.state.clientes[0] && (
                                    <>
                                      <td
                                        style={{
                                          backgroundColor: "inherit",
                                          whiteSpace: "nowrap",
                                          maxWidth: 85,
                                          minWidth: 85,
                                        }}
                                      >
                                        {row.port}
                                      </td>
                                      <td
                                        style={{
                                          backgroundColor: "inherit",
                                          whiteSpace: "nowrap",
                                          maxWidth: 60,
                                          minWidth: 60,
                                        }}
                                      >
                                        {moment(row.sailed).format("DD/MM/YY")}
                                      </td>
                                      <td
                                      style={{
                                        backgroundColor: "inherit",
                                        whiteSpace: "nowrap",
                                        maxWidth: 60,
                                        minWidth: 60,
                                      }}
                                    >
                                      {row.billing === "N/A" 
                                      ? "N/A" 
                                      : moment(row.billing).format("DD/MM/YY")}
                                    </td>
                                    </>
                                  )}
                                  {this.state.clientes[0] && (
                                    <>
                                      <td
                                        style={{
                                          backgroundColor: "inherit",
                                          whiteSpace: "nowrap",
                                          maxWidth: 105,
                                          minWidth: 105,
                                        }}
                                      >
                                        {row.port}
                                      </td>
                                      <td
                                        style={{
                                          backgroundColor: "inherit",
                                          whiteSpace: "nowrap",
                                          maxWidth: 95,
                                          minWidth: 95,
                                        }}
                                      >
                                        {moment(row.sailed).format(
                                          "MMM Do YYYY"
                                        )}
                                      </td>
                                      <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 95,
                                      minWidth: 95,
                                    }}
                                  >
                                    {row.billing === "N/A" 
                                    ? "N/A" 
                                    : moment(row.billing).format("MMM Do YYYY")}
                                  </td>
                                    </>
                                  )}
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 65,
                                      minWidth: 65,
                                    }}
                                  >
                                    {parseFloat(row?.roe || 5).toFixed(4)}
                                  </td>
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 95,
                                      minWidth: 95,
                                    }}
                                  >
                                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "decimal",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(row.fda)}
                                  </td>
                                  {hasDiscount && (
                                    <td style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 95,
                                      minWidth: 95,
                                    }}>
                                      {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "decimal",
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(row.discount)}
                                    </td>
                                  )}
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 95,
                                      minWidth: 95,
                                    }}
                                  >
                                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "decimal",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(row.received)}
                                  </td>
                                  <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "decimal",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(row.balance)}
                                  </td>
                                </tr>
                              );
                            }
                          })}
                        <tr style={{ fontSize: 13 }}>
                          <th colSpan={this.state.clientes[0] ? "6" : "6"}>
                            {"Total ->"}
                          </th>
                          <td
                            style={{
                              paddingRight: "15px",
                              borderTop: "1px solid black",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(totalFDAPorGrupo)}
                          </td>
                          {hasDiscount && (
                            <td style={{
                              paddingRight: "15px",
                              borderTop: "1px solid black",
                              whiteSpace: "nowrap",
                            }}>
                              {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(totalDiscountPorGrupo)}
                            </td>
                          )}
                          <td
                            style={{
                              paddingRight: "15px",
                              borderTop: "1px solid black",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(totalReceivedPorGrupo)}
                          </td>
                          <td
                            style={{
                              paddingRight: "15px",
                              borderTop: "1px solid black",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(totalBalancePorGrupo)}
                          </td>
                        </tr>
                      </table>
                      <hr />
                    </div>
                  );
                }

                checkBalance = 0;
                const rows = [];

                if (this.state.por == "porCliente" && !e.pessoa) {
                  e.pessoa = "";
                }
                if (this.state.por == "porVencimento" && !e.vencimento) {
                  e.vencimento = "";
                }
                if (this.state.por == "porData" && !e.dataPagamento) {
                  e.dataPagamento = "";
                }
                map =
                  this.state.por == "porCliente"
                    ? e.pessoa.split("@.@")
                    : this.state.por == "porVencimento"
                    ? e.vencimento.split("@.@")
                    : e.dataPagamento.split("@.@");

                map.map((el, index) => {
                  if (!e?.os_manual?.split("@.@")[index]) {
                    return;
                  }

                  let FDA = 0;
                  let discount = 0;
                  let received = 0;

                  if (this.state.moeda == 5) {
                    FDA += e?.valor_manual?.split("@.@")[index];
                    discount = e.discount_manual
                      ? util.toFixed(
                          parseFloat(e.discount_manual?.split("@.@")[index]),
                          2
                        )
                      : "0,00";
                    received = e.received_manual
                      ? util.toFixed(
                          parseFloat(e.received_manual?.split("@.@")[index]),
                          2
                        )
                      : "0,00";
                  } else if (this.state.moeda == 6) {
                    FDA += e?.valor_manual?.split("@.@")[index]
                      ? util.toFixed(
                          parseFloat(e.valor_manual.split("@.@")[index]) /
                            parseFloat(
                              e.roe_manual &&
                                !!e.roe_manual?.split("@.@")[index] &&
                                e.roe_manual?.split("@.@")[index] != 0
                                ? e.roe_manual?.split("@.@")[index]
                                : 5
                            ),
                          2
                        )
                      : 0;
                    discount += e.discount_manual?.split("@.@")[index]
                      ? util.toFixed(
                          parseFloat(e.discount_manual?.split("@.@")[index]) /
                            parseFloat(
                              e.roe_manual &&
                                !!e.roe_manual?.split("@.@")[index] &&
                                e.roe_manual?.split("@.@")[index] != 0
                                ? e.roe_manual?.split("@.@")[index]
                                : 5
                            ),
                          2
                        )
                      : 0;
                    received += e.received_manual?.split("@.@")[index]
                      ? util.toFixed(
                          parseFloat(e.received_manual?.split("@.@")[index]) /
                            parseFloat(
                              e.roe_manual &&
                                !!e.roe_manual?.split("@.@")[index] &&
                                e.roe_manual?.split("@.@")[index] != 0
                                ? e.roe_manual?.split("@.@")[index]
                                : 5
                            ),
                          2
                        )
                      : 0;
                  }

                  const balance =
                    parseFloat(FDA) -
                    parseFloat(discount) -
                    parseFloat(received);
                  if (parseFloat(balance.toFixed(2)) > 0) {
                    rows.push({
                      ship: e.navio_manual
                        ? util.removeAcentos(e.navio_manual.split("@.@")[index])
                        : "",
                      os: e.os_manual
                        ? util.removeAcentos(e.os_manual.split("@.@")[index])
                        : "",
                      port: e.porto_manual
                        ? util.removeAcentos(e.porto_manual.split("@.@")[index])
                        : "",
                      sailed: e.sailed_manual
                        ? e.sailed_manual.split("@.@")[index]
                        : "",
                      billing: e.envio_manual
                      ? (() => {
                          const date = moment(e.envio_manual.split("@.@")[index]);
                          return date.isValid()
                            ? date.format("YY") === "99" // Verifica se o ano é 99
                              ? "N/A" // Se o ano for 99, define como "N/A"
                              : date.format("YYYY-MM-DD") // Caso contrário, formata normalmente
                            : "";
                        })()
                      : "",
                      roe: e.roe_manual ? e.roe_manual.split("@.@")[index] : "",
                      fda: FDA,
                      discount,
                      received,
                      balance,
                    });
                  }
                  checkBalance += parseFloat(balance.toFixed(2));
                });

                map.map((el, index) => {
                  if (!e?.os?.split("@.@")[index]) {
                    return;
                  }
                  const eventMap = e.evento_valor?.split("@.@");
                  const eventMapReceived =
                    e.evento_valor_received?.split("@.@");
                  const eventMapDiscount =
                    e.evento_valor_discount?.split("@.@");

                  let FDA = 0;
                  let discount = 0;
                  let received = 0;

                  if (eventMap) {
                    console.log({
                      navio: e.navio.split("@.@")[index],
                      el,
                      os: e.os.split("@.@")[index],
                      saldo: e.saldo.split("@.@")[index],
                      index,
                      moeda: this.state.moeda,
                      evento_moeda: e.evento_moeda.split("@.@")[index],
                      roe: e.ROE.split("@.@")[index],
                      FDA,
                    });

                    eventMap.map((elem, eventIndex) => {
                      if (
                        e.evento_os.split("@.@")[eventIndex] ==
                        e.os.split("@.@")[index]
                      ) {
                        if (
                          this.state.moeda ==
                          e.evento_moeda.split("@.@")[eventIndex]
                        ) {
                          FDA += (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                              )
                            : 0;
                        } else if (this.state.moeda == 5) {
                          FDA += (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                              ) *
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        } else if (this.state.moeda == 6) {
                          FDA += (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor.split("@.@")[eventIndex]) * (e.evento_qntd.split("@.@")[eventIndex])
                              ) /
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        }
                      }
                    });
                  }
                  if (eventMapReceived) {
                    eventMap.map((elem, eventIndex) => {
                      if (
                        e.evento_os_received.split("@.@")[eventIndex] ==
                        e.os.split("@.@")[index]
                      ) {
                        if (
                          this.state.moeda ==
                          e.evento_moeda_received.split("@.@")[eventIndex]
                        ) {
                          received += (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                              )
                            : 0;
                        } else if (this.state.moeda == 5) {
                          received += (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                              ) *
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        } else if (this.state.moeda == 6) {
                          received += (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_received.split("@.@")[eventIndex]) * (e.evento_qntd_received.split("@.@")[eventIndex])
                              ) /
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        }
                      }
                    });
                  }
                  if (eventMapDiscount) {
                    eventMap.map((elem, eventIndex) => {
                      if (
                        e.evento_os_discount.split("@.@")[eventIndex] ==
                        e.os.split("@.@")[index]
                      ) {
                        if (
                          this.state.moeda ==
                          e.evento_moeda_discount.split("@.@")[eventIndex]
                        ) {
                          discount += (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                              )
                            : 0;
                        } else if (this.state.moeda == 5) {
                          discount += (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                              ) *
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        } else if (this.state.moeda == 6) {
                          discount += (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                            ? parseFloat(
                              (e.evento_valor_discount.split("@.@")[eventIndex]) * (e.evento_qntd_discount.split("@.@")[eventIndex])
                              ) /
                              parseFloat(
                                e.ROE &&
                                  !!e.ROE.split("@.@")[index] &&
                                  e.ROE.split("@.@")[index] != 0
                                  ? e.ROE.split("@.@")[index]
                                  : 5
                              )
                            : 0;
                        }
                      }
                    });
                  }

                  console.log({
                    navio: e.navio.split("@.@")[index],
                    el,
                    os: e.os.split("@.@")[index],
                    saldo: e.saldo.split("@.@")[index],
                    index,
                    moeda: this.state.moeda,
                    roe: e.ROE.split("@.@")[index],
                    FDA,
                  });

                  if (this.state.moeda == 5) {
                    FDA +=
                      e.bankCharges.split("@.@")[index] &&
                      e.bankCharges.split("@.@")[index] > 0
                        ? parseFloat(e.bankCharges.split("@.@")[index])
                        : 0;
                    FDA +=
                      e.governmentTaxes.split("@.@")[index] &&
                      e.governmentTaxes.split("@.@")[index] > 0
                        ? parseFloat(e.governmentTaxes.split("@.@")[index])
                        : 0;
                  } else if (this.state.moeda == 6) {
                    FDA +=
                      e.bankCharges.split("@.@")[index] &&
                      e.bankCharges.split("@.@")[index] > 0
                        ? parseFloat(e.bankCharges.split("@.@")[index]) /
                          parseFloat(
                            e.ROE &&
                              !!e.ROE.split("@.@")[index] &&
                              e.ROE.split("@.@")[index] != 0
                              ? e.ROE.split("@.@")[index]
                              : 5
                          )
                        : 0;
                    FDA +=
                      e.governmentTaxes.split("@.@")[index] &&
                      e.governmentTaxes.split("@.@")[index] > 0
                        ? parseFloat(e.governmentTaxes.split("@.@")[index]) /
                          parseFloat(
                            e.ROE &&
                              !!e.ROE.split("@.@")[index] &&
                              e.ROE.split("@.@")[index] != 0
                              ? e.ROE.split("@.@")[index]
                              : 5
                          )
                        : 0;
                  }

                  const balance =
                    parseFloat(FDA) -
                    parseFloat(discount) -
                    parseFloat(received);

                  console.log({
                    navio: e.navio.split("@.@")[index],
                    el,
                    os: e.os.split("@.@")[index],
                    saldo: e.saldo.split("@.@")[index],
                    index,
                    moeda: this.state.moeda,
                    roe: e.ROE.split("@.@")[index],
                    FDA,
                    discount,
                    received,
                    balance,
                  });

                  if (parseFloat(balance.toFixed(2)) > 0) {
                    rows.push({
                      ship: e.navio
                        ? util.removeAcentos(e.navio.split("@.@")[index])
                        : "",
                      os: e.os
                        ? util.removeAcentos(e.os.split("@.@")[index])
                        : "",
                      port: e.porto
                        ? util.removeAcentos(e.porto.split("@.@")[index])
                        : "",
                      sailed: e.sailed ? e.sailed.split("@.@")[index] : "",
                      billing: e.envio
                        ? (() => {
                            const date = moment(e.envio.split("@.@")[index]);
                            return date.isValid()
                              ? date.format("YY") == "99" // Verifica se o ano é 99
                                ? "N/A" // Se o ano for 99, define como "N/A"
                                : date.format("YYYY-MM-DD") // Caso contrário, formata normalmente
                              : "";
                          })()
                        : "",
                      roe: e.ROE ? e.ROE.split("@.@")[index] : "",
                      fda: FDA,
                      discount,
                      received,
                      balance,
                    });
                  }

                  checkBalance += parseFloat(balance.toFixed(2));
                });

                if (!checkBalance) {
                  return <></>;
                }

                let totalFDAPorGrupo = 0;
                let totalDiscountPorGrupo = 0;
                let totalReceivedPorGrupo = 0;
                let totalBalancePorGrupo = 0;

                const hasDiscount = rows.some(row => parseFloat(row.discount) > 0.00);

                return (
                  <div>
                    <table className="pdfTable">
                      <tr>
                      <th colSpan={hasDiscount ? 9 : 8}>
                          <span style={{ fontSize: 15 }}>
                            {this.state.por == "porCliente" && e.pessoa
                              ? e.pessoa.split("@.@")[0]
                              : this.state.por == "porVencimento" &&
                                e.vencimento
                              ? moment(e.vencimento.split("@.@")[0]).format(
                                  "DD/MM/YYYY"
                                )
                              : e.dataPagamento
                              ? moment(e.dataPagamento.split("@.@")[0]).format(
                                  "DD/MM/YYYY"
                                )
                              : ""}
                          </span>
                        </th>
                      </tr>
                      <tr style={{ fontSize: 13 }}>
                        <th>SHIP'S NAME</th>
                        <th>PO</th>
                        <th>PORT OF CALL</th>
                        <th>SAILED</th>
                        <th>BILLING</th>
                        <th>ROE</th>
                        <th>FDA</th>
                        {hasDiscount && <th>DISCOUNT</th>}
                        <th>RECEIVED</th>
                        <th>BALANCE</th>
                      </tr>
                      {rows
                        .sort((a, b) =>
                          moment(a.sailed).diff(moment(b.sailed))
                        )
                        .map((row, index) => {
                          if (parseFloat(row.balance) > 0) {
                            totalFDA += parseFloat(row.fda);
                            totalDiscount += parseFloat(row.discount);
                            totalReceived += parseFloat(row.received);
                            this.setState({
                              totalBalance:
                                this.state.totalBalance +
                                parseFloat(row.balance),
                            });

                            totalFDAPorGrupo += parseFloat(row.fda);
                            totalDiscountPorGrupo += parseFloat(row.discount);
                            totalReceivedPorGrupo += parseFloat(row.received);
                            totalBalancePorGrupo += parseFloat(row.balance);

                            return (
                              <tr style={{ fontSize: 12 }} className="SOA_row">
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 135,
                                    minWidth: 135,
                                  }}
                                >
                                  {row.ship}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 55,
                                    minWidth: 55,
                                  }}
                                >
                                  {row.os}
                                </td>
                                {!this.state.clientes[0] && (
                                  <>
                                    <td
                                      style={{
                                        backgroundColor: "inherit",
                                        whiteSpace: "nowrap",
                                        maxWidth: 85,
                                        minWidth: 85,
                                      }}
                                    >
                                      {row.port}
                                    </td>
                                    <td
                                      style={{
                                        backgroundColor: "inherit",
                                        whiteSpace: "nowrap",
                                        maxWidth: 60,
                                        minWidth: 60,
                                      }}
                                    >
                                      {moment(row.sailed).format("MMM Do YYYY")}
                                    </td>
                                    <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 60,
                                      minWidth: 60,
                                    }}
                                  >
                                    {row.billing === "N/A" 
                                    ? "N/A" 
                                    : moment(row.billing).format("MMM Do YYYY")}
                                  </td>
                                  </>
                                )}
                                {this.state.clientes[0] && (
                                  <>
                                    <td
                                      style={{
                                        backgroundColor: "inherit",
                                        whiteSpace: "nowrap",
                                        maxWidth: 105,
                                        minWidth: 105,
                                      }}
                                    >
                                      {row.port}
                                    </td>
                                    <td
                                      style={{
                                        backgroundColor: "inherit",
                                        whiteSpace: "nowrap",
                                        maxWidth: 95,
                                        minWidth: 95,
                                      }}
                                    >
                                      {moment(row.sailed).format("MMM Do YYYY")}
                                    </td>
                                    <td
                                    style={{
                                      backgroundColor: "inherit",
                                      whiteSpace: "nowrap",
                                      maxWidth: 95,
                                      minWidth: 95,
                                    }}
                                  >
                                    {row.billing === "N/A" 
                                    ? "N/A" 
                                    : moment(row.billing).format("MMM Do YYYY")}
                                  </td>
                                  </>
                                )}
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 65,
                                    minWidth: 65,
                                  }}
                                >
                                  {parseFloat(row?.roe || 5).toFixed(4)}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 95,
                                    minWidth: 95,
                                  }}
                                >
                                  {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.fda)}
                                </td>
                                {hasDiscount && (
                                  <td style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 95,
                                    minWidth: 95,
                                  }}>
                                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "decimal",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(row.discount)}
                                  </td>
                                )}
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                    maxWidth: 95,
                                    minWidth: 95,
                                  }}
                                >
                                  {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.received)}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: "inherit",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.balance)}
                                </td>
                              </tr>
                            );
                          }
                        })}
                      <tr style={{ fontSize: 13 }}>
                        <th colSpan={this.state.clientes[0] ? "6" : "6"}>
                          {"Total ->"}
                        </th>
                        <td
                          style={{
                            paddingRight: "15px",
                            borderTop: "1px solid black",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalFDAPorGrupo)}
                        </td>
                        {hasDiscount && (
                          <td style={{
                            paddingRight: "15px",
                            borderTop: "1px solid black",
                            whiteSpace: "nowrap",
                          }}>
                            {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(totalDiscountPorGrupo)}
                          </td>
                        )}
                        <td
                          style={{
                            paddingRight: "15px",
                            borderTop: "1px solid black",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalReceivedPorGrupo)}
                        </td>
                        <td
                          style={{
                            paddingRight: "15px",
                            borderTop: "1px solid black",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalBalancePorGrupo)}
                        </td>
                      </tr>
                    </table>
                    <hr />
                  </div>
                );
              })}
              <table className="totalTablePDF">
                <tr style={{ fontSize: 13 }}>
                  <th></th>
                  <th style={{ borderBottom: "1px solid black" }}>FDA</th>
                  <th style={{ borderBottom: "1px solid black" }}>DISCOUNT</th>
                  <th style={{ borderBottom: "1px solid black" }}>RECEIVED</th>
                  <th style={{ borderBottom: "1px solid black" }}>BALANCE</th>
                </tr>
                <tr style={{ fontSize: 12 }}>
                  <th>{"Total ->"}</th>
                  <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalFDA)}
                  </td>
                  <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalDiscount)}
                  </td>
                  <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalReceived)}
                  </td>
                  <td style={{ paddingRight: "15px", whiteSpace: "nowrap" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(this.state.totalBalance)}
                  </td>
                </tr>
              </table>

              <br />
              <br />
              <br />

              <h5 style={{ width: "100%", textAlign: "center" }}>
                BANKING DETAILS
              </h5>
              <table style={{ width: "80%", marginLeft: "5%" }}>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco Santander
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>SWIFT code:</b> BSCHBRSPXXX
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>IBAN:</b> BR8290400888032720130031839C1
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Branch's number:</b> 3272
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Account number:</b> 130031839
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Sender’s correspondent:</b> Standard Chartered Bank
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Sender’s correspondent - SWIFT:</b> SCBLUS33XXX
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE
                    AGENCIAMENTOS MARITIMOS LTDA-ME
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Address:</b> 161 Andrade Neves Street
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                    <b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75
                  </td>
                </tr>
              </table>
            </div>
          )}
        {this.props.location.state.backTo == "contasPagas" ||
          (this.props.location.state.backTo == "contasPagar" && (
            <div className="pdfContent">
              {relatorio.map((e) => {
                console.log(e);
                totalValorPorGrupo = 0;
                totalSaldoPorGrupo = 0;

                if (this.state.por == "porCliente" && !e.pessoa) {
                  e.pessoa = "";
                }
                if (this.state.por == "porVencimento" && !e.vencimento) {
                  e.vencimento = "";
                }
                if (this.state.por == "porData" && !e.dataPagamento) {
                  e.dataPagamento = "";
                }
                map =
                  this.state.por == "porCliente"
                    ? e.pessoa.split("@.@")
                    : this.state.por == "porVencimento"
                    ? e.vencimento.split("@.@")
                    : e.dataPagamento.split("@.@");
                return (
                  <div>
                    <table className="pdfTable">
                      <tr>
                        <th style={{ minWidth: 100 }}>Nº DOCTO</th>
                        <th style={{ minWidth: 75 }}>PO</th>
                        <th style={{ minWidth: 100 }}>PESSOA</th>
                        <th style={{ minWidth: 150 }}>HISTORICO</th>
                        <th style={{ minWidth: 100 }}>SALDO</th>
                        <th style={{ minWidth: 100 }}>VALOR</th>
                      </tr>
                      <tr
                        style={{
                          backgroundColor: "#999999",
                          border: "1px solid black",
                        }}
                      >
                        <th colSpan={6}>
                          <span style={{ fontSize: "1.2em" }}>
                            {this.state.por == "porCliente" && e.pessoa
                              ? e.pessoa.split("@.@")[0]
                              : this.state.por == "porVencimento" &&
                                e.vencimento
                              ? moment(e.vencimento.split("@.@")[0]).format(
                                  "DD/MM/YYYY"
                                )
                              : e.dataPagamento
                              ? moment(e.dataPagamento.split("@.@")[0]).format(
                                  "DD/MM/YYYY"
                                )
                              : ""}
                          </span>
                        </th>
                      </tr>
                      {map.map((el, index) => {
                        let valor = 0;
                        let saldo = 0;

                        if (
                          (e.os_moeda &&
                            this.state.moeda ==
                              e.os_moeda.split("@.@")[index]) ||
                          !e.os_moeda
                        ) {
                          valor = e.valor
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                e.valor.split("@.@")[
                                  index
                                ] /* - e.valorDescontos*/
                              )
                            : "0,00";
                          saldo = e.saldo
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                e.saldo.split("@.@")[
                                  index
                                ] /* - e.valorDescontos*/
                              )
                            : "0,00";
                        } else if (this.state.moeda == 5) {
                          valor = e.valor
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                parseFloat(
                                  e.ROE &&
                                    !!e.ROE.split("@.@")[index] &&
                                    e.ROE.split("@.@")[index] != 0
                                    ? e.ROE.split("@.@")[index]
                                    : 5
                                ) *
                                  parseFloat(
                                    e.valor.split("@.@")[
                                      index
                                    ] /* - e.valorDescontos*/
                                  )
                              )
                            : "0,00";
                          saldo = e.saldo
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                parseFloat(
                                  e.ROE &&
                                    !!e.ROE.split("@.@")[index] &&
                                    e.ROE.split("@.@")[index] != 0
                                    ? e.ROE.split("@.@")[index]
                                    : 5
                                ) *
                                  parseFloat(
                                    e.saldo.split("@.@")[
                                      index
                                    ] /* - e.valorDescontos*/
                                  )
                              )
                            : "0,00";
                        } else {
                          valor = e.valor
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                parseFloat(
                                  e.valor.split("@.@")[
                                    index
                                  ] /* - e.valorDescontos*/
                                ) /
                                  parseFloat(
                                    e.ROE &&
                                      !!e.ROE.split("@.@")[index] &&
                                      e.ROE.split("@.@")[index] != 0
                                      ? e.ROE.split("@.@")[index]
                                      : 5
                                  )
                              )
                            : "0,00";
                          saldo = e.saldo
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                parseFloat(
                                  e.saldo.split("@.@")[
                                    index
                                  ] /* - e.valorDescontos*/
                                ) /
                                  parseFloat(
                                    e.ROE &&
                                      !!e.ROE.split("@.@")[index] &&
                                      e.ROE.split("@.@")[index] != 0
                                      ? e.ROE.split("@.@")[index]
                                      : 5
                                  )
                              )
                            : "0,00";
                        }

                        totalValor += parseFloat(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        );
                        totalValorPorGrupo += parseFloat(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        );

                        totalSaldo += parseFloat(
                          saldo.replaceAll(".", "").replaceAll(",", ".")
                        );
                        totalSaldoPorGrupo += parseFloat(
                          saldo.replaceAll(".", "").replaceAll(",", ".")
                        );

                        if (
                          parseFloat(
                            valor.replaceAll(".", "").replaceAll(",", ".")
                          ) > 0
                        ) {
                          return (
                            <tr
                              style={{
                                backgroundColor:
                                  index % 2 === 0 ? "#FFFFFF" : "#999999",
                              }}
                            >
                              <td
                                style={{
                                  minWidth: 100,
                                  backgroundColor: "inherit",
                                }}
                              >
                                {e.documento
                                  ? util.removeAcentos(
                                      e.documento.split("@.@")[index]
                                    )
                                  : ""}
                              </td>
                              <td
                                style={{
                                  minWidth: 75,
                                  backgroundColor: "inherit",
                                }}
                              >
                                {e.os
                                  ? util.removeAcentos(e.os.split("@.@")[index])
                                  : ""}
                              </td>
                              <td
                                style={{
                                  minWidth: 100,
                                  backgroundColor: "inherit",
                                }}
                              >
                                {e.pessoa
                                  ? util.removeAcentos(
                                      e.pessoa.split("@.@")[index]
                                    )
                                  : ""}
                              </td>
                              <td
                                style={{
                                  minWidth: 150,
                                  backgroundColor: "inherit",
                                }}
                              >
                                {e.historico
                                  ? util.removeAcentos(
                                      e.historico.split("@.@")[index]
                                    )
                                  : ""}
                              </td>
                              <td
                                style={{
                                  minWidth: 100,
                                  backgroundColor: "inherit",
                                  paddingLeft: 3,
                                  paddingRight: 3,
                                }}
                              >
                                {this.state.moeda == 5 ? "R$" : "USD"} {valor}
                              </td>
                              <td
                                style={{
                                  minWidth: 100,
                                  backgroundColor: "inherit",
                                  paddingLeft: 3,
                                  paddingRight: 3,
                                }}
                              >
                                {this.state.moeda == 5 ? "R$" : "USD"} {saldo}
                              </td>
                            </tr>
                          );
                        }
                      })}
                      <tr>
                        <th colSpan="4">{"Total ->"}</th>
                        <td
                          style={{
                            borderTop: "1px solid black",
                            paddingLeft: 3,
                            paddingRight: 3,
                          }}
                        >
                          {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalValorPorGrupo)}
                        </td>
                        <td
                          style={{
                            borderTop: "1px solid black",
                            paddingLeft: 3,
                            paddingRight: 3,
                          }}
                        >
                          {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalSaldoPorGrupo)}
                        </td>
                      </tr>
                    </table>
                    <hr />
                  </div>
                );
              })}
              <table className="totalTablePDF">
                <tr>
                  <th></th>
                  <th style={{ borderBottom: "1px solid black" }}>VALOR</th>
                  <th style={{ borderBottom: "1px solid black" }}>SALDO</th>
                </tr>
                <tr>
                  <th>{"Total ->"}</th>
                  <td style={{ paddingRight: "15px" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalValor)}
                  </td>
                  <td style={{ paddingRight: "15px" }}>
                    {this.state.moeda == 5 ? "R$" : "USD"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalSaldo)}
                  </td>
                </tr>
              </table>
            </div>
          ))}
      </div>
    );

    await this.setState({
      pdfgerado: pdf,
      pdfView: true,
      loading: false,
      pdfEmail: ReactDOMServer.renderToString(pdf),
    });
    this.handleExportWithComponent();
  };

  handleExportWithComponent = (event) => {
    this.setState({ loading: false });
    
    // Se está marcado para download automático, gerar o ZIP
    if (this.state.downloadZipAutomatico && this.state.pdfsSeparadosGerados.length > 0) {
      // Aguardar que a visualização seja totalmente renderizada
      setTimeout(() => {
        // Verificar se os elementos DOM existem antes de gerar o ZIP
        const verificarElementosDOM = () => {
          const elementosEncontrados = this.state.pdfsSeparadosGerados.map(pdf => 
            document.getElementById(`pdfDiv_${pdf.clienteId}`)
          ).filter(el => el !== null);
          
          console.log(`Verificando elementos DOM: ${elementosEncontrados.length}/${this.state.pdfsSeparadosGerados.length}`);
          
          if (elementosEncontrados.length === this.state.pdfsSeparadosGerados.length) {
            console.log('Todos os elementos DOM estão prontos, gerando ZIP...');
            this.gerarZipPDFs();
          } else {
            console.log('Aguardando mais elementos DOM...');
            // Tentar novamente em 500ms
            setTimeout(verificarElementosDOM, 500);
          }
        };
        
        verificarElementosDOM();
      }, 2000); // Aguardar 2 segundos iniciais para garantir que o DOM comece a renderizar
    }
  };

  getPessoaContatos = async (pessoa) => {
    await apiEmployee
      .post(`getContatos.php`, {
        token: true,
        pessoa: pessoa,
      })
      .then(
        async (response) => {
          await this.setState({
            contatos: response.data,
            fornecedorEmail: response.data.find((e) => e.Tipo == "EM")
              ? response.data.find((e) => e.Tipo == "EM")?.Campo1
              : "",
          });
          await this.setState({
            emails: this.state.fornecedorEmail.split("; "),
          });
          await this.setState({ loading: false });
        },
        (response) => {
          this.erroApi(response);
        }
      );
  };

  render() {
    const validations = [];
    validations.push(this.state.por);
    validations.push(!this.state.bloqueado);

    const validForm = validations.reduce((t, a) => t && a);

    const validationsEmail = [];
    validationsEmail.push(this.state.emails[0] || this.state.failures[0]);
    validationsEmail.push(!this.state.emailBloqueado);

    const validFormEmail = validationsEmail.reduce((t, a) => t && a);

    return (
      <div className="allContent">
        {this.state.loading && <Skeleton />}
        {!this.state.loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              display: this.state.pdfView ? "flex" : "none",
              width: "100%",
              minWidth: 830,
              minHeight: "100vh",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "white",
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 830,
              }}
            >
              {/* Sempre exibir o PDF único para visualização */}
              <PDFExport
                fileName={this.state.pdfNome}
                scale={0.6}
                portrait={true}
                paperSize="A4"
                margin="0.5cm"
                ref={this.pdfExportComponent}
              >
                {this.state.pdfgerado}
              </PDFExport>

              {/* PDFs separados visíveis para exportação */}
              {this.state.pdfsSeparadosGerados.length > 0 && (
                <div style={{ marginTop: "40px", borderTop: "2px solid #ccc", paddingTop: "20px" }}>
                  <div style={{ textAlign: "center", marginBottom: "20px", backgroundColor: this.state.downloadZipAutomatico ? "#e7f3ff" : "#f8f9fa", padding: "15px", borderRadius: "5px", border: this.state.downloadZipAutomatico ? "2px solid #007bff" : "none" }}>
                    {this.state.downloadZipAutomatico ? (
                      <>
                        <h4 style={{ color: "#007bff", margin: "0" }}>🚀 Download Automático Ativado</h4>
                        <p style={{ margin: "8px 0 0 0", color: "#0056b3", fontSize: "14px", fontWeight: "bold" }}>
                          Um arquivo ZIP com {this.state.pdfsSeparadosGerados.length} PDFs será baixado automaticamente em instantes...
                        </p>
                        <div style={{ 
                          display: "inline-block", 
                          marginTop: "10px", 
                          padding: "5px 15px", 
                          backgroundColor: "#007bff", 
                          color: "white", 
                          borderRadius: "20px", 
                          fontSize: "12px",
                          animation: "pulse 1.5s infinite"
                        }}>
                          ⬇️ Preparando download...
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 style={{ color: "#495057", margin: "0" }}>📄 PDFs Individuais Preparados para Exportação</h4>
                        <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
                          {this.state.pdfsSeparadosGerados.length} arquivo(s) serão gerados separadamente
                        </p>
                      </>
                    )}
                  </div>
                  {this.state.pdfsSeparadosGerados.map((pdfData, index) => {
                    // Filtrar relatório para este cliente específico
                    const relatorioFiltrado = [];
                    
                    // Verificar se o relatório existe antes de usar forEach
                    if (this.state.relatorio && Array.isArray(this.state.relatorio)) {
                      this.state.relatorio.forEach(item => {
                        let itemFiltrado = { ...item };
                        let temDados = false;
                        
                        if (item.contas_normais && Array.isArray(item.contas_normais)) {
                          const contasCliente = item.contas_normais.filter(conta => {
                            // O campo pessoa pode ser apenas o ID ou um objeto
                            if (typeof conta.pessoa === 'object' && conta.pessoa.chave) {
                              return parseInt(conta.pessoa.chave) === parseInt(pdfData.clienteId);
                            } else if (typeof conta.pessoa === 'number' || typeof conta.pessoa === 'string') {
                            return parseInt(conta.pessoa) === parseInt(pdfData.clienteId);
                          }
                          return false;
                        });
                        if (contasCliente.length > 0) {
                          itemFiltrado.contas_normais = contasCliente;
                          temDados = true;
                        } else {
                          delete itemFiltrado.contas_normais;
                        }
                      }
                      
                      if (item.contas_manuais && Array.isArray(item.contas_manuais)) {
                        const contasCliente = item.contas_manuais.filter(conta => {
                          // O campo pessoa pode ser apenas o ID ou um objeto
                          if (typeof conta.pessoa === 'object' && conta.pessoa.chave) {
                            return parseInt(conta.pessoa.chave) === parseInt(pdfData.clienteId);
                          } else if (typeof conta.pessoa === 'number' || typeof conta.pessoa === 'string') {
                            return parseInt(conta.pessoa) === parseInt(pdfData.clienteId);
                          }
                          return false;
                        });
                        if (contasCliente.length > 0) {
                          itemFiltrado.contas_manuais = contasCliente;
                          temDados = true;
                        } else {
                          delete itemFiltrado.contas_manuais;
                        }
                      }
                      
                      // Se há contas normais ou manuais para este cliente, adicionar o item
                      if (temDados) {
                        // Definir a pessoa principal baseada nas contas encontradas ou do item principal
                        if (item.pessoa && item.pessoa.chave && parseInt(item.pessoa.chave) === parseInt(pdfData.clienteId)) {
                          itemFiltrado.pessoa = item.pessoa;
                        } else if (itemFiltrado.contas_normais && itemFiltrado.contas_normais[0]) {
                          // Se a pessoa é apenas ID, buscar dados completos na lista de pessoas
                          const pessoaId = typeof itemFiltrado.contas_normais[0].pessoa === 'object' 
                            ? itemFiltrado.contas_normais[0].pessoa.chave 
                            : itemFiltrado.contas_normais[0].pessoa;
                          const pessoaCompleta = this.state.pessoas.find(p => p.Chave == pessoaId);
                          itemFiltrado.pessoa = pessoaCompleta || { chave: pessoaId, nome: `Cliente ${pessoaId}` };
                        } else if (itemFiltrado.contas_manuais && itemFiltrado.contas_manuais[0]) {
                          // Se a pessoa é apenas ID, buscar dados completos na lista de pessoas
                          const pessoaId = typeof itemFiltrado.contas_manuais[0].pessoa === 'object' 
                            ? itemFiltrado.contas_manuais[0].pessoa.chave 
                            : itemFiltrado.contas_manuais[0].pessoa;
                          const pessoaCompleta = this.state.pessoas.find(p => p.Chave == pessoaId);
                          itemFiltrado.pessoa = pessoaCompleta || { chave: pessoaId, nome: `Cliente ${pessoaId}` };
                        }
                        relatorioFiltrado.push(itemFiltrado);
                      }
                    });
                    } // Fechamento do if que verifica se relatório existe
                    
                    console.log(`Filtro para cliente ${pdfData.clienteId}:`, relatorioFiltrado);
                    
                    return (
                      <div key={pdfData.clienteId} style={{ 
                        marginBottom: "30px", 
                        border: "1px solid #dee2e6", 
                        borderRadius: "5px",
                        overflow: "hidden"
                      }}>
                        <div style={{ 
                          backgroundColor: "#e9ecef", 
                          padding: "10px 15px", 
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#495057"
                        }}>
                          📄 {pdfData.pdfNome}
                        </div>
                        <div style={{ backgroundColor: "white" }}>
                          <PDFExport
                            fileName={pdfData.pdfNome}
                            scale={0.6}
                            portrait={true}
                            paperSize="A4"
                            margin="0.5cm"
                            ref={(ref) => this[`pdfExportRef_${pdfData.clienteId}`] = ref}
                          >
                            {this.renderPDFContent(relatorioFiltrado, pdfData.clienteId)}
                            
                            {/* Copiando exatamente do gerarPDFIndividual */}
                            <br />
                            <br />
                            <br />

                            <h5 style={{ width: "100%", textAlign: "center" }}>BANKING DETAILS</h5>
                            <table style={{ width: "80%", marginLeft: "5%" }}>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco Santander
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>SWIFT code:</b> BSCHBRSPXXX
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>IBAN:</b> BR8290400888032720130031839C1
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Branch's number:</b> 3272
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Account number:</b> 130031839
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Sender's correspondent:</b> Standard Chartered Bank
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Sender's correspondent - SWIFT:</b> SCBLUS33XXX
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Address:</b> 161 Andrade Neves Street
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                                  <b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75
                                </td>
                              </tr>
                            </table>
                          </PDFExport>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn btn-danger"
                  style={{ margin: 20 }}
                  onClick={() => {
                    // Se há PDFs separados, exportar todos eles
                    if (this.state.pdfsSeparadosGerados.length > 0) {
                      this.state.pdfsSeparadosGerados.forEach((pdfData, index) => {
                        setTimeout(() => {
                          this[`pdfExportRef_${pdfData.clienteId}`].save();
                        }, 500 * (index + 1));
                      });
                    } else {
                      // Caso contrário, exportar o PDF único como antes
                      this.pdfExportComponent.current.save();
                    }
                  }}
                >
                  {this.state.pdfsSeparadosGerados.length > 0 
                    ? `Exportar PDFs (${this.state.pdfsSeparadosGerados.length} arquivos)` 
                    : "Exportar PDF"}
                </button>
                {this.state.clientes[0] && !this.state.clientes[1] && (
                  <button
                    className="btn btn-info"
                    style={{ margin: 20 }}
                    onClick={() => this.setState({ emailModal: true })}
                  >
                    Enviar por email
                  </button>
                )}
              </div>
              <button
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 30,
                  backgroundColor: "inherit",
                  border: "none",
                }}
                onClick={() => this.setState({ pdfView: false, pdfsSeparadosGerados: [] })}
              >
                <FontAwesomeIcon
                  cursor="pointer"
                  className="seta"
                  icon={faArrowLeft}
                  color="#17386b"
                  size="2x"
                />
              </button>
            </div>
          </div>
        )}
        {!this.state.pdfView && !this.state.loading && (
          <>
            {this.state.redirect && <Redirect to={"/"} />}

            <section>
              {this.props.location.state.backTo == "contasPagar" && (
                <Header voltarContasPagar relatorio titulo="Contas a Pagar" />
              )}
              {this.props.location.state.backTo == "contasPagas" && (
                <Header voltarContasPagas relatorio titulo="Contas Pagas" />
              )}
              {this.props.location.state.backTo == "contasReceber" && (
                <Header
                  voltarContasReceber
                  relatorio
                  titulo="Contas a Receber"
                />
              )}
              {this.props.location.state.backTo == "contasRecebidas" && (
                <Header
                  voltarContasRecebidas
                  relatorio
                  titulo="Contas Recebidas"
                />
              )}
            </section>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: "-20px",
                marginBottom: "2%",
              }}
            >
              <h6 style={{ color: "red" }}>{this.state.erro}</h6>
            </div>

            <div className="contact-section">
              <div className="row">
                <div className="col-lg-12">
                  <Formik
                    initialValues={{
                      name: "",
                    }}
                    onSubmit={async (values) => {
                      await new Promise((r) => setTimeout(r, 1000));
                      this.gerarRelatorio(validForm);
                    }}
                  >
                    <Form className="contact-form">
                      <div className="row">
                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">
                          <div className="row addservicos">
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                              <label>Ordenar:</label>
                            </div>
                            <div className="col-1 errorMessage">
                              {!this.state.por && (
                                <FontAwesomeIcon
                                  title="Preencha o campo"
                                  icon={faExclamationTriangle}
                                />
                              )}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Select
                                className="SearchSelect"
                                options={this.state.porOptions}
                                value={
                                  this.state.porOptions.filter(
                                    (option) => option.value == this.state.por
                                  )[0]
                                }
                                search={true}
                                onChange={(e) => {
                                  this.setState({ por: e.value });
                                }}
                              />
                            </div>
                            {/* <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.conta)[0]} search={true} onChange={(e) => { this.setState({ conta: e.value, }) }} />
                                                        </div> */}
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                              <label>Centro de Custo</label>
                            </div>
                            <div className="col-1 errorMessage"></div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Select
                                className="SearchSelect"
                                options={this.state.centrosCustosOptions
                                  .filter((e) =>
                                    this.filterSearch(
                                      e,
                                      this.state.centrosCustosOptionsTexto
                                    )
                                  )
                                  .slice(0, 20)}
                                onInputChange={(e) => {
                                  this.setState({
                                    centrosCustosOptionsTexto: e,
                                  });
                                }}
                                value={
                                  this.state.centrosCustosOptions.filter(
                                    (option) =>
                                      option.value == this.state.centroCusto
                                  )[0]
                                }
                                search={true}
                                onChange={(e) => {
                                  this.setState({ centroCusto: e.value });
                                }}
                              />
                            </div>

                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                              <label>Pessoas</label>
                            </div>
                            <div className="col-1 errorMessage"></div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Select
                                className="SearchSelect"
                                options={this.state.pessoasOptions
                                  .filter((e) =>
                                    this.filterSearch(
                                      e,
                                      this.state.pessoasOptionsTexto
                                    )
                                  )
                                  .slice(0, 20)}
                                onInputChange={(e) => {
                                  this.setState({ pessoasOptionsTexto: e });
                                }}
                                search={true}
                                onChange={(e) => {
                                  if (
                                    !this.state.clientes.find(
                                      (c) => c == e.value
                                    )
                                  )
                                    this.setState({
                                      clientes: [
                                        ...this.state.clientes,
                                        e.value,
                                      ],
                                      emails: [],
                                      failures: [],
                                      successes: [],
                                    });
                                }}
                              />
                              <div
                                style={{
                                  marginBottom: 20,
                                  color: "white",
                                  fontSize: 13,
                                }}
                              >
                                {this.state.clientes.map((e, i) => (
                                  <span
                                    class="click_to_erase"
                                    onClick={() =>
                                      this.setState({
                                        clientes: this.state.clientes.filter(
                                          (c) => c != e
                                        ),
                                        emails: [],
                                        failures: [],
                                        successes: [],
                                      })
                                    }
                                  >{`${
                                    this.state.pessoas.find((p) => p.Chave == e)
                                      ?.Nome
                                  }${
                                    i != this.state.clientes.length - 1
                                      ? ", "
                                      : " "
                                  }`}</span>
                                ))}                              </div>
                            </div>
                            
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                              <label>Grupo de Clientes</label>
                            </div>
                            <div className="col-1 errorMessage"></div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Select
                                className="SearchSelect"
                                options={this.state.gruposOptions
                                  .filter((e) =>
                                    this.filterSearch(
                                      e,
                                      this.state.gruposOptionsTexto
                                    )
                                  )
                                  .slice(0, 20)}
                                onInputChange={(e) => {
                                  this.setState({ gruposOptionsTexto: e });
                                }}
                                value={
                                  this.state.gruposOptions.filter(
                                    (option) => option.value == this.state.grupo
                                  )[0]
                                }
                                search={true}
                                onChange={(e) => {
                                  this.setState({ grupo: e.value });
                                }}
                              />
                            </div>
                            
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Situação</label>
                            </div>
                            <div className='col-1 errorMessage'>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                <Select className='SearchSelect' options={this.state.situacaoOptions} value={this.state.situacaoOptions.find(option => option.value == this.state.situacao)} search={true} onChange={(e) => { this.setState({ situacao: e.value, }) }} />
                            </div>
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                              <label>Moeda</label>
                            </div>
                            <div className="col-1 errorMessage"></div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Select
                                className="SearchSelect"
                                options={this.state.moedasOptions
                                  .filter((e) =>
                                    this.filterSearch(
                                      e,
                                      this.state.moedasOptionsTexto
                                    )
                                  )
                                  .slice(0, 20)}
                                onInputChange={(e) => {
                                  this.setState({ moedasOptionsTexto: e });
                                }}
                                value={
                                  this.state.moedasOptions.filter(
                                    (option) => option.value == this.state.moeda
                                  )[0]
                                }
                                search={true}
                                onChange={(e) => {
                                  this.setState({ moeda: e.value });
                                }}
                              />
                            </div>
                            
                            {this.props.location.state.backTo == "contasReceber" && (
                              <>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>PDFs Separados</label>
                                </div>
                                <div className="col-1 errorMessage"></div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field 
                                    type="checkbox" 
                                    className="form-check-input" 
                                    style={{marginLeft: "2px", width: "36px", height: "10px"}}
                                    checked={this.state.pdfsSeparados} 
                                    onChange={(e) => { 
                                      this.setState({ pdfsSeparados: e.target.checked }) 
                                    }} 
                                  />
                                  <label className="form-check-label" style={{marginLeft: "60px", fontSize: "12px", color: "#666"}}>
                                    Gerar um PDF para cada cliente
                                  </label>
                                </div>
                              </>
                            )}
                            {/* <div className="col-12">
                                                            <label className="center relatorioLabelTitulo">Período</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.periodoInicial} onChange={async e => { this.setState({ periodoInicial: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Final</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.periodoFinal} onChange={async e => { this.setState({ periodoFinal: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="center relatorioLabelTitulo">Período Lançamento</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.lancamentoInicial} onChange={async e => { this.setState({ lancamentoInicial: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Final</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.lancamentoFinal} onChange={async e => { this.setState({ lancamentoFinal: e.currentTarget.value }) }} />
                                                        </div>


                                                        <div className="col-12 relatorioLabelTitulo">
                                                            <label className="center">Tipos de Documento</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm relatorioCheckLabel">
                                                            <label><i>Excluir</i></label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm relatorioCheck">
                                                            <Field type="checkbox" className="reduceCheckSize" name='cliente' checked={this.state.excluirTipos} onChange={async e => { this.setState({ excluirTipos: e.target.checked }) }} />
                                                        </div>

                                                        <div className='scrollDiv col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 row'>
                                                            {this.state.tiposDocumentoOptions.map((e, i) => (
                                                                <div className='row deleteMargin'>
                                                                    <div className={i == 0 ? "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheckLabel firstScrollLabel" : "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheckLabel"}>
                                                                        <label>{e.Descricao}</label>
                                                                    </div>

                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheck">
                                                                        <Field type="checkbox" className="reduceCheckSize" name={e.descricao} checked={this.state.tiposDocumentoOptions[i].checked} onChange={async () => { this.setTipoDocumento(e.chave, i) }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div> */}
                          </div>
                        </div>
                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                      </div>

                      <div className="row">
                        <div className="col-2"></div>
                        <div
                          className="col-8"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <button
                            disabled={!validForm}
                            type="submit"
                            style={
                              validForm
                                ? { width: 300 }
                                : {
                                    backgroundColor: "#eee",
                                    opacity: 0.3,
                                    width: 300,
                                  }
                            }
                          >
                            Gerar
                          </button>
                        </div>
                        <div className="col-2"></div>
                      </div>
                    </Form>
                  </Formik>
                </div>
              </div>
            </div>
            <Rodape />
          </>
        )}
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "5%",
            paddingBottom: "5%",
            overflow: "scroll",
          }}
          open={this.state.emailModal}
          onClose={async () => await this.setState({ emailModal: false })}
        >
          <div className="modalContainer">
            <div className="modalCriar">
              <div className="containersairlistprodmodal">
                <div
                  className="botaoSairModal"
                  onClick={async () =>
                    await this.setState({ email: false, emailModal: false })
                  }
                >
                  <span>X</span>
                </div>
              </div>
              <div className="modalContent">
                <div className="tituloModal">
                  <span>Enviar email:</span>
                </div>

                <div className="modalForm">
                  <Formik
                    initialValues={{
                      name: "",
                    }}
                    onSubmit={async (values) => {
                      await new Promise((r) => setTimeout(r, 1000));
                      this.enviarEmail(validFormEmail);
                    }}
                  >
                    <Form className="contact-form">
                      <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                          <div className="row addservicos">
                            {this.state.successes[0] && (
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Emails enviados:</label>
                              </div>
                            )}
                            {this.state.successes[0] && (
                              <div className="col-1 errorMessage"></div>
                            )}
                            {this.state.successes[0] && (
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                <label>
                                  {this.state.successes.map((e, i) => (
                                    <span className="listaEmail successEmail">
                                      {e}
                                      {this.state.successes[i + 1] ? ", " : ""}
                                    </span>
                                  ))}
                                </label>
                              </div>
                            )}
                            {this.state.successes[0] && (
                              <div className="col-1"></div>
                            )}
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                              <label>Destinatário(s)</label>
                            </div>
                            <div className="col-1 errorMessage"></div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                              <Field
                                className="form-control"
                                type="text"
                                value={this.state.emails.join("; ")}
                                onChange={async (e) => {
                                  this.setState({
                                    emails: e.currentTarget.value.split("; "),
                                  });
                                }}
                              />
                            </div>
                            <div className="col-1"></div>
                            {this.state.failures[0] && (
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Emails inválidos:</label>
                              </div>
                            )}
                            {this.state.failures[0] && (
                              <div className="col-1 errorMessage"></div>
                            )}
                            {this.state.failures[0] && (
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                <label>
                                  {this.state.failures.map((e, i) => (
                                    <span
                                      className="listaEmail failureEmail"
                                      title="Email inválido"
                                      onClick={async () =>
                                        await this.removeEmail(e)
                                      }
                                    >
                                      {e}
                                      {this.state.failures[i + 1] ? ", " : ""}
                                    </span>
                                  ))}
                                </label>
                              </div>
                            )}
                            {this.state.failures[0] && (
                              <div className="col-1"></div>
                            )}
                          </div>
                        </div>
                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                      </div>

                      <div className="row">
                        <div className="col-2"></div>
                        <div
                          className="col-8"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <button
                            disabled={!validFormEmail}
                            type="submit"
                            style={
                              validFormEmail
                                ? { width: 300 }
                                : {
                                    backgroundColor: "#eee",
                                    opacity: 0.3,
                                    width: 300,
                                  }
                            }
                          >
                            Enviar
                          </button>
                        </div>
                        <div className="col-2"></div>
                      </div>
                    </Form>
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ user, servidor }) => {
  return {
    user: user,
    online: servidor.online,
  };
};

export default connect(mapStateToProps, null)(Relatorio);
