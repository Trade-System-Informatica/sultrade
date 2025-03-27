import React, { Component } from "react";
import "./styles.css";
import { Formik, Field, Form } from "formik";
import Header from "../../../components/header";
import Rodape from "../../../components/rodape";
import ModalListas from "../../../components/modalListas";
import Skeleton from "../../../components/skeleton";
import util from "../../../classes/util";
import loader from "../../../classes/loader";
import {
  NOME_EMPRESA,
  CAMINHO_DOCUMENTOS,
  CAMBIO_LIQUIDAR,
  CAMINHO_INVOICES,
} from "../../../config";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import ModalLogs from "../../../components/modalLogs";
import { apiEmployee } from "../../../services/apiamrg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrashAlt,
  faPen,
  faPlus,
  faDollarSign,
  faTimes,
  faChevronRight,
  faChevronLeft,
  faArrowUp, 
  faArrowDown, 
  faSave,
  faCopy
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert";
import { PDFExport } from "@progress/kendo-react-pdf";
import { drawDOM, exportPDF } from "@progress/kendo-drawing";
import Modal from "@material-ui/core/Modal";
import Alert from "../../../components/alert";
import Util from "../../../classes/util";
import XLSX from "xlsx-js-style";
import ModalEventoEdit from "../../../components/modalEventoEdit";
import EventoEdit from "../../../components/eventoEdit";
import ModalCamposOS from "../../../components/modalCamposOS";
import apiHeroku from "../../../services/apiHeroku";

const estadoInicial = {
  os: "",
  ordem_servico: [],
  ordem_servico_codigos: [],

  chave: 0,
  descricao: "",
  codigo: "",
  cliente: "",
  navio: "",
  abertura: moment().format("YYYY-MM-DD"),
  chegada: moment().format("YYYY-MM-DD"),
  tipoServico: "",
  viagem: "",
  porto: "",
  eta: "",
  atb: "",
  etb: "",

  governmentTaxes: false,
  bankCharges: false,

  data_saida: "",
  encerramento: "",
  faturamento: "",
  envio: "",
  centroCusto: "",
  roe: 5,
  comentario: "",
  encerradoPor: "",
  faturadoPor: "",
  empresa: "",
  operador: "",
  editavel: true,
  editavelDataFaturamento: true,

  deleteSolicitao: false,

  eventoChave: 0,

  clientes: [],
  clientesOptions: [],
  clientesOptionsTexto: "",
  navios: [],
  naviosOptions: [],
  naviosOptionsTexto: "",
  portos: [],
  portosOptions: [],
  portosOptionsTexto: "",
  tiposServicos: [],
  tiposServicosOptions: [],
  tiposServicosOptionsTexto: "",
  operadores: [],
  operadoresOptions: [],
  operadoresOptionsTexto: "",

  tiposDocumento: [],
  tiposDocumentoOptions: [],
  tiposDocumentoOptionsTexto: "",

  documentoDescricao: "",
  documentoTipo: 1,

  acessos: [],
  permissoes: [],
  acessosPermissoes: [],

  bloqueado: false,

  modalAberto: false,
  modal: 0,
  modalLista: "",
  modalPesquisa: "",

  modalEscolhaOsShare: false,

  logs: [],
  modalLog: false,

  dadosIniciais: [],
  dadosFinais: [],
  dadosIniciaisDoc: [],
  dadosFinaisDoc: [],

  modalItemAberto: false,
  itemPermissao: "",
  itemInfo: [],
  itemNome: "",
  eventoChave: "",
  itemAdd: {},
  itemEdit: {},
  itemFinanceiro: {},
  itemEdit: {},
  itemDelete: "",

  navioNome: "",
  navioBloqueado: false,

  portoNome: "",
  portoSigla: "",
  portoBloqueado: false,

  clienteNome: "",
  clienteCpf: "",
  clienteCpfLimpo: "",
  clienteBloqueado: false,

  tipoServicoNome: "",
  tipoServicoPrazo: "",
  tipoServicoBloqueado: false,

  centrosCustos: [],
  centrosCustosOptions: [],
  centrosCustosOptionsTexto: "",

  empresas: [],
  empresasOptions: [],
  empresasOptionsTexto: "",

  cpfAprovado: false,

  eventos: [],
  todosEventos: [],
  documentos: [],

  documentoModal: false,
  documento: [],
  documentoNome: "",
  documentoChave: "",
  documentoCaminho: "",
  documentoTrocar: true,
  documentoEditar: false,

  tiposServicosItens: ["Pagar", "Receber", "Adiantamento", "Desconto"],

  pdfNome: "",
  pdfgerado: [],
  pdfContent: [],
  anexosForn: [],
  moedas: "",

  error: { msg: "", type: "" },

  loading: true,
  recarregaPagina: false,

  eventosTotal: 0,

  cabecalhoModal: false,
  cabecalho: "",
  company: "",
  address: "",
  CO: "",

  agrupadorModal: false,
  agrupadorTipo: "",
  agrupadorEventos: [],
  agruparFunction: () => {},

  custeios_subagentes: [],
  invoices_groups: [],

  historicosOptions: [],
  planosContasOptions: [],
  meiosPagamentosOptions: [],
  optionsTexto: "",

  historico: [],
  historicoPadrao: [],
  codBarras: [],
  contaDebito: [],
  contaCredito: [],
  meioPagamento: [],
  meioPagamentoNome: [],
  codigoReceita: [],
  contribuinte: [],
  codigoIdentificadorTributo: [],
  mesCompetNumRef: [],
  dataApuracao: [],
  darfValor: [],
  darfPagamento: [],
  darfMulta: [],
  darfJuros: [],
  darfOutros: [],

  contabiliza: false,
  eventosContabilizando: [],
  paginaContabiliza: 0,

  anexosNaoValidados: [],

  faturado: false,

  eventoData: "",
  eventoFornecedor: "",
  eventoMoeda: "",
  eventoFornecedorInicial: "",
  eventoTaxa: "",
  eventoDescricao: "",
  eventoTipo: "",
  eventoOrdem: "",
  eventoRemarks: "",
  eventoValor: "",
  eventoVlrc: "",
  eventoRepasse: "",
  eventoFornecedorCusteio: "",
  eventoQntd: "",
  eventoValorTotal: "0,00",

  taxas: [],
  taxasOptions: [],
  fornecedoresOptions: [],
  descricoesPadraoOptions: [],
  tiposSubOptions: [
    { label: "Pagar", value: 0 },
    { label: "Receber", value: 1 },
    { label: "Recebimento de Remessa", value: 2 },
    { label: "Desconto", value: 3 },
  ],

  dadosIniciaisSol: [],
  dadosFinaisSol: [],

  templatesModal: false,
  templates: [],

  grupoTemplate: {},

  gruposTemplates: [],
  gruposTemplatesModal: false,

  modalCamposOS: false,
  camposOS: [],
  redirectEventos: false,

  ordemModificada: false,
  selectedEvents: [],

  os_escolhida: {},
};

class AddOS extends Component {
  constructor(props) {
    super(props);
    this.pdfExportComponent = React.createRef(null);
  }

  state = {
    ...estadoInicial,
    usuarioLogado: this.props.user,
  };

  componentDidMount = async () => {
    if (!this.state.usuarioLogado?.codigo) {
      return;
    }

    window.scrollTo(0, 0);
    var id = await this.props.match.params.id;
    await this.setState({ chave: id });

    if (this.state.usuarioLogado.empresa != 0) {
      await this.setState({ empresa: this.state.usuarioLogado.empresa });
    }

    if (parseInt(id) !== 0) {
      await this.setState({
        os: await loader.getOne("getOSUma.php", null, null, {
          chave_os: this.state.chave,
        }),
        contaOs: await loader.getOne("getContaOS.php", null, null, {
          chave_os: this.state.chave,
        }),
      });

      await this.setState({
        descricao: this.state.os.Descricao,
        codigo: this.state.os.codigo,
        cliente: this.state.os.Chave_Cliente,
        navio: this.state.os.chave_navio,
        abertura: moment(this.state.os.Data_Abertura).format("YYYY-MM-DD"),
        chegada: moment(this.state.os.Data_Chegada).format("YYYY-MM-DD"),
        tipoServico: this.state.os.chave_tipo_servico,
        viagem: this.state.os.viagem,
        porto: this.state.os.porto,
        eta: moment(this.state.os.eta).format("YYYY-MM-DD"),
        atb: moment(this.state.os.atb).format("YYYY-MM-DD"),
        etb: moment(this.state.os.etb).format("YYYY-MM-DD HH:mm"),
        data_saida:
          moment(this.state.os.Data_Saida).format("YYYY-MM-DD") !=
          "Invalid date"
            ? moment(this.state.os.Data_Saida).format("YYYY-MM-DD HH:mm")
            : "T.B.I.",

        encerramento:
          moment(this.state.os.Data_Encerramento).format("YYYY-MM-DD") !=
          "Invalid date"
            ? moment(this.state.os.Data_Encerramento).format("YYYY-MM-DD")
            : "T.B.I.",
        faturamento:
          moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD") !=
          "Invalid date"
            ? moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD")
            : "T.B.I.",
        envio:
          moment(this.state.os.envio).format("YYYY-MM-DD") != "Invalid date"
            ? moment(this.state.os.envio).format("YYYY-MM-DD")
            : "T.B.I.",
        centroCusto: this.state.os.centro_custo,
        roe: parseFloat(this.state.os.ROE) == 0 ? "5.00000" : this.state.os.ROE,
        comentario: this.state.os.Comentario_Voucher,
        encerradoPor: this.state.os.encerradoPor,
        faturadoPor: this.state.os.faturadoPor,
        cabecalho: this.state.os.cabecalho,
        empresa: this.state.os.Empresa,
        operador: this.state.os.operador,
      });

      if (
        moment(this.state.os.Data_Encerramento).format("YYYY-MM-DD") !=
        "Invalid date"
      ) {
        await this.setState({ editavel: false });
      } else {
        await this.setState({ editavel: true });
      }

      if (
        moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD") !=
        "Invalid date"
      ) {
        await this.setState({ editavelDataFaturamento: false });
      } else {
        await this.setState({ editavelDataFaturamento: true });
      }

      if (this.state.cabecalho) {
        let cabecalho;

        try {
          cabecalho = JSON.parse(this.state.cabecalho);
        } catch (err) {
          cabecalho = JSON.parse(
            this.state.cabecalho.replaceAll("\n", "\\n").replaceAll("\t", "\\t")
          );
        }

        await this.setState({
          company: cabecalho.company ? cabecalho.company : "",
          address: cabecalho.address ? cabecalho.address : "",
          CO: cabecalho.CO ? cabecalho.CO : "",
        });
      }
    }
    await this.loadAll();
    await this.getDadosCliente();

    if (this.state.chave != 0) {
      await this.setState({
        dadosIniciais: [
          {
            titulo: "Descrição",
            valor: util.formatForLogs(this.state.descricao),
          },
          { titulo: "Código", valor: util.formatForLogs(this.state.codigo) },
          {
            titulo: "Cliente",
            valor: util.formatForLogs(
              this.state.cliente,
              "options",
              "",
              "",
              this.state.pessoasOptions
            ),
          },
          {
            titulo: "Navio",
            valor: util.formatForLogs(
              this.state.navio,
              "options",
              "",
              "",
              this.state.naviosOptions
            ),
          },
          {
            titulo: "Data de Abertura",
            valor: util.formatForLogs(this.state.abertura, "date"),
          },
          {
            titulo: "Data de Chegada",
            valor: util.formatForLogs(this.state.chegada, "date"),
          },
          {
            titulo: "Tipo de Servico",
            valor: util.formatForLogs(
              this.state.tipoServico,
              "options",
              "",
              "",
              this.state.tiposServicosOptions
            ),
          },
          { titulo: "Viagem", valor: util.formatForLogs(this.state.viagem) },
          {
            titulo: "Porto",
            valor: util.formatForLogs(
              this.state.porto,
              "options",
              "",
              "",
              this.state.portosOptions
            ),
          },
          { titulo: "ETA", valor: util.formatForLogs(this.state.eta, "date") },
          { titulo: "ATB", valor: util.formatForLogs(this.state.atb, "date") },
          {
            titulo: "ETB",
            valor: util.formatForLogs(this.state.etb, "datetime"),
          },
          {
            titulo: "Government Taxes",
            valor: util.formatForLogs(this.state.governmentTaxes, "money"),
          },
          {
            titulo: "Bank Charges",
            valor: util.formatForLogs(this.state.bankCharges, "money"),
          },
          {
            titulo: "Data de Saida",
            valor: util.formatForLogs(this.state.data_saida, "datetime"),
          },
          {
            titulo: "Data de Encerramento",
            valor: util.formatForLogs(this.state.encerramento, "date"),
          },
          {
            titulo: "Data de Faturamento",
            valor: util.formatForLogs(this.state.faturamento, "date"),
          },
          {
            titulo: "Centro de Custo",
            valor: util.formatForLogs(
              this.state.centroCusto,
              "options",
              "",
              "",
              this.state.centrosCustosOptions
            ),
          },
          { titulo: "ROE", valor: util.formatForLogs(this.state.roe) },
          {
            titulo: "Comentario Voucher",
            valor: util.formatForLogs(this.state.comentario),
          },
          {
            titulo: "Encerrado por",
            valor: util.formatForLogs(
              this.state.encerradoPor,
              "options",
              "",
              "",
              this.state.operadoresOptions
            ),
          },
          {
            titulo: "Faturado por",
            valor: util.formatForLogs(
              this.state.faturadoPor,
              "options",
              "",
              "",
              this.state.operadoresOptions
            ),
          },
          {
            titulo: "Operador",
            valor: util.formatForLogs(
              this.state.operador,
              "options",
              "",
              "",
              this.state.operadoresOptions
            ),
          },
        ],
      });
    }

    if (this.state.faturamento != "T.B.I." && this.state.chave != 0) {
      let permissao = false;
      this.state.acessosPermissoes.map((e) => {
        if (e.acessoAcao == "EVENTOS_FINANCEIRO" && e.permissaoEdita == 1) {
          permissao = true;
        }
      });

      if (!permissao) {
        this.setState({ faturado: true });
      }
    } else {
      this.setState({ faturado: false });
    }

    this.state.acessosPermissoes.map((e) => {
      if (
        (e.acessoAcao == "OS" &&
          e.permissaoInsere == 0 &&
          this.state.chave == 0) ||
        (e.acessoAcao == "OS" && e.permissaoEdita == 0 && this.state.chave != 0)
      ) {
        this.setState({ bloqueado: true });
      }
    });

    this.setState({ loading: false });
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (
      this.state.deleteSolicitao &&
      this.state.modalItemAberto != prevState.modalItemAberto
    ) {
      await this.setState({
        modalItemAberto: false,
        deleteSolicitao: false,
      });
    }
  };

  moveUp(index) {
    const eventos = [...this.state.eventos];
    const length = eventos.length;
    // Usando módulo para calcular o índice anterior de forma circular
    const previousIndex = (index - 1 + length) % length;
    [eventos[previousIndex], eventos[index]] = [eventos[index], eventos[previousIndex]];
    this.setState({ eventos, ordemModificada: true });
  }
  
  moveDown(index) {
    const eventos = [...this.state.eventos];
    const length = eventos.length;
    // Usando módulo para calcular o próximo índice de forma circular
    const nextIndex = (index + 1) % length;
    [eventos[nextIndex], eventos[index]] = [eventos[index], eventos[nextIndex]];
    this.setState({ eventos, ordemModificada: true });
  }

  handleCheckboxChange = (chave) => {
    this.setState(prevState => ({
      selectedEvents: prevState.selectedEvents.includes(chave)
        ? prevState.selectedEvents.filter(item => item !== chave)
        : [...prevState.selectedEvents, chave]
    }));
  };

  handleSelectAll = () => {
    this.setState(prevState => ({
      selectedEvents: prevState.selectedEvents.length === this.state.eventos.length
        ? [] // Se todos estão selecionados, desmarca todos
        : this.state.eventos.map(evento => evento.chave) // Seleciona todos
    }));
  };

  calculaTotal = () => {
    let eventosTotal = 0;

    this.state.eventos.map((evento) => {
      if (evento.tipo_sub == 0 || evento.tipo_sub == 1) {
        if (evento.Moeda == 5) {
          eventosTotal += parseFloat(evento.valor*evento.qntd);
        } else if (evento.Moeda == 6) {
          eventosTotal +=
            parseFloat(evento.valor*evento.qntd) *
            (parseFloat(this.state.os.ROE) == 0
              ? 5
              : parseFloat(this.state.os.ROE));
        }
      } else {
        if (evento.Moeda == 5) {
          eventosTotal -= parseFloat(evento.valor *evento.qntd);
        } else if (evento.Moeda == 6) {
          eventosTotal -=
            parseFloat(evento.valor *evento.qntd) *
            (parseFloat(this.state.os.ROE) == 0
              ? 5
              : parseFloat(this.state.os.ROE));
        }
      }
    });

    if (
      this.state.bankCharges &&
      parseFloat(
        this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")
      ) != 0
    ) {
      eventosTotal += parseFloat(
        this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")
      );
    }
    if (
      this.state.governmentTaxes &&
      parseFloat(
        this.state.governmentTaxes.replaceAll(".", "").replaceAll(",", ".")
      ) != 0
    ) {
      eventosTotal += parseFloat(
        this.state.governmentTaxes.replaceAll(".", "").replaceAll(",", ".")
      );
    }

    this.setState({ eventosTotal });
    return eventosTotal;
  };

  getDadosCliente = async () => {
    const info = await loader.getBody(`getContatos.php`, {
      token: true,
      pessoa: this.state.cliente,
    });

    this.setState({ bankCharges: false, governmentTaxes: false });

    for (let i = 0; i < info.length; i++) {
      const e = info[i];

      if (e.Tipo == "BK") {
        if (["SIM", "S"].includes(e.Campo1.toUpperCase())) {
          const parametros = await loader.getBody(`getParametros.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa,
          });

          if (parametros[0].bank_charges) {
            this.setState({
              bankCharges: new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parametros[0].bank_charges),
            });
          } else {
            this.setState({ bankCharges: "0,00" });
          }
        } else {
          if (Util.verificaDatas(this.state.encerramento, e.Campo1)) {
            const parametros = await loader.getBody(`getParametros.php`, {
              token: true,
              empresa: this.state.usuarioLogado.empresa,
            });

            if (parametros[0].bank_charges) {
              this.setState({
                bankCharges: new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(parametros[0].bank_charges),
              });
            } else {
              this.setState({ bankCharges: "0,00" });
            }
          }
        }
      }
      if (e.Tipo == "GT") {
        if (["SIM", "S"].includes(e.Campo1.toUpperCase())) {
          let valor = 0;

          this.state.eventos
            .filter((evento) => evento.Fornecedor_Custeio != 0)
            .map((evento) => {
              if (evento.Moeda == 5) {
                valor += parseFloat(evento.valor * evento.qntd) * 0.05;
              } else if (evento.Moeda == 6) {
                let roe = 5;
                if (this.state.os && parseFloat(this.state.os.ROE) != 0) {
                  roe = parseFloat(this.state.os.ROE);
                }
                valor += parseFloat(evento.valor * evento.qntd) * roe * 0.05;
              }
            });

          this.setState({
            governmentTaxes: new Intl.NumberFormat("pt-BR", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(valor),
          });
        } else {
          if (Util.verificaDatas(this.state.encerramento, e.Campo1)) {
            let valor = 0;

            this.state.eventos
              .filter((evento) => evento.Fornecedor_Custeio != 0)
              .map((evento) => {
                if (evento.Moeda == 5) {
                  valor += parseFloat(evento.valor * evento.qntd) * 0.05;
                } else if (evento.Moeda == 6) {
                  let roe = 5;
                  if (this.state.os && parseFloat(this.state.os.ROE) != 0) {
                    roe = parseFloat(this.state.os.ROE);
                  }
                  valor += parseFloat(evento.valor * evento.qntd) * roe * 0.05;
                }
              });

            this.setState({
              governmentTaxes: new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(valor),
            });
          }
        }
      }
    }
    this.calculaTotal();
  };

  getOS = async () => {
      const ordem_servico = [
        ...this.state.ordem_servico,
        ...(await loader.getBase(
          `getOS.php`,
          this.state.usuarioLogado.empresa,
          500,
          0
        )),
      ];
  
      await this.setState({ ordem_servico });
  
      this.state.ordem_servico.map(async (ord) => {
        const list_os_codigos = [
          ...this.state.ordem_servico_codigos,
          { label: ord.codigo, value: ord.Chave },
        ];
  
        await this.setState({ ordem_servico_codigos: list_os_codigos });
      });
  };

  loadAll = async () => {
    await this.setState({
      naviosOptions: await loader.getBaseOptions(
        "getNavios.php",
        "nome",
        "chave"
      ),
      clientesOptions: await loader.getBaseOptionsCustomLabel(
        "getClientes.php",
        "Nome",
        "Cnpj_Cpf",
        "Chave"
      ),
      tiposServicosOptions: await loader.getBaseOptions(
        "getTiposServicos.php",
        "descricao",
        "chave"
      ),
      portosOptions: await loader.getBaseOptions(
        "getPortos.php",
        "Descricao",
        "Chave"
      ),
      tiposDocumentoOptions: await loader.getBaseOptions(
        "getTiposDocumento.php",
        "Descricao",
        "Chave"
      ),
      moedasOptions: await loader.getBaseOptions(
        "getMoedas.php",
        "Sigla",
        "Chave"
      ),
      acessos: await loader.getBase("getTiposAcessos.php"),
      permissoes: await loader.getBase("getPermissoes.php"),
    });

    const planosContasOptions = await loader.getPlanosContasAnaliticasOptions();
    planosContasOptions.unshift({ value: "", label: "Select..." });

    const meiosPagamentosOptions = await loader.getMeiosPagamentosOptions();
    meiosPagamentosOptions.unshift({ value: "", label: "Select..." });

    await this.getOperadores();
    if (this.state.chave) {
      await this.getCusteiosSubagentes();
      await this.getInvoices();
      await this.getCentrosCustos();
      await this.getServicosItens();
      await this.getDocumentos();
      await this.getOS();
    }

    await this.getTemplates();

    await this.setState({
      planosContasOptions,
      meiosPagamentosOptions,
      acessosPermissoes: await loader.testaAcesso(
        this.state.acessos,
        this.state.permissoes,
        this.state.usuarioLogado
      ),
      /*{
                acesso: e.Chave,
                acessoAcao: e.Acao,
                permissaoInsere: permissao ? permissao.Liberacao.split(``)[0] : 0,
                permissaoEdita: permissao ? permissao.Liberacao.split(``)[1] : 0,
                permissaoConsulta: permissao ? permissao.Liberacao.split(``)[2] : 0,
                permissaoDeleta: permissao ? permissao.Liberacao.split(``)[3] : 0,
                permissaoImprime: permissao ? permissao.Liberacao.split(``)[4] : 0
            }*/
    });
    console.log('permissoes', this.state.acessosPermissoes);
  };

  checkOsClosed = () => {
    if (!this.state.editavel) {
      if (
        this.state.acessosPermissoes
          .filter((e) => {
            if (e.acessoAcao == "OS_ENCERRADA") {
              return e;
            }
          })
          .map((e) => e.permissaoEdita)[0] == 1
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  checkOsFaturada = () => {
    if (!this.state.editavelDataFaturamento) {
      if (
        this.state.acessosPermissoes
          .filter((e) => {
            if (e.acessoAcao == "OS_FATURADA") {
              return e;
            }
          })
          .map((e) => e.permissaoEdita)[0] == 1
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  getCusteiosSubagentes = async () => {
    await apiEmployee
      .post(`getCusteioSubagente.php`, {
        token: true,
        chave_os: this.state.chave,
      })
      .then(
        async (res) => {
          if (res.data) {
            this.setState({ custeios_subagentes: [...res.data] });
          }
        },
        async (res) => await console.log(`Erro: ${res}`)
      );
  };

  getInvoices = async () => {
    await apiEmployee
      .post(`getInvoices.php`, {
        token: true,
        chave_os: this.state.chave,
      })
      .then(
        async (res) => {
          if (res.data) {
            this.setState({ invoices_groups: [...res.data] });
          }
        },
        async (res) => await console.log(`Erro: ${res}`)
      );
  };

  filterAgrupador = (item) => {
    const eventosUsados = [];

    if (this.state.agrupadorTipo == "INVOICE") {
      if (this.state.grupoSelecionado != 0) {
        return false;
      }
      if (this.state.agrupadorEventos[0]) {
        this.state.invoices_groups
          .filter((e) => e.grupo != this.state.grupoSelecionado)
          .map((e) =>
            e.evento.split(",").map((el) => {
              eventosUsados.push(el);
            })
          );

        if (eventosUsados.includes(item.chave)) {
          return false;
        }

        const firstItem = this.state.eventos.find(
          (evento) => evento.chave == this.state.agrupadorEventos[0]
        );

        if (
          item.voucher != firstItem?.voucher ||
          item.Fornecedor_Custeio != firstItem?.Fornecedor_Custeio
        ) {
          return false;
        }
      }
    }
    if (this.state.agrupadorTipo == "CUSTEIO") {
      this.state.custeios_subagentes
        .filter((e) => e.grupo != this.state.grupoSelecionado)
        .map((e) =>
          e.evento.split(",").map((el) => {
            eventosUsados.push(el);
          })
        );

      if (eventosUsados.includes(item.chave)) {
        return false;
      }

      if (!this.state.agrupadorEventos[0] && !item.conta) {
        return true;
      }
      const firstItem = this.state.eventos.find(
        (evento) => evento.chave == this.state.agrupadorEventos[0]
      );

      if (
        item.tipo_sub != firstItem?.tipo_sub ||
        item.fornecedor != firstItem?.fornecedor
      ) {
        return false;
      }
    }

    return true;
  };

  agruparEventos = async () => {
    if (this.state.grupoSelecionado == 0) {
      await apiEmployee
        .post(`insertCusteioSubagente.php`, {
          token: true,
          os: this.state.chave,
          eventos: this.state.agrupadorEventos,
        })
        .then(
          async (res) => {
            this.setState({ agrupadorEventos: [] });
            await this.getCusteiosSubagentes();
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    } else {
      await apiEmployee
        .post(`updateCusteioSubagente.php`, {
          token: true,
          os: this.state.chave,
          grupo: this.state.grupoSelecionado,
          eventos: this.state.agrupadorEventos,
        })
        .then(
          async (res) => {
            this.setState({ agrupadorEventos: [] });
            await this.getCusteiosSubagentes();
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    }
  };

  abrirContabilizacao = async (grupo) => {
    const eventos = this.state.eventos.filter((evento) =>
      this.state.custeios_subagentes
        .find((e) => e.grupo == grupo)
        ?.evento.split(",")
        .includes(evento.chave)
    );
    const newArray = [...Array(eventos.length)].map(() => "");
    const contaDebito = [];
    const contaCredito = [];

    for (const evento of eventos) {
      if (evento.tipo_sub == 1) {
        contaCredito.push(await loader.getContaTaxa(evento.taxa));
        contaDebito.push(await loader.getContaPessoa(this.state.cliente));
      } else if (evento.tipo_sub == 0) {
        if (evento.repasse == 1) {
          contaCredito.push(
            await loader.getContaPessoa(
              !evento.fornecedor || evento.fornecedor === "0"
                ? evento.Fornecedor_Custeio
                : evento.fornecedor,
              "provisao"
            )
          );
          contaDebito.push(await loader.getContaPessoa(this.state.cliente));
        } else {
          contaCredito.push(
            await loader.getContaPessoa(
              !evento.fornecedor || evento.fornecedor === "0"
                ? evento.Fornecedor_Custeio
                : evento.fornecedor,
              "provisao"
            )
          );
          contaDebito.push("");
        }
      } else if (evento.tipo_sub == 2) {
        contaCredito.push(await loader.getContaPessoa(this.state.cliente));
        contaDebito.push(CAMBIO_LIQUIDAR);
      } else if (evento.tipo_sub == 3) {
        contaCredito.push(await loader.getContaPessoa(this.state.cliente));
        contaDebito.push();
      }
    }

    this.setState({
      historico: newArray,
      codBarras: newArray,
      meioPagamento: newArray,
      meioPagamentoNome: newArray,
      darfPagamento: newArray,
      codigoReceita: newArray,
      contribuinte: newArray,
      codigoIdentificadorTributo: newArray,
      mesCompetNumRef: newArray,
      dataApuracao: newArray,
      darfValor: newArray,
      darfMulta: newArray,
      darfJuros: newArray,
      darfOutros: newArray,
      contaDebito,
      contaCredito,
      eventosContabilizando: eventos,
      contabiliza: true,
      paginaContabiliza: 0,
    });
  };

  deleteGrupo = async (grupo) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui text-center">
            {this.setState({ modalItemAberto: false })}
            <h1>{NOME_EMPRESA}</h1>
            <p>Deseja remover este grupo?</p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-25"
              onClick={async () => {
                onClose();
              }}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-25"
              onClick={async () => {
                await apiEmployee
                  .post(`deleteCusteioSubagente.php`, {
                    token: true,
                    grupo,
                    os: this.state.chave,
                  })
                  .then(
                    async (response) => {
                      await loader.salvaLogs(
                        "custeios_subagentes",
                        this.state.usuarioLogado.codigo,
                        null,
                        "Exclusão",
                        grupo
                      );

                      this.getCusteiosSubagentes();
                    },
                    async (response) => {
                      this.erroApi(response);
                    }
                  );
                onClose();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  getTaxasOptions = async () => {
    let taxas = [];
    if (this.state.taxas[0]) {
      taxas = this.state.taxas;
    } else {
      taxas = await apiEmployee
        .post(`getTaxas.php`, {
          token: true,
        })
        .then(
          async (res) => {
            return res.data;
          },
          async (err) => {
            this.erroApi(err);
          }
        );
    }
    this.setState({ taxas });

    if (this.state.eventoTipo == 0) {
      const options = taxas
        .filter((taxa) => taxa.Tipo == "P")
        .map((e) => {
          return { label: e.descricao, value: e.chave, money: e.valor };
        });

      await this.setState({ taxasOptions: options });
    } else if (this.state.eventoTipo == 1) {
      const options = taxas
        .filter((taxa) => taxa.Tipo == "R")
        .map((e) => {
          return { label: e.descricao, value: e.chave, money: e.valor };
        });

      await this.setState({ taxasOptions: options });
    } else {
      const options = taxas.map((e) => {
        return { label: e.descricao, value: e.chave, money: e.valor };
      });

      await this.setState({ taxasOptions: options });
    }
  };

  getFornecedores = async () => {
    await apiEmployee
      .post(`getFornecedores.php`, {
        token: true,
      })
      .then(
        async (res) => {
          if (res.data[0]) {
            const options = res.data.map((e) => {
              return {
                label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${
                  e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""
                }`,
                value: e.Chave,
              };
            });

            options.unshift({ label: "Nenhum", value: "0" });

            await this.setState({ fornecedoresOptions: options });
          }
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getDescricaoPadrao = async () => {
    await apiEmployee
      .post(`getDescricaoPadrao.php`, {
        token: true,
      })
      .then(
        async (res) => {
          if (res.data[0]) {
            const options = res.data.map((e) => {
              return { label: e.descricao, value: e.descricao };
            });

            await this.setState({ descricoesPadraoOptions: options });
          }
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  setItemEdit = async (evento = null, template = false) => {
    await this.setState({
      modalItemAberto: false,
    });

    await this.getTaxasOptions();
    if (!this.state.fornecedoresOptions[0]) {
      await this.getFornecedores();
    }
    if (!this.state.descricoesPadraoOptions[0]) {
      await this.getDescricaoPadrao();
    }

    if (template) {
      const template = {
        data: evento.data || this.state.eventoData,
        fornecedor: evento.fornecedor || this.state.eventoFornecedor,
        Moeda: evento.Moeda || this.state.eventoMoeda,
        taxa: evento.taxa || this.state.eventoTaxa,
        descricao: evento.descricao || this.state.eventoDescricao,
        tipo_sub: evento.tipo_sub || this.state.eventoTipo,
        ordem: this.state.eventoOrdem,
        remarks: evento.remarks || this.state.eventoRemarks,
        valor: evento.valor || this.state.eventoValor,
        valor1: evento.valor1 || this.state.eventoVlrc,
        repasse: evento.repasse || this.state.eventoRepasse,
        Fornecedor_Custeio:
          evento.Fornecedor_Custeio || this.state.eventoFornecedorCusteio,
        chave: this.state.eventoChave,
        qntd: evento.qntd || this.state.eventoQntd,
      };

      let valorTotalInicial = evento.qntd * evento.valor;

      const updateValorTotal = () => {
        const valor = parseFloat(this.state.eventoValor.replace(",", ".").replace(".", "")) || 0;
        const qntd = parseInt(this.state.eventoQntd) || 1;
        const valorTotal = valor * qntd;
        let valorTotalInicial = new Intl.NumberFormat("pt-BR", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(valorTotal)
      };

      await this.setState({
        eventoData: template.data,
        eventoFornecedor: template.fornecedor,
        eventoMoeda: template.Moeda,
        eventoTaxa: template.taxa,
        eventoDescricao: template.descricao,
        eventoTipo: template.tipo_sub,
        eventoOrdem: template.ordem,
        eventoRemarks: template.remarks,
        eventoValor: Number(template.valor)
          ? new Intl.NumberFormat("pt-BR", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(template.valor)
          : "0,00",
        eventoVlrc: Number(template.valor1)
          ? new Intl.NumberFormat("pt-BR", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(template.valor1)
          : "0,00",
        eventoRepasse: template.repasse,
        eventoFornecedorCusteio: template.Fornecedor_Custeio,
        eventoChave: template.chave,
        eventoQntd: Number(template.qntd),

        modalItemAberto: true,
        itemNome: template.descricao,
        itemPermissao: "SERVICOS_ITENS",

        dadosIniciaisSol: [
          {
            titulo: "Data",
            valor: util.formatForLogs(this.state.eventoData, "date"),
          },
          {
            titulo: "Fornecedor",
            valor: util.formatForLogs(
              this.state.eventoFornecedor,
              "options",
              "",
              "",
              this.state.fornecedoresOptions
            ),
          },
          {
            titulo: "Taxa",
            valor: util.formatForLogs(
              this.state.eventoTaxa,
              "options",
              "",
              "",
              this.state.taxasOptions
            ),
          },
          {
            titulo: "Moeda",
            valor: util.formatForLogs(
              this.state.eventoMoeda,
              "options",
              "",
              "",
              this.state.moedasOptions
            ),
          },
          {
            titulo: "Valor unitário",
            valor: util.formatForLogs(this.state.eventoValor, "money", "0,00"),
          },
          {
            titulo: "VCP",
            valor: util.formatForLogs(this.state.eventoVlrc, "money", "0,00"),
          },
          {
            titulo: "Repasse",
            valor: util.formatForLogs(this.state.eventoRepasse, "bool"),
          },
          {
            titulo: "Descrição",
            valor: util.formatForLogs(this.state.eventoDescricao),
          },
          {
            titulo: "Tipo",
            valor: util.formatForLogs(
              this.state.eventoTipo,
              "options",
              "",
              "",
              this.state.tiposSubOptions
            ),
          },
          {
            titulo: "Ordem",
            valor: util.formatForLogs(this.state.eventoOrdem),
          },
          {
            titulo: "Remarks",
            valor: util.formatForLogs(this.state.eventoRemarks),
          },
          {
            titulo: "Fornecedor Custeio",
            valor: util.formatForLogs(
              this.state.eventoFornecedorCusteio,
              "options",
              "",
              "",
              this.state.fornecedoresOptions
            ),
          },
          {
            titulo: "Quantidade",
            valor: util.formatForLogs(this.state.eventoQntd),
          },
        ],

        itemEdit: {
          onSubmit: async () => await this.salvarEvento(),
          valores: [
            {
              titulo: "Data",
              valor: template.data,
              obrigatorio: true,
              tipo: "date",
              onChange: async (valor) => {
                await this.setState({ eventoData: valor });
              },
            },
            {
              titulo: "Ordem",
              valor: template.ordem,
              obrigatorio: true,
              tipo: "text",
              onChange: async (valor) => {
                await this.setState({ eventoOrdem: valor });
              },
            },
            {
              titulo: "Tipo",
              valor: template.tipo_sub,
              obrigatorio: true,
              tipo: "select",
              options: this.state.tiposSubOptions,
              onChange: async (valor) => {
                await this.setState({ eventoTipo: valor });
              },
            },
            {
              titulo: "Repasse",
              valor: template.repasse == 1 ? true : false,
              tipo: "check",
              onChange: async (valor) =>
                await this.setState({ eventoRepasse: valor }),
            },
            {
              titulo: "Taxa",
              valor: template.taxa,
              obrigatorio: [0, 1].includes(template.tipo_sub),
              tipo: "select",
              options: this.state.taxasOptions,
              onChange: async (valor) => {
                await this.setState({ eventoTaxa: valor });
              },
            },
            {
              titulo: "Fornecedor",
              valor: template.fornecedor,
              obrigatorio: template.tipo_sub == 0,
              tipo: "select",
              options: this.state.fornecedoresOptions,
              onChange: async (valor) => {
                await this.setState({ eventoFornecedor: valor });
              },
            },
            {
              titulo: "Fornecedor Custeio",
              valor: template.Fornecedor_Custeio,
              obrigatorio: template.tipo_sub == 1,
              tipo: "select",
              options: this.state.fornecedoresOptions,
              onChange: async (valor) => {
                await this.setState({ eventoFornecedorCusteio: valor });
              },
            },
            {
              titulo: "Descrição Padrão",
              valor: template.descricao,
              tipo: "select",
              options: this.state.descricoesPadraoOptions,
              onChange: async (valor) => {
                await this.setState({ eventoDescricao: valor });
              },
            },
            {
              titulo: "Descrição",
              valor: template.descricao,
              obrigatorio: true,
              tipo: "text",
              onChange: async (valor) => {
                await this.setState({ eventoDescricao: valor });
              },
            },
            {
              half: true,
              titulo: "Valor unitário",
              obrigatorio: true,
              valor1: template.Moeda,
              tipo1: "select",
              options1: this.state.moedasOptions,
              onChange1: async (valor) => {
                await this.setState({ eventoMoeda: valor });
              },
              valor2: Number(template.valor)
                ? new Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(template.valor)
                : "0,00",
              tipo2: "text",
              onChange2: async (valor) => {
                await this.setState({ eventoValor: valor }, updateValorTotal);
              },
              onBlur2: async (valor) => {
                await this.setState({
                  eventoValor: Number(
                    valor.replaceAll(".", "").replaceAll(",", ".")
                  )
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(valor.replaceAll(".", "").replaceAll(",", "."))
                    : "0,00",
                }, updateValorTotal);
              },
            },
            {
              titulo: "Quantidade",
              valor: Number(template.qntd),
              tipo: "text",
              onChange: async (valor) => {
                await this.setState({ eventoQntd: Number(valor) }, updateValorTotal);
              },
            },
            {
              titulo: "Valor total",
              valor: new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(valorTotalInicial),
              tipo: "text",
              disabled: true,
            },
            {
              titulo: "VCP",
              valor: Number(template.valor1)
                ? new Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(template.valor1)
                : "0,00",
              tipo: "money",
              onChange: async (valor) => {
                await this.setState({ eventoVlrc: valor });
              },
              onBlur: async (valor) => {
                await this.setState({
                  eventoVlrc: Number(
                    valor.replaceAll(".", "").replaceAll(",", ".")
                  )
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(valor.replaceAll(".", "").replaceAll(",", "."))
                    : "0,00",
                });
              },
            },
            {
              titulo: "Remarks",
              valor: template.remarks,
              tipo: "textarea",
              onChange: async (valor) => {
                await this.setState({ eventoRemarks: valor });
              },
            },
          ],
        },
      });
    } else {
      if (evento) {
        let valorTotalInicial = evento.qntd * evento.valor;

        const updateValorTotal = () => {
          const valor = parseFloat(this.state.eventoValor.replace(",", ".").replace(".", "")) || 0;
          const qntd = parseInt(this.state.eventoQntd) || 1;
          const valorTotal = valor * qntd;
          let valorTotalInicial = new Intl.NumberFormat("pt-BR", {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(valorTotal)
        };

        await this.setState({
          eventoData: evento.data || this.state.eventoData,
          eventoFornecedor: evento.fornecedor,
          eventoMoeda: evento.Moeda,
          eventoTaxa: evento.taxa,
          eventoDescricao: evento.descricao,
          eventoTipo: evento.tipo_sub,
          eventoOrdem: evento.ordem,
          eventoRemarks: evento.remarks,
          eventoQntd: evento.qntd,
          eventoValor: Number(evento.valor)
            ? new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(evento.valor)
            : "0,00",
          eventoVlrc: Number(evento.valor1)
            ? new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(evento.valor1)
            : "0,00",
          eventoRepasse: evento.repasse,
          eventoFornecedorCusteio: evento.Fornecedor_Custeio,
          eventoChave: evento.chave,

          modalItemAberto: true,
          itemNome: evento.descricao,
          itemPermissao: "SERVICOS_ITENS",

          dadosIniciaisSol: [
            {
              titulo: "Data",
              valor: util.formatForLogs(this.state.eventoData, "date"),
            },
            {
              titulo: "Fornecedor",
              valor: util.formatForLogs(
                this.state.eventoFornecedor,
                "options",
                "",
                "",
                this.state.fornecedoresOptions
              ),
            },
            {
              titulo: "Taxa",
              valor: util.formatForLogs(
                this.state.eventoTaxa,
                "options",
                "",
                "",
                this.state.taxasOptions
              ),
            },
            {
              titulo: "Moeda",
              valor: util.formatForLogs(
                this.state.eventoMoeda,
                "options",
                "",
                "",
                this.state.moedasOptions
              ),
            },
            {
              titulo: "Valor unitário",
              valor: util.formatForLogs(
                this.state.eventoValor,
                "money",
                "0,00"
              ),
            },
            {
              titulo: "VCP",
              valor: util.formatForLogs(this.state.eventoVlrc, "money", "0,00"),
            },
            {
              titulo: "Repasse",
              valor: util.formatForLogs(this.state.eventoRepasse, "bool"),
            },
            {
              titulo: "Descrição",
              valor: util.formatForLogs(this.state.eventoDescricao),
            },
            {
              titulo: "Tipo",
              valor: util.formatForLogs(
                this.state.eventoTipo,
                "options",
                "",
                "",
                this.state.tiposSubOptions
              ),
            },
            {
              titulo: "Ordem",
              valor: util.formatForLogs(this.state.eventoOrdem),
            },
            {
              titulo: "Remarks",
              valor: util.formatForLogs(this.state.eventoRemarks),
            },
            {
              titulo: "Fornecedor Custeio",
              valor: util.formatForLogs(
                this.state.eventoFornecedorCusteio,
                "options",
                "",
                "",
                this.state.fornecedoresOptions
              ),
            },
            {
              titulo: "Quantidade",
              valor: util.formatForLogs(this.state.eventoQntd),
            },
          ],

          itemEdit: {
            onSubmit: async () => await this.salvarEvento(),
            valores: [
              {
                titulo: "Data",
                valor: evento.data,
                obrigatorio: true,
                tipo: "date",
                onChange: async (valor) => {
                  await this.setState({ eventoData: valor });
                },
              },
              {
                titulo: "Ordem",
                valor: evento.ordem,
                obrigatorio: true,
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoOrdem: valor });
                },
              },
              {
                titulo: "Tipo",
                valor: evento.tipo_sub,
                obrigatorio: true,
                tipo: "select",
                options: this.state.tiposSubOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoTipo: valor });
                },
              },
              {
                titulo: "Repasse",
                valor: evento.repasse == 1 ? true : false,
                tipo: "check",
                onChange: async (valor) =>
                  await this.setState({ eventoRepasse: valor }),
              },
              {
                titulo: "Taxa",
                valor: evento.taxa,
                obrigatorio: [0, 1].includes(evento.tipo_sub),
                tipo: "select",
                options: this.state.taxasOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoTaxa: valor });
                },
              },
              {
                titulo: "Fornecedor",
                valor: evento.fornecedor,
                obrigatorio: evento.tipo_sub == 0,
                tipo: "select",
                options: this.state.fornecedoresOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoFornecedor: valor });
                },
              },
              {
                titulo: "Fornecedor Custeio",
                valor: evento.Fornecedor_Custeio,
                obrigatorio: evento.tipo_sub == 1,
                tipo: "select",
                options: this.state.fornecedoresOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoFornecedorCusteio: valor });
                },
              },
              {
                titulo: "Descrição Padrão",
                valor: evento.descricao,
                tipo: "select",
                options: this.state.descricoesPadraoOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoDescricao: valor });
                },
              },
              {
                titulo: "Descrição",
                valor: evento.descricao,
                obrigatorio: true,
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoDescricao: valor });
                },
              },
              {
                half: true,
                titulo: "Valor unitário",
                obrigatorio: true,
                valor1: evento.Moeda,
                tipo1: "select",
                options1: this.state.moedasOptions,
                onChange1: async (valor) => {
                  await this.setState({ eventoMoeda: valor });
                },
                valor2: Number(evento.valor)
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(evento.valor)
                  : "0,00",
                tipo2: "text",
                onChange2: async (valor) => {
                  await this.setState({ eventoValor: valor }, updateValorTotal);
                },
                onBlur2: async (valor) => {
                  await this.setState({
                    eventoValor: Number(
                      valor.replaceAll(".", "").replaceAll(",", ".")
                    )
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        )
                      : "0,00",
                  }, updateValorTotal);
                },
              },
              {
                titulo: "Quantidade",
                valor: Number(evento.qntd),
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoQntd: Number(valor) }, updateValorTotal);
                },
              },
              {
                titulo: "Valor total",
                valor: new Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(valorTotalInicial),
                tipo: "text",
                disabled: true, 
              },
              {
                titulo: "VCP",
                valor: Number(evento.valor1)
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(evento.valor1)
                  : "0,00",
                tipo: "money",
                onChange: async (valor) => {
                  await this.setState({ eventoVlrc: valor });
                },
                onBlur: async (valor) => {
                  await this.setState({
                    eventoVlrc: Number(
                      valor.replaceAll(".", "").replaceAll(",", ".")
                    )
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        )
                      : "0,00",
                  });
                },
              },
              {
                titulo: "Remarks",
                valor: evento.remarks,
                tipo: "textarea",
                onChange: async (valor) => {
                  await this.setState({ eventoRemarks: valor });
                },
              },
            ],
          },
        });
      } else {
        await this.setState({
          eventoData: moment().format("YYYY-MM-DD"),
          eventoFornecedor: "",
          eventoMoeda: 6,
          eventoTaxa: "",
          eventoDescricao: "",
          eventoTipo: 0,
          eventoOrdem: `${
            Math.floor(
              Math.max(...this.state.eventos.map((e) => parseFloat(e.ordem)), 0)
            ) + 1
          }`,
          eventoRemarks: "",
          eventoQntd: 1,
          eventoValor: "0,00",
          eventoVlrc: "0,00",
          eventoRepasse: false,
          eventoFornecedorCusteio: "",

          modalItemAberto: true,
          itemNome: "",
          eventoChave: 0,
          itemPermissao: "SERVICOS_ITENS",

          dadosIniciaisSol: [],

          itemEdit: {
            onSubmit: async () => await this.salvarEvento(),
            valores: [
              {
                titulo: "Data",
                obrigatorio: true,
                valor: moment().format("YYYY-MM-DD"),
                tipo: "date",
                onChange: async (valor) => {
                  await this.setState({ eventoData: valor });
                },
              },
              {
                titulo: "Ordem",
                obrigatorio: true,
                valor: `${
                  Math.floor(
                    Math.max(
                      ...this.state.eventos.map((e) => parseFloat(e.ordem)),
                      0
                    )
                  ) + 1
                }`,
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoOrdem: valor });
                },
              },
              {
                titulo: "Tipo",
                obrigatorio: true,
                valor: 0,
                tipo: "select",
                options: this.state.tiposSubOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoTipo: valor });
                },
              },
              {
                titulo: "Repasse",
                valor: false,
                tipo: "check",
                onChange: async (valor) =>
                  await this.setState({ eventoRepasse: valor }),
              },
              {
                titulo: "Taxa",
                obrigatorio: true,
                valor: "",
                tipo: "select",
                options: this.state.taxasOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoTaxa: valor });
                },
              },
              {
                titulo: "Fornecedor",
                obrigatorio: true,
                valor: "",
                tipo: "select",
                options: this.state.fornecedoresOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoFornecedor: valor });
                },
              },
              {
                titulo: "Fornecedor Custeio",
                valor: "",
                tipo: "select",
                options: this.state.fornecedoresOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoFornecedorCusteio: valor });
                },
              },
              {
                titulo: "Descrição Padrão",
                valor: "",
                tipo: "select",
                options: this.state.descricoesPadraoOptions,
                onChange: async (valor) => {
                  await this.setState({ eventoDescricao: valor });
                },
              },
              {
                titulo: "Descrição",
                obrigatorio: true,
                valor: "",
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoDescricao: valor });
                },
              },
              {
                half: true,
                titulo: "Valor unitário",
                obrigatorio: true,
                valor1: 6,
                tipo1: "select",
                options1: this.state.moedasOptions,
                onChange1: async (valor) => {
                  await this.setState({ eventoMoeda: valor });
                },
                valor2: "0,00",
                tipo2: "text",
                onChange2: async (valor) => {
                  await this.setState({ eventoValor: valor });
                },
                onBlur2: async (valor) => {
                  await this.setState({
                    eventoValor: Number(
                      valor.replaceAll(".", "").replaceAll(",", ".")
                    )
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        )
                      : "",
                  });
                },
              },
              {
                titulo: "Quantidade",
                valor: 1,
                tipo: "text",
                onChange: async (valor) => {
                  await this.setState({ eventoQntd: Number(valor) });
                },
              },
              {
                titulo: "VCP",
                valor: "0,00",
                tipo: "money",
                onChange: async (valor) => {
                  await this.setState({ eventoVlrc: valor });
                },
                onBlur: async (valor) => {
                  await this.setState({
                    eventoVlrc: Number(
                      valor.replaceAll(".", "").replaceAll(",", ".")
                    )
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          valor.replaceAll(".", "").replaceAll(",", ".")
                        )
                      : "",
                  });
                },
              },
              {
                titulo: "Remarks",
                valor: "",
                tipo: "textarea",
                onChange: async (valor) => {
                  await this.setState({ eventoRemarks: valor });
                },
              },
            ],
          },
        });
      }
    }

    if (this.refs.focusMe) {
      this.refs.focusMe.focus();
    }
  };

  getServicosItens = async () => {
    await apiEmployee
      .post(`getServicosItensOs.php`, {
        token: true,
        chave_os: this.state.chave,
      })
      .then(
        async (response) => {
          const todosEventos = [...this.state.todosEventos, ...response.data];

          const eventos = [
            ...this.state.eventos,
            ...response.data.filter((e) => e.cancelada != 1),
          ];

          if (eventos.find((evento) => evento.Moeda == 0)) {
            this.setState({
              error: {
                type: "error",
                msg: "Foram encontrados eventos sem valor de moeda. Por favor contate o setor de desenvolvimento",
              },
            });
          }

          await this.setState({ eventos, todosEventos });
        },
        (response) => {
          this.erroApi(response);
        }
      );
  };

  getDocumentos = async () => {
    await apiEmployee
      .post(`getDocumentosOS.php`, {
        token: true,
        chave_os: this.state.chave,
      })
      .then(
        async (response) => {
          const documentos = [...this.state.documentos, ...response.data];
          await this.setState({ documentos: documentos });
        },
        (response) => {
          this.erroApi(response);
        }
      );
  };

  faturarData = async (valor) => {
    //console.log(valor)
    if (!this.state.anexosForn[0]) {
      await this.setState({
        faturamento: valor,
        faturadoPor:
          valor == "" || !moment(valor).isValid()
            ? ""
            : this.state.usuarioLogado.codigo,
      });
    } else {
      await this.setState({
        error: { type: "error", msg: "Há Faturas Pendentes!" },
      });
    }
  };

    copyServicoItem = async (item, nome) => {
      const currentOrders = this.state.eventos?.map(item => item.ordem) || [];
      const nextOrder = Math.max(...currentOrders, 0) + 1;
      const values = `'${this.state.os.Chave}', 
                      '${item.data}', 
                      '${item.fornecedor}', 
                      '${item.taxa}', 
                      '${item.descricao}', 
                      '${item.tipo_sub}', 
                      '${item.Fornecedor_Custeio}', 
                      '${item.remarks}', 
                      '${item.Moeda}', 
                      '${item.valor}', 
                      '${item.valor1}', 
                      '${item.repasse}', 
                      '${item.qntd}'`;
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui text-center">
              {this.setState({ modalItemAberto: false })}
              <h1>{NOME_EMPRESA}</h1>
              <p>Deseja copiar este evento? ({nome}) </p>
              <button
                style={{ marginRight: 5 }}
                className="btn btn-danger w-25"
                onClick={async () => {
                  onClose();
                }}
              >
                Não
              </button>
              <button
                style={{ marginRight: 5 }}
                className="btn btn-success w-25"
                onClick={async () => {
                  await apiEmployee
                    .post(`insertServicoItemBasico.php`, {
                      token: true,
                      values: values,
                      chave_os: this.state.os.Chave,
                      ordem: nextOrder
                    })
                    .then(
                      async (response) => {
                        if (response.data == true) {
                          await loader.salvaLogs(
                            "os_servicos_itens",
                            this.state.usuarioLogado.codigo,
                            null,
                            "Copia",
                            item.chave
                          );
                        }
                        document.location.reload();
                      },
                      async (response) => {
                        this.erroApi(response);
                      }
                    );
                  onClose();
                }}
              >
                Sim
              </button>
            </div>
          );
        },
      });
    };

  deleteServicoItem = async (chave, nome) => {
    this.setState({ deleteSolicitao: true });

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui text-center">
            {this.setState({ modalItemAberto: false })}
            <h1>{NOME_EMPRESA}</h1>
            <p>Deseja remover este evento? ({nome}) </p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-25"
              onClick={async () => {
                onClose();
              }}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-25"
              onClick={async () => {
                await apiEmployee
                  .post(`deleteServicoItem.php`, {
                    token: true,
                    chave: chave,
                    canceladaPor: this.state.usuarioLogado.codigo,
                  })
                  .then(
                    async (response) => {
                      if (response.data == true) {
                        await loader.salvaLogs(
                          "os_servicos_itens",
                          this.state.usuarioLogado.codigo,
                          null,
                          "Cancelamento",
                          chave
                        );

                        document.location.reload();
                      }
                    },
                    async (response) => {
                      this.erroApi(response);
                    }
                  );
                onClose();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  deleteMultipleEvents = async () => {
    if (this.state.selectedEvents.length === 0) return;

    const eventNames = this.state.selectedEvents.map(chave => 
      this.state.eventos.find(evento => evento.chave === chave)?.descricao
    ).join(', ');

    confirmAlert({
      customUI: ({ onClose }) => {
        {this.setState({ modalItemAberto: false })}
        return (
          <div className="custom-ui text-center">
            <h1>{NOME_EMPRESA}</h1>
            <p>Deseja remover estes eventos? ({eventNames}) </p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-25"
              onClick={onClose}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-25"
              onClick={async () => {
                for (const chave of this.state.selectedEvents) {
                  await apiEmployee
                    .post(`deleteServicoItem.php`, {
                      token: true,
                      chave: chave,
                      canceladaPor: this.state.usuarioLogado.codigo,
                    })
                    .then(
                      async (response) => {
                        if (response.data == true) {
                          await loader.salvaLogs(
                            "os_servicos_itens",
                            this.state.usuarioLogado.codigo,
                            null,
                            "Cancelamento",
                            chave
                          );
                        }
                      },
                      (response) => {
                        this.erroApi(response);
                      }
                    );
                }
                document.location.reload();
                onClose();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  ShareToOs = async () => {
    if (this.state.selectedEvents.length === 0) return;

    const eventNames = this.state.selectedEvents.map(chave => 
      this.state.eventos.find(evento => evento.chave === chave)?.descricao
    ).join(', ');

    confirmAlert({
      customUI: ({ onClose }) => {
        {this.setState({ modalItemAberto: false })}
        return (
          <div className="custom-ui text-center">
            <h1>{NOME_EMPRESA}</h1>
            <p>Deseja transferir estes eventos ({eventNames}) para a OS ({this.state.os_escolhida.label})?</p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-25"
              onClick={onClose}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-25"
              onClick={async () => {
                for (const chave of this.state.selectedEvents) {
                  await apiEmployee
                    .post(`shareServicoItem.php`, {
                      token: true,
                      chaveEvento: chave,
                      chaveOs: this.state.os_escolhida.value
                    })
                    .then(
                      async (response) => {
                        if (response.data == true) {
                          await loader.salvaLogs(
                            "os_servicos_itens",
                            this.state.usuarioLogado.codigo,
                            null,
                            "Compartilhamento",
                            chave
                          );
                        }
                      },
                      (response) => {
                        this.erroApi(response);
                      }
                    );
                }
                onClose();
                await this.setState({ redirectAfterInsertEventsInOs: true });
                window.location.reload();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  deleteDocumento = async (chave, nome, caminho) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui text-center">
            <h1>{NOME_EMPRESA}</h1>
            <p>Deseja remover este Documento? ({nome}) </p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-25"
              onClick={async () => {
                onClose();
              }}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-25"
              onClick={async () => {
                await apiEmployee
                  .post(`deleteDocumento.php`, {
                    token: true,
                    chave: chave,
                    nome: caminho,
                  })
                  .then(
                    async (response) => {
                      if (response.data == true) {
                        await loader.salvaLogs(
                          "os_documentos",
                          this.state.usuarioLogado.codigo,
                          null,
                          "Exclusão",
                          chave
                        );

                        document.location.reload();
                      }
                    },
                    async (response) => {
                      this.erroApi(response);
                    }
                  );
                onClose();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  getCodigo = async () => {
    await apiEmployee
      .post("getCodigos.php", {
        token: true,
        tipo: "OS",
      })
      .then(
        async (res) => {
          await this.setState({ codigo: res.data[0] });
        },
        async (err) => console.log(`erro: ` + err)
      );
  };

  getCentrosCustos = async () => {
    await apiEmployee
      .post("getCentrosCustosLivres.php", {
        token: true,
        os_chave: this.state.chave,
      })
      .then(
        async (res) => {
          await this.setState({ centrosCustos: res.data });

          const options = this.state.centrosCustos.map((e) => {
            return { label: `CC:${e.Codigo} - ${e.Descricao}`, value: e.Chave };
          });

          const centroCusto = this.state.centrosCustos.find(
            (e) =>
              !this.state.centroCusto &&
              e.Codigo == this.state.codigo.slice(2) &&
              e.Codigo >= 5850
          );

          if (centroCusto) {
            this.setState({ centroCusto: centroCusto.Chave });
          }
          options.unshift({ label: "--", value: "" });

          await this.setState({ centrosCustosOptions: options });
        },
        async (err) => console.log(`erro: ` + err)
      );
  };

  getOperadores = async () => {
    await apiEmployee
      .post(`getOperadores.php`, {
        token: true,
        empresa: this.state.usuarioLogado.empresa,
      })
      .then(
        async (res) => {
          await this.setState({ operadores: res.data });
          const options = this.state.operadores
            .filter((e) => e.ativo == 1)
            .map((e) => {
              return { label: e.Nome, value: e.Codigo };
            });

          await this.setState({ operadoresOptions: options });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  finalizaSalvamento = async () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui text-center">
            <h1>{NOME_EMPRESA}</h1>
            <p>OS salva!</p>
            <p>Deseja criar mais?</p>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-danger w-50"
              onClick={async () => {
                onClose();
              }}
            >
              Não
            </button>
            <button
              style={{ marginRight: 5 }}
              className="btn btn-success w-50"
              onClick={async () => {
                await this.setState({
                  recarregaPagina: true,
                });

                onClose();
              }}
            >
              Sim
            </button>
          </div>
        );
      },
    });
  };

  getTemplates = async () => {
    await apiEmployee
      .post(`getEventosTemplates.php`, {
        token: true,
        empresa: this.state.usuarioLogado.empresa,
        offset: 0,
      })
      .then(
        async (res) => {
          await this.setState({ templates: res.data });
        },
        async (err) => {
          this.erroApi(err);
        }
      );
  };

  getGruposTemplates = async () => {
    if (!this.state.gruposTemplates[0]) {
      await apiEmployee
        .post(`getGruposTemplates.php`, {
          token: true,
        })
        .then(
          async (res) => {
            await this.setState({ gruposTemplates: res.data });
          },
          async (err) => {
            this.erroApi(err);
          }
        );
    }
    this.setState({
      gruposTemplatesModal: true,
    });
  };

  criarGrupoTemplates = async (validForm) => {
    const { grupoTemplate } = this.state;
    const templates = grupoTemplate.templatesChaves
      ?.split("@.@")
      ?.map((e) => this.state.templates.find((t) => t.chave == e));

      for (const [index, template] of templates.entries()) {
        let ordem;
        if (this.state.eventos.length > 0) {
          ordem =
            parseFloat(
              this.state.eventos[this.state.eventos.length - 1]?.ordem.replaceAll(
                ",",
                "."
              )
            ) +
            (index + 1);
        } else {
          ordem = index + 1;
        }

      await apiEmployee
        .post(`insertServicoItemBasico.php`, {
          token: true,
          values: `'${this.state.chave}', '', '${template.fornecedor}', '${template.taxa}', '${template.descricao}', '${template.tipo_sub}', '${template.Fornecedor_Custeio}', '${template.remarks}', '${template.Moeda}', '${template.valor}', '${template.valor1}', '${template.repasse}', '${template.qntd}'`,
          chave_os: this.state.chave,
          ordem,
        })
        .then(
          async (res) => {
            await loader.salvaLogs(
              "os_servicos_itens",
              this.state.usuarioLogado.codigo,
              null,
              "Inclusão",
              res.data[0].chave
            );
          },
          async (res) => await console.log(`Erro: ${res.data}`)
        );
    };

    if (validForm) {
      this.salvarOS(validForm);
    } else {
      this.setState({ recarregaPagina: true });
    }
  };

  salvarOS = async (validForm, reload = true) => {
    this.setState({ ...util.cleanStates(this.state) });

    await this.setState({
      governmentTaxes: this.state.governmentTaxes
        ? this.state.governmentTaxes
        : 0,
      bankCharges: this.state.bankCharges ? this.state.bankCharges : 0,
      dadosFinais: [
        {
          titulo: "Descrição",
          valor: util.formatForLogs(this.state.descricao),
        },
        { titulo: "Código", valor: util.formatForLogs(this.state.codigo) },
        {
          titulo: "Cliente",
          valor: util.formatForLogs(
            this.state.cliente,
            "options",
            "",
            "",
            this.state.pessoasOptions
          ),
        },
        {
          titulo: "Navio",
          valor: util.formatForLogs(
            this.state.navio,
            "options",
            "",
            "",
            this.state.naviosOptions
          ),
        },
        {
          titulo: "Data de Abertura",
          valor: util.formatForLogs(this.state.abertura, "date"),
        },
        {
          titulo: "Data de Chegada",
          valor: util.formatForLogs(this.state.chegada, "date"),
        },
        {
          titulo: "Tipo de Servico",
          valor: util.formatForLogs(
            this.state.tipoServico,
            "options",
            "",
            "",
            this.state.tiposServicosOptions
          ),
        },
        { titulo: "Viagem", valor: util.formatForLogs(this.state.viagem) },
        {
          titulo: "Porto",
          valor: util.formatForLogs(
            this.state.porto,
            "options",
            "",
            "",
            this.state.portosOptions
          ),
        },
        { titulo: "ETA", valor: util.formatForLogs(this.state.eta, "date") },
        { titulo: "ATB", valor: util.formatForLogs(this.state.atb, "date") },
        {
          titulo: "ETB",
          valor: util.formatForLogs(this.state.etb, "datetime"),
        },
        {
          titulo: "Government Taxes",
          valor: util.formatForLogs(this.state.governmentTaxes, "money"),
        },
        {
          titulo: "Bank Charges",
          valor: util.formatForLogs(this.state.bankCharges, "money"),
        },
        {
          titulo: "Data de Saida",
          valor: util.formatForLogs(this.state.data_saida, "datetime"),
        },
        {
          titulo: "Data de Encerramento",
          valor: util.formatForLogs(this.state.encerramento, "date"),
        },
        {
          titulo: "Data de Faturamento",
          valor: util.formatForLogs(this.state.faturamento, "date"),
        },
        {
          titulo: "Centro de Custo",
          valor: util.formatForLogs(
            this.state.centroCusto,
            "options",
            "",
            "",
            this.state.centrosCustosOptions
          ),
        },
        { titulo: "ROE", valor: util.formatForLogs(this.state.roe) },
        {
          titulo: "Comentario Voucher",
          valor: util.formatForLogs(this.state.comentario),
        },
        {
          titulo: "Encerrado por",
          valor: util.formatForLogs(
            this.state.encerradoPor,
            "options",
            "",
            "",
            this.state.operadoresOptions
          ),
        },
        {
          titulo: "Faturado por",
          valor: util.formatForLogs(
            this.state.faturadoPor,
            "options",
            "",
            "",
            this.state.operadoresOptions
          ),
        },
        {
          titulo: "Operador",
          valor: util.formatForLogs(
            this.state.operador,
            "options",
            "",
            "",
            this.state.operadoresOptions
          ),
        },
      ],
      loading: true,
      bloqueado: true,
    });

    if (parseInt(this.state.chave) === 0 && validForm) {
      await this.getCodigo();
      let clienteEncurtado = this.state.clientesOptions.find(
        (cliente) => cliente.value == this.state.cliente
      )?.label;
      clienteEncurtado = clienteEncurtado.split(" ")[0];

      await apiEmployee
        .post(`insertOS.php`, {
          token: true,
          values: `'${this.state.usuarioLogado.codigo}', '${
            this.state.descricao
          }', 'ST${this.state.codigo.Proximo}', '${this.state.cliente}', '${
            this.state.navio
          }', '${moment(this.state.abertura).format("YYYY-MM-DD")}', '${moment(
            this.state.chegada
          ).format("YYYY-MM-DD")}', '${moment(this.state.data_saida).format(
            "YYYY-MM-DD HH:mm"
          )}', '${this.state.tipoServico}', '${this.state.viagem}', '${
            this.state.porto
          }', '${this.state.encerradoPor}', '${this.state.faturadoPor}', '${
            this.state.empresa
          }', '${this.state.eta}', '${this.state.atb}', '${this.state.etb}', '${
            this.state.governmentTaxes
              ? parseFloat(
                  this.state.governmentTaxes
                    .replaceAll(".", "")
                    .replaceAll(",", ".")
                )
              : 0
          }', '${
            this.state.bankCharges
              ? parseFloat(
                  this.state.bankCharges
                    .replaceAll(".", "")
                    .replaceAll(",", ".")
                )
              : 0
          }', '${this.state.operador}', '${this.state.envio}'`,
          codigo: this.state.codigo.Proximo,
          tipo: this.state.codigo.Tipo,
          navio: this.state.naviosOptions.find(
            (navio) => navio.value == this.state.navio
          )?.label,
          tipoServico: this.state.tiposServicosOptions.find(
            (tipo) => tipo.value == this.state.tipoServico
          )?.label,
          cliente: clienteEncurtado,
          clienteChave: this.state.cliente,
          porto: this.state.portosOptions.find(
            (porto) => porto.value == this.state.porto
          )?.label,
        })
        .then(
          async (res) => {
            if (res.data[0].Chave) {
              await this.setState({
                codigo: res.data[0].codigo,
                chave: res.data[0].Chave,
                os: res.data[0],
              });
              await this.GerarEtiqueta(res.data[0].codigo, true);
              await loader.salvaLogs(
                "os",
                this.state.usuarioLogado.codigo,
                null,
                "Inclusão",
                res.data[0].Chave
              );

              await this.setState({ loading: false, bloqueado: false });
              this.setState({ recarregaPagina: reload });
            } else {
              console.log(res.data);
            }
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    } else if (validForm) {
      const codigoNumero = parseInt(this.state.codigo.slice(2));

      if (
        codigoNumero >= 5850 &&
        (this.state.navio != this.state.os.chave_navio ||
          this.state.porto != this.state.os.porto ||
          this.state.cliente != this.state.os.Chave_Cliente ||
          this.state.tipoServico != this.state.os.tipo_servico)
      ) {
        await this.mudarCentroCusto();
      }

      if (this.state.faturamento && moment(this.state.faturamento).isValid()) {
        await this.faturaOS();
      } else if (!this.state.faturamento) {
        await this.checkAndDeleteContaOS();
      }
      await apiEmployee
        .post(`updateOS.php`, {
          token: true,
          Chave: this.state.chave,
          Descricao: this.state.descricao,
          Codigo: this.state.codigo,
          Chave_Cliente: this.state.cliente,
          chave_navio: this.state.navio,
          Data_Abertura: this.state.abertura
            ? moment(this.state.abertura).format("YYYY-MM-DD")
            : "",
          Data_Chegada: this.state.chegada
            ? moment(this.state.chegada).format("YYYY-MM-DD")
            : "",
          chave_tipo_servico: this.state.tipoServico,
          viagem: this.state.viagem,
          porto: this.state.porto,
          eta: this.state.eta
            ? moment(this.state.eta).format("YYYY-MM-DD")
            : "",
          atb: this.state.atb
            ? moment(this.state.atb).format("YYYY-MM-DD")
            : "",
          etb: this.state.etb
            ? moment(this.state.etb).format("YYYY-MM-DD HH:mm")
            : "",

          Data_Saida: this.state.data_saida
            ? moment(this.state.data_saida).format("YYYY-MM-DD HH:mm")
            : "",
          Data_Encerramento: this.state.encerramento
            ? moment(this.state.encerramento).format("YYYY-MM-DD")
            : "",
          Data_Faturamento: this.state.faturamento
            ? moment(this.state.faturamento).format("YYYY-MM-DD")
            : "",
          centro_custo: this.state.centroCusto,
          ROE: this.state.roe,
          Comentario_Voucher: this.state.comentario,
          encerradoPor: this.state.encerradoPor,
          faturadoPor: this.state.faturadoPor,
          Empresa: this.state.empresa,
          governmentTaxes: this.state.governmentTaxes
            ? parseFloat(
                this.state.governmentTaxes
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )
            : 0,
          bankCharges: this.state.bankCharges
            ? parseFloat(
                this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")
              )
            : 0,
          operador: this.state.operador,
          envio: this.state.envio,
        })
        .then(
          async (res) => {
            if (res.data === true) {
              await loader.salvaLogs(
                "os",
                this.state.usuarioLogado.codigo,
                this.state.dadosIniciais,
                this.state.dadosFinais,
                this.state.chave,
                `OS: ${this.state.codigo}`
              );
              await this.setState({
                loading: false,
                bloqueado: false,
                governmentTaxes: this.state.governmentTaxes
                ? this.state.governmentTaxes
                : false,
                bankCharges: this.state.bankCharges
                ? this.state.bankCharges
                : false,
              });
              // CHECA SE O BALANCE É MENOR QUE O BALANCE MAXIMO DO CLIENTE QUANDO FOR COLOCADO UMA DATA DE FATURAMENTO
              if ((this.state.dadosIniciais?.find((e) => e.titulo === "Data de Faturamento")?.valor) != (this.state.dadosFinais?.find((e) => e.titulo === "Data de Faturamento")?.valor)) {
                fetch('https://apisiacweb.herokuapp.com/sultrade/maxBalance', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': '07256661000128',
                  },
                  body: JSON.stringify({
                    codigo: this.state.codigo, 
                    cliente: this.state.cliente, 
                    centro_custo: this.state.centroCusto
                  }),
                  keepalive: true
                });
                
                if (reload) {
                  window.location.reload();
                }
              } else if (reload) {
                window.location.reload();
              }
            } else {
              await alert(`Erro ${JSON.stringify(res)}`);
            }
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    }
  };

  faturaOS = async () => {
    let valor = 0;
    let saldo = 0;
    let valorDesconto = 0;
    let valorRecebido = 0;

    this.state.eventos.map((evento) => {
      if (evento.tipo_sub == 3 && evento.cancelada == 0) {
        if (evento.Moeda == 5) {
          valorDesconto += parseFloat(evento.valor * evento.qntd);
        } else if (evento.Moeda == 6) {
          valorDesconto +=
            parseFloat(evento.valor * evento.qntd) *
            (parseFloat(this.state.roe.replace(",", ".")) == 0
              ? 5
              : parseFloat(this.state.roe.replace(",", ".")));
        }
      } else if (evento.tipo_sub == 2) {
        if (evento.Moeda == 5) {
          valorRecebido += parseFloat(evento.valor * evento.qntd);
        } else if (evento.Moeda == 6) {
          valorRecebido +=
            parseFloat(evento.valor * evento.qntd) *
            (parseFloat(this.state.roe.replace(",", ".")) == 0
              ? 5
              : parseFloat(this.state.roe.replace(",", ".")));
        }
      } else if (![3, 2].includes(evento.tipo_sub) && evento.cancelada == 0) {
        if (evento.repasse != 0 || evento.Fornecedor_Custeio != 0) {
          if (evento.Moeda == 5) {
            valor += parseFloat(evento.valor * evento.qntd);
          } else if (evento.Moeda == 6) {
            valor +=
              parseFloat(evento.valor * evento.qntd) *
              (parseFloat(this.state.roe.replace(",", ".")) == 0
                ? 5
                : parseFloat(this.state.roe.replace(",", ".")));
          }
        }
      }
    });

    if (
      this.state.bankCharges &&
      parseFloat(
        this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")
      ) != 0
    ) {
      valor += parseFloat(
        this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")
      );
    }

    if (
      this.state.governmentTaxes &&
      parseFloat(
        this.state.governmentTaxes.replaceAll(".", "").replaceAll(",", ".")
      ) != 0
    ) {
      valor += parseFloat(
        this.state.governmentTaxes.replaceAll(".", "").replaceAll(",", ".")
      );
    }

    let valuesRet = "";
    saldo = valor - (valorDesconto + valorRecebido);

    if (!this.state.contaOs) {
      if (valorDesconto != 0) {
        valuesRet = `'0', '${parseFloat(valorDesconto)}', 'Desconto de ${
          this.state.codigo
        }', 'DESCONTO'`;
      }

      await apiEmployee
        .post(`insertContaOS.php`, {
          token: true,
          values: `'${this.state.chave}', '${moment(
            this.state.faturamento
          ).format("YYYY-MM-DD")}', '0', '${this.state.cliente}', '0', '0', '${
            this.state.centroCusto
          }', '',  0,1, 1, '${parseFloat(`${valor}`)}', '${parseFloat(
            `${saldo}`
          )}', '', '', '${0}', '${this.state.usuarioLogado.codigo}', '${
            this.state.empresa
          }', 0, 0, 0, ''`,
          valuesRet,
          os: this.state.chave,
        })
        .then(
          async (res) => {
            console.log(res.data);
          },
          async (res) => await console.log(`Erro: ${res.data}`)
        );
    } else {
      await apiEmployee
        .post(`updateContaOS.php`, {
          token: true,
          chave_conta: this.state.contaOs?.Chave,
          Lancto: moment(this.state.faturamento).format("YYYY-MM-DD"),
          Pessoa: this.state.cliente,
          Centro_Custo: this.state.centroCusto,
          Valor: parseFloat(valor),
          Saldo: parseFloat(saldo),
          Operador: this.state.usuarioLogado.codigo,
          Empresa: this.state.empresa,
          valuesRet: parseFloat(valorDesconto),
        })
        .then(
          async (res) => {
            console.log(res.data);
          },
          async (res) => await console.log(`Erro: ${res.data}`)
        );
    }
  };

  checkAndDeleteContaOS = async () => {
    await apiEmployee
      .post(`checkAndDeleteContaOS.php`, {
        token: true,
        os: this.state.chave,
      })
      .then(
        async (res) => {
          console.log(res.data);
        },
        async (res) => await console.log(`Erro: ${res.data}`)
      );
  };

  mudarCentroCusto = async () => {
    let clienteEncurtado = this.state.clientesOptions.find(
      (cliente) => cliente.value == this.state.cliente
    )?.label;
    clienteEncurtado = clienteEncurtado.split(" ")[0];

    const codigoNumero = parseInt(this.state.codigo.slice(2));

    await apiEmployee
      .post(`updateCentroCustoFromOS.php`, {
        token: true,
        Chave: this.state.centroCusto,
        OSCodigo: codigoNumero,
        Descricao: `${this.state.codigo}, ${
          this.state.naviosOptions.find((e) => e.value == this.state.navio)
            ?.label
        } - ${
          this.state.tiposServicosOptions.find(
            (e) => e.value == this.state.tipoServico
          )?.label
        } - ${clienteEncurtado} - ${
          this.state.portosOptions.find((e) => e.value == this.state.porto)
            ?.label
        }`,
        Cliente: this.state.cliente,
      })
      .then(
        async (res) => {
          console.log(res.data);
        },
        async (res) => await console.log(`Erro: ${res.data}`)
      );
  };

  calculaValorTotal = async () => {
    const values = await loader.valoresOS(this.state.chave);

    let valorTotal = 0;

    if (values[0].governmentTaxes > 0) {
      valorTotal += parseFloat(values[0].governmentTaxes);
    }
    if (values[0].bankCharges > 0) {
      valorTotal += parseFloat(this.state.pdfContent[0].bankCharges);
    }

    values.map((e, index) => {
      if (e.moeda == 5) {
        valorTotal += parseFloat(e.valor);
      } else {
        valorTotal += Util.toFixed(parseFloat(e.valor * this.state.roe), 2);
      }
    });

    return valorTotal;
  };

  salvarConta = async () => {
    this.setState({ ...util.cleanStates(this.state) });

    this.setState({ loading: true, contabiliza: false });

    let grupos = [];

    this.state.eventosContabilizando.forEach((evento, index) => {
      const grupoIndex = grupos.findIndex(
        (ev) =>
          evento.desconto_conta == ev.desconto_conta &&
          evento.retencao_inss == ev.retencao_inss &&
          evento.retencao_ir == ev.retencao_ir &&
          evento.retencao_iss == ev.retencao_iss &&
          evento.retencao_csll == ev.retencao_csll &&
          this.state.historico[index] == ev.historico &&
          this.state.historicoPadrao[index] == ev.historicoPadrao &&
          this.state.codBarras[index] == ev.codBarras &&
          this.state.contaDebito[index] == ev.contaDebito &&
          this.state.contaCredito[index] == ev.contaCredito &&
          this.state.meioPagamento[index] == ev.meioPagamento &&
          this.state.codigoReceita[index] == ev.codigoReceita &&
          this.state.contribuinte[index] == ev.contribuinte &&
          this.state.codigoIdentificadorTributo[index] ==
            ev.codigoIdentificadorTributo &&
          this.state.mesCompetNumRef[index] == ev.mesCompetNumRef &&
          this.state.dataApuracao[index] == ev.dataApuracao &&
          this.state.darfValor[index] == ev.darfValor &&
          this.state.darfPagamento[index] == ev.darfPagamento &&
          this.state.darfMulta[index] == ev.darfMulta &&
          this.state.darfJuros[index] == ev.darfJuros &&
          this.state.darfOutros[index] == ev.darfOutros
      );

      if (grupoIndex != -1) {
        grupos[grupoIndex].eventos.push({ ...evento });
        grupos[grupoIndex].vcp += parseFloat(evento.valor1);
      } else {
        grupos.push({
          valuesLancto: `'${moment().format("YYYY-MM-DD")}', '${
            evento.tipo_documento ? evento.tipo_documento : ""
          }', '${this.state.centroCusto}', '${
            this.state.historicoPadrao[index]
          }', '${this.state.cliente}', '${this.state.usuarioLogado.codigo}', '${
            this.state.usuarioLogado.codigo
          }', '${moment().format("YYYY-MM-DD")}', '${moment().format(
            "YYYY-MM-DD"
          )}', '0', '0', '0'`,
          valuesConta: `'${moment(evento.emissao ? evento.emissao : "").format(
            "YYYY-MM-DD"
          )}', '${evento.tipo_sub == 0 ? 1 : 0}', '${evento.fornecedor}', '${
            this.state.tipo_sub == 0
              ? this.state.contaCredito[index]
              : this.state.contaDebito[index]
          }', '${this.state.codBarras[index]}', '${this.state.centroCusto}', '${
            this.state.historico[index]
          }', '${
            this.state.tipo_sub == 0
              ? this.state.contaDebito[index]
              : this.state.contaCredito[index]
          }', '1', '1', '${evento.vencimento}', '${evento.vencimento}', '', '${
            this.state.usuarioLogado.codigo
          }', '${this.state.empresa}', '${evento.documento}', '${
            evento.tipo_documento
          }', '${this.state.meioPagamento[index]}', '${evento.chave}'`,
          valuesDarf: ["DARF", "GPS", "GRU", "PIX"].includes(
            this.state.meioPagamentoNome[index]
          )
            ? `'${this.state.codigoReceita[index]}', '${
                this.state.contribuinte[index]
              }', '${this.state.codigoIdentificadorTributo[index]}', '${
                this.state.mesCompetNumRef[index]
              }', '${moment(this.state.dataApuracao[index]).format(
                "YYYY-MM-DD"
              )}', '${parseFloat(
                this.state.darfValor[index]
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )}', '${parseFloat(
                this.state.darfMulta[index]
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )}', '${parseFloat(
                this.state.darfJuros[index]
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )}', '${parseFloat(
                this.state.darfOutros[index]
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )}', '${parseFloat(
                this.state.darfPagamento[index]
                  .replaceAll(".", "")
                  .replaceAll(",", ".")
              )}'`
            : false,
          eventos: [{ ...evento }],
          vcp: parseFloat(evento.valor1),
          desconto_conta: evento.desconto_conta,
          retencao_inss: evento.retencao_inss,
          retencao_ir: evento.retencao_ir,
          retencao_iss: evento.retencao_iss,
          retencao_csll: evento.retencao_csll,
          contaDebito: this.state.contaDebito[index],
          contaCredito: this.state.contaCredito[index],
          chave: this.state.custeios_subagentes.find(
            (gp) => gp.grupo == this.state.grupoSelecionado
          )?.chave_grupo,
          historico: this.state.historico[index],
          historicoPadrao: this.state.historicoPadrao[index],
          codBarras: this.state.codBarras[index],
          contaDebito: this.state.contaDebito[index],
          contaCredito: this.state.contaCredito[index],
          meioPagamento: this.state.meioPagamento[index],
          meioPagamentoNome: this.state.meioPagamentoNome[index],
          codigoReceita: this.state.codigoReceita[index],
          contribuinte: this.state.contribuinte[index],
          codigoIdentificadorTributo:
            this.state.codigoIdentificadorTributo[index],
          mesCompetNumRef: this.state.mesCompetNumRef[index],
          dataApuracao: this.state.dataApuracao[index],
          darfValor: this.state.darfValor[index],
          darfPagamento: this.state.darfPagamento[index],
          darfMulta: this.state.darfMulta[index],
          darfJuros: this.state.darfJuros[index],
          darfOutros: this.state.darfOutros[index],
        });
      }
    });

    await apiEmployee
      .post(`contabilizaCusteioSubagente.php`, {
        token: true,
        grupos,
      })
      .then(
        async (res) => {
          if (res.data === true) {
            await this.setState({ loading: false });
          } else {
            await alert(`Erro ${JSON.stringify(res)}`);
          }
        },
        async (res) => await console.log(`Erro: ${res}`)
      );
  };

  salvarCabecalho = async () => {
    this.setState({ ...util.cleanStates(this.state) });
    await this.setState({ loading: true, cabecalhoModal: false });

    const cabecalho = `{"company": "${this.state.company
      .replaceAll('"', "'")
      .replaceAll("\t", "\\t")
      .replaceAll("\n", "\\n")}", "address": "${this.state.address
      .replaceAll('"', "'")
      .replaceAll("\t", "\\t")
      .replaceAll("\n", "\\n")}", "CO": "${this.state.CO.replaceAll('"', "'")
      .replaceAll("\t", "\\t")
      .replaceAll("\n", "\\n")}"}`;

    await apiEmployee
      .post(`updateOSCabecalho.php`, {
        token: true,
        Chave: this.state.chave,
        cabecalho,
      })
      .then(
        async (res) => {
          if (res.data === true) {
            //console.log(res.data);
            await this.setState({ loading: false });
          } else {
            await alert(`Erro ${JSON.stringify(res)}`);
          }
        },
        async (res) => await console.log(`Erro: ${res}`)
      );
  };

  erroApi = async (res) => {
    alert(res);
    await this.setState({ redirect: true });
  };

  filterSearch = (e, state) => {
    if (e == "") {
      return true;
    }

    const text = state.toUpperCase();
    return e.label.toUpperCase().includes(text);
  };

  filterSearchCentroCusto = (e, state) => {
    if (e == "") {
      return true;
    }

    const text = state.toUpperCase();
    return (
      e.label.toUpperCase().includes(text) ||
      e.value.toUpperCase().includes(text)
    );
  };

  alteraModal = async (valor) => {
    this.setState({ modal: valor });
  };

  alteraNavio = async (valor) => {
    await this.setState({
      navio: valor,
      modalAberto: false,
      navios: await loader.getBase("getNavios.php"),
      naviosOptions: await loader.getBaseOptions(
        "getNavios.php",
        "nome",
        "chave"
      ),
    });
  };

  alteraPorto = async (valor) => {
    await this.setState({
      porto: valor,
      modalAberto: false,
      portos: await loader.getBase("getPortos.php"),
      portosOptions: await loader.getBaseOptions(
        "getPortos.php",
        "Descricao",
        "Chave"
      ),
    });
  };

  alteraCliente = async (valor, categoria) => {
    if (categoria.split("")[0] == "1") {
      await this.setState({ cliente: valor });
      await this.getDadosCliente();
    }
    await this.setState({
      modalAberto: false,
      clientes: await loader.getBase("getClientes.php"),
      clientesOptions: await loader.getBaseOptions(
        "getClientes.php",
        "Nome",
        "Chave"
      ),
    });
  };

  alteraTipoServico = async (valor) => {
    await this.setState({
      tipoServico: valor,
      modalAberto: false,
      tiposServicos: await loader.getBase("getTiposServicos.php"),
      tiposServicosOptions: await loader.getBaseOptions(
        "getTiposServicos.php",
        "descricao",
        "chave"
      ),
    });
  };

  alteraCentroCusto = async (valor) => {
    await this.setState({ centroCusto: valor });
    await this.setState({ modalAberto: false });
    await this.getCentrosCustos();
  };

  //ALERTA: As funções abaixo (CapaVoucher, FaturamentoCusteio, RelatorioVoucher e CloseToReal) possuem valores e styles hardcoded e uma dependência depreciada; Sua existência e difícil manutenção é um lembrete para que isso não ocorra novamente.
  CapaVoucher = async (codigo, validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      this.setState({
        pdfNome: `Capa${this.state.codigo ? ` - ${this.state.codigo}` : ""}`,
      });

      await this.setState({ loading: true });
      await apiEmployee
        .post(`getCapaVoucher.php`, {
          token: true,
          codigo: codigo,
        })
        .then(
          async (response) => {
            await this.setState({ pdfContent: response.data });
          },
          async (response) => {
            console.log(response);
          }
        );

      if (!this.state.pdfContent || !this.state.pdfContent[0]) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }

      if (
        this.state.pdfContent.find(
          (os) => !os.chavTaxa && [0, 1].includes(os.tipo)
        )
      ) {
        return this.setState({
          error: { type: "error", msg: "Há eventos sem taxas" },
          loading: false,
        });
      }

      const vouchers = [];
      this.state.pdfContent
        .filter((content) => content.tipo != 2)
        .map((content) => {
          if (!vouchers.includes(content.chavTaxa)) {
            vouchers.push(content.chavTaxa);
          }
        });

      let backgroundColor = "#ffffff";

      let operador = "";
      if (this.state.pdfContent[0]) {
        operador = this.state.operadores.filter(
          (e) => e.Codigo == this.state.pdfContent[0].faturadoPor
        )[0];
      }
      let pdf = "";
      let totalFinal = 0;
      let totalFinalDolar = 0;
      let descontoFinal = 0;
      let descontoFinalDolar = 0;
      let recebimentoFinal = 0;
      let recebimentoFinalDolar = 0;

      let company = util.returnIfExists(
        this.state.pdfContent[0],
        this.state.pdfContent[0].cliente
      );
      let address = `${util.returnIfExists(
        this.state.pdfContent[0],
        this.state.pdfContent[0].complemento
      )} ${util.returnIfExists(
        this.state.pdfContent[0],
        this.state.pdfContent[0].rua
      )} ${
        this.state.pdfContent[0].numero &&
        this.state.pdfContent[0].numero != "0"
          ? this.state.pdfContent[0].numero
          : ""
      } ${
        this.state.pdfContent[0].cep && this.state.pdfContent[0].cep != "0"
          ? this.state.pdfContent[0].cep
          : ""
      }`;
      let CO;

      if (this.state.pdfContent[0].cabecalho) {
        let cabecalho;

        try {
          cabecalho = JSON.parse(this.state.pdfContent[0].cabecalho);
        } catch (err) {
          cabecalho = JSON.parse(
            this.state.pdfContent[0].cabecalho
              ?.replaceAll("\n", "\\n")
              .replaceAll("\t", "\\t")
          );
        }

        if (cabecalho.company) {
          company = cabecalho.company;
        }

        if (cabecalho.address) {
          address = cabecalho.address;
        }

        if (cabecalho.CO) {
          CO = cabecalho.CO;
        }
      }

      if (
        this.state.pdfContent[0].GT &&
        ["SIM", "S"].includes(this.state.pdfContent[0].GT.toUpperCase())
      ) {
        totalFinal += parseFloat(this.state.pdfContent[0].governmentTaxes);
        totalFinalDolar += Util.toFixed(
          parseFloat(
            this.state.pdfContent[0].governmentTaxes /
              this.state.pdfContent[0].roe
          ),
          2
        );
      } else {
        if (Util.verificaDatas(this.state.pdfContent[0].data_encerramento, this.state.pdfContent[0].GT)) {
          totalFinal += parseFloat(this.state.pdfContent[0].governmentTaxes);
          totalFinalDolar += Util.toFixed(
          parseFloat(
            this.state.pdfContent[0].governmentTaxes /
              this.state.pdfContent[0].roe
          ),
          2
        );
        }
      }

      if (
        this.state.pdfContent[0].BK &&
        ["SIM", "S"].includes(this.state.pdfContent[0].BK.toUpperCase())
      ) {
        totalFinal += parseFloat(this.state.pdfContent[0].bankCharges);
        totalFinalDolar += Util.toFixed(
          parseFloat(
            this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe
          ),
          2
        );
      } else {
        if (Util.verificaDatas(this.state.pdfContent[0].data_encerramento, this.state.pdfContent[0].BK)) {
          totalFinal += parseFloat(this.state.pdfContent[0].bankCharges);
          totalFinalDolar += Util.toFixed(
          parseFloat(
            this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe
          ),
          2
        );
        }
      }
    

      if (this.state.pdfContent[0]) {
        pdf = (
          <div key={546546554654}>
            <br />
            <h5 style={{ width: "100%", textAlign: "center" }}>
              <b>AGENT DISBURSEMENT ACCOUNT</b>
            </h5>
            <h4 style={{ width: "100%", textAlign: "center" }}>
              SULTRADE SHIPPING AGENCY
            </h4>
            <div className="voucherImagem">
              <img
                className="img-fluid"
                src="https://i.ibb.co/n69ZD86/logo-Vertical.png"
                alt="logo-lpc"
                border="0"
                style={{ width: "130px", height: "100px" }}
              />
            </div>
            <br />
            {/*
                    <div className='pdfHeader'>
                        <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-lpc" border="0" style={{ width: '30%', height: '150px' }} />
                        <h3 className='pdfTitle'>AGENT DISBURSEMENT ACCOUNT</h3>
                        <h3>SULTRADE SHIPPING AGENCY</h3>
                    </div>
        */}
            <div style={{ width: "80%", marginLeft: "5%" }}>
              <table>
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Company:</b> {company}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Address:</b> {address}
                  </td>
                </tr>
                {CO && (
                  <tr>
                    <td colSpan={4} className="pdf_large_col">
                      <b>C/O:</b> {CO}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Vessel Name:</b>{" "}
                    {util.returnIfExists(
                      this.state.pdfContent[0],
                      this.state.pdfContent[0].nomeNavio
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Name of Port:</b>{" "}
                    {util.returnIfExists(
                      this.state.pdfContent[0],
                      this.state.pdfContent[0].nomePorto
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Arrived:</b>{" "}
                    {moment(this.state.pdfContent[0].data_chegada).format(
                      "MMMM DD, YYYY"
                    ) != "Invalid date"
                      ? moment(this.state.pdfContent[0].data_chegada).format(
                          "MMMM DD, YYYY"
                        )
                      : "T.B.I."}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="pdf_large_col">
                    <b>Sailed:</b>{" "}
                    {moment(this.state.pdfContent[0].data_saida).format(
                      "MMMM DD, YYYY"
                    ) != "Invalid date"
                      ? moment(this.state.pdfContent[0].data_saida).format(
                          "MMMM DD, YYYY"
                        )
                      : "T.B.I."}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="pdf_large_col">
                    <b>Date of Billing:</b>{" "}
                    {moment(this.state.pdfContent[0].data_faturamento).format(
                      "MMMM DD, YYYY"
                    ) != "Invalid date"
                      ? moment(
                          this.state.pdfContent[0].data_faturamento
                        ).format("MMMM DD, YYYY")
                      : "T.B.I."}
                  </td>
                  <td colSpan={2} className="pdf_money_colOS">
                    <b>PO:</b>{" "}
                    {util.returnIfExists(
                      this.state.pdfContent[0],
                      this.state.pdfContent[0].codigo
                    )}
                  </td>
                </tr>
              </table>
            </div>
            <br />
            <div className="pdfContent">
              <div>
                {/* <table className='pdfTable'>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>COMPANY: {company}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>ADDRESS: {address}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Vessel Name: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Name of Port: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Arrived: {moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Sailed: {moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Date Of Billing: {moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>PO: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                </tr>


                            </table>*/}
                <br />

                <table className={`voucherTable`}>
                  <tr>
                    <td className="pdfTitle" style={{ width: 75 }}>
                      Voucher
                    </td>
                    <td colSpan="3" className="pdfTitle">
                      Description
                    </td>
                    <td colSpan="2" className="pdfTitle">
                      Expense Type
                    </td>
                    <td className="pdfTitle">Final USD</td>
                    <td className="pdfTitle">Final BRL</td>
                  </tr>
                  {vouchers.map((voucher, index) => {
                    const voucherInfo = this.state.pdfContent.find(
                      (e) => e.chavTaxa == voucher
                    );
                    if (index % 2 == 0) {
                      backgroundColor = "#FFFFFF";
                    } else {
                      backgroundColor = "#BBBBBB";
                    }

                    let valorTotal = 0;

                    if (!voucherInfo.chavTaxa) {
                      return <></>;
                    }
                    return (
                      <>
                        {this.state.pdfContent
                          .filter(
                            (e) =>
                              e.tipo != 2 &&
                              e.tipo != 3 &&
                              e.chavTaxa == voucher &&
                              (e.repasse || e.faturamentoCusteio)
                          )
                          .map((e, i) => {
                            //console.log(e);
                            if (e.tipo != 3) {
                              if (e.moeda == 5) {
                                valorTotal += parseFloat((e.valor * e.qntd));
                                console.log(valorTotal);
                                totalFinal += parseFloat((e.valor * e.qntd));
                                console.log(totalFinal);
                                totalFinalDolar += Util.toFixed(
                                  parseFloat(
                                    (e.valor * e.qntd) / this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                                console.log(totalFinalDolar);
                              } else {
                                valorTotal += Util.toFixed(
                                  parseFloat(
                                    ((e.valor * e.qntd)) * this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                                totalFinal += Util.toFixed(
                                  parseFloat(
                                    (e.valor * e.qntd) * this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                                totalFinalDolar += parseFloat((e.valor * e.qntd));
                              }
                            } else {
                              if (e.moeda == 5) {
                                valorTotal -= parseFloat((e.valor * e.qntd));
                                descontoFinal += parseFloat((e.valor * e.qntd));
                                descontoFinalDolar += Util.toFixed(
                                  parseFloat(
                                    (e.valor * e.qntd) / this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                              } else {
                                valorTotal -= Util.toFixed(
                                  parseFloat(
                                    (e.valor * e.qntd) * this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                                descontoFinal += Util.toFixed(
                                  parseFloat(
                                    (e.valor * e.qntd) * this.state.pdfContent[0].roe
                                  ),
                                  2
                                );
                                descontoFinalDolar += parseFloat((e.valor * e.qntd));
                              }
                            }
                          })}

                        <tr>
                          <td
                            className="pdf_small_col reduce_font"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            {voucherInfo.chavTaxa}
                          </td>
                          <td
                            colSpan="3"
                            className="pdf_large_col reduce_font"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            {voucherInfo.descSubgrupo}
                          </td>
                          <td
                            colSpan="2"
                            className="pdf_small_col reduce_font"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            {voucherInfo.descGrupo}
                          </td>
                          <td
                            className="pdf_money_colOS reduce_font"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            {util.formataDinheiroBrasileiro(
                              parseFloat(
                                valorTotal / this.state.pdfContent[0].roe
                              )
                            )}
                          </td>
                          <td
                            className="pdf_money_colOS reduce_font"
                            style={{ backgroundColor: backgroundColor }}
                          >
                            {util.formataDinheiroBrasileiro(
                              parseFloat(valorTotal)
                            )}
                          </td>
                        </tr>
                      </>
                    );
                  })}
                  {this.state.pdfContent[0].GT &&
                    (["SIM", "S"].includes(
                      this.state.pdfContent[0].GT.toUpperCase()
                    ) || Util.verificaDatas(this.state.pdfContent[0].data_encerramento, this.state.pdfContent[0].GT)) && (
                      <tr>
                        <td></td>
                        <td
                          colSpan="3"
                          className="pdf_large_col"
                          style={{ fontWeight: "bold" }}
                        >
                          GOVERNMENT TAXES
                        </td>
                        <td
                          colSpan="2"
                          className="pdf_small_col"
                          style={{ fontWeight: "bold" }}
                        ></td>
                        <td
                          className="pdf_money_colOS"
                          style={{ fontWeight: "bold" }}
                        >
                          {util.formataDinheiroBrasileiro(
                            parseFloat(
                              this.state.pdfContent[0].governmentTaxes /
                                this.state.pdfContent[0].roe
                            )
                          )}
                        </td>
                        <td
                          className="pdf_money_colOS"
                          style={{ fontWeight: "bold" }}
                        >
                          {util.formataDinheiroBrasileiro(
                            parseFloat(this.state.pdfContent[0].governmentTaxes)
                          )}
                        </td>
                      </tr>
                    )}
                  {this.state.pdfContent[0].BK &&
                    (["SIM", "S"].includes(
                      this.state.pdfContent[0].BK.toUpperCase()
                    ) || Util.verificaDatas(this.state.pdfContent[0].data_encerramento, this.state.pdfContent[0].BK)) && (
                      <tr>
                        <td></td>
                        <td
                          colSpan="3"
                          className="pdf_large_col"
                          style={{ fontWeight: "bold" }}
                        >
                          BANK CHARGES
                        </td>
                        <td
                          colSpan="2"
                          className="pdf_small_col"
                          style={{ fontWeight: "bold" }}
                        ></td>
                        <td
                          className="pdf_money_colOS"
                          style={{ fontWeight: "bold" }}
                        >
                          {util.formataDinheiroBrasileiro(
                            parseFloat(
                              this.state.pdfContent[0].bankCharges /
                                this.state.pdfContent[0].roe
                            )
                          )}
                        </td>
                        <td
                          className="pdf_money_colOS"
                          style={{ fontWeight: "bold" }}
                        >
                          {util.formataDinheiroBrasileiro(
                            parseFloat(this.state.pdfContent[0].bankCharges)
                          )}
                        </td>
                      </tr>
                    )}

                  {this.state.pdfContent
                    .filter((e) => e.tipo == 3)
                    .map((e) => {
                      //console.log(e);
                      if (e.moeda == 5) {
                        //valorTotal -= parseFloat(e.valor);
                        descontoFinal += parseFloat((e.valor * e.qntd));
                        descontoFinalDolar += Util.toFixed(
                          parseFloat((e.valor * e.qntd) / this.state.pdfContent[0].roe),
                          2
                        );
                      } else {
                        //valorTotal -= Util.toFixed(parseFloat(e.valor * this.state.pdfContent[0].roe), 2);
                        descontoFinal += Util.toFixed(
                          parseFloat((e.valor * e.qntd) * this.state.pdfContent[0].roe),
                          2
                        );
                        descontoFinalDolar += parseFloat((e.valor * e.qntd));
                      }
                    })}
                  {this.state.pdfContent
                    .filter((e) => e.tipo == 2)
                    .map((e) => {
                      //console.log(e);
                      if (e.moeda == 5) {
                        //valorTotal -= parseFloat(e.valor);
                        recebimentoFinal += parseFloat((e.valor * e.qntd));
                        recebimentoFinalDolar += Util.toFixed(
                          parseFloat((e.valor * e.qntd) / this.state.pdfContent[0].roe),
                          2
                        );
                      } else {
                        //valorTotal -= Util.toFixed(parseFloat(e.valor * this.state.pdfContent[0].roe), 2);
                        recebimentoFinal += Util.toFixed(
                          parseFloat((e.valor * e.qntd) * this.state.pdfContent[0].roe),
                          2
                        );
                        recebimentoFinalDolar += parseFloat((e.valor * e.qntd));
                      }
                    })}
                </table>
                <br />
                <table className="voucherTableFinal">
                  <tr>
                    <td colSpan="5" className="pdfTitle pdf_small_col">
                      Total Final Costs
                    </td>
                    <td className="pdfTitle pdf_money_colOS">
                      {util.formataDinheiroBrasileiro(
                        parseFloat(totalFinalDolar)
                      )}
                    </td>
                    <td className="pdfTitle pdf_money_colOS">
                      {util.formataDinheiroBrasileiro(parseFloat(totalFinal))}
                    </td>
                  </tr>
                  {parseFloat(recebimentoFinal) > 0 && (
                    <tr>
                      <td colSpan="5" className="pdf_small_col">
                        Funds Received
                      </td>
                      <td className="pdf_money_colOS">
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoFinalDolar)
                        )}
                      </td>
                      <td className="pdf_money_colOS">
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoFinal)
                        )}
                      </td>
                    </tr>
                  )}
                  {parseFloat(descontoFinal) > 0 && (
                    <tr>
                      <td colSpan="5" className="pdf_small_col">
                        Discount
                      </td>
                      <td className="pdf_money_colOS">
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoFinalDolar)
                        )}
                      </td>
                      <td className="pdf_money_colOS">
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoFinal)
                        )}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="5" className="pdfTitle pdf_small_col">
                      Final Blce/Debit Customer
                    </td>
                    <td className="pdfTitle pdf_money_colOS">
                      {util.formataDinheiroBrasileiro(
                        parseFloat(totalFinalDolar) -
                          parseFloat(descontoFinalDolar) -
                          parseFloat(recebimentoFinalDolar)
                      )}
                    </td>
                    <td className="pdfTitle pdf_money_colOS">
                      {util.formataDinheiroBrasileiro(
                        parseFloat(totalFinal) -
                          parseFloat(descontoFinal) -
                          parseFloat(recebimentoFinal)
                      )}
                    </td>
                  </tr>
                </table>
                <table
                  className="pdfTable"
                  style={{ width: "80%", marginLeft: "5%" }}
                >
                  <tr>
                    <td style={{ padding: "0px 3px 0px 3px" }}>ISSUED BY:</td>
                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan="2">
                      {operador ? operador.Nome : ""}
                    </td>
                    <td style={{ padding: "0px 3px 0px 3px" }}>ROE:</td>
                    <td style={{ padding: "0px 3px 0px 3px" }}>
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].roe.replaceAll(".", ",")
                      )}
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
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco do
                      Brasil
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio
                      Grande
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Address:</b> Benjamin
                      Constant St, 72
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Swift Code:</b> BRASBRRJCTA
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>IBAN:</b>{" "}
                      BR6400000000026940001614410C1
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Branch's number:</b> 2694-8
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Account number:</b>{" "}
                      161441-X
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE
                      AGENCIAMENTOS MARITIMOS LTDA-ME
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}
                    >
                      <b style={{ paddingRight: 5 }}>CNPJ:</b>{" "}
                      10.432.546/0001-75
                    </td>
                  </tr>
                </table>
                {/*
                            <div><span className='pdfTitle'>Bank's name:</span> <span>Banco do Brasil S/A</span></div>
                            <div><span className='pdfTitle'>Branch's name:</span> <span>Rio Grande</span></div>
                            <div><span className='pdfTitle'>Address:</span> <span>Benjamin Constant St, 72</span></div>
                            <div><span className='pdfTitle'>Swift Code:</span> <span>BRASBRRJCTA</span></div>
                            <div><span className='pdfTitle'>IBAN:</span> <span>BR6400000000026940001614410C1</span></div>
                            <div><span className='pdfTitle'>Branch's number:</span> <span>2694-8</span></div>
                            <div><span className='pdfTitle'>Account number:</span> <span>161441-X</span></div>
                            <div><span className='pdfTitle'>Account name:</span> <span>SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME</span></div>
                            <div><span className='pdfTitle'>Phone:</span> <span>+55 53 3235 3500</span></div>
                            <div><span className='pdfTitle'>CNPJ:</span> <span>10.432.546/0001-75</span></div>
*/}
              </div>
            </div>
          </div>
        );
      } else {
        await this.setState({
          erro: "Sem as informações necessárias para criar o pdf",
          loading: false,
        });
        return;
      }
      await this.setState({ pdfgerado: pdf });
      this.handleExportWithComponent();
    } catch (err) {
      await this.setState({ erro: "Erro ao criar pdf", loading: false });
    }
  };

  FaturamentoCusteio = async (codigo, validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      this.setState({
        pdfNome: `Relatorio Líquidos${
          this.state.codigo ? ` - ${this.state.codigo}` : ""
        }`,
      });

      await this.setState({
        loading: true,
        pdfContent: await loader.getBody(`faturamentoCusteio.php`, {
          token: true,
          codigo: codigo,
        }),
      });

      //console.log(this.state.pdfContent);

      if (!this.state.pdfContent || !this.state.pdfContent[0]) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }

      let totalConsolidado = 0;
      let valorTotal = 0;
      let valorTotalCobrar = 0;
      let valorTotalPago = 0;
      let valorTotalLiquido = 0;
      let contasCodigos = [];
      let contas = [];
      let contasValores = [];
      let pdf = "";
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);

      XLSX.utils.book_append_sheet(workbook, worksheet, "FATURAMENTOS");
      const smallHeaders = [
        "Evento",
        "Conta",
        "Valor à Cobrar",
        "Valor Pago",
        "Valor Líquido",
      ];

      const footer = [
        {
          titulo: "VALOR DA NF A SER EMITIDA",
          blank: "",
          valor_a_cobrar: "",
          valor_pago: "",
          valor_liquido: "",
        },
      ];

      const emptyLine = [
        {
          _0: "",
          _1: "",
          _2: "",
          _3: "",
          _4: "",
        },
      ];

      const wsCols = [
        { wch: 75 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = wsCols;

      let rowCount = 0;
      const colCount = 4;

      const titlesRows = [];
      const accountsTitlesRows = [];
      const fieldsRows = [];
      const fieldsRepasseRows = [];
      const accountsRows = [];
      const accountsTotalRows = [];
      const footersRows = [];
      const headersRows = [];
      const totalRow = [];
      const totalCusteioRow = [];
      const totalDespesasRow = [];
      const totalFDARow = [];
      const totalEsperadoRow = [];
      const emptyRows = [];

      const { pdfContent } = this.state;
      const pdfCusteio = [];
      const pdfCusteioCodigo = [];
      const pdfRepasse = [];

      if (!pdfContent[0]) {
        await this.setState({
          erro: "Sem as informações necessárias para gerar o documento!",
          loading: false,
        });
        return;
      }

      pdfContent.map((content) => {
        if (content.repasse == 1) {
          pdfRepasse.push(content);
        } else {
          if (!pdfCusteio.includes(content.fornecedor_custeio)) {
            pdfCusteio.push(content.fornecedor_custeio);
            pdfCusteioCodigo.push(content.fornecedor_custeioCodigo);
          }
        }
      });
      let roe = 5;

      if (pdfContent[0].ROE && pdfContent[0].ROE != 0) {
        roe = pdfContent[0].ROE;
      }

      console.log(pdfContent, "pdfContent");
      console.log("\n\n\n\n\n\n\n");
      console.log(pdfCusteio, "pdfCusteio");
      console.log(pdfCusteioCodigo, "pdfCusteioCodigo");
      console.log(pdfRepasse, "pdfRepasse");

      if (pdfContent) {
        pdfCusteio.map((custeio, custeioIndex) => {
          valorTotalCobrar = 0;
          valorTotalLiquido = 0;
          valorTotalPago = 0;
          valorTotal = 0;

          if (custeio) {
            const firstHeader = [
              `NAVIO ${
                pdfContent[0].nome_navio
                  ? pdfContent[0].nome_navio.toUpperCase()
                  : ""
              }`,
              "",
              "",
              "",
              `ROE: ${roe}`,
            ];

            const bigHeader = [`FATURAMENTO ${custeio}`, "", "", "", ""];

            if (rowCount == 0) {
              XLSX.utils.sheet_add_aoa(worksheet, [
                firstHeader,
                bigHeader,
                smallHeaders,
              ]);
              headersRows.push(rowCount);
              titlesRows.push(rowCount + 1);
              headersRows.push(rowCount + 2);
              rowCount += 3;
            } else {
              XLSX.utils.sheet_add_aoa(worksheet, [bigHeader, smallHeaders], {
                skipHeader: true,
                origin: -1,
              });
              titlesRows.push(rowCount);
              headersRows.push(rowCount + 1);
              rowCount += 2;
            }

            const fields = [];
            if (!["17", "16"].includes(pdfCusteioCodigo[custeioIndex])) {
              // ESTE TRECHO DO CODIGO CARREGA OS DADOS CASO CUSTEIO NAO SEJA A SULTRADE
              pdfContent
                .filter((content) => content.fornecedor_custeio == custeio)
                .map((content, index) => {
                  let valor_cobrar = (content.valor_cobrar * content.qntd);
                  let valor_pago = content.valor_pago;

                  if(content?.fornecedor_custeioCodigo == 269 || content?.fornecedor_custeioCodigo == 32) 
                  {
                    valor_pago = 0;
                  }

                  if (content.moeda == 6) {
                    valor_cobrar = Util.toFixed(
                      parseFloat(valor_cobrar) * parseFloat(roe),
                      2
                    );
                  }

                  valorTotalCobrar += parseFloat(valor_cobrar);
                  valorTotalPago += parseFloat(valor_pago);
                  let valor_liquido =
                    parseFloat(valor_cobrar) - parseFloat(valor_pago);

                  valorTotal += valor_liquido;
                  totalConsolidado += parseFloat(valor_cobrar);
                  valorTotalLiquido += parseFloat(valor_cobrar);

                  if (
                    contasCodigos[0] &&
                    contasCodigos.find(
                      (cnt) =>
                        cnt.conta ==
                          (content.uf == 81
                            ? content.contaEstrangeiraCod
                            : content.contaCod) &&
                        cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                    )
                  ) {
                    contasCodigos = contasCodigos.map((cnt) =>
                      cnt.conta ==
                        (content.uf == 81
                          ? content.contaEstrangeiraCod
                          : content.contaCod) &&
                      cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                        ? { ...cnt, row: [...cnt.row, rowCount] }
                        : { ...cnt }
                    );
                  } else {
                    contasCodigos.push({
                      conta:
                        content.uf == 81
                          ? content.contaEstrangeiraCod
                          : content.contaCod,
                      row: [rowCount],
                      custeioCodigo: pdfCusteioCodigo[custeioIndex],
                      custeioNome: pdfCusteio[custeioIndex],
                    });
                  }

                  fields.push({
                    evento: content.evento.trim(),
                    conta:
                      content.uf == 81
                        ? content.contaEstrangeiraCod
                        : content.contaCod
                        ? content.contaCod
                        : "",
                    valor_a_cobrar: parseFloat(valor_cobrar),
                    valor_pago: parseFloat(valor_pago),
                    valor_liquido: "",
                  });
                  fieldsRows.push(rowCount);
                  rowCount++;
                });
            } else {
              // ESTE TRECHO CARREGA OS DADOS CASO CUSTEIO SEJA SULTRADE
              pdfContent.map((content, index) => {
                if (content.fornecedor_custeio == custeio) {
                  let valor_cobrar = (content.valor_cobrar * content.qntd);
                  let valor_pago = content.valor_pago;

                  if (content.moeda == 6) {
                    valor_cobrar = Util.toFixed(
                      parseFloat(valor_cobrar) * parseFloat(roe),
                      2
                    );
                  }

                  valorTotalPago += parseFloat(
                    content.fornecedor_custeio == custeio ? 0 : valor_pago
                  );
                  valorTotalCobrar += parseFloat(
                    content.fornecedor_custeio == custeio ? valor_cobrar : 0
                  );
                  valorTotalLiquido += parseFloat(
                    content.fornecedor_custeio == custeio
                      ? valor_cobrar
                      : -valor_pago
                  );

                  totalConsolidado +=
                    content.fornecedor_custeio == custeio ? valor_cobrar : 0;

                  if (
                    contasCodigos[0] &&
                    contasCodigos.find(
                      (cnt) =>
                        cnt.conta ==
                          (content.uf == 81
                            ? content.contaEstrangeiraCod
                            : content.contaCod) &&
                        cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                    )
                  ) {
                    contasCodigos = contasCodigos.map((cnt) =>
                      cnt.conta ==
                        (content.uf == 81
                          ? content.contaEstrangeiraCod
                          : content.contaCod) &&
                      cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                        ? { ...cnt, row: [...cnt.row, rowCount] }
                        : { ...cnt }
                    );
                  } else {
                    contasCodigos.push({
                      conta:
                        content.uf == 81
                          ? content.contaEstrangeiraCod
                          : content.contaCod,
                      row: [rowCount],
                      custeioCodigo: pdfCusteioCodigo[custeioIndex],
                      custeioNome: pdfCusteio[custeioIndex],
                    });
                  }

                  fields.push({
                    evento: content.evento.trim(),
                    conta:
                      content.uf == 81
                        ? content.contaEstrangeiraCod
                        : content.contaCod
                        ? content.contaCod
                        : "",
                    valor_a_cobrar:
                      content.fornecedor_custeio == custeio
                        ? parseFloat(valor_cobrar)
                        : 0,
                    valor_pago: parseFloat(valor_pago),
                    valor_liquido: "",
                  });
                  fieldsRows.push(rowCount);
                  rowCount++;
                }
                else if( content?.repasse == 0 ) {
                    let valor_cobrar = 0;
                    let valor_pago = content.valor_pago;
  
                    if (content.moeda == 6) {
                      valor_cobrar = Util.toFixed(
                        parseFloat(valor_cobrar) * parseFloat(roe),
                        2
                      );
                    }
  
                    valorTotalPago += parseFloat(
                      content.fornecedor_custeio == custeio ? 0 : valor_pago
                    );
                    valorTotalCobrar += parseFloat(
                      content.fornecedor_custeio == custeio ? valor_cobrar : 0
                    );
                    valorTotalLiquido += parseFloat(
                      content.fornecedor_custeio == custeio
                        ? valor_cobrar
                        : -valor_pago
                    );
  
                    totalConsolidado +=
                      content.fornecedor_custeio == custeio ? valor_cobrar : 0;
  
                    if (
                      contasCodigos[0] &&
                      contasCodigos.find(
                        (cnt) =>
                          cnt.conta ==
                            (content.uf == 81
                              ? content.contaEstrangeiraCod
                              : content.contaCod) &&
                          cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                      )
                    ) {
                      contasCodigos = contasCodigos.map((cnt) =>
                        cnt.conta ==
                          (content.uf == 81
                            ? content.contaEstrangeiraCod
                            : content.contaCod) &&
                        cnt.custeioCodigo == pdfCusteioCodigo[custeioIndex]
                          ? { ...cnt, row: [...cnt.row, rowCount] }
                          : { ...cnt }
                      );
                    } else {
                      contasCodigos.push({
                        conta:
                          content.uf == 81
                            ? content.contaEstrangeiraCod
                            : content.contaCod,
                        row: [rowCount],
                        custeioCodigo: pdfCusteioCodigo[custeioIndex],
                        custeioNome: pdfCusteio[custeioIndex],
                      });
                    }
  
                    fields.push({
                      evento: content.evento.trim(),
                      conta:
                        content.uf == 81
                          ? content.contaEstrangeiraCod
                          : content.contaCod
                          ? content.contaCod
                          : "",
                      valor_a_cobrar:
                        content.fornecedor_custeio == custeio
                          ? parseFloat(valor_cobrar)
                          : 0,
                      valor_pago: parseFloat(valor_pago),
                      valor_liquido: "",
                    });
                    fieldsRows.push(rowCount);
                    rowCount++;
                }
              });
            }

            XLSX.utils.sheet_add_json(worksheet, fields, {
              skipHeader: true,
              origin: -1,
            });

            XLSX.utils.sheet_add_json(worksheet, emptyLine, {
              skipHeader: true,
              origin: -1,
            });
            emptyRows.push(rowCount);
            rowCount++;

            XLSX.utils.sheet_add_json(worksheet, footer, {
              skipHeader: true,
              origin: -1,
            });
            footersRows.push(rowCount);
            rowCount++;

            XLSX.utils.sheet_add_json(worksheet, emptyLine, {
              skipHeader: true,
              origin: -1,
            });
            emptyRows.push(rowCount);
            rowCount++;
          }
        });

        XLSX.utils.sheet_add_json(worksheet, emptyLine, {
          skipHeader: true,
          origin: -1,
        });
        XLSX.utils.sheet_add_json(
          worksheet,
          [
            {
              title: "TOTAL CONSOLIDADO",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            },
          ],
          {
            skipHeader: true,
            origin: -1,
          }
        );
        XLSX.utils.sheet_add_json(worksheet, emptyLine, {
          skipHeader: true,
          origin: -1,
        });
        emptyRows.push(rowCount);
        totalRow.push(rowCount + 1);
        emptyRows.push(rowCount + 2);
        rowCount += 3;

        if (pdfRepasse[0]) {
          const bigHeader = [`DESPESAS PARA REPASSE`, "", "", "", ""];

          XLSX.utils.sheet_add_aoa(worksheet, [bigHeader, smallHeaders], {
            skipHeader: true,
            origin: -1,
          });
          titlesRows.push(rowCount);
          headersRows.push(rowCount + 1);
          rowCount += 2;
          pdfRepasse.map((repasse, repasseIndex) => {
            valorTotalCobrar = 0;
            valorTotalLiquido = 0;
            valorTotalPago = 0;
            valorTotal = 0;

            const fields = [];
            let valor_cobrar = (repasse.valor_cobrar * repasse.qntd);
            let valor_pago = repasse.valor_pago;

            if (repasse.moeda == 6) {
              valor_cobrar = Util.toFixed(
                parseFloat(valor_cobrar) * parseFloat(roe),
                2
              );
            }

            valorTotalCobrar += parseFloat(valor_cobrar);
            valorTotalPago += parseFloat(valor_pago);
            let valor_liquido =
              parseFloat(valor_cobrar) - parseFloat(valor_pago);

            valorTotal += valor_liquido;
            totalConsolidado += parseFloat(valor_cobrar);
            valorTotalLiquido += parseFloat(valor_cobrar);

            if (
              contasCodigos[0] &&
              contasCodigos.find(
                (cnt) =>
                  cnt.conta ==
                    (repasse.uf == 81
                      ? repasse.contaEstrangeiraCod
                      : repasse.contaCod) && cnt.custeioCodigo == 0
              )
            ) {
              contasCodigos = contasCodigos.map((cnt) =>
                cnt.conta ==
                  (repasse.uf == 81
                    ? repasse.contaEstrangeiraCod
                    : repasse.contaCod) && cnt.custeioCodigo == 0
                  ? { ...cnt, row: [...cnt.row, rowCount] }
                  : { ...cnt }
              );
            } else {
              contasCodigos.push({
                conta:
                  repasse.uf == 81
                    ? repasse.contaEstrangeiraCod
                    : repasse.contaCod,
                row: [rowCount],
                custeioCodigo: 0,
                custeioNome: "Despesas para Repasse",
              });
            }

            fields.push({
              evento: repasse.evento.trim(),
              conta:
                repasse.uf == 81
                  ? repasse.contaEstrangeiraCod
                  : repasse.contaCod
                  ? repasse.contaCod
                  : "",
              valor_a_cobrar: parseFloat(valor_pago),
              valor_pago: parseFloat(valor_pago),
              valor_liquido: "",
            });
            fieldsRepasseRows.push(rowCount);
            rowCount++;

            XLSX.utils.sheet_add_json(worksheet, fields, {
              skipHeader: true,
              origin: -1,
            });
          });
          XLSX.utils.sheet_add_json(worksheet, emptyLine, {
            skipHeader: true,
            origin: -1,
          });
          emptyRows.push(rowCount);
          rowCount++;

          XLSX.utils.sheet_add_json(worksheet, footer, {
            skipHeader: true,
            origin: -1,
          });
          footersRows.push(rowCount);
          rowCount++;

          XLSX.utils.sheet_add_json(worksheet, emptyLine, {
            skipHeader: true,
            origin: -1,
          });
          emptyRows.push(rowCount);
          rowCount++;
        }

        XLSX.utils.sheet_add_json(
          worksheet,
          [
            {
              title: "TOTAL DO CUSTEIO SEM BANK CHARGES E GOVERNMENT TAXES",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            },
            {
              title:
                "BANK CHARGES + GOVERNMENT TAXES (C. DESPESAS RECUPERADAS)",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            },
            {
              title: "TOTAL FINAL DO FDA",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            },
          ],
          {
            skipHeader: true,
            origin: -1,
          }
        );
        XLSX.utils.sheet_add_json(worksheet, emptyLine, {
          skipHeader: true,
          origin: -1,
        });

        XLSX.utils.sheet_add_json(
          worksheet,
          [
            {
              title: "TOTAL CTA CUSTEIO ESPERADO ANTES DO FATURAMENTO",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            },
          ],
          {
            skipHeader: true,
            origin: -1,
          }
        );

        totalCusteioRow.push(rowCount);
        totalDespesasRow.push(rowCount + 1);
        totalFDARow.push(rowCount + 2);
        emptyRows.push(rowCount + 3);
        totalEsperadoRow.push(rowCount + 4);
        rowCount += 5;

        [...pdfCusteioCodigo, 0].map((custeio, custeioIndex) => {
          if (
            !custeio ||
            !contasCodigos.find(
              (conta) =>
                conta.custeioCodigo == pdfCusteioCodigo[custeioIndex] &&
                !!conta.conta
            )
          ) {
            return;
          }
          let contaValor = 0;

          if (contas[0]) {
            contas.push({
              _0: "",
              _1: "",
              _2: "",
              _3: "",
              _4: "",
            });
            emptyRows.push(rowCount);
            rowCount++;
          }

          contas.push({
            _0: "",
            _1: "",
            _2: "",
            _3: pdfCusteio[custeioIndex],
            _4: "",
          });
          accountsTitlesRows.push(rowCount);
          rowCount++;

          contas.push({
            _0: "",
            _1: "",
            _2: "",
            _3: "Conta",
            _4: "Valor",
          });
          headersRows.push(rowCount);
          rowCount++;

          contasCodigos
            .filter((conta) => conta.custeioCodigo == custeio && !!conta.conta)
            .map((conta) => {
              contaValor += parseFloat(conta.valor);

              contas.push({
                _0: "",
                _1: "",
                _2: "",
                _3: conta.conta,
                _4: "",
              });
              accountsRows.push(rowCount);
              rowCount++;
            });
          contas.push({
            _0: "",
            _1: "",
            _2: "",
            _3: "TOTAL",
            _4: "",
          });
          accountsTotalRows.push(rowCount);
          rowCount++;
        });

        if (contas[0]) {
          XLSX.utils.sheet_add_json(worksheet, contas, {
            skipHeader: true,
            origin: -1,
          });
        }

        worksheet["!merges"] = [
          ...titlesRows.map((r) => ({ s: { c: 0, r }, e: { c: 4, r } })),
          ...footersRows.map((r) => ({ s: { c: 0, r }, e: { c: 1, r } })),
          ...[
            ...totalRow,
            ...totalCusteioRow,
            ...totalDespesasRow,
            ...totalFDARow,
            ...totalFDARow,
          ].map((r) => ({ s: { c: 0, r }, e: { c: 3, r } })),
          ...accountsTitlesRows.map((r) => ({
            s: { c: 3, r },
            e: { c: 4, r },
          })),
        ];
        let footerCobrar = [];
        let footerPago = [];
        let accountTotal = [];
        let accountTitle = "";
        let totalValor = [];
        let totalCusteio = [];
        let totalFDA = [];
        let totalEsperado = [];
        //console.log({ titlesRows, accountsTitlesRows, fieldsRows, fieldsRepasseRows, accountsRows, accountsTotalRows, footersRows, headersRows, totalRow, totalCusteioRow, totalDespesasRow, totalFDARow, totalEsperadoRow, emptyRows });
        for (let row = 0; row < rowCount; row++) {
          for (let col = 0; col <= colCount; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            //console.log({cell, row, col, value: worksheet[cell]})

            if (titlesRows.includes(row)) {
              worksheet[cell].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: {
                  sz: 18,
                  bold: true,
                },
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: "888888" },
                  bgColor: { rgb: "888888" },
                },
              };
            }
            if (
              [
                ...accountsTitlesRows,
                ...accountsRows,
                ...accountsTotalRows,
              ].includes(row)
            ) {
              worksheet[cell].s = {
                ...worksheet[cell].s,
                font: {
                  sz: 8,
                },
              };
              if ([3, 4].includes(col) && accountsTitlesRows.includes(row)) {
                worksheet[cell].s = {
                  ...worksheet[cell].s,
                  alignment: { horizontal: "center", vertical: "center" },
                  fill: {
                    patternType: "solid",
                    fgColor: { rgb: "888888" },
                    bgColor: { rgb: "888888" },
                  },
                  font: {
                    ...worksheet[cell].s?.font,
                    bold: true,
                  },
                };
                if (col === 3) {
                  accountTitle = worksheet[cell].v;
                }
              }
              if (col === 4 && accountsRows.includes(row)) {
                const prevCell =
                  worksheet[XLSX.utils.encode_cell({ r: row, c: col - 1 })]?.v;

                const accountCells = [];
                contasCodigos
                  .filter(
                    (e) => e.conta == prevCell && e.custeioNome == accountTitle
                  )
                  .forEach((cell) => {
                    cell.row.forEach((r) => {
                      accountCells.push(r);
                    });
                  });

                worksheet[cell].f = accountCells
                  ?.map((e) => XLSX.utils.encode_cell({ r: e, c: 4 }))
                  ?.join("+");
                worksheet[cell].s = {
                  ...worksheet[cell].s,
                  numFmt: "R$ #,##0.00",
                };
                accountTotal.push(cell);
              }
              if (accountsTotalRows.includes(row)) {
                worksheet[cell].s = {
                  ...worksheet[cell].s,
                  numFmt: "R$ #,##0.00",
                  font: {
                    ...worksheet[cell].s?.font,
                    bold: true,
                  },
                };
                if (col === 4) {
                  worksheet[cell].f = accountTotal.join("+");
                  accountTotal = [];
                  accountTitle = "";
                }
              }
            }
            if (footersRows.includes(row)) {
              if (footerCobrar[0] && footerPago[0]) {
                if (col === 2) {
                  worksheet[cell].f = footerCobrar.join("+");

                  if (footersRows[footersRows.length - 1] !== row) {
                    totalCusteio.push(
                      XLSX.utils.encode_cell({ r: row, c: col })
                    );
                  }
                } else if (col === 3) {
                  worksheet[cell].f = footerPago.join("+");

                  if (footersRows[footersRows.length - 1] === row) {
                    totalCusteio.push(
                      XLSX.utils.encode_cell({ r: row, c: col })
                    );
                  }
                  totalEsperado.push(
                    XLSX.utils.encode_cell({ r: row, c: col })
                  );
                } else if (col === 4) {
                  const valorCobrar = XLSX.utils.encode_cell({ r: row, c: 2 });
                  const valorPago = XLSX.utils.encode_cell({ r: row, c: 3 });

                  worksheet[cell].f = `${valorCobrar} - ${valorPago}`;
                  footerCobrar = [];
                  footerPago = [];
                  totalValor.push(XLSX.utils.encode_cell({ r: row, c: col }));
                }
              }

              worksheet[cell].s = {
                ...worksheet[cell].s,
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: "CCCCCC" },
                  bgColor: { rgb: "CCCCCC" },
                },
                font: {
                  ...worksheet[cell].s?.font,
                  bold: true,
                },
              };
            }
            if ([...fieldsRows, ...fieldsRepasseRows].includes(row)) {
              worksheet[cell].s = {
                border: {
                  right: {
                    style: "thin",
                    color: "000000",
                  },
                  left: {
                    style: "thin",
                    color: "000000",
                  },
                  top: {
                    style: "thin",
                    color: "000000",
                  },
                  bottom: {
                    style: "thin",
                    color: "000000",
                  },
                },
              };
              if (col === 4) {
                const valorCobrar = XLSX.utils.encode_cell({ r: row, c: 2 });
                const valorPago = XLSX.utils.encode_cell({ r: row, c: 3 });
                footerCobrar.push(valorCobrar);
                footerPago.push(valorPago);

                worksheet[cell].f = `${valorCobrar} - ${valorPago}`;
              }
            }

            if (
              ([2, 3, 4].includes(col) &&
                [...fieldsRepasseRows, ...fieldsRows, ...footersRows].includes(
                  row
                )) ||
              (col === 4 &&
                [
                  ...totalRow,
                  ...totalCusteioRow,
                  ...totalDespesasRow,
                  ...totalEsperadoRow,
                  ...totalFDARow,
                ].includes(row))
            ) {
              worksheet[cell].s = {
                ...worksheet[cell].s,
                numFmt: "R$ #,##0.00",
              };
            }

            if (totalRow.includes(row)) {
              worksheet[cell].s = {
                ...worksheet[cell].s,
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: "888888" },
                  bgColor: { rgb: "888888" },
                },
                numFmt: "R$ #,##0.00",
                font: {
                  ...worksheet[cell].s?.font,
                  bold: true,
                },
              };
              if (col === 4) {
                worksheet[cell].f = totalValor.join("+");
              }
            }

            if (totalCusteioRow.includes(row) && col === 4) {
              worksheet[cell].f = totalCusteio
                .map((t, i) => {
                  if (i === totalCusteio.length - 1) {
                    return t.replace("D", "C");
                  }
                  return t;
                })
                .join("+");
              totalFDA.push(XLSX.utils.encode_cell({ r: row, c: col }));
            }

            if (totalDespesasRow.includes(row) && col === 4) {
              worksheet[
                cell
              ].f = `${pdfContent[0]?.governmentTaxes} + ${pdfContent[0]?.bankCharges}`;
              totalFDA.push(XLSX.utils.encode_cell({ r: row, c: col }));
            }

            if (totalFDARow.includes(row)) {
              worksheet[cell].s = {
                ...worksheet[cell].s,
                font: {
                  ...worksheet[cell].s?.font,
                  bold: true,
                },
              };
              if (col === 4) {
                worksheet[cell].f = totalFDA.join("+");
              }
            }

            if (totalEsperadoRow.includes(row) && col === 4) {
              worksheet[cell].f = totalEsperado.join("+");
            }
          }
        }

        const data = await XLSX.write(workbook, {
          type: "buffer",
          cellStyles: true,
        });

        const buffer = Buffer.from(data);
        const blob = new Blob([buffer]);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.state.codigo} ${
          this.state.naviosOptions.find((e) => e.value == this.state.navio)
            ?.label
        }.xlsx`;
        a.click();
      } else {
        await this.setState({
          erro: "Sem as informações necessárias para gerar o documento!",
          loading: false,
        });
        return;
      }
    } catch (err) {
      console.log(err);
      await this.setState({
        erro: "Erro ao criar o documento",
        loading: false,
      });
    }
    this.setState({ loading: false });

    /*try {
            if (!validForm) {
                await this.setState({ error: { type: "error", msg: "Verifique se as informações estão corretas!" } });
                return;
            }

            await this.salvarOS(validForm, false)

            this.setState({ pdfNome: "Relatorio_liquidos" })


            await this.setState({
                loading: true,
                pdfContent: await loader.getBody(`faturamentoCusteio.php`, { token: true, codigo: codigo })
            })

            //console.log(this.state.pdfContent);

            if (!this.state.pdfContent || !this.state.pdfContent[0]) {
                return this.setState({ error: { type: "error", msg: "Sem informações necessárias" }, loading: false })
            }

            let totalConsolidado = 0;
            let valorTotal = 0;
            let valorTotalCobrar = 0;
            let valorTotalPago = 0;
            let valorTotalLiquido = 0;
            let contasCodigos = [];
            let contasValores = [];
            let pdf = '';

            const { pdfContent } = this.state;

            const pdfCusteio = [];
            const pdfCusteioCodigo = [];

            if (!pdfContent[0]) {
                await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
                return;
            }

            pdfContent.map((content) => {
                if (!pdfCusteio.includes(content.fornecedor_custeio)) {
                    pdfCusteio.push(content.fornecedor_custeio);
                    pdfCusteioCodigo.push(content.fornecedor_custeioCodigo);
                }
            })

            let roe = 5;

            if (pdfContent[0].ROE && pdfContent[0].ROE != 0) {
                roe = pdfContent[0].ROE;
            }

            if (pdfContent) {
                pdf =
                    <div style={{ zoom: 1 }} key={546546554654}>

                        <div className={`faturamentoCabecalho`}>NAVIO: {pdfContent[0].nome_navio ? pdfContent[0].nome_navio.toUpperCase() : ""}</div>
                        <br />
                        {pdfCusteio.map((custeio, custeioIndex) => {
                            valorTotalCobrar = 0;
                            valorTotalLiquido = 0;
                            valorTotalPago = 0;
                            valorTotal = 0;

                            if (custeio) {
                                return (
                                    <>
                                        <div className={`faturamentoTitulo`}>FATURAMENTO <span style={{ marginLeft: 10 }}>{custeio}</span></div>
                                        <table style={{ width: "100%", padding: "0px 3px 0px 3px" }}>
                                            <tr>
                                                <th colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>EVENTO</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>CONTA</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR A COBRAR</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR PAGO</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR LIQUIDO</th>
                                            </tr>
                                            {!["17", "16"].includes(pdfCusteioCodigo[custeioIndex]) && pdfContent.filter((content) => content.fornecedor_custeio == custeio).map((content, index) => {
                                                let valor_cobrar = content.valor_cobrar;
                                                let valor_pago = content.valor_pago;

                                                if (content.moeda == 6) {
                                                    valor_cobrar = Util.toFixed(parseFloat(valor_cobrar) * parseFloat(roe), 2);
                                                }

                                                valorTotalCobrar += parseFloat(valor_cobrar);
                                                valorTotalPago += parseFloat(valor_pago);
                                                let valor_liquido = parseFloat(valor_cobrar) - parseFloat(valor_pago);

                                                valorTotal += valor_liquido;
                                                totalConsolidado += parseFloat(valor_cobrar);
                                                valorTotalLiquido += parseFloat(valor_cobrar);

                                                return (
                                                    <>
                                                        <tr>
                                                            <td colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px", paddingRight: 75 }}>{content.evento}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>{content.uf == 81 ? content.contaEstrangeiraCod : content.contaCod}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor_cobrar)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor_cobrar)}</td>
                                                        </tr>
                                                    </>
                                                )
                                            })}
                                            {["17", "16"].includes(pdfCusteioCodigo[custeioIndex]) && pdfContent.filter((content) => !!content.fornecedor_custeio).map((content, index) => {
                                                let valor_cobrar = content.valor_cobrar;
                                                let valor_pago = content.valor_pago;

                                                if (content.moeda == 6) {
                                                    valor_cobrar = Util.toFixed(parseFloat(valor_cobrar) * parseFloat(roe), 2);
                                                }

                                                valorTotalPago += parseFloat(content.fornecedor_custeio == custeio ? 0 : valor_pago);
                                                valorTotalCobrar += parseFloat(content.fornecedor_custeio == custeio ? valor_cobrar : 0);
                                                valorTotalLiquido += parseFloat(content.fornecedor_custeio == custeio ? valor_cobrar : -valor_pago);

                                                totalConsolidado += content.fornecedor_custeio == custeio ? valor_cobrar : 0;

                                                if (contasCodigos[0] && contasCodigos.find((cnt) => cnt.conta == (content.uf == 81 ? content.contaEstrangeiraCod : content.contaCod) && cnt.custeio == content.fornecedor_custeioCodigo)) {
                                                    contasCodigos = contasCodigos.map((cnt) => cnt.conta == (content.uf == 81 ? content.contaEstrangeiraCod : content.contaCod) && cnt.custeio == content.fornecedor_custeioCodigo ? ({ ...cnt, valor: parseFloat(cnt.valor) + parseFloat(content.fornecedor_custeio == custeio ? 0 : valor_pago) }) : ({ ...cnt }))
                                                } else {
                                                    contasCodigos.push({
                                                        conta: content.uf == 81 ? content.contaEstrangeiraCod : content.contaCod,
                                                        valor: valor_cobrar,
                                                        custeio: content.fornecedor_custeioCodigo
                                                    });
                                                }

                                                return (
                                                    <>
                                                        <tr>
                                                            <td colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px", paddingRight: 75 }}>{content.evento}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>{content.uf == 81 ? content.contaEstrangeiraCod : content.contaCod}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(content.fornecedor_custeio == custeio ? valor_cobrar : 0)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(content.fornecedor_custeio == custeio ? valor_pago : valor_pago)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(content.fornecedor_custeio == custeio ? valor_cobrar : -valor_pago)}</td>
                                                        </tr>
                                                    </>
                                                )
                                            })}
                                            <tr style={{ backgroundColor: "#9A9A9A" }}>
                                                <td colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black" }}><b>VALOR DA NF A SER EMITIDA</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black" }}></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalCobrar)}</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(["16", "17"].includes(pdfCusteioCodigo[custeioIndex]) ? valorTotalPago : 0)}</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalLiquido)}</b></td>
                                            </tr>
                                        </table>
                                    </>
                                )
                            }
                        })}
                        <div className="faturamentoFooter">
                            VALOR CONSOLIDADO: R$<span style={{ marginLeft: "40px" }}>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalConsolidado)}</span>
                        </div>
                        {pdfCusteioCodigo.map((custeio, custeioIndex) => {
                            let contaValor = 0;
                            if (!custeio) return (<></>);

                            return (
                                <table className="relatorio_liquidos_contas">
                                    <tr className="relatorio_liquidos_contas_titulos">
                                        <th colSpan={3}>
                                            {pdfCusteio[custeioIndex]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th>
                                            Conta
                                        </th>
                                        <th>
                                            Valor
                                        </th>
                                    </tr>
                                    {contasCodigos.filter((conta) => conta.custeio == custeio && !!conta.conta).map((conta) => {
                                        contaValor += parseFloat(conta.valor);

                                        return (
                                            <tr className="relatorio_liquidos_contas_row">
                                                <td className="relatorio_liquidos_contas_item"></td>
                                                <td className="relatorio_liquidos_contas_item">{conta.conta}</td>
                                                <td className="relatorio_liquidos_contas_item">R${Util.formataDinheiroBrasileiro(conta.valor)}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="relatorio_liquidos_contas_row">
                                        <th className="relatorio_liquidos_contas_item" colSpan={2}>TOTAL:</th>
                                        <th className="relatorio_liquidos_contas_item">R${Util.formataDinheiroBrasileiro(contaValor)}</th>
                                    </tr>
                                </table>
                            )
                        })
                        }
                    </div>
            } else {
                await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
                return;
            }

            await this.setState({ pdfgerado: pdf })
            this.handleExportWithComponent()
        } catch (err) {
            console.log(err);
            await this.setState({ erro: "Erro ao criar o pdf", loading: false });
        }*/
  };

  Invoices = async (validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      await this.setState({
        loading: true,
        pdfContent: await loader.getBody(`invoices.php`, {
          token: true,
          os: this.state.chave,
          eventos: this.state.agrupadorEventos,
        }),
      });

      if (!this.state.pdfContent || !this.state.pdfContent.events) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }

      const { pdfContent } = this.state;

      let name;
      if ([16, 17].includes(parseInt(pdfContent.fornecedorCusteio))) {
        name = "sultrade";
      } else if (parseInt(pdfContent.fornecedorCusteio) == 32) {
        name = "porto";
      } else if (parseInt(pdfContent.fornecedorCusteio) == 269) {
        name = "coast";
      }

      this.setState({ pdfNome: `Invoices - ${name} (${pdfContent.invoice})` });

      let cabecalho;
      try {
        cabecalho = JSON.parse(pdfContent.cabecalho);
      } catch (err) {
        console.error(err);
      }
      const roe = pdfContent.ROE ? parseFloat(pdfContent.ROE) : 5;
      let valorTotal = 0;
      let pdf;

      if ([16, 17].includes(parseInt(pdfContent.fornecedorCusteio))) {
        pdf = (
          <div key={546546554654} className="pdf_padding" id="pdfDiv">
            <br />
            <div className="invoices_header_sultrade">
              <div className="invoices_header_image_sultrade">
                <img
                  className="img-fluid"
                  src="https://i.ibb.co/NCw9jYX/sultrade-logo.png"
                  alt="logo-lpc"
                  border="0"
                  style={{
                    minWidth: "375px",
                    width: "375px",
                    maxWidth: "375px",
                    minHeight: "93px",
                    height: "93px",
                    maxHeight: "93px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="invoices_header_info_sultrade">
                <h3>SULTRADE SHIPPING AGENCY</h3>
                <span>CNPJ/VAT Number : 10.432.546/0001-75</span>
                <span>
                  <a href="mailto:sultrade@sultradeagency.com">
                    E-mail : sultrade@sultradeagency.com
                  </a>
                </span>
                <span>Phone : +55 (53) 3235 3500</span>
                <span>
                  <a href="https://www.sultradeagency.com">
                    www.sultradeagency.com
                  </a>
                </span>
              </div>
            </div>
            <br />
            <div className="invoices_info_sultrade">
              <div className="invoices_info_data_sultrade">
                COMPANY:{" "}
                <b>
                  {cabecalho?.company
                    ? cabecalho?.company
                    : pdfContent.clienteNome}
                </b>
              </div>
              <div className="invoices_info_data_sultrade2">
                INVOICE NUMBER: <b>{pdfContent.invoice}</b>
              </div>
              {cabecalho?.CO && (
                <>
                  <div className="invoices_info_data_sultrade">
                    {cabecalho?.CO ? `C/O: ` : ""}
                    <b>{cabecalho?.CO ? cabecalho.CO : ""}</b>
                  </div>
                  <div className="invoices_info_data_sultrade2">
                    DATE OF BILLING:{" "}
                    <b>
                      {moment(pdfContent.data_emissao).isValid()
                        ? moment(pdfContent.data_emissao).format(
                            "MMMM DD, YYYY"
                          )
                        : "-"}
                    </b>
                  </div>
                  <div className="invoices_info_data_sultrade">
                    ADDRESS:{" "}
                    <b>
                      {cabecalho?.address
                        ? cabecalho?.address
                        : pdfContent.address}
                    </b>
                  </div>
                </>
              )}
              {!cabecalho?.CO && (
                <>
                  <div className="invoices_info_data_sultrade">
                    ADDRESS:{" "}
                    <b>
                      {cabecalho?.address
                        ? cabecalho?.address
                        : pdfContent.address}
                    </b>
                  </div>
                  <div className="invoices_info_data_sultrade2">
                    DATE OF BILLING:{" "}
                    <b>
                      {moment(pdfContent.data_emissao).isValid()
                        ? moment(pdfContent.data_emissao).format(
                            "MMMM DD, YYYY"
                          )
                        : "-"}
                    </b>
                  </div>
                </>
              )}
              <div className="invoices_info_data_sultrade">
                PO - VESSEL:{" "}
                <b>
                  {pdfContent.codigo}-{pdfContent.navioNome}
                </b>
              </div>
              <div className="invoices_info_data_sultrade"></div>
            </div>
            <br />
            <br />
            <br />
            <div className="invoices_content_sultrade">
              <div className="invoices_content_header_sultrade">
                <div className="invoices_content_title_sultrade">
                  Description
                </div>
                <div className="invoices_content_title_sultrade"></div>
              </div>
              {pdfContent.events.map((event) => {
                const quantity = 1;
                let valor;

                if (event.Moeda == 5) {
                  valor = Util.toFixed(parseFloat((event.valor*event.qntd) / roe), 2);
                } else {
                  valor = parseFloat((event.valor*event.qntd));
                }

                const total = valor * quantity;
                valorTotal += total;

                return (
                  <div className="invoices_content_row_sultrade">
                    <div className="invoices_content_col_sultrade">
                      {event.descricao}
                    </div>
                    <div className="invoices_content_col_sultrade text-right">
                      USD{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(total)}
                    </div>
                  </div>
                );
              })}
              <div className="invoices_total_row_sultrade">
                <div className="invoices_total_sultrade">Total</div>
                <div className="invoices_total_sultrade">USD</div>
                <div className="invoices_total_sultrade">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(valorTotal)}
                </div>
              </div>
            </div>
          </div>
        );
      } else if (pdfContent.fornecedorCusteio == 32) {
        pdf = (
          <div key={546546554654} className="pdf_padding" id="pdfDiv">
            <br />
            <div className="invoices_header_porto">
              <div className="invoices_header_image_porto">
                <img
                  className="img-fluid"
                  src="https://i.ibb.co/QK61hd5/porto-brasil-logo.png"
                  alt="logo-lpc"
                  border="0"
                  style={{
                    minWidth: "150px",
                    width: "150px",
                    maxWidth: "150px",
                    minHeight: "142px",
                    height: "142px",
                    maxHeight: "142px",
                    objectFit: "cover",
                  }}
                />
                <h1>Invoice</h1>
              </div>
              <div className="invoices_header_info_porto">
                <h4>
                  <b>TRANSPORTE PORTO BRAZIL LTDA</b>
                </h4>
                <span>
                  <b>Date:</b>{" "}
                  {moment(pdfContent.data_emissao).isValid()
                    ? moment(pdfContent.data_emissao).format("MMMM DD, YYYY")
                    : "-"}
                </span>
                <span></span>
                <span>
                  <b>Invoice:</b> {pdfContent.invoice}
                </span>
              </div>
            </div>
            <br />
            <div className="invoices_info_porto">
              <div className="invoices_info_data_porto">
                <b>To:</b>{" "}
                {cabecalho?.company
                  ? cabecalho?.company
                  : pdfContent.clienteNome}
              </div>
              {cabecalho?.CO && (
                <div className="invoices_info_data_porto">
                  <b>{cabecalho?.CO ? `C/O: ` : ""}</b>
                  {cabecalho?.CO ? cabecalho.CO : ""}
                </div>
              )}
              <div className="invoices_info_data_porto">
                <b>Address:</b>{" "}
                {cabecalho?.address ? cabecalho?.address : pdfContent.address}
              </div>
              <div className="invoices_info_data_porto">
                <b>PO - VESSEL:</b> {pdfContent.codigo}-{pdfContent.navioNome}
              </div>
            </div>
            <br />
            <br />
            <br />
            <div className="invoices_content_porto">
              <div className="invoices_content_header_porto">
                <div className="invoices_content_title_porto">Description</div>
                <div className="invoices_content_title_porto"></div>
              </div>
              {pdfContent.events.map((event) => {
                const quantity = 1;
                let valor;

                if (event.Moeda == 5) {
                  valor = Util.toFixed(parseFloat((event.valor*event.qntd) / roe), 2);
                } else {
                  valor = parseFloat((event.valor*event.qntd));
                }

                const total = valor * quantity;
                valorTotal += total;

                return (
                  <div className="invoices_content_row_porto">
                    <div className="invoices_content_col_porto">
                      {event.descricao}
                    </div>
                    <div className="invoices_content_col_porto text-right">
                      USD{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(total)}
                    </div>
                  </div>
                );
              })}
              <div className="invoices_total_row_porto">
                <div className="invoices_total_porto">Total</div>
                <div className="invoices_total_porto">
                  USD{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(valorTotal)}
                </div>
              </div>
            </div>
          </div>
        );
      } else if (pdfContent.fornecedorCusteio == 269) {
        pdf = (
          <div key={546546554654} className="pdf_padding" id="pdfDiv">
            <br />
            <div className="invoices_header_coast">
              <div className="invoices_header_image_coast">
                <img
                  className="img-fluid"
                  src="https://i.ibb.co/mv8gqfw/coast-logo.png"
                  alt="logo-lpc"
                  border="0"
                  style={{
                    minWidth: "150px",
                    width: "150px",
                    maxWidth: "150px",
                    minHeight: "59px",
                    height: "59px",
                    maxHeight: "59px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="invoices_header_info_coast">
                <span>COAST SERVICOS ADMINISTRATIVOS LTDA</span>
                <span>
                  Date:{" "}
                  {moment(pdfContent.data_emissao).isValid()
                    ? moment(pdfContent.data_emissao).format("MMMM DD, YYYY")
                    : "-"}
                </span>
                <span>CPNJ/VAT NUMBER : 15.258.758/0001-00</span>
                <span>Invoice: {pdfContent.invoice}</span>
              </div>
            </div>
            <br />
            <div className="invoices_info_coast">
              <div className="invoices_info_data_coast">
                To:{" "}
                {cabecalho?.company
                  ? cabecalho?.company
                  : pdfContent.clienteNome}
              </div>
              {cabecalho?.CO && (
                <div className="invoices_info_data_coast">
                  {cabecalho?.CO ? `C/O: ${cabecalho.CO}` : ""}
                </div>
              )}
              <div className="invoices_info_data_coast">
                Address:{" "}
                {cabecalho?.address ? cabecalho?.address : pdfContent.address}
              </div>
              <div className="invoices_info_data_coast">
                PO - VESSEL: {pdfContent.codigo}-{pdfContent.navioNome}
              </div>
            </div>
            <br />
            <br />
            <div className="invoices_content_coast">
              <div className="invoices_content_header_coast">
                <div className="invoices_content_title_coast">Description</div>
                <div className="invoices_content_title_coast"></div>
              </div>
              {pdfContent.events.map((event) => {
                const quantity = 1;
                let valor;

                if (event.Moeda == 5) {
                  valor = Util.toFixed(parseFloat((event.valor*event.qntd) / roe), 2);
                } else {
                  valor = parseFloat((event.valor*event.qntd));
                }

                const total = valor * quantity;
                valorTotal += total;

                return (
                  <div className="invoices_content_row_coast">
                    <div className="invoices_content_col_coast">
                      {event.descricao}
                    </div>
                    <div className="invoices_content_col_coast text-right">
                      USD{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(total)}
                    </div>
                  </div>
                );
              })}
              <div className="invoices_total_row_coast">
                <div className="invoices_total_coast">Total</div>
                <div className="invoices_total_coast">
                  USD{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(valorTotal)}
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return this.setState({
          error: { type: "error", msg: "Fornecedor Custeio desconhecido" },
          loading: false,
        });
      }
      await this.setState({ pdfgerado: pdf });

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

      await apiEmployee
        .post(`salvaInvoices.php`, {
          token: true,
          base64,
          name: this.state.pdfNome,
          os: this.state.chave,
        })
        .then(
          (res) => {},
          (err) => console.error(err)
        );

      this.handleExportWithComponent();
    } catch (err) {
      console.log(err);
      await this.setState({
        erro: "Erro ao criar o documento",
        loading: false,
      });
    }
    this.getInvoices();
    this.setState({ loading: false });
  };

  RelatorioVoucher = async (codigo, validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      this.setState({
        pdfNome: `Vouchers${
          this.state.codigo ? ` - ${this.state.codigo}` : ""
        }`,
      });

      await this.setState({
        loading: true,
        pdfContent: await loader.getBody(`relatorioVoucher.php`, {
          token: true,
          codigo: codigo,
        }),
      });

      if (
        !this.state.pdfContent ||
        !this.state.pdfContent.itens ||
        !this.state.pdfContent.chaves
      ) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }
      if (this.state.pdfContent.itens.find((os) => !os.codsubgrupo_taxas)) {
        return this.setState({
          error: { type: "error", msg: "Há eventos sem taxas" },
          loading: false,
        });
      }

      const pdfContent = this.state.pdfContent.itens;
      const pdfChaves = this.state.pdfContent.chaves;
      const pdfCampos = this.state.pdfContent.campos;
      // alert(JSON.stringify(pdfCampos))
      // alert(JSON.stringify(pdfContent))
      //console.log(pdfChaves)

      const getDescricaoItem = (item) => {
        if (item.tipo_op == "R") {
          if (item.fornecedor_custeio && item.descricao_item) {
            return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`;
          } else {
            return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`;
          }
        } else if (item.repasse != 0) {
          if (item.fornecedor && item.descricao_item) {
            return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`;
          }
        } else {
          if (item.fornecedor_custeio && item.descricao_item) {
            return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`;
          } else {
            return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`;
          }
        }
      };

      const getValorItemReal = (item) => {
        if (item.moeda_item == 6 && item.ROE != 0) {
          return (item.valor_item*item.qntd) * item.ROE;
        } else {
          return (item.valor_item*item.qntd);
        }
      };

      const getValorItemDolar = (item) => {
        if (item.moeda_item == 5 && item.ROE != 0) {
          return (item.valor_item*item.qntd) / item.ROE;
        } else {
          return (item.valor_item*item.qntd);
        }
      };

      const mconversao = () => {
        if (pdfContent[0].ROE != 0) {
          return `Exchange Rate US$ 1,00 = R$${pdfContent[0].ROE}`;
        }
      };

      let valorTotalReais = 0;
      let valorTotalDolares = 0;
      let pdf = "";
      let campos = [];
      let camposTitulos = [];

      if (pdfContent) {
        pdf = (
          <div style={{ zoom: 1 }} key={546546554654}>
            {pdfChaves
              .toSorted(
                (a, b) =>
                  parseInt(a.codsubgrupo_taxas) - parseInt(b.codsubgrupo_taxas)
              )
              .map((chave, index) => {
                let company = chave.company;
                let address = chave.address;
                let CO;

                if (chave.cabecalho) {
                  let cabecalho;

                  try {
                    cabecalho = JSON.parse(chave.cabecalho);
                  } catch (err) {
                    cabecalho = JSON.parse(
                      chave.cabecalho
                        ?.replaceAll("\n", "\\n")
                        .replaceAll("\t", "\\t")
                    );
                  }

                  if (cabecalho.company) {
                    company = cabecalho.company;
                  }

                  if (cabecalho.address) {
                    address = cabecalho.address;
                  }

                  if (cabecalho.CO) {
                    CO = cabecalho.CO;
                  }
                }

                valorTotalReais = 0;
                valorTotalDolares = 0;

                campos = [];
                camposTitulos = [];
                return (
                  <>
                    <br />
                    <div
                      className={`voucherCabecalho ${
                        index == 0 ? "" : "page-break"
                      }`}
                      style={{ marginRight: 55 }}
                    >
                      Voucher nr. {chave.codsubgrupo}
                    </div>
                    <br />
                    <div
                      style={{ float: "right", marginRight: 55, marginTop: 25 }}
                    >
                      <img
                        className="img-fluid"
                        src="https://i.ibb.co/n69ZD86/logo-Vertical.png"
                        alt="logo-lpc"
                        border="0"
                        style={{ width: "130px", height: "100px" }}
                      />
                    </div>
                    <div style={{ width: "70%", marginLeft: "5%" }}>
                      <table style={{ width: "100%" }}>
                        <tr>
                          {company && (
                            <td colSpan={CO ? 4 : 6} className="pdf_large_column">
                              <b>Company:</b> {company}
                            </td>
                          )}
                          {CO && (
                            <td
                              colSpan={CO ? 2 : 0}
                              className={
                                company ? "pdf_money_colOS" : "pdf_small_col"
                              }
                            >
                              <b>C/O:</b> {CO}
                            </td>
                          )}
                        </tr>
                        <tr>
                          {address && (
                            <td colSpan={5} className="pdf_large_column">
                              <b>Address:</b> {address}
                            </td>
                          )}
                          {chave.codigo && (
                            <td
                              colSpan={1}
                              className={
                                address ? "pdf_money_colOS" : "pdf_small_col"
                              }
                            >
                              <b>PO:</b> {chave.codigo}
                            </td>
                          )}
                        </tr>
                        <tr>
                          {chave.Data_Faturamento &&
                            moment(chave.Data_Faturamento).isValid() && (
                              <td colSpan={3} className="pdf_large_column">
                                <b>Date of Billing:</b>{" "}
                                {moment(chave.Data_Faturamento).format(
                                  "DD/MM/YYYY"
                                )}
                              </td>
                            )}
                          {chave.eta && moment(chave.eta).isValid() && (
                            <td
                              colSpan={3}
                              className={
                                chave.Data_Faturamento &&
                                moment(chave.Data_Faturamento).isValid()
                                  ? "pdf_money_colOS"
                                  : "pdf_small_col"
                              }
                            >
                              <b>Arrived:</b>{" "}
                              {moment(chave.eta).format("DD/MM/YYYY")}
                            </td>
                          )}
                        </tr>
                        <tr>
                          {chave.vessel_name && (
                            <td colSpan={3} className="pdf_large_column">
                              <b>Vessel Name:</b> {chave.vessel_name}
                            </td>
                          )}
                          {chave.Data_Saida &&
                            moment(chave.Data_Saida).isValid() && (
                              <td
                                colSpan={3}
                                className={
                                  chave.vessel_name
                                    ? "pdf_money_colOS"
                                    : "pdf_small_col"
                                }
                              >
                                <b>Sailed:</b>{" "}
                                {moment(chave.Data_Saida).format("DD/MM/YYYY")}
                              </td>
                            )}
                        </tr>
                        <tr>
                          {chave.name_of_port && (
                            <td colSpan={3} className="pdf_large_column">
                              <b>Name of Port:</b> {chave.name_of_port}
                            </td>
                          )}
                          <td
                            colSpan={3}
                            className={
                              chave.name_of_port
                                ? "pdf_money_colOS"
                                : "pdf_small_col"
                            }
                          >
                            {mconversao()}
                          </td>
                        </tr>
                      </table>
                    </div>
                    <br />
                    <br />
                    <br />
                    <div className="voucherContent">
                      <div className="center">{chave.subgrupos}</div>
                      {/* <div className="center">{JSON.stringify(chave)}</div> */}
                      <table>
                        <tr>
                          <th className="pdf_large_col" colSpan={7}>
                            Services
                          </th>
                          <th>Debit BRL</th>
                          <th>Debit USD</th>
                        </tr>
                        {pdfContent
                          .filter(
                            (e) =>
                              e.codsubgrupo_taxas == chave.codsubgrupo_taxas 
                          )
                          .map((e, i) => {
                            valorTotalReais += Util.toFixed(
                              parseFloat(getValorItemReal(e)),
                              2
                            );
                            valorTotalDolares += Util.toFixed(
                              parseFloat(getValorItemDolar(e)),
                              2
                            );

                            pdfCampos
                              .filter((campo) => campo.chaveEvento == e.chsub && campo.chaveSubgrupo == chave.codsubgrupo_taxas)
                              .map((campo) => {
                                if (
                                  !camposTitulos.find(
                                    (titulo) => titulo.titulo == campo.campo
                                  )
                                ) {
                                  camposTitulos.push({
                                    titulo: campo.campo,
                                    tipo: campo.tipoCampo,
                                  });
                                }

                                if (
                                  campo.tipoCampo == "LISTA" &&
                                  !campos.find((c) => c.campo == campo.campo)
                                ) {
                                  const complementos =
                                    campo.complemento?.split("\n");

                                  if (complementos[0]) {
                                    complementos.forEach((complemento) => {
                                      campos.push({ ...campo, complemento });
                                    });
                                  }
                                } else if (
                                  campo.tipoCampo == "TEXTO" &&
                                  !campos.find((c) => c.campo == campo.campo)
                                ) {
                                  campos.push(campo);
                                }
                              });
                            return (
                              <tr>
                                <td
                                  className="pdf_large_col reduce-font"
                                  colSpan={7}
                                >
                                  {getDescricaoItem(e)}
                                </td>
                                <td className="pdf_money_colOS reduce-font">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(getValorItemReal(e))}
                                </td>
                                <td className="pdf_money_colOS reduce-font">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(getValorItemDolar(e))}
                                </td>
                              </tr>
                            );
                          })}
                        <tr>
                          <td colSpan={7} className="pdf_large_col">
                            <b>TOTAL</b>
                          </td>
                          <td className="pdf_money_colOS">
                            <b>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(valorTotalReais)}
                            </b>
                          </td>
                          <td className="pdf_money_colOS">
                            <b>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(valorTotalDolares)}
                            </b>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div className="voucherFooter">Comments:</div>
                    {/* <div>
                      {JSON.stringify(camposTitulos)}
                      {JSON.stringify(campos)}
                    </div> */}
                    {camposTitulos.map((titulo) => {
                      if (titulo.tipo == "LISTA") {
                        return (
                          <div className="voucherCamposLista">
                            <div className="voucherCampoTitulos">
                              {titulo.titulo}
                            </div>
                            <ul className="voucherLiListaCampos">
                              {campos
                                .filter((campo) => campo.campo == titulo.titulo && campo.chaveSubgrupo == chave.codsubgrupo_taxas)
                                .map((campo) => (
                                  <li>{campo.complemento}</li>
                                ))}
                            </ul>
                          </div>
                        );
                      } else if (titulo.tipo == "TEXTO") {
                        return (
                          <div className="voucherCamposLista">
                            <div className="voucherCampoTitulos">
                              {titulo.titulo}
                            </div>
                            <div className="voucherComplementosLista">
                              {campos
                                .filter((campo) => campo.campo == titulo.titulo)
                                .map((campo) => (
                                  <pre>{campo.complemento}</pre>
                                ))}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </>
                );
              })}
          </div>
        );
      } else {
        await this.setState({
          erro: "Sem as informações necessárias para gerar o pdf!",
          loading: false,
        });
        return;
      }

      await this.setState({ pdfgerado: pdf });
      this.handleExportWithComponent();
    } catch (err) {
      console.log(err);
      await this.setState({ erro: "Erro ao criar o pdf", loading: false });
    }
  };

  CloseToReal = async (codigo, validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      this.setState({
        pdfNome: `Close to Real${
          this.state.codigo ? ` - ${this.state.codigo}` : ""
        }`,
      });

      await this.setState({ loading: true });
      await apiEmployee
        .post(`getCloseToReal.php`, {
          token: true,
          codigo: codigo,
        })
        .then(
          async (response) => {
            await this.setState({ pdfContent: response.data });
          },
          async (response) => {
            console.log(response);
          }
        );
      let valorTotal = 0;
      let valorTotalDolar = 0;
      let recebimentoTotal = 0;
      let recebimentoTotalDolar = 0;
      let descontoTotal = 0;
      let descontoTotalDolar = 0;
      let pdf = "";

      if (!this.state.pdfContent || !this.state.pdfContent[0]) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }

      if (this.state.pdfContent[0]) {
        if (this.state.pdfContent[0].governmentTaxes > 0) {
          valorTotal += parseFloat(this.state.pdfContent[0].governmentTaxes);
          valorTotalDolar += Util.toFixed(
            parseFloat(
              this.state.pdfContent[0].governmentTaxes /
                (this.state.pdfContent[0].roe
                  ? this.state.pdfContent[0].roe
                  : 5)
            ),
            2
          );
        }
        if (this.state.pdfContent[0].bankCharges > 0) {
          valorTotal += parseFloat(this.state.pdfContent[0].bankCharges);
          valorTotalDolar += Util.toFixed(
            parseFloat(
              this.state.pdfContent[0].bankCharges /
                (this.state.pdfContent[0].roe
                  ? this.state.pdfContent[0].roe
                  : 5)
            ),
            2
          );
        }

        if (
          this.state.pdfContent.find(
            (os) => (os.tipo == 0 || os.tipo == 1) && !os.chavTaxa
          )
        ) {
          return this.setState({
            error: { type: "error", msg: "Há eventos sem taxas" },
            loading: false,
          });
        }

        pdf = (
          <div style={{ zoom: 1 }} key={546546554654}>
            <div className="pdfHeader">
              <img
                className="img-fluid"
                src="https://i.ibb.co/vmKJkx4/logo.png"
                alt="logo-lpc"
                border="0"
                style={{ width: "24%", height: "150px" }}
              />
              <h3 className="pdfTitle"></h3>
              <h4>Close to Real</h4>
            </div>
            <hr />
            <div className="pdfContent">
              <div>
                <table className="pdfTableCabecalho">
                  <tr>
                    <td colSpan={4} className="pdf_large_col">
                      <b style={{ paddingRight: 5 }}>COMPANY:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].cliente
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="pdf_large_col" colSpan="4">
                      <b style={{ paddingRight: 5 }}>ADDRESS:</b>{" "}
                      {`${util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].complemento
                      )} ${util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].rua
                      )} ${
                        this.state.pdfContent[0].numero &&
                        this.state.pdfContent[0].numero != "0"
                          ? this.state.pdfContent[0].numero
                          : ""
                      } ${
                        this.state.pdfContent[0].cep &&
                        this.state.pdfContent[0].cep != "0"
                          ? this.state.pdfContent[0].cep
                          : ""
                      }`}
                    </td>
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="2">
                      <b style={{ paddingRight: 5 }}>Vessel Name:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].nomeNavio
                      )}
                    </td>
                    <td className="pdf_money_colOS" colSpan="2">
                      <b style={{ paddingRight: 5 }}>Name of Port:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].nomePorto
                      )}
                    </td>
                  </tr>
                  <tr>
                    {this.state.pdfContent[0].data_chegada &&
                      moment(
                        this.state.pdfContent[0].data_chegada
                      ).isValid() && (
                        <td className="pdf_small_col" colSpan="2">
                          <b style={{ paddingRight: 5 }}>Arrived:</b>{" "}
                          {moment(
                            util.returnIfExists(
                              this.state.pdfContent[0],
                              this.state.pdfContent[0].data_chegada
                            )
                          ).format("MMMM DD, YYYY")}
                        </td>
                      )}
                    {this.state.pdfContent[0].data_saida &&
                      moment(this.state.pdfContent[0].data_saida).format(
                        "DD/MM/YYYY"
                      ) != "Invalid date" && (
                        <td
                          className={`${
                            this.state.pdfContent[0].data_chegada &&
                            moment(this.state.pdfContent[0].data_chegada)
                              .isValid
                              ? "pdf_money_colOS"
                              : "pdf_small_col"
                          }`}
                          colSpan="2"
                        >
                          <b style={{ paddingRight: 5 }}>Sailed:</b>{" "}
                          {moment(
                            util.returnIfExists(
                              this.state.pdfContent[0],
                              this.state.pdfContent[0].data_saida
                            )
                          ).format("MMMM DD, YYYY")}
                        </td>
                      )}
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="2">
                      <b style={{ paddingRight: 5 }}>PO:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].codigo
                      )}
                    </td>
                    {/* <td className="pdf_money_colOS" colSpan="2">
                      <b style={{ paddingRight: 5 }}>O.C.C:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].centro_custo
                      )}
                    </td> */}
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="4">
                      <b style={{ paddingRight: 5 }}>ROE:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].roe.replaceAll(".", ",")
                      )}
                    </td>
                  </tr>
                </table>
                <br />
              </div>
            </div>
            <div>
              <table style={{ width: "90%", marginLeft: "5%" }}>
                <tr>
                  <td colSpan="2" className="pdf_small_col pdfTitle"></td>
                  <td className="pdf_small_col"></td>
                  <td className="pdf_small_col"></td>
                </tr>
                <tr></tr>
                <tr>
                  <td
                    colSpan="7"
                    className="pdf_large_col"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    DESCRIPTION:
                  </td>
                  <td
                    className="pdf_money_colOS"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    VALUE (USD)
                  </td>
                  <td
                    className="pdf_money_colOS"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    VALUE (R$)
                  </td>
                </tr>
                {this.state.pdfContent.map((e, index) => {
                  if (e.tipo == 0 || e.tipo == 1) {
                    if (e.moeda == 5) {
                      valorTotal += parseFloat((e.valor*e.qntd));
                      valorTotalDolar += Util.toFixed(
                        parseFloat(
                          e.valor /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      valorTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      valorTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  } else if (e.tipo == 2) {
                    if (e.moeda == 5) {
                      recebimentoTotal += parseFloat(e.valor*e.qntd);
                      recebimentoTotalDolar += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      recebimentoTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      recebimentoTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  } else if (e.tipo == 3) {
                    if (e.moeda == 5) {
                      descontoTotal += parseFloat((e.valor*e.qntd));
                      descontoTotalDolar += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      descontoTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      descontoTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  }

                  if (e.tipo == 0 || e.tipo == 1) {
                      if (e.descos === "LINHA VAZIA") {
                        return (
                            <tr
                                style={{
                                    background: index % 2 == 0 ? "white" : "#dddddd",
                                    height: "20px" 
                                }}
                            >
                                <td colSpan="9"
                                style={{
                                  background: index % 2 == 0 ? "white" : "#ccc",
                                }}
                                ></td>
                            </tr>
                        );
                    }
                    return (
                      <tr
                        style={{
                          background: index % 2 == 0 ? "white" : "#dddddd",
                        }}
                      >
                        <td
                          colSpan="7"
                          className="pdf_large_col reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.descos}
                        </td>
                        <td
                          className="pdf_money_colOS reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.moeda == 5
                            ? util.formataDinheiroBrasileiro(
                                parseFloat(
                                  (e.valor*e.qntd) /
                                    (this.state.pdfContent[0].roe
                                      ? this.state.pdfContent[0].roe
                                      : 5)
                                )
                              )
                            : util.formataDinheiroBrasileiro(
                                parseFloat((e.valor*e.qntd))
                              )}
                        </td>
                        <td
                          className="pdf_money_colOS reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.moeda == 6
                            ? util.formataDinheiroBrasileiro(
                                parseFloat(
                                  (e.valor*e.qntd) *
                                    (this.state.pdfContent[0].roe
                                      ? this.state.pdfContent[0].roe
                                      : 5)
                                )
                              )
                            : util.formataDinheiroBrasileiro(
                                parseFloat((e.valor*e.qntd))
                              )}
                        </td>
                      </tr>
                    );
                  }
                })}
                {this.state.pdfContent[0].governmentTaxes > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col reduce_font">
                      <b>GOVERNMENT TAXES</b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(
                            this.state.pdfContent[0].governmentTaxes /
                              (this.state.pdfContent[0].roe
                                ? this.state.pdfContent[0].roe
                                : 5)
                          )
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(this.state.pdfContent[0].governmentTaxes)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                {this.state.pdfContent[0].bankCharges > 0 && (
                  <tr styles={{ padding: "37px 0px 37px 0px" }}>
                    <td colSpan="7" className="pdf_large_col reduce_font">
                      <b>BANK CHARGES</b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(
                            this.state.pdfContent[0].bankCharges /
                              (this.state.pdfContent[0].roe
                                ? this.state.pdfContent[0].roe
                                : 5)
                          )
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(this.state.pdfContent[0].bankCharges)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="7" className="pdf_large_col pdfTitle">
                    Total
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotalDolar)
                      )}
                    </b>
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(parseFloat(valorTotal))}
                    </b>
                  </td>
                </tr>
                {parseFloat(descontoTotal) > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col pdfTitle">
                      Discount
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoTotalDolar)
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoTotal)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                {parseFloat(recebimentoTotal) > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col pdfTitle">
                      Received
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoTotalDolar)
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoTotal)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="7" className="pdf_large_col pdfTitle">
                    Balance
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotalDolar) -
                          (parseFloat(recebimentoTotalDolar) +
                            parseFloat(descontoTotalDolar))
                      )}
                    </b>
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotal) -
                          (parseFloat(recebimentoTotal) +
                            parseFloat(descontoTotal))
                      )}
                    </b>
                  </td>
                </tr>
              </table>
            </div>
            <br />
            <br />
            <br />

            <h5 style={{ width: "100%", textAlign: "center" }}>
              BANKING DETAILS
            </h5>
            <table style={{ width: "80%", marginLeft: "5%" }}>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco do
                  Brasil
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Address:</b> Benjamin Constant
                  St, 72
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Swift Code:</b> BRASBRRJCTA
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>IBAN:</b>{" "}
                  BR6400000000026940001614410C1
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Branch's number:</b> 2694-8
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Account number:</b> 161441-X
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
        );
      } else {
        await this.setState({
          erro: "Sem as informações necessárias para gerar o pdf!",
          loading: false,
        });
        return;
      }

      await this.setState({ pdfgerado: pdf });
      this.handleExportWithComponent();
    } catch (err) {
      await this.setState({ erro: "Erro ao criar o pdf", loading: false });
    }
  };

  CommercialInvoice = async (codigo, validForm) => {
    try {
      if (!validForm) {
        await this.setState({
          error: {
            type: "error",
            msg: "Verifique se as informações estão corretas!",
          },
        });
        return;
      }

      await this.salvarOS(validForm, false);

      this.setState({
        pdfNome: `Commercial Invoice${
          this.state.codigo ? ` - ${this.state.codigo}` : ""
        }`,
      });

      await this.setState({ loading: true });
      await apiEmployee
        .post(`getCloseToReal.php`, {
          token: true,
          codigo: codigo,
        })
        .then(
          async (response) => {
            await this.setState({ pdfContent: response.data });
          },
          async (response) => {
            console.log(response);
          }
        );
      let valorTotal = 0;
      let valorTotalDolar = 0;
      let recebimentoTotal = 0;
      let recebimentoTotalDolar = 0;
      let descontoTotal = 0;
      let descontoTotalDolar = 0;
      let pdf = "";

      if (!this.state.pdfContent || !this.state.pdfContent[0]) {
        return this.setState({
          error: { type: "error", msg: "Sem informações necessárias" },
          loading: false,
        });
      }

      if (this.state.pdfContent[0]) {
        if (this.state.pdfContent[0].governmentTaxes > 0) {
          valorTotal += parseFloat(this.state.pdfContent[0].governmentTaxes);
          valorTotalDolar += Util.toFixed(
            parseFloat(
              this.state.pdfContent[0].governmentTaxes /
                (this.state.pdfContent[0].roe
                  ? this.state.pdfContent[0].roe
                  : 5)
            ),
            2
          );
        }
        if (this.state.pdfContent[0].bankCharges > 0) {
          valorTotal += parseFloat(this.state.pdfContent[0].bankCharges);
          valorTotalDolar += Util.toFixed(
            parseFloat(
              this.state.pdfContent[0].bankCharges /
                (this.state.pdfContent[0].roe
                  ? this.state.pdfContent[0].roe
                  : 5)
            ),
            2
          );
        }

        if (
          this.state.pdfContent.find(
            (os) => (os.tipo == 0 || os.tipo == 1) && !os.chavTaxa
          )
        ) {
          return this.setState({
            error: { type: "error", msg: "Há eventos sem taxas" },
            loading: false,
          });
        }

        pdf = (
          <div style={{ zoom: 1 }} key={546546554654}>
            <div className="pdfHeader">
              <img
                className="img-fluid"
                src="https://i.ibb.co/vmKJkx4/logo.png"
                alt="logo-lpc"
                border="0"
                style={{ width: "24%", height: "150px" }}
              />
              <h3 className="pdfTitle"></h3>
              <h4>COMMERCIAL INVOICE</h4>
            </div>
            <hr />
            <div className="pdfContent">
              <div>
                <table className="pdfTableCabecalho">
                  <tr>
                    <td colSpan={4} className="pdf_large_col">
                      <b style={{ paddingRight: 5 }}>COMPANY:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].cliente
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="pdf_large_col" colSpan="4">
                      <b style={{ paddingRight: 5 }}>ADDRESS:</b>{" "}
                      {`${util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].complemento
                      )} ${util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].rua
                      )} ${
                        this.state.pdfContent[0].numero &&
                        this.state.pdfContent[0].numero != "0"
                          ? this.state.pdfContent[0].numero
                          : ""
                      } ${
                        this.state.pdfContent[0].cep &&
                        this.state.pdfContent[0].cep != "0"
                          ? this.state.pdfContent[0].cep
                          : ""
                      }`}
                    </td>
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="2">
                      <b style={{ paddingRight: 5 }}>Vessel Name:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].nomeNavio
                      )}
                    </td>
                    <td className="pdf_money_colOS" colSpan="2">
                      <b style={{ paddingRight: 5 }}>Name of Port:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].nomePorto
                      )}
                    </td>
                  </tr>
                  <tr>
                    {this.state.pdfContent[0].data_chegada &&
                      moment(
                        this.state.pdfContent[0].data_chegada
                      ).isValid() && (
                        <td className="pdf_small_col" colSpan="2">
                          <b style={{ paddingRight: 5 }}>Arrived:</b>{" "}
                          {moment(
                            util.returnIfExists(
                              this.state.pdfContent[0],
                              this.state.pdfContent[0].data_chegada
                            )
                          ).format("MMMM DD, YYYY")}
                        </td>
                      )}
                    {this.state.pdfContent[0].data_saida &&
                      moment(this.state.pdfContent[0].data_saida).format(
                        "DD/MM/YYYY"
                      ) != "Invalid date" && (
                        <td
                          className={`${
                            this.state.pdfContent[0].data_chegada &&
                            moment(this.state.pdfContent[0].data_chegada)
                              .isValid
                              ? "pdf_money_colOS"
                              : "pdf_small_col"
                          }`}
                          colSpan="2"
                        >
                          <b style={{ paddingRight: 5 }}>Sailed:</b>{" "}
                          {moment(
                            util.returnIfExists(
                              this.state.pdfContent[0],
                              this.state.pdfContent[0].data_saida
                            )
                          ).format("MMMM DD, YYYY")}
                        </td>
                      )}
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="2">
                      <b style={{ paddingRight: 5 }}>PO:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].codigo
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="pdf_small_col" colSpan="4">
                      <b style={{ paddingRight: 5 }}>ROE:</b>{" "}
                      {util.returnIfExists(
                        this.state.pdfContent[0],
                        this.state.pdfContent[0].roe.replaceAll(".", ",")
                      )}
                    </td>
                  </tr>
                </table>
                <br />
              </div>
            </div>
            <div>
              <table style={{ width: "90%", marginLeft: "5%" }}>
                <tr>
                  <td colSpan="2" className="pdf_small_col pdfTitle"></td>
                  <td className="pdf_small_col"></td>
                  <td className="pdf_small_col"></td>
                </tr>
                <tr></tr>
                <tr>
                  <td
                    colSpan="7"
                    className="pdf_large_col"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    DESCRIPTION:
                  </td>
                  <td
                    className="pdf_money_colOS"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    VALUE (USD)
                  </td>
                  <td
                    className="pdf_money_colOS"
                    style={{ backgroundColor: "#CDCDCD" }}
                  >
                    VALUE (R$)
                  </td>
                </tr>
                {this.state.pdfContent.map((e, index) => {
                  if (e.tipo == 0 || e.tipo == 1) {
                    if (e.moeda == 5) {
                      valorTotal += parseFloat((e.valor*e.qntd));
                      valorTotalDolar += Util.toFixed(
                        parseFloat(
                          e.valor /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      valorTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      valorTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  } else if (e.tipo == 2) {
                    if (e.moeda == 5) {
                      recebimentoTotal += parseFloat(e.valor*e.qntd);
                      recebimentoTotalDolar += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      recebimentoTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      recebimentoTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  } else if (e.tipo == 3) {
                    if (e.moeda == 5) {
                      descontoTotal += parseFloat((e.valor*e.qntd));
                      descontoTotalDolar += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) /
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                    } else {
                      descontoTotal += Util.toFixed(
                        parseFloat(
                          (e.valor*e.qntd) *
                            (this.state.pdfContent[0].roe
                              ? this.state.pdfContent[0].roe
                              : 5)
                        ),
                        2
                      );
                      descontoTotalDolar += parseFloat((e.valor*e.qntd));
                    }
                  }

                  if (e.tipo == 0 || e.tipo == 1) {
                    return (
                      <tr
                        style={{
                          background: index % 2 == 0 ? "white" : "#dddddd",
                        }}
                      >
                        <td
                          colSpan="7"
                          className="pdf_large_col reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.descos}
                        </td>
                        <td
                          className="pdf_money_colOS reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.moeda == 5
                            ? util.formataDinheiroBrasileiro(
                                parseFloat(
                                  (e.valor*e.qntd) /
                                    (this.state.pdfContent[0].roe
                                      ? this.state.pdfContent[0].roe
                                      : 5)
                                )
                              )
                            : util.formataDinheiroBrasileiro(
                                parseFloat((e.valor*e.qntd))
                              )}
                        </td>
                        <td
                          className="pdf_money_colOS reduce_font"
                          style={{
                            background: index % 2 == 0 ? "white" : "#ccc",
                          }}
                        >
                          {e.moeda == 6
                            ? util.formataDinheiroBrasileiro(
                                parseFloat(
                                  (e.valor*e.qntd) *
                                    (this.state.pdfContent[0].roe
                                      ? this.state.pdfContent[0].roe
                                      : 5)
                                )
                              )
                            : util.formataDinheiroBrasileiro(
                                parseFloat((e.valor*e.qntd))
                              )}
                        </td>
                      </tr>
                    );
                  }
                })}
                {this.state.pdfContent[0].governmentTaxes > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col reduce_font">
                      <b>GOVERNMENT TAXES</b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(
                            this.state.pdfContent[0].governmentTaxes /
                              (this.state.pdfContent[0].roe
                                ? this.state.pdfContent[0].roe
                                : 5)
                          )
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(this.state.pdfContent[0].governmentTaxes)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                {this.state.pdfContent[0].bankCharges > 0 && (
                  <tr styles={{ padding: "37px 0px 37px 0px" }}>
                    <td colSpan="7" className="pdf_large_col reduce_font">
                      <b>BANK CHARGES</b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(
                            this.state.pdfContent[0].bankCharges /
                              (this.state.pdfContent[0].roe
                                ? this.state.pdfContent[0].roe
                                : 5)
                          )
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS reduce_font">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(this.state.pdfContent[0].bankCharges)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="7" className="pdf_large_col pdfTitle">
                    Total
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotalDolar)
                      )}
                    </b>
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(parseFloat(valorTotal))}
                    </b>
                  </td>
                </tr>
                {parseFloat(descontoTotal) > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col pdfTitle">
                      Discount
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoTotalDolar)
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(descontoTotal)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                {parseFloat(recebimentoTotal) > 0 && (
                  <tr>
                    <td colSpan="7" className="pdf_large_col pdfTitle">
                      Received
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoTotalDolar)
                        )}
                      </b>
                    </td>
                    <td className="pdf_money_colOS">
                      <b>
                        {util.formataDinheiroBrasileiro(
                          parseFloat(recebimentoTotal)
                        )}
                      </b>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="7" className="pdf_large_col pdfTitle">
                    Balance
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotalDolar) -
                          (parseFloat(recebimentoTotalDolar) +
                            parseFloat(descontoTotalDolar))
                      )}
                    </b>
                  </td>
                  <td className="pdf_money_colOS">
                    <b>
                      {util.formataDinheiroBrasileiro(
                        parseFloat(valorTotal) -
                          (parseFloat(recebimentoTotal) +
                            parseFloat(descontoTotal))
                      )}
                    </b>
                  </td>
                </tr>
              </table>
            </div>
            <br />
            <br />
            <br />

            {/* <h5 style={{ width: "100%", textAlign: "center" }}>
              BANKING DETAILS
            </h5>
            <table style={{ width: "80%", marginLeft: "5%" }}>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Bank's name:</b> Banco do
                  Brasil
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Address:</b> Benjamin Constant
                  St, 72
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Swift Code:</b> BRASBRRJCTA
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>IBAN:</b>{" "}
                  BR6400000000026940001614410C1
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Branch's number:</b> 2694-8
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>Account number:</b> 161441-X
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
                  <b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}>
                  <b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75
                </td>
              </tr> 
            </table>
            */}
            <br />
            <br />
            <br />
            <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
              <h5 style={{ borderTop: "1px solid black", width: "40%", paddingTop: "5px", textAlign: "center", margin: 0 }}>
                MASTER OF {util.returnIfExists(
                  this.state.pdfContent[0],
                  this.state.pdfContent[0].nomeNavio
                )}
              </h5>
            </div>
          </div>
        );
      } else {
        await this.setState({
          erro: "Sem as informações necessárias para gerar o pdf!",
          loading: false,
        });
        return;
      }

      await this.setState({ pdfgerado: pdf });
      this.handleExportWithComponent();
    } catch (err) {
      await this.setState({ erro: "Erro ao criar o pdf", loading: false });
    }
  };
  //

  GerarEtiqueta = async (codigo, criacao=false) => {
    await apiEmployee.post(`enviaEtiquetaOS.php`, {
      os: codigo,
      navio: this.state.naviosOptions.find(
        (navio) => navio.value == this.state.navio
      )
        ? this.state.naviosOptions.find(
            (navio) => navio.value == this.state.navio
          ).label
        : "",
      cliente: this.state.clientesOptions.find(
        (cliente) => cliente.value == this.state.cliente
      )
        ? this.state.clientesOptions.find(
            (cliente) => cliente.value == this.state.cliente
          ).label
        : "",
      servico: this.state.tiposServicosOptions.find(
        (tipoServico) => tipoServico.value == this.state.tipoServico
      )
        ? this.state.tiposServicosOptions.find(
            (tipoServico) => tipoServico.value == this.state.tipoServico
          ).label
        : "",
      operador: this.state.operadoresOptions.find(
        (operador) => operador.value == this.state.operador
      )
        ? this.state.operadoresOptions.find(
            (operador) => operador.value == this.state.operador
          ).label
        : "",
      porto: this.state.portosOptions.find(
        (porto) => porto.value == this.state.porto
      )
        ? this.state.portosOptions.find(
            (porto) => porto.value == this.state.porto
          ).label
        : "",
      eta:
        moment(this.state.eta).format("DD/MM/YYYY") != "Invalid date"
          ? moment(this.state.eta).format("DD/MM/YYYY")
          : "T.B.I.",
      etb:
        moment(this.state.etb).format("DD/MM/YYYY") != "Invalid date"
          ? moment(this.state.etb).format("DD/MM/YYYY HH:mm")
          : "T.B.I.",
      data_saida:
        moment(this.state.data_saida).format("DD/MM/YYYY") != "Invalid date"
          ? moment(this.state.data_saida).format("DD/MM/YYYY HH:mm")
          : "T.B.I.",
        criacao: criacao,
    });
  };

  enviaDocumento = async () => {
    await this.setState({ loading: true });
    let documento = "";
    let format = "";
    let ext = "";
    if (this.state.documento[0]) {
      documento = await util.getBase64(this.state.documento[0]);
      format = this.state.documento[0].type;
      ext =
        this.state.documentoNome.split(".")[
          this.state.documentoNome.split(".").length - 1
        ];
    }
    if (!this.state.documentoEditar) {
      let documentoDescricao = this.state.documentoCaminho.split(".");

      documentoDescricao[documentoDescricao.length - 1] = ext;

      await this.setState({
        dadosFinaisDoc: [
          {
            titulo: "Descricao",
            valor: util.formatForLogs(this.state.documentoDescricao),
          },
          {
            titulo: "Tipo de Documento",
            valor: util.formatForLogs(
              this.state.documentoTipo,
              "options",
              "",
              "",
              this.state.tiposDocumentosOptions
            ),
          },
          {
            titulo: "Caminho",
            valor: util.formatForLogs(documentoDescricao.join("")),
          },
        ],
      });

      await apiEmployee
        .post(`enviaDocumento.php`, {
          documento: documento,
          format: format,
          ext: ext,
          chave_os: this.state.chave,
          chave_osi: 0,
          descricao: this.state.documentoDescricao,
          tipo: this.state.documentoTipo,
        })
        .then(
          async (res) => {
            await loader.salvaLogs(
              "os_documentos",
              this.state.usuarioLogado.codigo,
              null,
              "Inclusão",
              res.data[0].chave
            );

            window.location.reload();
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    } else {
      if (this.state.documentoTrocar) {
        await apiEmployee
          .post(`trocaDocumento.php`, {
            documento: documento,
            format: format,
            ext: ext,
            chave: this.state.documentoChave,
            descricao: this.state.documentoDescricao,
            tipo: this.state.documentoTipo,
            caminho: this.state.documentoCaminho,
          })
          .then(
            async (res) => {
              await loader.salvaLogs(
                "os_documentos",
                this.state.usuarioLogado.codigo,
                this.state.dadosIniciaisDoc,
                this.state.dadosFinaisDoc,
                this.state.documentoChave
              );

              window.location.reload();
            },
            async (res) => await console.log(`Erro: ${res}`)
          );
      } else {
        await apiEmployee
          .post(`updateDocumento.php`, {
            chave: this.state.documentoChave,
            descricao: this.state.documentoDescricao,
            tipo: this.state.documentoTipo,
          })
          .then(
            async (res) => {
              await loader.salvaLogs(
                "os_documentos",
                this.state.usuarioLogado.codigo,
                this.state.dadosIniciaisDoc,
                this.state.dadosFinaisDoc,
                this.state.documentoChave
              );

              window.location.reload();
            },
            async (res) => await console.log(`Erro: ${res}`)
          );
      }
    }
  };

  revertItemEdit = async (itemEdit) => {
    this.setState({
      eventoData: itemEdit.valores.find((e) => e.titulo === "Data")?.valor,
      eventoFornecedor: itemEdit.valores.find((e) => e.titulo === "Fornecedor")
        ?.valor,
      eventoTaxa: itemEdit.valores.find((e) => e.titulo === "Taxa")?.valor,
      eventoMoeda: itemEdit.valores.find((e) => e.titulo === "Valor unitário")?.valor1,
      eventoValor: itemEdit.valores.find((e) => e.titulo === "Valor unitário")?.valor2,
      eventoVlrc: itemEdit.valores.find((e) => e.titulo === "VCP")?.valor,
      eventoRepasse: itemEdit.valores.find((e) => e.titulo === "Repasse")
        ?.valor,
      eventoDescricao: itemEdit.valores.find((e) => e.titulo === "Descrição")
        ?.valor,
      eventoTipo: itemEdit.valores.find((e) => e.titulo === "Tipo")?.valor,
      eventoOrdem: itemEdit.valores.find((e) => e.titulo === "Ordem")?.valor,
      eventoRemarks: itemEdit.valores.find((e) => e.titulo === "Remarks")
        ?.valor,
      eventoFornecedorCusteio: itemEdit.valores.find(
        (e) => e.titulo === "Fornecedor Custeio"
      )?.valor,
      eventoQntd: itemEdit.valores.find((e) => e.titulo === "Quantidade")?.valor,
    });
  };

  salvarOrdem = async () => {
    this.setState({ loading: true });
  
    // Mapear eventos e criar as requisições para salvar a ordem no backend
    const promises = this.state.eventos.map((evento, index) => {
      return apiEmployee.post(`updateServicoItemOrdem.php`, {
        token: true,
        chave: evento.chave, // Identificador do evento a ser atualizado
        ordem: index + 1,    // Define a nova ordem baseada na posição do array
      });
    });
  
    // Executa todas as requisições e espera elas terminarem
    try {
      await Promise.all(promises);
      console.log("Ordem dos eventos salva com sucesso.");
      
      this.setState({ loading: false });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar ordem dos eventos: ", error);
      this.setState({ loading: false });
    }
  };

  salvarEvento = async () => {
    this.setState({ ...util.cleanStates(this.state) });

    await this.setState({
      dadosFinaisSol: [
        {
          titulo: "Data",
          valor: util.formatForLogs(this.state.eventoData, "date"),
        },
        {
          titulo: "Fornecedor",
          valor: util.formatForLogs(
            this.state.eventoFornecedor,
            "options",
            "",
            "",
            this.state.fornecedoresOptions
          ),
        },
        {
          titulo: "Taxa",
          valor: util.formatForLogs(
            this.state.eventoTaxa,
            "options",
            "",
            "",
            this.state.taxasOptions
          ),
        },
        {
          titulo: "Moeda",
          valor: util.formatForLogs(
            this.state.eventoMoeda,
            "options",
            "",
            "",
            this.state.moedasOptions
          ),
        },
        {
          titulo: "Valor unitário",
          valor: util.formatForLogs(this.state.eventoValor, "money", "0,00"),
        },
        {
          titulo: "VCP",
          valor: util.formatForLogs(this.state.eventoVlrc, "money", "0,00"),
        },
        {
          titulo: "Repasse",
          valor: util.formatForLogs(this.state.eventoRepasse, "bool"),
        },
        {
          titulo: "Descrição",
          valor: util.formatForLogs(this.state.eventoDescricao),
        },
        {
          titulo: "Tipo",
          valor: util.formatForLogs(
            this.state.eventoTipo,
            "options",
            "",
            "",
            this.state.tiposSubOptions
          ),
        },
        { titulo: "Ordem", valor: util.formatForLogs(this.state.eventoOrdem) },
        {
          titulo: "Remarks",
          valor: util.formatForLogs(this.state.eventoRemarks),
        },
        {
          titulo: "Fornecedor Custeio",
          valor: util.formatForLogs(
            this.state.eventoFornecedorCusteio,
            "options",
            "",
            "",
            this.state.fornecedoresOptions
          ),
        },
        {
          titulo: "Quantidade",
          valor: util.formatForLogs(this.state.eventoQntd),
        },
      ],
      loading: true,
    });

    if (parseInt(this.state.eventoChave) === 0) {
      if (this.state.eventoRepasse == "1") {
        console.log("repasse = 1");
        this.setState({ eventoFornecedorCusteio: 0 });
      }
      await apiEmployee
        .post(`insertServicoItemBasico.php`, {
          token: true,
          values: `'${this.state.chave}', '${this.state.eventoData}', '${this.state.eventoFornecedor}', '${this.state.eventoTaxa}', '${this.state.eventoDescricao}', '${this.state.eventoTipo}', '${this.state.eventoFornecedorCusteio}', '${this.state.eventoRemarks}', '${this.state.eventoMoeda}', '${parseFloat(
            this.state.eventoValor == ""
              ? 0
              : this.state.eventoValor.replaceAll(".", "").replaceAll(",", ".")
          )}', '${parseFloat(
            this.state.eventoVlrc == ""
              ? 0
              : this.state.eventoVlrc.replaceAll(".", "").replaceAll(",", ".")
          )}', '${
            this.state.eventoRepasse && this.state.eventoRepasse != "0" ? 1 : 0
          }', '${this.state.eventoQntd}'`,
          chave_os: this.state.chave,
          ordem: this.state.eventoOrdem.replaceAll(",", "."),
        })
        .then(
          async (res) => {
            await loader.salvaLogs(
              "os_servicos_itens",
              this.state.usuarioLogado.codigo,
              null,
              "Inclusão",
              res.data[0].chave
            );

            window.location.reload();
          },
          async (res) => await console.log(`Erro: ${res.data}`)
        );
    } else {
      if (this.state.eventoRepasse == "1") {
        console.log("repasse = 1");
        this.setState({ eventoFornecedorCusteio: 0 });
      }
      await apiEmployee
        .post(`updateServicoItem.php`, {
          token: true,
          chave: this.state.eventoChave,
          chave_os: this.state.chave,
          data: this.state.eventoData,
          Moeda: this.state.eventoMoeda,
          valor: parseFloat(
            this.state.eventoValor == ""
              ? 0
              : this.state.eventoValor.replaceAll(".", "").replaceAll(",", ".")
          ),
          valor1: parseFloat(
            this.state.eventoVlrc.replaceAll(".", "").replaceAll(",", ".")
          ),
          repasse:
            this.state.eventoRepasse && this.state.eventoRepasse != "0" ? 1 : 0,
          fornecedor: this.state.eventoFornecedor,
          taxa: this.state.eventoTaxa,
          descricao: this.state.eventoDescricao,
          ordem: this.state.eventoOrdem.replaceAll(",", "."),
          tipo_sub: this.state.eventoTipo,
          Fornecedor_Custeio: this.state.eventoFornecedorCusteio,
          remarks: this.state.eventoRemarks,
          qntd: this.state.eventoQntd,
        })
        .then(
          async (res) => {
            if (res.data[0]) {
              await loader.salvaLogs(
                "os_servicos_itens",
                this.state.usuarioLogado.codigo,
                this.state.dadosIniciaisSol,
                this.state.dadosFinaisSol,
                this.state.eventoChave,
                `EVENTO: ${this.state.descricao}`
              );

              window.location.reload();
            } else {
              await alert(`Erro ${JSON.stringify(res)}`);
            }
          },
          async (res) => await console.log(`Erro: ${res}`)
        );
    }

    await this.setState({ modalItemAberto: false });
  };

  getCamposVoucher = async () => {
    const camposOS = await loader.getBody("getCamposOS.php", {
      token: true,
      chave_os: this.state.chave,
    });

    this.setState({
      camposOS,
      modalCamposOS: true,
    });
  };

  RetornaParaOrcamento = async (reload = false) => {
    await apiEmployee
      .post(`retornaParaOrcamento.php`, {
        token: true,
        Chave: this.state.chave,
      })
      .then(
        async (res) => {
          if (res.data === true) {
            if (reload) {
              await this.setState({ redirectReturnOrcamento: reload });
              window.location.reload();
            }
          } else {
            await alert(`Erro ${JSON.stringify(res)}`);
          }
        },
        async (res) => await console.log(`Erro: ${res}`)
      );
    console.log("oi");
  };

  handleExportWithComponent = (event) => {
    this.pdfExportComponent.current.save();
    this.setState({ loading: false });
  };

  openLogs = async () => {
    let logs = await loader.getLogsOS(
      this.state.chave,
      this.state.todosEventos.map((e) => e.chave)
    );

    logs = logs.map((e) => {
      if (
        e.Tabela == "os" &&
        (e.Campos.includes("Inclusão") || e.Campos.includes("Cancelamento"))
      ) {
        return { ...e, Campos: `Solicitação de Serviço: ${e.Campos}` };
      } else {
        return { ...e };
      }
    });

    await this.setState({ logs, modalLog: true });
  };

  DesabilitaRetroceder() {
    const {encerramento} = this.state;
    if (encerramento && encerramento !== 'T.B.I.') {
        return true;
    }
    else return false;
  }

  validateDates() {
    const { encerramento, faturamento, envio } = this.state;

    // Se todas as datas forem vazias, permitimos salvar
    if (!encerramento && !faturamento && !envio) {
        return true;
    }

    // Verifica se as datas são válidas ou "T.B.I."
    const encerramentoDate = encerramento && encerramento !== 'T.B.I.' ? new Date(encerramento) : null;
    const faturamentoDate = faturamento && faturamento !== 'T.B.I.' ? new Date(faturamento) : null;
    const envioDate = envio && envio !== 'T.B.I.' ? new Date(envio) : null;

    const isEncerramentoValid = !encerramento || encerramento === 'T.B.I.' || !isNaN(encerramentoDate.getTime());
    const isFaturamentoValid = !faturamento || faturamento === 'T.B.I.' || !isNaN(faturamentoDate.getTime());
    const isEnvioValid = !envio || envio === 'T.B.I.' || !isNaN(envioDate.getTime());

    // Validar que todas as datas sejam válidas ou 'T.B.I.'
    if (!isEncerramentoValid || !isFaturamentoValid || !isEnvioValid) {
        return false;
    }

    // Se não houver data de encerramento, faturamento não deve ser permitido
    if (!encerramento || encerramento === 'T.B.I.') {
        if (faturamento && faturamento !== 'T.B.I.') {
            return false;  // Faturamento não deve ser permitido sem data de encerramento
        }
        if (envio && envio !== 'T.B.I.') {
            return false;  // Envio não deve ser permitido sem data de encerramento
        }
    }

    // Se não houver data de faturamento, envio não deve ser permitido
    if (!faturamento || faturamento === 'T.B.I.') {
      if (envio && envio !== 'T.B.I.') {
          return false;  // Envio não deve ser permitido sem data de faturamento
      }
  }

  // Se a data de encerramento não for 'T.B.I.', faturamento deve ser após encerramento
  if (encerramento && encerramento !== 'T.B.I.') {
      if (faturamento && faturamento !== 'T.B.I.' && faturamentoDate < encerramentoDate) {
          return false;  // Faturamento deve ser após encerramento
      }
      if (envio && envio !== 'T.B.I.' && envioDate < (faturamento ? faturamentoDate : encerramentoDate)) {
          return false;  // Envio deve ser após faturamento ou encerramento se faturamento não estiver definido
      }
  }

    // Se a data de faturamento não for 'T.B.I.', envio deve ser após faturamento
    if (faturamento && faturamento !== 'T.B.I.') {
        if (envio && envio !== 'T.B.I.' && envioDate < faturamentoDate) {
            return false;  // Envio deve ser após faturamento
        }
    }

    return true;
}

  render() {
    const validations = [];
    validations.push(this.state.abertura);  
    validations.push(this.state.chegada);
    validations.push(this.state.cliente);
    validations.push(this.state.navio);
    validations.push(this.state.operador);
    validations.push(this.state.tipoServico);
    validations.push(this.state.empresa);
    validations.push(
      this.state.roe && this.state.roe == parseFloat(this.state.roe)
    );
    validations.push(!this.state.bloqueado);

    const validDateCheck = this.validateDates();

    const validForm = validations.reduce((t, a) => t && a) && validDateCheck;

    const validationsContabiliza = [];
    validationsContabiliza.push(this.state.meioPagamento);
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        this.state.codigoReceita
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        this.state.contribuinte
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        this.state.codigoIdentificadorTributo
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        this.state.mesCompetNumRef
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        this.state.dataApuracao
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        (this.state.darfValor &&
          this.state.darfValor.replaceAll(".", "").replaceAll(",", ".") ==
            parseFloat(
              this.state.darfValor.replaceAll(".", "").replaceAll(",", ".")
            ))
    );
    validationsContabiliza.push(
      (this.state.meioPagamentoNome != "DARF" &&
        this.state.meioPagamentoNome != "GPS") ||
        (this.state.darfPagamento &&
          this.state.darfPagamento.replaceAll(".", "").replaceAll(",", ".") ==
            parseFloat(
              this.state.darfPagamento.replaceAll(".", "").replaceAll(",", ".")
            ))
    );
    validationsContabiliza.push(!this.state.bloqueadoContabiliza);

    //const validFormContabiliza = validationsContabiliza.reduce((t, a) => t && a)
    const validFormContabiliza = true;

    const validationsEvento = [];
    validationsEvento.push(this.state.eventoData);
    validationsEvento.push(
      this.state.eventoTaxa ||
        this.state.eventoTipo == 2 ||
        this.state.eventoTipo == 3
    );
    validationsEvento.push(
      this.state.eventoFornecedor ||
        this.state.eventoTipo == 1 ||
        this.state.eventoTipo == 2 ||
        this.state.eventoTipo == 3
    );
    validationsEvento.push(
      this.state.eventoFornecedorCusteio || this.state.eventoTipo != 1
    );
    validationsEvento.push(
      this.state.eventoValor &&
        !isNaN(this.state.eventoValor.replaceAll(".", "").replaceAll(",", "."))
    );
    validationsEvento.push(
      (this.state.eventoRepasse == 0 && !this.state.eventoVlrc) ||
        (this.state.eventoVlrc.replaceAll(".", "").replaceAll(",", ".") ==
          parseFloat(
            this.state.eventoVlrc.replaceAll(".", "").replaceAll(",", ".")
          ) &&
          (this.state.eventoRepasse == 0 ||
            this.state.eventoVlrc == this.state.eventoValor))
    );
    validationsEvento.push(this.state.eventoDescricao);
    validationsEvento.push(
      this.state.eventoOrdem &&
        this.state.eventoOrdem.replaceAll(",", ".") ==
          parseFloat(this.state.eventoOrdem.replaceAll(",", "."))
    );

    const validFormEvento = validationsEvento.reduce((a, b) => a && b);
    return (
      <div className="allContent">
        <div
          style={{
            position: "absolute",
            left: "-900000px",
            top: 0,
          }}
        >
          <PDFExport
            fileName={this.state.pdfNome}
            scale={0.6}
            landscape={false}
            className={"pdfExp"}
            paperSize="A4"
            margin="0.5cm"
            forcePageBreak=".page-break"
            ref={this.pdfExportComponent}
          >
            {this.state.pdfgerado}
          </PDFExport>
        </div>

        {this.state.loading && <Skeleton />}

        {this.state.redirect && <Redirect to={"/"} />}

        {this.state.recarregaPagina && (
          <>
            <Redirect
              to={{
                pathname: `/ordensservico/addos/${this.state.chave}`,
                state: {
                  ...this.props.location.state,
                  os: { ...this.state.os },
                },
              }}
            />
            {window.location.reload()}
          </>
        )}
        {this.state.redirectAfterInsertEventsInOs && (
                  <>
                    <Redirect
                      to={{
                        pathname: `/ordensservico/addos/${this.state.os_escolhida.value}`,
                      }}
                    />
                  </>
        )}
        {this.state.redirectReturnOrcamento && (
          <>
          <Redirect
            to={{
              pathname: `/ordensservico/addOsOrcamento/${this.state.chave}`,
              state: {
                ...this.props.location.state,
                os: { ...this.state.os },
              },
            }}
          />
          {window.location.reload()}
        </>
        )}
        {this.state.redirectEventos && (
          <>
            <Redirect
              to={{
                pathname: `/ordensservico/addevento/${this.state.eventofeed.chave}`,
                state: {
                  evento: { ...this.state.eventofeed },
                  os: { ...this.state.os },
                },
              }}
            />
          </>
        )}

        {!this.state.loading && (
          <>
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
              open={this.state.documentoModal}
              onClose={async () =>
                await this.setState({ documentoModal: false })
              }
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({
                          documentoModal: false,
                          documentoTrocar: true,
                        })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="tituloModal">
                      <span>Enviar documento:</span>
                    </div>

                    <div className="modalForm">
                      <Formik
                        initialValues={{
                          name: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          await this.enviaDocumento();
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                              <div className="row addservicos">
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Descrição:</label>
                                </div>
                                <div className="col-1 errorMessage"></div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    type="text"
                                    value={this.state.documentoDescricao}
                                    onChange={async (e) => {
                                      this.setState({
                                        documentoDescricao:
                                          e.currentTarget.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Tipo:</label>
                                </div>
                                <div className="col-1 errorMessage"></div>
                                <div
                                  className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10"
                                  style={
                                    this.state.tiposDocumentoOptions.length > 75
                                      ? { marginBottom: 10 }
                                      : {}
                                  }
                                >
                                  <Select
                                    className="SearchSelect"
                                    options={this.state.tiposDocumentoOptions
                                      .filter((e) =>
                                        this.filterSearch(
                                          e,
                                          this.state.tiposDocumentoOptionsTexto
                                        )
                                      )
                                      .slice(0, 75)}
                                    onInputChange={(e) => {
                                      this.setState({
                                        tiposDocumentoOptionsTexto: e,
                                      });
                                    }}
                                    value={
                                      this.state.tiposDocumentoOptions.filter(
                                        (option) =>
                                          option.value ==
                                          this.state.documentoTipo
                                      )[0]
                                    }
                                    search={true}
                                    onChange={(e) => {
                                      this.setState({ documentoTipo: e.value });
                                    }}
                                  />
                                  {this.state.tiposDocumentoOptions.length >
                                    75 && (
                                    <span
                                      style={{
                                        color: "red",
                                        whiteSpace: "nowrap",
                                        fontSize: "0.8em",
                                      }}
                                    >
                                      Limite de 75 tipos atingido. Os tipos
                                      ocultos devem ser pesquisados
                                    </span>
                                  )}
                                </div>
                                {this.state.documentoEditar && (
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Trocar documento?</label>
                                  </div>
                                )}
                                {this.state.documentoEditar && (
                                  <div className="col-1"></div>
                                )}
                                {this.state.documentoEditar && (
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <input
                                      className="form_control"
                                      checked={this.state.documentoTrocar}
                                      onChange={(e) => {
                                        this.setState({
                                          documentoTrocar: e.target.checked,
                                        });
                                      }}
                                      type="checkbox"
                                    />
                                  </div>
                                )}
                                {this.state.documentoTrocar && (
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Arquivo:</label>
                                  </div>
                                )}
                                {this.state.documentoTrocar && (
                                  <div className="col-1 errorMessage"></div>
                                )}
                                {this.state.documentoTrocar && (
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <Field
                                      className="form-control"
                                      type="file"
                                      value={this.state.documentoNome}
                                      onChange={async (e) => {
                                        this.setState({
                                          documento: e.currentTarget.files,
                                          documentoNome: e.currentTarget.value,
                                        });
                                      }}
                                    />
                                  </div>
                                )}
                                {this.state.documentoTrocar && (
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
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <button type="submit" style={{ width: 300 }}>
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
              open={this.state.agrupadorModal}
              onClose={async () =>
                await this.setState({ agrupadorModal: false })
              }
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({ agrupadorModal: false })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="modalForm" style={{ width: "95%" }}>
                      <Formik
                        initialValues={{
                          name: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          await this.setState({ agrupadorModal: false });

                          if (this.state.agrupadorTipo == "CUSTEIO") {
                            await this.agruparEventos();
                          } else if (this.state.agrupadorTipo == "INVOICE") {
                            await this.Invoices(validForm);
                          }
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                              <div className="row addservicos">
                                <div className="col-12">
                                  <h4 className="text-center white">
                                    Eventos:
                                  </h4>
                                </div>
                                <h3 className="text-center white">
                                  Selecionados
                                </h3>
                                {this.state.agrupadorEventos[0] && (
                                  <div className="agrupador_eventos_selecionados">
                                    <table className="agrupador_lista">
                                      <tr>
                                        <th className="text-center">
                                          <span>Chave</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Tipo</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Ordem</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Descrição</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Valor (R$)</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Valor (USD)</span>
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{
                                            width: 20,
                                            height: 20,
                                            padding: 5,
                                          }}
                                        ></th>
                                      </tr>
                                      {this.state.eventos[0] != undefined &&
                                        this.state.eventos
                                          .filter((feed) =>
                                            this.state.agrupadorEventos.includes(
                                              feed.chave
                                            )
                                          )
                                          .map((feed, index) => (
                                            <>
                                              {window.innerWidth < 500 && (
                                                <tr
                                                  onClick={() => {
                                                    if (
                                                      this.state
                                                        .agrupadorTipo ==
                                                        "INVOICE" &&
                                                      this.state
                                                        .grupoSelecionado != 0
                                                    ) {
                                                      this.setState({
                                                        grupoSelecionado: "",
                                                        agrupadorEventos: [],
                                                      });
                                                    }
                                                    this.setState({
                                                      agrupadorEventos:
                                                        this.state.agrupadorEventos.filter(
                                                          (e) => e != feed.chave
                                                        ),
                                                    });
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="checkbox"
                                                      checked={true}
                                                    />
                                                  </td>
                                                </tr>
                                              )}
                                              {window.innerWidth >= 500 && (
                                                <tr
                                                  onClick={() => {
                                                    if (
                                                      this.state
                                                        .agrupadorTipo ==
                                                        "INVOICE" &&
                                                      this.state
                                                        .grupoSelecionado != 0
                                                    ) {
                                                      this.setState({
                                                        grupoSelecionado: "",
                                                        agrupadorEventos: [],
                                                      });
                                                    }
                                                    this.setState({
                                                      agrupadorEventos:
                                                        this.state.agrupadorEventos.filter(
                                                          (e) => e != feed.chave
                                                        ),
                                                    });
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {
                                                        this.state
                                                          .tiposServicosItens[
                                                          feed.tipo_sub
                                                        ]
                                                      }
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>{feed.descricao}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="checkbox"
                                                      checked={true}
                                                    />
                                                  </td>
                                                </tr>
                                              )}
                                            </>
                                          ))}
                                    </table>
                                  </div>
                                )}
                                {!this.state.agrupadorEventos[0] && (
                                  <h4 className="text-center">Nenhum</h4>
                                )}
                                <br />
                                <br />
                                <br />
                                <h3 className="text-center white">Eventos</h3>
                                {this.state.eventos
                                  .filter(
                                    (feed) =>
                                      !this.state.agrupadorEventos.includes(
                                        feed.chave
                                      )
                                  )
                                  .find(this.filterAgrupador) && (
                                  <div className="agrupador_eventos">
                                    <table className="agrupador_lista">
                                      <tr>
                                        <th className="text-center">
                                          <span>Chave</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Tipo</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Ordem</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Descrição</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Valor (USD)</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Valor (R$)</span>
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{
                                            width: 20,
                                            height: 20,
                                            padding: 5,
                                          }}
                                        ></th>
                                      </tr>
                                      {this.state.eventos[0] != undefined &&
                                        this.state.eventos
                                          .filter(
                                            (feed) =>
                                              !this.state.agrupadorEventos.includes(
                                                feed.chave
                                              )
                                          )
                                          .filter(this.filterAgrupador)
                                          .map((feed, index) => (
                                            <>
                                              {window.innerWidth < 500 && (
                                                <tr
                                                  onClick={() => {
                                                    if (
                                                      this.state
                                                        .agrupadorTipo ===
                                                        "INVOICE" &&
                                                      this.state
                                                        .agrupadorEventos
                                                        .length == 0 &&
                                                      this.state.invoices_groups.find(
                                                        (e) =>
                                                          e.evento
                                                            .split(",")
                                                            .find(
                                                              (ev) =>
                                                                ev?.trim() ==
                                                                feed.chave
                                                            )
                                                      )
                                                    ) {
                                                      this.setState({
                                                        grupoSelecionado:
                                                          this.state.invoices_groups.find(
                                                            (e) =>
                                                              e.evento
                                                                .split(",")
                                                                .find(
                                                                  (ev) =>
                                                                    ev?.trim() ==
                                                                    feed.chave
                                                                )
                                                          )?.chave_grupo,
                                                        agrupadorEventos:
                                                          this.state.invoices_groups
                                                            .find((e) =>
                                                              e.evento
                                                                .split(",")
                                                                .find(
                                                                  (ev) =>
                                                                    ev?.trim() ==
                                                                    feed.chave
                                                                )
                                                            )
                                                            ?.evento?.split(
                                                              ","
                                                            ),
                                                      });
                                                    } else {
                                                      this.setState({
                                                        agrupadorEventos: [
                                                          ...this.state
                                                            .agrupadorEventos,
                                                          feed.chave,
                                                        ],
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="checkbox"
                                                      checked={false}
                                                    />
                                                  </td>
                                                </tr>
                                              )}
                                              {window.innerWidth >= 500 && (
                                                <tr
                                                  onClick={() => {
                                                    if (
                                                      this.state
                                                        .agrupadorTipo ===
                                                        "INVOICE" &&
                                                      this.state
                                                        .agrupadorEventos
                                                        .length == 0 &&
                                                      this.state.invoices_groups.find(
                                                        (e) =>
                                                          e.evento
                                                            .split(",")
                                                            .find(
                                                              (ev) =>
                                                                ev?.trim() ==
                                                                feed.chave
                                                            )
                                                      )
                                                    ) {
                                                      this.setState({
                                                        grupoSelecionado:
                                                          this.state.invoices_groups.find(
                                                            (e) =>
                                                              e.evento
                                                                .split(",")
                                                                .find(
                                                                  (ev) =>
                                                                    ev?.trim() ==
                                                                    feed.chave
                                                                )
                                                          )?.chave_grupo,
                                                        agrupadorEventos:
                                                          this.state.invoices_groups
                                                            .find((e) =>
                                                              e.evento
                                                                .split(",")
                                                                .find(
                                                                  (ev) =>
                                                                    ev?.trim() ==
                                                                    feed.chave
                                                                )
                                                            )
                                                            ?.evento?.split(
                                                              ","
                                                            ),
                                                      });
                                                    } else {
                                                      this.setState({
                                                        agrupadorEventos: [
                                                          ...this.state
                                                            .agrupadorEventos,
                                                          feed.chave,
                                                        ],
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {
                                                        this.state
                                                          .tiposServicosItens[
                                                          feed.tipo_sub
                                                        ]
                                                      }
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>{feed.descricao}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="checkbox"
                                                      checked={false}
                                                    />
                                                  </td>
                                                </tr>
                                              )}
                                            </>
                                          ))}
                                    </table>
                                  </div>
                                )}
                                {!this.state.eventos
                                  .filter(
                                    (feed) =>
                                      !this.state.agrupadorEventos.includes(
                                        feed.chave
                                      )
                                  )
                                  .find(this.filterAgrupador) && (
                                  <h4 className="text-center">
                                    Nenhum disponível
                                  </h4>
                                )}
                              </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                          </div>

                          {this.state.agrupadorEventos[0] && (
                            <div className="row">
                              <div className="col-2"></div>
                              {(this.state.grupoSelecionado == 0 ||
                                this.state.agrupadorTipo == "INVOICE") && (
                                <div
                                  className="col-8"
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <button type="submit" style={{ width: 300 }}>
                                    Salvar
                                  </button>
                                </div>
                              )}
                              {this.state.grupoSelecionado != 0 &&
                                this.state.agrupadorTipo == "CUSTEIO" && (
                                  <>
                                    <div
                                      className="col-4"
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <button
                                        type="submit"
                                        style={{ width: 300 }}
                                      >
                                        Salvar
                                      </button>
                                    </div>
                                    <div
                                      className="col-4"
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <button
                                        type="submit"
                                        onClick={() =>
                                          this.abrirContabilizacao(
                                            this.state.grupoSelecionado
                                          )
                                        }
                                        style={{ width: 300 }}
                                      >
                                        Contabilizar
                                      </button>
                                    </div>
                                  </>
                                )}
                              <div className="col-2"></div>
                            </div>
                          )}
                        </Form>
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

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
              open={this.state.templatesModal}
              onClose={async () =>
                await this.setState({ templatesModal: false })
              }
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({ templatesModal: false })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="modalForm" style={{ width: "95%" }}>
                      <Formik
                        initialValues={{
                          name: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          await this.setState({ templatesModal: false });
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                              <div className="row addservicos">
                                <div className="col-12">
                                  <h4 className="text-center white">
                                    Templates:
                                  </h4>
                                </div>
                                {this.state.templates[0] && (
                                  <div className="agrupador_eventos_selecionados">
                                    <table className="agrupador_lista">
                                      <tr>
                                        <th className="text-center">
                                          <span>Chave</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Tipo</span>
                                          </th>
                                        )}
                                        <th className="text-center ordem-column">
                                          <span>Ordem</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center desc-column">
                                            <span>Descrição</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Valor (R$)</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Valor (USD)</span>
                                        </th>
                                      </tr>
                                      {this.state.templates[0] != undefined &&
                                        this.state.templates
                                          .filter(
                                            (feed) => /*this.filterTemplate*/ {
                                              return true;
                                            }
                                          )
                                          .map((feed, index) => (
                                            <>
                                              {window.innerWidth < 500 && (
                                                <tr
                                                  onClick={() => {
                                                    this.setItemEdit(
                                                      feed,
                                                      true
                                                    );
                                                    this.setState({
                                                      templatesModal: false,
                                                    });
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                </tr>
                                              )}
                                              {window.innerWidth >= 500 && (
                                                <tr
                                                  onClick={() => {
                                                    this.setItemEdit(
                                                      feed,
                                                      true
                                                    );
                                                    this.setState({
                                                      templatesModal: false,
                                                    });
                                                  }}
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {
                                                        this.state
                                                          .tiposServicosItens[
                                                          feed.tipo_sub
                                                        ]
                                                      }
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>{feed.descricao}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                </tr>
                                              )}
                                            </>
                                          ))}
                                    </table>
                                  </div>
                                )}
                                {!this.state.templates[0] && (
                                  <h4 className="text-center">Nenhum</h4>
                                )}
                              </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                          </div>
                        </Form>
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

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
              open={this.state.gruposTemplatesModal}
              onClose={async () => await this.setState({ gruposTemplatesModal: false })}
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () => await this.setState({ gruposTemplatesModal: false })}
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="modalForm" style={{ width: "95%" }}>
                      <Formik
                        initialValues={{
                          name: "",
                          search: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          await this.criarGrupoTemplates(validForm);
                          await this.setState({ gruposTemplatesModal: false });
                        }}
                      >
                        {({ values, handleChange }) => (
                          <Form className="contact-form">
                            <div className="row">
                              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                <div className="row addservicos">
                                  <div className="col-12">
                                    <h4 className="text-center white">Grupos de Templates:</h4>
                                  </div>
                                  <div className="col-12 mb-3">
                                    <input
                                      type="text"
                                      name="search"
                                      className="form-control"
                                      placeholder="Pesquisar templates..."
                                      value={values.search}
                                      onChange={handleChange}
                                    />
                                  </div>
                                  {this.state.gruposTemplates[0] && (
                                    <div className="agrupador_eventos_selecionados">
                                      <table className="agrupador_lista">
                                        <tr>
                                          <th className="text-center px-4">
                                            <span>Chave</span>
                                          </th>
                                          <th className="text-center px-4">
                                            <span>Nome</span>
                                          </th>
                                          <th className="text-center px-4">
                                            <span>Porto</span>
                                          </th>
                                        </tr>
                                        {this.state.gruposTemplates[0] != undefined &&
                                          this.state.gruposTemplates
                                            .filter((feed) => {
                                              const searchTerm = values.search.toLowerCase();
                                              return (
                                                (feed.porto || "")
                                                  .toLowerCase()
                                                  .includes(searchTerm) ||
                                                feed.nome
                                                  .toLowerCase()
                                                  .includes(searchTerm) ||
                                                feed.chave
                                                  .toLowerCase()
                                                  .includes(searchTerm)
                                              );
                                            })
                                            .map((feed, index) => (
                                              <tr
                                                onClick={() => {
                                                  if (
                                                    this.state.grupoTemplate &&
                                                    this.state.grupoTemplate.chave != feed.chave
                                                  ) {
                                                    this.setState({ grupoTemplate: feed });
                                                  } else {
                                                    this.setState({ grupoTemplate: {} });
                                                  }
                                                }}
                                                style={{
                                                  filter:
                                                    feed.chave == this.state.grupoTemplate.chave
                                                      ? "brightness(0.5)"
                                                      : undefined,
                                                }}
                                              >
                                                <td className="text-center px-4">
                                                  <p>{feed.chave}</p>
                                                </td>
                                                <td className="text-center px-4">
                                                  <p>{feed.nome}</p>
                                                </td>
                                                <td className="text-center px-4">
                                                  <p>{feed.porto || "-"}</p>
                                                </td>
                                              </tr>
                                            ))}
                                      </table>
                                    </div>
                                  )}
                                  {!this.state.gruposTemplates[0] && (
                                    <h4 className="text-center">Nenhum</h4>
                                  )}
                                </div>
                              </div>
                              {this.state.grupoTemplate && (
                                <div className="row">
                                  <div className="col-2"></div>
                                  <div
                                    className="col-8"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      disabled={!this.state.grupoTemplate?.chave || !validForm}
                                      style={{ width: 300 }}
                                    >
                                      Salvar
                                    </button>
                                  </div>
                                  <div className="col-2"></div>
                                </div>
                              )}
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

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
              open={this.state.cabecalhoModal}
              onClose={async () => {
                await this.setState({ cabecalhoModal: false });
                await this.salvarCabecalho();
              }}
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({ cabecalhoModal: false })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="tituloModal">
                      <span>Cabeçalho:</span>
                    </div>

                    <div className="modalForm">
                      <Formik
                        initialValues={{
                          name: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          await this.salvarCabecalho();
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                              <div className="row addservicos">
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Company:</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {(this.state.company.indexOf('"') != -1 ||
                                    this.state.company.indexOf("'") != -1) && (
                                    <FontAwesomeIcon
                                      title="Aspas duplas e únicas não são permitidas"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    as={"textarea"}
                                    rows="3"
                                    value={this.state.company}
                                    onChange={async (e) => {
                                      this.setState({
                                        company: e.currentTarget.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Address:</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {(this.state.address.indexOf('"') != -1 ||
                                    this.state.address.indexOf("'") != -1) && (
                                    <FontAwesomeIcon
                                      title="Preencha o campo"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    as={"textarea"}
                                    rows="3"
                                    value={this.state.address}
                                    onChange={async (e) => {
                                      this.setState({
                                        address: e.currentTarget.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>C/O:</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {(this.state.CO.indexOf('"') != -1 ||
                                    this.state.CO.indexOf("'") != -1) && (
                                    <FontAwesomeIcon
                                      title="Preencha o campo"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    as={"textarea"}
                                    rows="3"
                                    value={this.state.CO}
                                    onChange={async (e) => {
                                      this.setState({
                                        CO: e.currentTarget.value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                          </div>

                          <div className="row">
                            <div className="col-2"></div>
                            <div
                              className="col-8"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                type="submit"
                                disabled={
                                  this.state.company.indexOf('"') != -1 ||
                                  this.state.company.indexOf("'") != -1 ||
                                  this.state.address.indexOf("'") != -1 ||
                                  this.state.address.indexOf('"') != -1
                                }
                                style={{ width: 300 }}
                              >
                                Salvar
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
              open={this.state.contabiliza}
              onClose={async () =>
                await this.setState({
                  contabiliza: false,
                  bloqueado: false,
                  bloqueadoContabiliza: false,
                })
              }
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({
                          contabiliza: false,
                          bloqueado: false,
                          bloqueadoContabiliza: false,
                        })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="tituloPagesModal">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          this.state.paginaContabiliza != 0
                            ? this.setState({
                                paginaContabiliza:
                                  this.state.paginaContabiliza - 1,
                              })
                            : {}
                        }
                      >
                        <FontAwesomeIcon
                          icon={faChevronLeft}
                          color={
                            this.state.paginaContabiliza == 0
                              ? "#CFCFCF"
                              : "#8a8a8a"
                          }
                        />
                      </span>
                      <span>
                        {
                          this.state.eventosContabilizando[
                            this.state.paginaContabiliza
                          ]?.descricao
                        }
                      </span>
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          this.state.paginaContabiliza !=
                          this.state.eventosContabilizando.length - 1
                            ? this.setState({
                                paginaContabiliza:
                                  this.state.paginaContabiliza + 1,
                              })
                            : {}
                        }
                      >
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          color={
                            this.state.paginaContabiliza >=
                            this.state.eventosContabilizando.length - 1
                              ? "#CFCFCF"
                              : "#8a8a8a"
                          }
                        />
                      </span>
                    </div>

                    <div className="modalForm">
                      <Formik
                        initialValues={{
                          name: "",
                        }}
                        onSubmit={async (values) => {
                          await new Promise((r) => setTimeout(r, 1000));
                          this.salvarConta(validFormContabiliza);
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                              <div className="row addservicos">
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Histórico Padrão</label>
                                </div>
                                <div className="col-1"></div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Select
                                    className="SearchSelect"
                                    options={this.state.historicosOptions
                                      .filter((e) =>
                                        this.filterSearch(
                                          e,
                                          this.state.optionsTexto
                                        )
                                      )
                                      .slice(0, 20)}
                                    onInputChange={(e) => {
                                      this.setState({
                                        historicosOptionsTexto: e,
                                      });
                                    }}
                                    value={
                                      this.state.historicosOptions.filter(
                                        (option) =>
                                          option.chave ==
                                          this.state.historicoPadrao
                                      )[0]
                                    }
                                    search={true}
                                    onChange={(e) => {
                                      this.setState({
                                        historico: this.state.historico.map(
                                          (h, index) =>
                                            index ==
                                              this.state.paginaContabiliza || !h
                                              ? e.label
                                              : h
                                        ),
                                        historicoPadrao:
                                          this.state.historicoPadrao.map(
                                            (h, index) =>
                                              index ==
                                                this.state.paginaContabiliza ||
                                              !h
                                                ? e.chave
                                                : h
                                          ),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Histórico</label>
                                </div>
                                <div className="col-1 errorMessage"></div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    type="text"
                                    value={
                                      this.state.historico[
                                        this.state.paginaContabiliza
                                      ]
                                    }
                                    onChange={async (e) => {
                                      this.setState({
                                        historico: this.state.historico.map(
                                          (h, index) =>
                                            index ==
                                            this.state.paginaContabiliza
                                              ? e.currentTarget.value
                                              : h
                                        ),
                                      });
                                    }}
                                    onBlur={async (e) => {
                                      this.setState({
                                        historico: this.state.historico.map(
                                          (h) =>
                                            !h ? e.currentTarget.value : h
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Cód. Barras</label>
                                </div>
                                <div className="col-1 errorMessage"></div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Field
                                    className="form-control"
                                    type="text"
                                    value={
                                      this.state.codBarras[
                                        this.state.paginaContabiliza
                                      ]
                                    }
                                    onChange={async (e) => {
                                      this.setState({
                                        codBarras: this.state.codBarras.map(
                                          (c, index) =>
                                            index ==
                                            this.state.paginaContabiliza
                                              ? e.currentTarget.value
                                              : c
                                        ),
                                      });
                                    }}
                                    onBlur={async (e) => {
                                      this.setState({
                                        codBarras: this.state.codBarras.map(
                                          (c) =>
                                            !c ? e.currentTarget.value : c
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Conta Débito</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {!this.state.contaDebito[
                                    this.state.paginaContabiliza
                                  ] && (
                                    <FontAwesomeIcon
                                      title="Preencha o campo"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Select
                                    className="SearchSelect"
                                    isDisabled={
                                      !(
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.tipo_sub == 0 &&
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.repasse
                                      )
                                    }
                                    options={this.state.planosContasOptions
                                      .filter((e) =>
                                        this.filterSearch(
                                          e,
                                          this.state.optionsTexto
                                        )
                                      )
                                      .slice(0, 20)}
                                    onInputChange={(e) => {
                                      this.setState({ optionsTexto: e });
                                    }}
                                    value={
                                      this.state.planosContasOptions.filter(
                                        (option) =>
                                          option.value ==
                                          this.state.contaDebito[
                                            this.state.paginaContabiliza
                                          ]
                                      )[0]
                                    }
                                    search={true}
                                    onChange={(e) => {
                                      if (
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.tipo_sub == 0 &&
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.repasse
                                      ) {
                                        this.setState({
                                          contaDebito:
                                            this.state.contaDebito.map(
                                              (c, index) =>
                                                index ==
                                                  this.state
                                                    .paginaContabiliza || !c
                                                  ? e.value
                                                  : c
                                            ),
                                        });
                                      }
                                    }}
                                  />
                                </div>{" "}
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Conta Crédito</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {!this.state.contaCredito[
                                    this.state.paginaContabiliza
                                  ] && (
                                    <FontAwesomeIcon
                                      title="Preencha o campo"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Select
                                    className="SearchSelect"
                                    isDisabled={
                                      !(
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.tipo_sub == "0" &&
                                        !this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.repasse
                                      )
                                    }
                                    options={this.state.planosContasOptions
                                      .filter((e) =>
                                        this.filterSearch(
                                          e,
                                          this.state.optionsTexto
                                        )
                                      )
                                      .slice(0, 20)}
                                    value={
                                      this.state.planosContasOptions.filter(
                                        (option) =>
                                          option.value ==
                                          this.state.contaCredito[
                                            this.state.paginaContabiliza
                                          ]
                                      )[0]
                                    }
                                    onChange={(e) => {
                                      if (
                                        this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.tipo_sub != 1 ||
                                        !this.state.eventosContabilizando[
                                          this.state.paginaContabiliza
                                        ]?.repasse
                                      ) {
                                        this.setState({
                                          contaCredito:
                                            this.state.contaCredito.map(
                                              (c, index) =>
                                                index ==
                                                  this.state
                                                    .paginaContabiliza || !c
                                                  ? e.value
                                                  : c
                                            ),
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                  <label>Meio de Pagamento</label>
                                </div>
                                <div className="col-1 errorMessage">
                                  {!this.state.meioPagamento[
                                    this.state.paginaContabiliza
                                  ] && (
                                    <FontAwesomeIcon
                                      title="Preencha o campo"
                                      icon={faExclamationTriangle}
                                    />
                                  )}
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                  <Select
                                    className="SearchSelect"
                                    options={this.state.meiosPagamentosOptions
                                      .filter((e) =>
                                        this.filterSearch(
                                          e,
                                          this.state.optionsTexto
                                        )
                                      )
                                      .slice(0, 20)}
                                    onInputChange={(e) => {
                                      this.setState({ optionsTexto: e });
                                    }}
                                    value={
                                      this.state.meiosPagamentosOptions.filter(
                                        (option) =>
                                          option.value ==
                                          this.state.meioPagamento[
                                            this.state.paginaContabiliza
                                          ]
                                      )[0]
                                    }
                                    search={true}
                                    onChange={(e) => {
                                      this.setState({
                                        meioPagamento:
                                          this.state.meioPagamento.map(
                                            (m, index) =>
                                              index ==
                                                this.state.paginaContabiliza ||
                                              !m
                                                ? e.value
                                                : m
                                          ),
                                        meioPagamentoNome:
                                          this.state.meioPagamentoNome.map(
                                            (m, index) =>
                                              index ==
                                                this.state.paginaContabiliza ||
                                              !m
                                                ? e.label
                                                : m
                                          ),
                                      });
                                    }}
                                  />
                                </div>
                                {(this.state.meioPagamentoNome[
                                  this.state.paginaContabiliza
                                ] == "DARF" ||
                                  this.state.meioPagamentoNome[
                                    this.state.paginaContabiliza
                                  ] == "GPS") && (
                                  <>
                                    <div>
                                      <hr />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Código da receita</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.codigoReceita[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control"
                                        type="text"
                                        value={
                                          this.state.codigoReceita[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            codigoReceita:
                                              this.state.codigoReceita.map(
                                                (c, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !c
                                                    ? e.currentTarget.value
                                                    : c
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Contribuinte</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.contribuinte[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control"
                                        type="text"
                                        value={
                                          this.state.contribuinte[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            contribuinte:
                                              this.state.contribuinte.map(
                                                (c, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : c
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            contribuinte:
                                              this.state.contribuinte.map(
                                                (c, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !c
                                                    ? e.currentTarget.value
                                                    : c
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>
                                        Código identicador do tributo
                                      </label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.codigoIdentificadorTributo[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control"
                                        type="text"
                                        value={
                                          this.state.codigoIdentificadorTributo[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            codigoIdentificadorTributo:
                                              this.state.codigoIdentificadorTributo.map(
                                                (c, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : c
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            codigoIdentificadorTributo:
                                              this.state.codigoIdentificadorTributo.map(
                                                (c, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !c
                                                    ? e.currentTarget.value
                                                    : c
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Número de referência</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.mesCompetNumRef[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control"
                                        type="text"
                                        value={
                                          this.state.mesCompetNumRef[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            mesCompetNumRef:
                                              this.state.mesCompetNumRef.map(
                                                (m, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : m
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            mesCompetNumRef:
                                              this.state.mesCompetNumRef.map(
                                                (m, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !m
                                                    ? e.currentTarget.value
                                                    : m
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Data de Apuração</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.dataApuracao[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control"
                                        type="date"
                                        value={
                                          this.state.dataApuracao[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            dataApuracao:
                                              this.state.dataApuracao.map(
                                                (d, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : d
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            dataApuracao:
                                              this.state.dataApuracao.map(
                                                (d, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !d
                                                    ? e.currentTarget.value
                                                    : d
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Valor</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.darfValor[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control text-right"
                                        type="text"
                                        value={
                                          this.state.darfValor[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            darfValor: this.state.darfValor.map(
                                              (d, index) =>
                                                index ==
                                                this.state.paginaContabiliza
                                                  ? e.currentTarget.value
                                                  : d
                                            ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            darfValor: this.state.darfValor.map(
                                              (d, index) =>
                                                index ==
                                                  this.state
                                                    .paginaContabiliza || !d
                                                  ? Number(
                                                      e.currentTarget.value
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    )
                                                    ? new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        e.currentTarget.value
                                                          .replaceAll(".", "")
                                                          .replaceAll(",", ".")
                                                      )
                                                    : ""
                                                  : d
                                            ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Multa</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.darfMulta[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control text-right"
                                        type="text"
                                        value={
                                          this.state.darfMulta[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            darfMulta: this.state.darfMulta.map(
                                              (d, index) =>
                                                index ==
                                                this.state.paginaContabiliza
                                                  ? e.currentTarget.value
                                                  : d
                                            ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            darfMulta: this.state.darfMulta.map(
                                              (d, index) =>
                                                index ==
                                                  this.state
                                                    .paginaContabiliza || !d
                                                  ? Number(
                                                      e.currentTarget.value
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    )
                                                    ? new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        e.currentTarget.value
                                                          .replaceAll(".", "")
                                                          .replaceAll(",", ".")
                                                      )
                                                    : ""
                                                  : d
                                            ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Juros</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.darfJuros[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control text-right"
                                        type="text"
                                        value={
                                          this.state.darfJuros[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            darfJuros: this.state.darfJuros.map(
                                              (d, index) =>
                                                index ==
                                                this.state.paginaContabiliza
                                                  ? e.currentTarget.value
                                                  : d
                                            ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            darfJuros: this.state.darfJuros.map(
                                              (d, index) =>
                                                index ==
                                                  this.state
                                                    .paginaContabiliza || !d
                                                  ? Number(
                                                      e.currentTarget.value
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    )
                                                    ? new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        e.currentTarget.value
                                                          .replaceAll(".", "")
                                                          .replaceAll(",", ".")
                                                      )
                                                    : ""
                                                  : d
                                            ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Valor de Pagamento</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.darfPagamento[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control text-right"
                                        type="text"
                                        value={
                                          this.state.darfPagamento[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            darfPagamento:
                                              this.state.darfPagamento.map(
                                                (d, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : d
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            darfPagamento:
                                              this.state.darfPagamento.map(
                                                (d, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !d
                                                    ? Number(
                                                        e.currentTarget.value
                                                          .replaceAll(".", "")
                                                          .replaceAll(",", ".")
                                                      )
                                                      ? new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          e.currentTarget.value
                                                            .replaceAll(".", "")
                                                            .replaceAll(
                                                              ",",
                                                              "."
                                                            )
                                                        )
                                                      : ""
                                                    : d
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                      <label>Outros Valores</label>
                                    </div>
                                    <div className="col-1 errorMessage">
                                      {!this.state.darfOutros[
                                        this.state.paginaContabiliza
                                      ] && (
                                        <FontAwesomeIcon
                                          title="Preencha o campo"
                                          icon={faExclamationTriangle}
                                        />
                                      )}
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                      <Field
                                        className="form-control text-right"
                                        type="text"
                                        value={
                                          this.state.darfOutros[
                                            this.state.paginaContabiliza
                                          ]
                                        }
                                        onChange={async (e) => {
                                          this.setState({
                                            darfOutros:
                                              this.state.darfOutros.map(
                                                (d, index) =>
                                                  index ==
                                                  this.state.paginaContabiliza
                                                    ? e.currentTarget.value
                                                    : d
                                              ),
                                          });
                                        }}
                                        onBlur={async (e) => {
                                          this.setState({
                                            darfOutros:
                                              this.state.darfOutros.map(
                                                (d, index) =>
                                                  index ==
                                                    this.state
                                                      .paginaContabiliza || !d
                                                    ? Number(
                                                        e.currentTarget.value
                                                          .replaceAll(".", "")
                                                          .replaceAll(",", ".")
                                                      )
                                                      ? new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          e.currentTarget.value
                                                            .replaceAll(".", "")
                                                            .replaceAll(
                                                              ",",
                                                              "."
                                                            )
                                                        )
                                                      : ""
                                                    : d
                                              ),
                                          });
                                        }}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                          </div>

                          <div className="row">
                            <div className="col-2"></div>
                            <div
                              className="col-8"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                disabled={!validFormContabiliza}
                                type="submit"
                                style={
                                  validFormContabiliza
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
              open={this.state.modalEscolhaOsShare}
              onClose={async () =>
                await this.setState({ modalEscolhaOsShare: false })
              }
            >
              <div className="modalContainer">
                <div className="modalCriar">
                  <div className="containersairlistprodmodal">
                    <div
                      className="botaoSairModal"
                      onClick={async () =>
                        await this.setState({ modalEscolhaOsShare: false })
                      }
                    >
                      <span>X</span>
                    </div>
                  </div>
                  <div className="modalContent">
                    <div className="modalForm" style={{ width: "95%" }}>
                      <Formik
                        initialValues={{
                          codigo: "",
                        }}
                        onSubmit={async () => {
                          this.setState({ modalEscolhaOsShare: false })
                          this.ShareToOs();
                        }}
                      >
                        <Form className="contact-form">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">
                                  <div className="row addservicos">
                                    <div className="col-12">
                                      <h4 className="text-center white">
                                        Escolha a OS:
                                      </h4>
                                    </div>
                                    <Select
                                      className="SearchSelect"
                                      options={this.state.ordem_servico_codigos}
                                      value={this.state.os_escolhida}
                                      search={true}
                                      onChange={(e) => {
                                        this.setState({ os_escolhida: e });
                                      }}
                                    />
                                  </div>

                                  <div
                                    className="row"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      disabled={
                                        this.state.os_escolhida.label
                                          ? false
                                          : true
                                      }
                                      style={
                                        this.state.os_escolhida.label
                                          ? {
                                              justifyContent: "center",
                                              alignItems: "center",
                                              width: 300,
                                            }
                                          : {
                                              justifyContent: "center",
                                              alignItems: "center",
                                              backgroundColor: "gray",
                                              width: 300,
                                            }
                                      }
                                    >
                                      Enviar eventos
                                    </button>
                                  </div>

                              <div className="col-2"></div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                          </div>
                        </Form>
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            <ModalListas
              alteraModal={this.alteraModal}
              alteraNavio={this.alteraNavio}
              alteraPorto={this.alteraPorto}
              alteraCliente={this.alteraCliente}
              alteraTipoServico={this.alteraTipoServico}
              alteraCentroCusto={this.alteraCentroCusto}
              acessosPermissoes={this.state.acessosPermissoes}
              modalAberto={this.state.modalAberto}
              modal={this.state.modal}
              modalLista={this.state.modalLista}
              pesquisa={this.state.modalPesquisa}
              closeModal={() => {
                this.setState({ modalAberto: false });
              }}
            />

            {this.state.modalCamposOS && (
              <ModalCamposOS
                open={this.state.modalCamposOS}
                closeModal={() => {
                  this.setState({ modalCamposOS: false });
                }}
                campos={this.state.camposOS}
                submit={() => {
                  this.setState({ modalCamposOS: false });
                  this.salvarOS(validForm, false);
                }}
              />
            )}

            <section>
              <Header
                voltarOS
                titulo="OS"
                chave={this.state.codigo != 0 ? this.state.codigo : ""}
              />
              <br />
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
            <br />
            <br />
            <br />

            {this.state.chave != 0 &&
              this.state.acessosPermissoes
                .filter((e) => {
                  if (e.acessoAcao == "LOGS") {
                    return e;
                  }
                })
                .map((e) => e.permissaoConsulta)[0] == 1 && (
                <div className="logButton">
                  <button onClick={() => this.openLogs()}>Logs</button>
                </div>
              )}

            <ModalLogs
              closeModal={() => {
                this.setState({ modalLog: false });
              }}
              logs={this.state.logs}
              nome={this.state.viagem}
              chave={this.state.chave}
              modalAberto={this.state.modalLog}
            />

            <div className="contact-section">
              <Alert
                alert={this.state.error}
                setAlert={(value) => this.setState({ error: value })}
              />

              <div className="row">
                <div className="col-lg-12">
                  <Formik
                    initialValues={{
                      name: "",
                    }}
                    onSubmit={async (values) => {
                      await new Promise((r) => setTimeout(r, 1000));
                      this.salvarOS(validForm && !this.state.faturado);
                    }}
                  >
                    <Form className="contact-form">
                      <div className="row">
                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">
                          {/*CRIAÇÃO*/}
                          {this.state.chave == 0 && (
                            <div className="row addservicos">
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                <label>Data Abertura</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.abertura && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="date"
                                  disabled
                                  value={this.state.abertura}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Navio</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.navio && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  onClick={async () => {}}
                                  options={this.state.naviosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.naviosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ naviosOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.naviosOptions.filter(
                                      (option) =>
                                        option.value == this.state.navio
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ navio: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-10 col-10">
                                {this.state.acessosPermissoes
                                  .filter((e) => {
                                    if (e.acessoAcao == "NAVIOS") {
                                      return e;
                                    }
                                  })
                                  .map((e) => e.permissaoConsulta)[0] == 1 && (
                                  <div
                                    className="insideFormButton"
                                    onClick={async () => {
                                      if (this.state.navios[0]) {
                                      } else {
                                        await this.setState({
                                          navios: await loader.getBase(
                                            "getNavios.php"
                                          ),
                                        });
                                      }
                                      await this.setState({
                                        modalAberto: true,
                                        modal: "listarNavios",
                                        modalPesquisa: this.state.navio,
                                        modalLista: this.state.navios,
                                      });
                                    }}
                                  >
                                    ...
                                  </div>
                                )}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Porto</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.porto && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  options={this.state.portosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.portosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ portosOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.portosOptions.filter(
                                      (option) =>
                                        option.value == this.state.porto
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ porto: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.acessosPermissoes
                                  .filter((e) => {
                                    if (e.acessoAcao == "PORTOS") {
                                      return e;
                                    }
                                  })
                                  .map((e) => e.permissaoConsulta)[0] == 1 && (
                                  <div
                                    className="insideFormButton"
                                    onClick={async () => {
                                      if (this.state.portos[0]) {
                                      } else {
                                        await this.setState({
                                          portos: await loader.getBase(
                                            "getPortos.php"
                                          ),
                                        });
                                      }
                                      await this.setState({
                                        modalAberto: true,
                                        modal: "listarPortos",
                                        modalPesquisa: this.state.porto,
                                        modalLista: this.state.portos,
                                      });
                                    }}
                                  >
                                    ...
                                  </div>
                                )}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Cliente</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.cliente && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  options={this.state.clientesOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.clientesOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ clientesOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.clientesOptions.filter(
                                      (option) =>
                                        option.value == this.state.cliente
                                    )[0]
                                  }
                                  search={true}
                                  onChange={async (e) => {
                                    await this.setState({ cliente: e.value });
                                    await this.getDadosCliente();
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.acessosPermissoes
                                  .filter((e) => {
                                    if (e.acessoAcao == "PESSOAS") {
                                      return e;
                                    }
                                  })
                                  .map((e) => e.permissaoConsulta)[0] == 1 && (
                                  <div
                                    className="insideFormButton"
                                    onClick={async () => {
                                      if (this.state.clientes[0]) {
                                      } else {
                                        await this.setState({
                                          clientes: await loader.getBase(
                                            "getClientes.php"
                                          ),
                                        });
                                      }
                                      await this.setState({
                                        modalAberto: true,
                                        modal: "listarCliente",
                                        modalPesquisa: this.state.cliente,
                                        modalLista: this.state.clientes,
                                      });
                                    }}
                                  >
                                    ...
                                  </div>
                                )}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Tipos de Serviço</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.tipoServico && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  options={this.state.tiposServicosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.tiposServicosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({
                                      tiposServicosOptionsTexto: e,
                                    });
                                  }}
                                  value={
                                    this.state.tiposServicosOptions.filter(
                                      (option) =>
                                        option.value == this.state.tipoServico
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ tipoServico: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.acessosPermissoes
                                  .filter((e) => {
                                    if (e.acessoAcao == "TIPOS_SERVICOS") {
                                      return e;
                                    }
                                  })
                                  .map((e) => e.permissaoConsulta)[0] == 1 && (
                                  <div
                                    className="insideFormButton"
                                    onClick={async () => {
                                      if (this.state.tiposServicos[0]) {
                                      } else {
                                        await this.setState({
                                          tiposServicos: await loader.getBase(
                                            "getTiposServicos.php"
                                          ),
                                        });
                                      }
                                      await this.setState({
                                        modalAberto: true,
                                        modal: "listarTiposServicos",
                                        modalPesquisa: this.state.tipoServico,
                                        modalLista: this.state.tiposServicos,
                                      });
                                    }}
                                  >
                                    ...
                                  </div>
                                )}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Operador</label>
                              </div>
                              <div className="col-1 errorMessage">
                              {!this.state.operador && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  options={this.state.operadoresOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.operadoresOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({
                                      operadoresOptionsTexto: e,
                                    });
                                  }}
                                  value={
                                    this.state.operadoresOptions.filter(
                                      (option) =>
                                        option.value == this.state.operador
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ operador: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12"></div>
                              <div className="col-1"></div>

                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.A.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="date"
                                  max="9999-12-31"
                                  value={this.state.eta}
                                  onChange={async (e) => {
                                    this.setState({
                                      eta: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.B.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="datetime-local"
                                  max="9999-12-31T23:59"
                                  value={this.state.etb}
                                  onChange={async (e) => {
                                    this.setState({
                                      etb: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.S.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="datetime-local"
                                  max="9999-12-31T23:59"
                                  value={this.state.data_saida}
                                  onChange={async (e) => {
                                    this.setState({
                                      data_saida: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              {this.state.governmentTaxes && (
                                <>
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Government Taxes</label>
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <Field
                                      className="form-control text-right"
                                      type="text"
                                      step="0.1"
                                      value={this.state.governmentTaxes}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                </>
                              )}
                              {this.state.bankCharges && (
                                <>
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Bank Charges</label>
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <Field
                                      className="form-control text-right"
                                      type="text"
                                      step="0.1"
                                      value={this.state.bankCharges}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                </>
                              )}
                            </div>
                          )}

                          {/*EDIÇÃO*/}
                          {this.state.chave != 0 && (
                            <div className="row addservicos">
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                <label>Codigo</label>
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                <Field
                                  className="form-control"
                                  type="text"
                                  disabled
                                  value={
                                    this.state.codigo.Proximo
                                      ? `TS${this.state.codigo.Proximo}`
                                      : this.state.codigo
                                      ? this.state.codigo
                                      : ""
                                  }
                                />
                              </div>
                              <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12 labelForm">
                                <div className="centerDiv">
                                  <button
                                    disabled={!validForm}
                                    type="button"
                                    style={
                                      validForm
                                        ? {
                                            width: 150,
                                            height: 50,
                                            padding: 5,
                                            color: "white",
                                            border: "1px solid #efefef",
                                            marginBottom: 25,
                                          }
                                        : {
                                            backgroundColor: "#999",
                                            opacity: 0.3,
                                            width: 150,
                                            height: 50,
                                            padding: 5,
                                            color: "#ccc",
                                            border: "1px solid #ccc",
                                            marginBottom: 25,
                                          }
                                    }
                                    onClick={() => {
                                      this.setState({ cabecalhoModal: true });
                                    }}
                                  >
                                    Instrução de Cobrança
                                  </button>
                                </div>
                              </div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Data Abertura</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.abertura && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="date"
                                  disabled
                                  value={this.state.abertura}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Navio</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.navio && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10 ">
                                <Select
                                  className="SearchSelect"
                                  isDisabled={!this.state.editavel}
                                  options={this.state.naviosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.naviosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ naviosOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.naviosOptions.filter(
                                      (option) =>
                                        option.value == this.state.navio
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ navio: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.editavel
                                  ? this.state.acessosPermissoes
                                      .filter((e) => {
                                        if (e.acessoAcao == "NAVIOS") {
                                          return e;
                                        }
                                      })
                                      .map((e) => e.permissaoConsulta)[0] ==
                                      1 && (
                                      <div
                                        className="insideFormButton"
                                        onClick={async () => {
                                          if (this.state.navios[0]) {
                                          } else {
                                            await this.setState({
                                              navios: await loader.getBase(
                                                "getNavios.php"
                                              ),
                                            });
                                          }
                                          await this.setState({
                                            modalAberto: true,
                                            modal: "listarNavios",
                                            modalPesquisa: this.state.navio,
                                            modalLista: this.state.navios,
                                          });
                                        }}
                                      >
                                        ...
                                      </div>
                                    )
                                  : null}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Porto</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.porto && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  isDisabled={!this.state.editavel}
                                  options={this.state.portosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.portosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ portosOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.portosOptions.filter(
                                      (option) =>
                                        option.value == this.state.porto
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ porto: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.editavel
                                  ? this.state.acessosPermissoes
                                      .filter((e) => {
                                        if (e.acessoAcao == "PORTOS") {
                                          return e;
                                        }
                                      })
                                      .map((e) => e.permissaoConsulta)[0] ==
                                      1 && (
                                      <div
                                        className="insideFormButton"
                                        onClick={async () => {
                                          if (this.state.portos[0]) {
                                          } else {
                                            await this.setState({
                                              portos: await loader.getBase(
                                                "getPortos.php"
                                              ),
                                            });
                                          }
                                          await this.setState({
                                            modalAberto: true,
                                            modal: "listarPortos",
                                            modalPesquisa: this.state.porto,
                                            modalLista: this.state.portos,
                                          });
                                        }}
                                      >
                                        ...
                                      </div>
                                    )
                                  : null}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Cliente</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.cliente && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  isDisabled={!this.state.editavel}
                                  options={this.state.clientesOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.clientesOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({ clientesOptionsTexto: e });
                                  }}
                                  value={
                                    this.state.clientesOptions.filter(
                                      (option) =>
                                        option.value == this.state.cliente
                                    )[0]
                                  }
                                  search={true}
                                  onChange={async (e) => {
                                    await this.setState({ cliente: e.value });
                                    await this.getDadosCliente();
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.editavel
                                  ? this.state.acessosPermissoes
                                      .filter((e) => {
                                        if (e.acessoAcao == "PESSOAS") {
                                          return e;
                                        }
                                      })
                                      .map((e) => e.permissaoConsulta)[0] ==
                                      1 && (
                                      <div
                                        className="insideFormButton"
                                        onClick={async () => {
                                          if (this.state.clientes[0]) {
                                          } else {
                                            await this.setState({
                                              clientes: await loader.getBase(
                                                "getClientes.php"
                                              ),
                                            });
                                          }
                                          await this.setState({
                                            modalAberto: true,
                                            modal: "listarCliente",
                                            modalPesquisa: this.state.cliente,
                                            modalLista: this.state.clientes,
                                          });
                                        }}
                                      >
                                        ...
                                      </div>
                                    )
                                  : null}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Tipos de Serviço</label>
                              </div>
                              <div className="col-1 errorMessage">
                                {!this.state.tipoServico && (
                                  <FontAwesomeIcon
                                    title="Preencha o campo"
                                    icon={faExclamationTriangle}
                                  />
                                )}
                              </div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  isDisabled={!this.state.editavel}
                                  options={this.state.tiposServicosOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.tiposServicosOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({
                                      tiposServicosOptionsTexto: e,
                                    });
                                  }}
                                  value={
                                    this.state.tiposServicosOptions.filter(
                                      (option) =>
                                        option.value == this.state.tipoServico
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ tipoServico: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.editavel
                                  ? this.state.acessosPermissoes
                                      .filter((e) => {
                                        if (e.acessoAcao == "TIPOS_SERVICOS") {
                                          return e;
                                        }
                                      })
                                      .map((e) => e.permissaoConsulta)[0] ==
                                      1 && (
                                      <div
                                        className="insideFormButton"
                                        onClick={async () => {
                                          if (this.state.tiposServicos[0]) {
                                          } else {
                                            await this.setState({
                                              tiposServicos:
                                                await loader.getBase(
                                                  "getTiposServicos.php"
                                                ),
                                            });
                                          }
                                          await this.setState({
                                            modalAberto: true,
                                            modal: "listarTiposServicos",
                                            modalPesquisa:
                                              this.state.tipoServico,
                                            modalLista:
                                              this.state.tiposServicos,
                                          });
                                        }}
                                      >
                                        ...
                                      </div>
                                    )
                                  : null}
                              </div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Operador</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  className="SearchSelect"
                                  isDisabled={!this.state.editavel}
                                  options={this.state.operadoresOptions
                                    .filter((e) =>
                                      this.filterSearch(
                                        e,
                                        this.state.operadoresOptionsTexto
                                      )
                                    )
                                    .slice(0, 20)}
                                  onInputChange={(e) => {
                                    this.setState({
                                      operadoresOptionsTexto: e,
                                    });
                                  }}
                                  value={
                                    this.state.operadoresOptions.filter(
                                      (option) =>
                                        option.value == this.state.operador
                                    )[0]
                                  }
                                  search={true}
                                  onChange={(e) => {
                                    this.setState({ operador: e.value });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>

                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.A.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={!this.state.editavel}
                                  type="date"
                                  max="9999-12-31"
                                  value={this.state.eta}
                                  onChange={async (e) => {
                                    this.setState({
                                      eta: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.B.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={!this.state.editavel}
                                  type="datetime-local"
                                  max="9999-12-31T23:59"
                                  value={this.state.etb}
                                  onChange={async (e) => {
                                    this.setState({
                                      etb: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>E.T.S.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={!this.state.editavel}
                                  type="datetime-local"
                                  max="9999-12-31T23:59"
                                  value={this.state.data_saida}
                                  onChange={async (e) => {
                                    this.setState({
                                      data_saida: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              {this.state.governmentTaxes && (
                                <>
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Government Taxes</label>
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <Field
                                      className="form-control text-right"
                                      type="text"
                                      step="0.1"
                                      value={this.state.governmentTaxes}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                </>
                              )}
                              {this.state.bankCharges && (
                                <>
                                  <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                    <label>Bank Charges</label>
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                    <Field
                                      className="form-control text-right"
                                      type="text"
                                      step="0.1"
                                      value={this.state.bankCharges}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-1 errorMessage"></div>
                                </>
                              )}
                              <div>
                                <hr />
                              </div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Data Encerramento</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={this.checkOsClosed()}
                                  type="date"
                                  value={this.state.encerramento}
                                  onChange={async (e) => {
                                    await this.setState({
                                      encerramento: e.currentTarget.value,
                                    });
                                    await this.setState({
                                      encerradoPor:
                                        this.state.encerramento == ""
                                          ? ""
                                          : this.state.usuarioLogado.codigo,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Data Faturamento</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={this.checkOsFaturada()}
                                  type="date"
                                  value={this.state.faturamento}
                                  onChange={async (e) => {
                                    this.faturarData(e.currentTarget.value);
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Data de Envio</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  type="date"
                                  value={this.state.envio}
                                  onChange={async (e) => {
                                    this.setState({
                                      envio: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>Centro de Custo</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                <Select
                                  disabled={!this.state.editavel}
                                  isDisabled={
                                    this.state.codigo.slice(2) >= 5850
                                  }
                                  className="SearchSelect"
                                  options={this.state.centrosCustosOptions
                                    .filter((e) =>
                                      this.filterSearchCentroCusto(
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
                              <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                {this.state.codigo.slice(2) < 5850 &&
                                  this.state.acessosPermissoes
                                    .filter((e) => {
                                      if (e.acessoAcao == "CENTROS_CUSTOS") {
                                        return e;
                                      }
                                    })
                                    .map((e) => e.permissaoConsulta)[0] ==
                                    1 && (
                                    <div
                                      className="insideFormButton"
                                      onClick={async () => {
                                        if (this.state.centrosCustos[0]) {
                                        } else {
                                          await this.setState({
                                            centrosCustos: await loader.getBase(
                                              "getCentroCustos.php"
                                            ),
                                          });
                                        }
                                        await this.setState({
                                          modalAberto: true,
                                          modal: "listarCentrosCustos",
                                          modalPesquisa: this.state.centroCusto,
                                          modalLista: this.state.centrosCustos,
                                        });
                                      }}
                                    >
                                      ...
                                    </div>
                                  )}
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                <label>R.O.E.</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={!this.state.editavel}
                                  onWheel={(event) =>
                                    event.currentTarget.blur()
                                  }
                                  type="number"
                                  step="0.01"
                                  value={this.state.roe}
                                  onChange={async (e) => {
                                    this.setState({
                                      roe: e.currentTarget.value,
                                    });
                                    console.log(e.currentTarget.value);
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm ">
                                <label>Comentário Voucher</label>
                              </div>
                              <div className="col-1 errorMessage"></div>
                              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                <Field
                                  className="form-control"
                                  disabled={!this.state.editavel}
                                  type="text"
                                  rows="4"
                                  component="textarea"
                                  value={this.state.comentario}
                                  onChange={async (e) => {
                                    this.setState({
                                      comentario: e.currentTarget.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-1"></div>
                            </div>
                          )}
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
                            disabled={!(validForm && !this.state.faturado)}
                            type="submit"
                            style={
                              validForm && !this.state.faturado
                                ? { width: 300 }
                                : {
                                    backgroundColor: "#eee",
                                    opacity: 0.3,
                                    width: 300,
                                  }
                            }
                          >
                            Salvar
                          </button>
                        </div>
                        <div className="col-2"></div>
                      </div>
                    </Form>
                  </Formik>
                </div>

                <br />

                {this.props.match.params.id != 0 && (
                  <>
                    <div>
                      <div className="page-breadcrumb2">
                        <h3>Relatórios</h3>
                      </div>
                    </div>
                    <br />
                    <div className="relatoriosSection">
                      <div className="relatorioButton">
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            this.CloseToReal(this.state.os.codigo, validForm)
                          }
                        >
                          Close to Real
                        </button>
                      </div>
                      <div className="relatorioButton">
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            this.CommercialInvoice(this.state.os.codigo, validForm)
                          }
                        >
                          Commercial Invoice
                        </button>
                      </div>
                      {this.state.acessosPermissoes
                        .filter((e) => {
                          if (e.acessoAcao == "RELATORIOS_OS") {
                            return e;
                          }
                        })
                        .map((e) => e.permissaoImprime)[0] == 1 && (
                        <>
                          <div className="relatorioButton">
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                this.RelatorioVoucher(
                                  this.state.os.codigo,
                                  validForm
                                )
                              }
                            >
                              Vouchers
                            </button>
                          </div>
                          <div className="relatorioButton">
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                this.CapaVoucher(
                                  this.state.os.codigo,
                                  validForm
                                )
                              }
                            >
                              Capa
                            </button>
                          </div>
                          <div className="relatorioButton">
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                this.FaturamentoCusteio(
                                  this.state.os.codigo,
                                  validForm
                                )
                              }
                            >
                              Relatório Líquidos
                            </button>
                          </div>
                          <div className="relatorioButton">
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                this.setState({
                                  agrupadorModal: true,
                                  grupoSelecionado: 0,
                                  agrupadorEventos: [],
                                  agrupadorTipo: "INVOICE",
                                })
                              }
                            >
                              Invoices
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {this.props.match.params.id != 0 && (
                  <>
                    <br />
                    <br />
                    <br />
                    <br />
                    <div>
                      <div className="page-breadcrumb2">
                        <h3>Funções</h3>
                      </div>
                    </div>
                    <br />
                    <div className="relatoriosSection">
                      <div className="relatorioButton">
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            this.GerarEtiqueta(this.state.os.codigo, false)
                          }
                        >
                          Enviar Etiqueta
                        </button>
                      </div>
                      {this.state.acessosPermissoes
                        .filter((e) => {
                          if (e.acessoAcao == "RELATORIOS_OS") {
                            return e;
                          }
                        })
                        .map((e) => e.permissaoImprime)[0] == 1 && (
                        <>
                          <div className="relatorioButton">
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                this.setState({
                                  agrupadorModal: true,
                                  grupoSelecionado: 0,
                                  agrupadorEventos: [],
                                  agrupadorTipo: "CUSTEIO",
                                })
                              }
                            >
                              Custeio Subagente
                            </button>
                          </div>
                        </>
                      )}
                      <div className="relatorioButton">
                        <button className="btn btn-danger">
                          <Link
                            style={{ color: "inherit", textDecoration: "none" }}
                            to={{
                              pathname: "/financeiro/addFatura/0",
                              state: {
                                backTo: `/ordensservicos/os/${this.state.chave}`,
                                os: this.state.os,
                              },
                            }}
                          >
                            Emitir NF
                          </Link>
                        </button>
                      </div>
                      <div className="relatorioButton">
                        <button
                          className="btn btn-danger"
                          onClick={() => this.getCamposVoucher()}
                        >
                          Campos de Voucher
                        </button>
                      </div>
                      {/* <div className="relatorioButton">
                        <button
                          disabled={this.DesabilitaRetroceder()}
                          className="btn btn-danger"
                          onClick={() => this.RetornaParaOrcamento(true)}
                        >
                          Retroceder para orçamento
                        </button>
                      </div> */}
                      <div className="relatorioButton">
                        <button
                          className="btn btn-danger"
                          onClick={() => this.getGruposTemplates()}
                        >
                          Gerar templates
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {this.props.match.params.id != 0 &&
                  this.state.acessosPermissoes
                    .filter((e) => {
                      if (e.acessoAcao == "SERVICOS_ITENS") {
                        return e;
                      }
                    })
                    .map((e) => e.permissaoConsulta)[0] == 1 && (
                    <div>
                      <br />
                      <br />
                      <div>
                        <div>
                          <div className="page-breadcrumb2">
                            <h3>Eventos</h3>
                          </div>
                        </div>
                        <br />
                        <div>
                          <div>
                            <div className="row" id="product-list">
                              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                <div className="single-product-item">
                                  <div className="row subtitulosTabela">
                                    <table className="addOsTable">
                                      <tr className="cabecalhoEventos">
                                      <th className="text-center">
                                        <input
                                          type="checkbox"
                                          onChange={this.handleSelectAll}
                                          checked={this.state.selectedEvents.length === this.state.eventos.length && this.state.eventos.length > 0}
                                        />
                                      </th>
                                        <th className="text-center">
                                          <span>Chave</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Tipo</span>
                                          </th>
                                        )}
                                        <th className="text-center ordem-column">
                                          <span>Ordem</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center desc-column">
                                            <span>Descrição</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Valor (USD)</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Valor (R$)</span>
                                        </th>
                                        <th className="text-center">
                                          <span
                                            className="iconelixo giveMargin plus-column"
                                            type="button"
                                          >
                                            <Link
                                              to={{
                                                pathname: `/ordensservico/addevento/0`,
                                                state: {
                                                  os: { ...this.state.os },
                                                  editavel: this.state.editavel,
                                                  editavelDataFaturamento: this.state.editavelDataFaturamento,
                                                },
                                              }}
                                            >
                                              <FontAwesomeIcon icon={faPlus} />
                                            </Link>
                                          </span>
                                        </th>
                                      </tr>
                                      {this.state.eventos[0] != undefined &&
                                        this.state.eventos.map(
                                          (feed, index) => (
                                            <>
                                              {window.innerWidth < 500 && (
                                                <tr
                                                  onClick={async () => {
                                                    await this.setState({
                                                      modalItemAberto: false,
                                                    });
                                                    await this.setItemEdit(
                                                      feed
                                                    );
                                                  }}
                                                  className={
                                                    index % 2 == 0
                                                      ? "parTr"
                                                      : "imparTr"
                                                  }
                                                >
                                                  <td className="text-center pseudo_link">
                                                    <input
                                                      type="checkbox"
                                                      checked={this.state.selectedEvents.includes(feed.chave)}
                                                      onChange={() => this.handleCheckboxChange(feed.chave)}
                                                      onClick={(e) => e.stopPropagation()}
                                                    />
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center" onClick={(e) => e.preventDefault()}>
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}{' '}
                                                    <span type="button" className="iconelixo giveMargin" onClick={(e) => {e.stopPropagation(); this.moveUp(index);}} disabled={index === 0}>
                                                      <FontAwesomeIcon icon={faArrowUp} />
                                                    </span>
                                                    <span type="button" className="iconelixo" onClick={(e) => {e.stopPropagation(); this.moveDown(index);}} disabled={index === this.state.eventos.length - 1}>
                                                      <FontAwesomeIcon icon={faArrowDown} />
                                                    </span>
                                                    </p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faPen}
                                                      />
                                                    </span>

                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <Link
                                                        to={{
                                                          pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                          state: {
                                                            evento: { ...feed },
                                                            os: {
                                                              ...this.state.os,
                                                            },
                                                          },
                                                        }}
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faDollarSign}
                                                        />
                                                      </Link>
                                                    </span>


                                                    {this.state.acessosPermissoes
                                                      .filter((e) => {
                                                        if (
                                                          e.acessoAcao ==
                                                          "SERVICOS_ITENS"
                                                        ) {
                                                          return e;
                                                        }
                                                      })
                                                      .map(
                                                        (e) => e.permissaoDeleta
                                                      )[0] == 1 && (
                                                      <span
                                                        type="button"
                                                        className="iconelixo"
                                                        onClick={(a) =>
                                                          this.deleteServicoItem(
                                                            feed.chave,
                                                            feed.descricao
                                                          )
                                                        }
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faTimes}
                                                        />
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                              {window.innerWidth >= 500 && (
                                                <tr
                                                  onClick={async () => {
                                                    await this.setState({
                                                      modalItemAberto: false,
                                                    });
                                                    await this.setItemEdit(
                                                      feed
                                                    );
                                                  }}
                                                  className={
                                                    index % 2 == 0
                                                      ? "parTr"
                                                      : "imparTr"
                                                  }
                                                >
                                                  <td className="text-center">
                                                    <input
                                                      type="checkbox"
                                                      checked={this.state.selectedEvents.includes(feed.chave)}
                                                      onChange={() => this.handleCheckboxChange(feed.chave)}
                                                      onClick={(e) => e.stopPropagation()}
                                                    /><p></p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>{feed.chave}</p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>
                                                      {
                                                        this.state
                                                          .tiposServicosItens[
                                                          feed.tipo_sub
                                                        ]
                                                      }
                                                    </p>
                                                  </td>
                                                  <td className="text-center" onClick={(e) => e.preventDefault()}>
                                                    <p>
                                                      {feed.ordem.replaceAll(
                                                        ",",
                                                        "."
                                                      )}{' '}
                                                    <span type="button" className="iconelixo giveMargin" onClick={(e) => {e.stopPropagation(); this.moveUp(index);}} disabled={index === 0}>
                                                      <FontAwesomeIcon icon={faArrowUp} />
                                                    </span>
                                                    <span type="button" className="iconelixo" onClick={(e) => {e.stopPropagation(); this.moveDown(index);}} disabled={index === this.state.eventos.length - 1}>
                                                      <FontAwesomeIcon icon={faArrowDown} />
                                                    </span>
                                                    </p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>{feed.descricao}</p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>
                                                      USD{" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 6
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) /
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td className="text-center pseudo_link">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format(
                                                        feed.Moeda == 5
                                                          ? (feed.valor * feed.qntd)
                                                          : (feed.valor * feed.qntd) *
                                                              (parseFloat(
                                                                this.state.os
                                                                  .ROE
                                                              ) != 0
                                                                ? parseFloat(
                                                                    this.state
                                                                      .os.ROE
                                                                  )
                                                                : 5)
                                                      )}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faPen}
                                                      />
                                                    </span>

                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <Link
                                                        to={{
                                                          pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                          state: {
                                                            evento: { ...feed },
                                                            os: {
                                                              ...this.state.os,
                                                            },
                                                          },
                                                        }}
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faDollarSign}
                                                        />
                                                      </Link>
                                                    </span>

                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        this.copyServicoItem(feed, feed.descricao);
                                                      }}
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faCopy}
                                                      />
                                                    </span>

                                                    {this.state.acessosPermissoes
                                                      .filter((e) => {
                                                        if (
                                                          e.acessoAcao ==
                                                          "SERVICOS_ITENS"
                                                        ) {
                                                          return e;
                                                        }
                                                      })
                                                      .map(
                                                        (e) => e.permissaoDeleta
                                                      )[0] == 1 && (
                                                      <span
                                                        type="button"
                                                        className="iconelixo"
                                                        onClick={(a) =>
                                                          this.deleteServicoItem(
                                                            feed.chave,
                                                            feed.descricao
                                                          )
                                                        }
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faTimes}
                                                        />
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                            </>
                                          )
                                        )}
                                      {this.state.eventos[0] && (
                                        <>
                                          {window.innerWidth < 500 && (
                                            <>
                                              {this.state.bankCharges &&
                                                parseFloat(
                                                  this.state.bankCharges
                                                    .replaceAll(".", "")
                                                    .replaceAll(",", ".")
                                                ) != 0 && (
                                                  <tr
                                                    className={
                                                      this.state.eventos
                                                        .length %
                                                        2 ==
                                                      0
                                                        ? "parTr"
                                                        : "imparTr"
                                                    }
                                                  >
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      Bank Charges
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        USD{" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.bankCharges
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          ) /
                                                            (parseFloat(
                                                              this.state.os.ROE
                                                            ) != 0
                                                              ? parseFloat(
                                                                  this.state.os
                                                                    .ROE
                                                                )
                                                              : 5)
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        R${" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.bankCharges
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          )
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td></td>
                                                  </tr>
                                                )}
                                              {this.state.governmentTaxes &&
                                                parseFloat(
                                                  this.state.governmentTaxes
                                                    .replaceAll(".", "")
                                                    .replaceAll(",", ".")
                                                ) != 0 && (
                                                  <tr
                                                    className={
                                                      (this.state.eventos
                                                        .length +
                                                        (this.state
                                                          .bankCharges &&
                                                        parseFloat(
                                                          this.state.bankCharges
                                                            .replaceAll(".", "")
                                                            .replaceAll(
                                                              ",",
                                                              "."
                                                            )
                                                        ) != 0
                                                          ? 1
                                                          : 0)) %
                                                        2 ==
                                                      0
                                                        ? "parTr"
                                                        : "imparTr"
                                                    }
                                                  >
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      Government Taxes
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        USD{" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.governmentTaxes
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          ) /
                                                            (parseFloat(
                                                              this.state.os.ROE
                                                            ) != 0
                                                              ? parseFloat(
                                                                  this.state.os
                                                                    .ROE
                                                                )
                                                              : 5)
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        R${" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.governmentTaxes
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          )
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td></td>
                                                  </tr>
                                                )}
                                              <tr
                                                className={
                                                  (this.state.eventos.length +
                                                    (this.state.bankCharges &&
                                                    parseFloat(
                                                      this.state.bankCharges
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    ) != 0
                                                      ? 1
                                                      : 0) +
                                                    (this.state
                                                      .governmentTaxes &&
                                                    parseFloat(
                                                      this.state.governmentTaxes
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    ) != 0
                                                      ? 1
                                                      : 0)) %
                                                    2 ==
                                                  0
                                                    ? "parTr"
                                                    : "imparTr"
                                                }
                                              >
                                                <td className="text-center"></td>
                                                <td className="text-center">
                                                  Total
                                                </td>
                                                <td className="text-center">
                                                  <p>
                                                    USD{" "}
                                                    {new Intl.NumberFormat(
                                                      "pt-BR",
                                                      {
                                                        style: "decimal",
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    ).format(
                                                      this.state.eventosTotal /
                                                        (parseFloat(
                                                          this.state.os.ROE
                                                        ) != 0
                                                          ? parseFloat(
                                                              this.state.os.ROE
                                                            )
                                                          : 5)
                                                    )}
                                                  </p>
                                                </td>
                                                <td className="text-center">
                                                  <p>
                                                    R${" "}
                                                    {new Intl.NumberFormat(
                                                      "pt-BR",
                                                      {
                                                        style: "decimal",
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    ).format(
                                                      this.state.eventosTotal
                                                    )}
                                                  </p>
                                                </td>
                                                <td></td>
                                              </tr>
                                            </>
                                          )}
                                          {window.innerWidth >= 500 && (
                                            <>
                                              {this.state.bankCharges &&
                                                parseFloat(
                                                  this.state.bankCharges
                                                    .replaceAll(".", "")
                                                    .replaceAll(",", ".")
                                                ) != 0 && (
                                                  <tr
                                                    className={
                                                      this.state.eventos
                                                        .length %
                                                        2 ==
                                                      0
                                                        ? "parTr"
                                                        : "imparTr"
                                                    }
                                                  >
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      Bank Charges
                                                    </td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      <p>
                                                        USD{" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.bankCharges
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          ) /
                                                            (parseFloat(
                                                              this.state.os.ROE
                                                            ) != 0
                                                              ? parseFloat(
                                                                  this.state.os
                                                                    .ROE
                                                                )
                                                              : 5)
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        R${" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.bankCharges
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          )
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td></td>
                                                  </tr>
                                                )}
                                              {this.state.governmentTaxes &&
                                                parseFloat(
                                                  this.state.governmentTaxes
                                                    .replaceAll(".", "")
                                                    .replaceAll(",", ".")
                                                ) != 0 && (
                                                  <tr
                                                    className={
                                                      (this.state.eventos
                                                        .length +
                                                        (this.state
                                                          .bankCharges &&
                                                        parseFloat(
                                                          this.state.bankCharges
                                                            .replaceAll(".", "")
                                                            .replaceAll(
                                                              ",",
                                                              "."
                                                            )
                                                        ) != 0
                                                          ? 1
                                                          : 0)) %
                                                        2 ==
                                                      0
                                                        ? "parTr"
                                                        : "imparTr"
                                                    }
                                                  >
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      Government Taxes
                                                    </td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">
                                                      <p>
                                                        USD{" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.governmentTaxes
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          ) /
                                                            (parseFloat(
                                                              this.state.os.ROE
                                                            ) != 0
                                                              ? parseFloat(
                                                                  this.state.os
                                                                    .ROE
                                                                )
                                                              : 5)
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td className="text-center">
                                                      <p>
                                                        R${" "}
                                                        {new Intl.NumberFormat(
                                                          "pt-BR",
                                                          {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        ).format(
                                                          parseFloat(
                                                            this.state.governmentTaxes
                                                              .replaceAll(
                                                                ".",
                                                                ""
                                                              )
                                                              .replaceAll(
                                                                ",",
                                                                "."
                                                              )
                                                          )
                                                        )}
                                                      </p>
                                                    </td>
                                                    <td></td>
                                                  </tr>
                                                )}
                                              <tr
                                                className={
                                                  (this.state.eventos.length +
                                                    (this.state.bankCharges &&
                                                    parseFloat(
                                                      this.state.bankCharges
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    ) != 0
                                                      ? 1
                                                      : 0) +
                                                    (this.state
                                                      .governmentTaxes &&
                                                    parseFloat(
                                                      this.state.governmentTaxes
                                                        .replaceAll(".", "")
                                                        .replaceAll(",", ".")
                                                    ) != 0
                                                      ? 1
                                                      : 0)) %
                                                    2 ==
                                                  0
                                                    ? "parTr"
                                                    : "imparTr"
                                                }
                                              >
                                                <td className="text-center"></td>
                                                <td className="text-center"></td>
                                                <td className="text-center">
                                                  Total
                                                </td>
                                                <td className="text-center"></td>
                                                <td className="text-center"></td>
                                                <td className="text-center">
                                                  <p>
                                                    USD{" "}
                                                    {new Intl.NumberFormat(
                                                      "pt-BR",
                                                      {
                                                        style: "decimal",
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    ).format(
                                                      this.state.eventosTotal /
                                                        (parseFloat(
                                                          this.state.os.ROE
                                                        ) != 0
                                                          ? parseFloat(
                                                              this.state.os.ROE
                                                            )
                                                          : 5)
                                                    )}
                                                  </p>
                                                </td>
                                                <td className="text-center">
                                                  <p>
                                                    R${" "}
                                                    {new Intl.NumberFormat(
                                                      "pt-BR",
                                                      {
                                                        style: "decimal",
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    ).format(
                                                      this.state.eventosTotal
                                                    )}
                                                  </p>
                                                </td>
                                                <td></td>
                                              </tr>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </table>
                                  </div>
                                  <div className="action-buttons-container">
                                    {this.state.acessosPermissoes
                                      .filter(e => e.acessoAcao === "SERVICOS_ITENS")
                                      .map(e => e.permissaoInsere)[0] == 1 && 
                                      this.state.selectedEvents.length > 0 && (
                                        <button 
                                          className="action-button btn-success"
                                          onClick={() => {
                                            this.setState({ modalEscolhaOsShare: true });
                                          }}
                                        >
                                          <FontAwesomeIcon icon={faPlus} /> 
                                          Transferir Selecionados ({this.state.selectedEvents.length})
                                        </button>
                                    )}
                                    
                                    {this.state.acessosPermissoes
                                      .filter(e => e.acessoAcao === "SERVICOS_ITENS")
                                      .map(e => e.permissaoDeleta)[0] == 1 && 
                                      this.state.selectedEvents.length > 0 && (
                                        <button 
                                          className="action-button btn-danger"
                                          onClick={this.deleteMultipleEvents}
                                        >
                                          <FontAwesomeIcon icon={faTrashAlt} /> 
                                          Excluir Selecionados ({this.state.selectedEvents.length})
                                        </button>
                                    )}
                                    
                                    {this.state.ordemModificada && (
                                      <button 
                                        className="action-button btn-success" 
                                        onClick={this.salvarOrdem} 
                                        disabled={this.state.loading}
                                      >
                                        {this.state.loading ? (
                                          "Salvando..."
                                        ) : (
                                          <>
                                            <FontAwesomeIcon icon={faSave} /> Salvar Ordem
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                <div ref={"focusMe"} tabindex={-1}>
                  <EventoEdit
                    chave={this.state.eventoChave}
                    taxas={this.state.taxas}
                    itemPermissao={this.state.itemPermissao}
                    acessosPermissoes={this.state.acessosPermissoes}
                    setItemEdit={(itemEdit) => this.revertItemEdit(itemEdit)}
                    itemEdit={this.state.itemEdit}
                    editavel={this.state.editavel}
                    editavelDataFaturamento={this.state.editavelDataFaturamento}
                    onSubmit={this.salvarEvento}
                    valid={validFormEvento}
                    aberto={this.state.modalItemAberto}
                    openTemplates={() =>
                      this.setState({ templatesModal: true })
                    }
                  />
                </div>

                {this.props.match.params.id != 0 &&
                  this.state.custeios_subagentes[0] &&
                  this.state.acessosPermissoes
                    .filter((e) => {
                      if (e.acessoAcao == "SERVICOS_ITENS") {
                        return e;
                      }
                    })
                    .map((e) => e.permissaoConsulta)[0] == 1 && (
                    <div>
                      <br />
                      <br />
                      <div>
                        <div>
                          <div className="page-breadcrumb2">
                            <h3>Custeios Subagentes</h3>
                          </div>
                        </div>
                        <br />
                        <div>
                          <div>
                            <div className="row" id="product-list">
                              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                <div className="single-product-item">
                                  <div className="row subtitulosTabela">
                                    <table className="addOsTable">
                                      <tr>
                                        <th className="text-center">
                                          <span>Grupo</span>
                                        </th>
                                        {window.innerWidth >= 500 && (
                                          <th className="text-center">
                                            <span>Tipo</span>
                                          </th>
                                        )}
                                        <th className="text-center">
                                          <span>Fornecedor</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Valor</span>
                                        </th>
                                        <th className="text-center"></th>
                                      </tr>
                                      {this.state.custeios_subagentes[0] !=
                                        undefined &&
                                        this.state.custeios_subagentes.map(
                                          (feed, index) => (
                                            <>
                                              {window.innerWidth < 500 && (
                                                <tr
                                                  className={
                                                    index % 2 == 0
                                                      ? "parTr"
                                                      : "imparTr"
                                                  }
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.grupo}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>{feed.fornecedorNome}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format((feed.valor * feed.qntd))}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faPen}
                                                        onClick={() =>
                                                          this.setState({
                                                            grupoSelecionado:
                                                              feed.grupo,
                                                            agrupadorModal: true,
                                                            agrupadorEventos:
                                                              feed.evento.split(
                                                                ","
                                                              ),
                                                            agrupadorTipo:
                                                              "CUSTEIO",
                                                          })
                                                        }
                                                      />
                                                    </span>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faTrashAlt}
                                                        onClick={() =>
                                                          this.deleteGrupo(
                                                            feed.grupo
                                                          )
                                                        }
                                                      />
                                                    </span>
                                                  </td>
                                                </tr>
                                              )}
                                              {window.innerWidth >= 500 && (
                                                <tr
                                                  className={
                                                    index % 2 == 0
                                                      ? "parTr"
                                                      : "imparTr"
                                                  }
                                                >
                                                  <td className="text-center">
                                                    <p>{feed.grupo}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      {
                                                        this.state
                                                          .tiposServicosItens[
                                                          feed.tipo
                                                        ]
                                                      }
                                                    </p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>{feed.fornecedorNome}</p>
                                                  </td>
                                                  <td className="text-center">
                                                    <p>
                                                      R${" "}
                                                      {new Intl.NumberFormat(
                                                        "pt-BR",
                                                        {
                                                          style: "decimal",
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      ).format((feed.valor * feed.qntd))}
                                                    </p>
                                                  </td>
                                                  <td>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faPen}
                                                        onClick={() =>
                                                          this.setState({
                                                            grupoSelecionado:
                                                              feed.grupo,
                                                            agrupadorModal: true,
                                                            agrupadorEventos:
                                                              feed.evento.split(
                                                                ","
                                                              ),
                                                            agrupadorTipo:
                                                              "CUSTEIO",
                                                          })
                                                        }
                                                      />
                                                    </span>
                                                    <span
                                                      className="iconelixo giveMargin"
                                                      type="button"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faTrashAlt}
                                                        onClick={() =>
                                                          this.deleteGrupo(
                                                            feed.grupo
                                                          )
                                                        }
                                                      />
                                                    </span>
                                                  </td>
                                                </tr>
                                              )}
                                            </>
                                          )
                                        )}
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {this.props.match.params.id != 0 &&
                  this.state.acessosPermissoes
                    .filter((e) => {
                      if (e.acessoAcao == "DOCUMENTOS") {
                        return e;
                      }
                    })
                    .map((e) => e.permissaoConsulta)[0] == 1 && (
                    <div>
                      <div>
                        <div>
                          <div className="page-breadcrumb2">
                            <h3>Documentos</h3>
                          </div>
                        </div>
                        <br />
                        <div>
                          <div>
                            <div className="row" id="product-list">
                              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                <div className="single-product-item">
                                  <div className="row subtitulosTabela">
                                    <table className="addOsTable">
                                      <tr>
                                        <th className="text-center">
                                          <span>Chave</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Descrição</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Nome</span>
                                        </th>
                                        <th className="text-center">
                                          <span>Categoria</span>
                                        </th>
                                        <th className="text-center">
                                          <span>
                                            <Link>
                                              <FontAwesomeIcon
                                                icon={faPlus}
                                                onClick={() =>
                                                  this.setState({
                                                    documentoModal: true,
                                                  })
                                                }
                                              />
                                            </Link>
                                          </span>
                                        </th>
                                      </tr>
                                      {this.state.documentos[0] != undefined &&
                                        this.state.documentos
                                          .filter((e) => e.chave_os_itens == 0)
                                          .map((feed, index) => (
                                            <tr
                                              className={
                                                index % 2 == 0
                                                  ? "parTr"
                                                  : "imparTr"
                                              }
                                            >
                                              <td className="text-center">
                                                <a
                                                  href={
                                                    feed.tipo_docto == 55
                                                      ? `${CAMINHO_INVOICES}/${feed.caminho}`
                                                      : `${CAMINHO_DOCUMENTOS}/docs/${feed.caminho}`
                                                  }
                                                  className="nonlink"
                                                  target="_blank"
                                                >
                                                  <p>{feed.chave}</p>
                                                </a>
                                              </td>
                                              <td className="text-center">
                                                <a
                                                  href={
                                                    feed.tipo_docto == 55
                                                      ? `${CAMINHO_INVOICES}/${feed.caminho}`
                                                      : `${CAMINHO_DOCUMENTOS}/docs/${feed.caminho}`
                                                  }
                                                  className="nonlink"
                                                  target="_blank"
                                                >
                                                  <p>{feed.descricao}</p>
                                                </a>
                                              </td>
                                              <td className="text-center">
                                                <a
                                                  href={
                                                    feed.tipo_docto == 55
                                                      ? `${CAMINHO_INVOICES}/${feed.caminho}`
                                                      : `${CAMINHO_DOCUMENTOS}/docs/${feed.caminho}`
                                                  }
                                                  className="nonlink"
                                                  target="_blank"
                                                >
                                                  <p>{feed.caminho}</p>
                                                </a>
                                              </td>
                                              <td className="text-center">
                                                <a
                                                  href={
                                                    feed.tipo_docto == 55
                                                      ? `${CAMINHO_INVOICES}/${feed.caminho}`
                                                      : `${CAMINHO_DOCUMENTOS}/docs/${feed.caminho}`
                                                  }
                                                  className="nonlink"
                                                  target="_blank"
                                                >
                                                  <p>{feed.categoria}</p>
                                                </a>
                                              </td>
                                              <td>
                                                <span
                                                  className="iconelixo giveMargin"
                                                  type="button"
                                                >
                                                  <FontAwesomeIcon
                                                    icon={faPlus}
                                                    onClick={() =>
                                                      this.setState({
                                                        documentoModal: true,
                                                        documentoDescricao: "",
                                                        documentoTipo: "",
                                                        documentoNome: "",
                                                        documentoEditar: false,
                                                      })
                                                    }
                                                  />
                                                </span>

                                                <span className="iconelixo giveMargin">
                                                  <FontAwesomeIcon
                                                    icon={faPen}
                                                    onClick={() =>
                                                      this.setState({
                                                        documentoModal: true,
                                                        documentoDescricao:
                                                          feed.descricao,
                                                        documentoTipo:
                                                          feed.tipo_docto,
                                                        documentoNome: "",
                                                        documentoTrocar: false,
                                                        documentoEditar: true,
                                                        documentoChave:
                                                          feed.chave,
                                                        documentoCaminho:
                                                          feed.caminho,

                                                        dadosIniciaisDoc: [
                                                          {
                                                            titulo: "descricao",
                                                            valor:
                                                              feed.descricao,
                                                          },
                                                          {
                                                            titulo: "tipo_doto",
                                                            valor:
                                                              feed.tipo_docto,
                                                          },
                                                          {
                                                            titulo: "caminho",
                                                            valor: feed.caminho,
                                                          },
                                                        ],
                                                      })
                                                    }
                                                  />
                                                </span>

                                                {this.state.acessosPermissoes
                                                  .filter((e) => {
                                                    if (
                                                      e.acessoAcao ==
                                                      "DOCUMENTOS"
                                                    ) {
                                                      return e;
                                                    }
                                                  })
                                                  .map(
                                                    (e) => e.permissaoDeleta
                                                  )[0] == 1 && (
                                                  <span
                                                    type="button"
                                                    className="iconelixo"
                                                    onClick={(a) =>
                                                      this.deleteDocumento(
                                                        feed.chave,
                                                        feed.descricao,
                                                        feed.caminho
                                                      )
                                                    }
                                                  >
                                                    <FontAwesomeIcon
                                                      icon={faTrashAlt}
                                                    />
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <Rodape />
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ user, empresa, servidor }) => {
  return {
    user: user,
    empresa: empresa,
    online: servidor.online,
  };
};

export default connect(mapStateToProps, null)(AddOS);
