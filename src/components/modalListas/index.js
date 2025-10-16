import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Modal from '@material-ui/core/Modal';
import InputMask from 'react-input-mask';
import SkeletonPesquisa from '../../components/skeletonpesquisa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faExclamationTriangle, faEnvelope, faHome } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../services/apiamrg'
import moment from 'moment'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../config'
import { confirmAlert } from 'react-confirm-alert'
import Select from 'react-select';
import 'react-confirm-alert/src/react-confirm-alert.css'
import CEP from 'cep-promise';
import loader from '../../classes/loader'
import Util from '../../classes/util'

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    pesquisaExata: false,
    load: 100,
    categoria: "",

    dadosIniciais: '',
    dadosFinais: '',

    navios: [],
    navioChave: 0,
    navioNome: '',
    navioBandeira: '',
    navioBloqueado: false,
    navioImo: '',
    navioGrt: '0',
    navioDwt: '0',
    navioLoa: '0',
    navioBeam: '0',

    bandeiras: [],
    banderiasOptions: [],

    portos: [],
    portoChave: '',
    portoNome: '',
    portoSigla: '',
    portoBloqueado: false,

    clientes: [],
    clienteNome: '',
    clienteNomeFantasia: '',
    clienteCpf: '',
    clienteCpfLimpo: '',
    clienteRG: '',
    clienteInscricaoMunicipal: '',
    clienteNascimento: '',
    clienteContaContabil: '',
    clienteContaProvisao: '',
    clienteContaFatura: '',
    clienteContaContabilInicial: '',
    clienteContaProvisaoInicial: '',
    clienteContaFaturaInicial: '',
    clienteCategoria: {
        cliente: false,
        fornecedor: false,
        prestador_servico: false,
        transportador: false,
        banco: false,
        broker: false,
        // adm_cartao: false,
        // adm_convenio: false
    },
    clienteBloqueado: false,

    paises: [],
    paisesOptions: [],
    paisesOptionsTexto: '',

    tipoServicos: [],
    tipoServicoChave: '',
    tipoServicoNome: '',
    tipoServicoPrazo: '',
    tipoServicoBloqueado: false,

    centroCustos: [],
    centroCustoChave: '',
    centroCustoNome: '',
    centroCustoCliente: '',
    centroCustoData: '',
    centroCustoEncerramento: '',
    centroCustoCodigo: '',
    centroCustoBloqueado: false,

    centroCustoPessoas: [],
    centroCustoPessoasOptions: [],
    centroCustoPessoasOptionsTexto: '',

    subgrupoChave: '',
    subgrupoGrupo: '',
    subgrupoNome: '',

    grupos: [],
    gruposOptions: [],
    gruposOptionsTexto: '',

    planoContaChave: '',
    planoContaCodigo: '',
    planoContaCodigoLimpo: '',
    planoContaGrupo: '',
    planoContaInativa: '',
    planoContaIndicador: '',
    planoContaNivel: '',
    planoContaNome: '',
    planoContaBloqueado: false,

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    enderecos: [],
    enderecoBairro: '',
    enderecoBairroLock: false,
    enderecoCep: '',
    enderecoChave: 0,
    enderecoCidade: '',
    enderecoCidadeDescricao: '',
    enderecoCidadeLock: false,
    enderecoComplemento: '',
    enderecoEndereco: '',
    enderecoEnderecoLock: false,
    enderecoNumero: '',
    enderecoPais: '',
    enderecoPaisNome: '',
    enderecoTipo: '',
    enderecoTipos: [
        {
            label: "Padrao",
            value: 0
        },
        {
            label: "Entrega",
            value: 1
        }, {
            label: "Cobranca",
            value: 2
        }, {
            label: "Residencial",
            value: 3
        }
    ],
    enderecoTipoNome: '',
    enderecoUF: '',
    enderecoUFLock: false,
    enderecoUFNome: '',

    contatos: [],

    contatoChave: '',
    contatoCampo1: '',
    contatoCampo2: '',
    contatoTipo: '',
    contatoTipos: '',
    contatoTipoNome: '',
    contatoTiposOptions: '',


    cidades: [],
    cidadesOptions: [],

    estados: [],
    estadosOptions: [],

    paises: [],
    paisesOptions: [],

    tipoEndereco: ['Padrão', 'Entrega', 'Cobrança', 'Residencial'],

    cpfAprovado: false,

    taxaChave: 0,
    taxaNome: '',
    taxaValor: '',
    taxaVariavel: false,
    taxaMoeda: 5,
    taxaTipo: 'P',
    taxaConta_contabil: '',
    taxaConta_credito: '',
    taxaHistorico_padrao: '',
    taxaFormula_ate: '',
    taxaSubgrupo: '',
    taxaBloqueado: false,

    moedas: [],
    subgrupos: [],
    subgruposOptions: [],
    subgruposOptionsTexto: '',

    historicos: [],
    historicosOptions: [],
    historicosOptionsTexto: '',

    descricaoChave: 0,
    descricaoNome: '',
    descricaoBloqueado: false
}


class ModalListas extends Component {
    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }


    componentDidMount = async () => {
        await this.getLugares();
        await this.getPessoas();
        await this.getGrupos();
        await this.getTiposContatos();
        await this.adicionaInformacaoContatos();

        await this.setState({
            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            moedas: await loader.getBase('getMoedas.php'),
            subgrupos: await loader.getBase('getSubgrupos.php'),
            historicos: await loader.getBase('getHistoricos.php')
        })

        await this.setState({
            planosContasOptions: await Util.turnToOption(this.state.planosContas, "Descricao", "Chave"),
            subgruposOptions: await Util.turnToOption(this.state.subgrupos, 'descricao', 'chave'),
            historicosOptions: await Util.turnToOption(this.state.historicos, "Descricao", 'chave')
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        // Atualizar categoria quando receber da prop
        if (prevProps.categoriaFiltro != this.props.categoriaFiltro && this.props.categoriaFiltro) {
            await this.setState({ categoria: this.props.categoriaFiltro });
        }
        
        if (prevState.clienteCpf != this.state.clienteCpf) {
            let numberPattern = /\d+/g;
            var cpflimpo = ''
            if(this.state.clienteCpf) {
                if (this.state.clienteCpf != '___.___.___-__' && this.state.clienteCpf != '') {
                    let cpflimpo2 = this.state.clienteCpf.match(numberPattern)
                    var cpflimpo = '';
                    if (cpflimpo2 && cpflimpo2[0]) {
                        cpflimpo = cpflimpo2.join('');
                    }
                }
                if (this.state.clienteCpf.length > 10) {
                    this.setState({ clienteCpfLimpo: cpflimpo })
                }
            }
        }

        if (prevState.planoContaCodigo != this.state.planoContaCodigo) {
            let numberPattern = /\d+/g;
            var codigoLimpo = ''
            if (this.state.planoContaCodigo != '_' && this.state.planoContaCodigo != '_._' && this.state.planoContaCodigo != '_._._' && this.state.planoContaCodigo != '_._._.__' && this.state.planoContaCodigo != '_._._.__.__' && this.state.planoContaCodigo != '_._._.__.__.___' && this.state.planoContaCodigo != '_._._.__.__.___.___' && this.state.planoContaCodigo != '') {
                let codigoLimpo2 = this.state.planoContaCodigo.match(numberPattern)
                var codigoLimpo = codigoLimpo2.join('')
            }
            this.setState({ planoContaCodigoLimpo: codigoLimpo })
        }

        if (prevState.enderecoCep != this.state.enderecoCep) {
            this.setState({ enderecoCidadeLock: false, enderecoUFLock: false, enderecoEnderecoLock: false, enderecoBairroLock: false })
        }

        if (prevProps.pesquisa != this.props.pesquisa || this.state.pesquisaExata && this.state.pesquisa == "") {
            this.setState({ tipoPesquisa: 3, pesquisa: this.props.pesquisa, pesquisaExata: true });
        }
    }

    fecharModal = () => {
        this.setState({ pesquisa: '' });
        this.props.closeModal();
    }

    carregaCodigos = async () => {
        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'CC'
        }).then(
            async res => {
                this.setState({ centroCustoCodigo: res.data[0].Proximo })
            }
        )
    }

    getLugares = async () => {
        await apiEmployee.post('getLugares.php', {
            token: true
        }).then(
            async res => {
                this.setState({ paises: res.data.paises, estados: res.data.estados, cidades: res.data.cidades });

                let options = this.state.estados.map((e) => {
                    return { label: e.Descricao, value: e.Chave, pais: e.Pais }
                })
                this.setState({ estadosOptions: options });

                options = this.state.paises.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })
                this.setState({ paisesOptions: options });

                options = this.state.cidades.map((e) => {
                    return { label: e.Descricao, value: e.Chave, estado: e.Estado }
                })
                this.setState({ cidadesOptions: options });

                if (await this.state.enderecoChave != 0) {
                    let option = this.state.estadosOptions.filter((e) => { if (e.value == this.state.enderecoUF) { return e } })
                    this.setState({ enderecoUFNome: option[0].label });

                    option = this.state.paisesOptions.filter((e) => { if (e.value == this.state.enderecoPais) { return e } })
                    this.setState({ enderecoPaisNome: option[0].label });
                }
            },
            async err => console.log('erro: ' + err)
        )
    }

    getPessoas = async () => {
        await apiEmployee.post('getPessoas.php', {
            token: true
        }).then(
            async res => {
                this.setState({ centroCustoPessoas: res.data });

                let options = this.state.centroCustoPessoas.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })
                this.setState({ centroCustoPessoasOptions: options });

            },
            async err => console.log('erro: ' + err)
        )
    }

    getEnderecos = async (pessoa) => {
        await apiEmployee.post(`getEnderecos.php`, {
            token: true,
            pessoa: pessoa
        }).then(
            async response => {
                let enderecos = response.data.map((e) => {
                    return { ...e, tipoNome: this.state.tipoEndereco[e.Tipo] }
                })
                await this.setState({ enderecos: enderecos })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }

        )
    }

    buscarDadosCep = async (cep) => {
        try {
            const obj = await CEP(cep)
            await apiEmployee.post('getEstadoCidade.php', {
                token: true,
                cidade: obj.city,
                estado: obj.state.toUpperCase()
            }).then(
                async res => {
                    this.setState({ enderecoCidade: res.data.cidade[0].Chave, enderecoUF: res.data.estado[0].Chave, enderecoUFNome: res.data.estado[0].Descricao, enderecoCidadeDescricao: res.data.cidade[0].Descricao })
                },
                async err => { console.log('erro: ' + err) }
            )

            await this.setState({ enderecoCepLimpo: obj.cep, enderecoBairro: obj.neighborhood, enderecoEndereco: obj.street })
            await this.setState({ enderecoCidadeLock: (obj.city ? true : false), enderecoUFLock: (obj.state ? true : false), enderecoBairroLock: (obj.neighborhood ? true : false), enderecoEnderecoLock: (obj.street ? true : false) })
            //return true
        } catch (e) {
            //return false
        }
    }

    getContatos = async (pessoa) => {
        await apiEmployee.post(`getContatos.php`, {
            token: true,
            pessoa: pessoa
        }).then(
            async response => {
                await this.setState({ contatos: response.data })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }

        )
    }

    getTiposContatos = async () => {
        await apiEmployee.post("getTiposComplementares.php", {
            token: true
        }).then(
            async res => {
                await this.setState({ contatoTipos: res.data });

                if (this.state.contatoTipos[0]) {
                    let options = this.state.contatoTipos.map((e) => {
                        return { label: e.Descricao, value: e.Codigo }
                    })
                    this.setState({ contatoTiposOptions: options });
                }
            },
            async err => console.log('erro: ' + err)
        )
    }

    adicionaInformacaoContatos = async () => {
        let tiposContatos = this.state.contatos.map((contato) => {
            return { ...contato, tipoNome: this.state.contatoTipos.filter((tipo) => tipo.Codigo == contato.Tipo)[0].Descricao }
        })

        await this.setState({ contatos: tiposContatos })

    }

    getGrupos = async () => {
        await apiEmployee.post('getGrupos.php', {
            token: true
        }).then(
            async res => {
                this.setState({ grupos: res.data });

                let options = this.state.grupos.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })
                this.setState({ gruposOptions: options });

            },
            async err => console.log('erro: ' + err)
        )
    }

    converteCategoria = async (valor) => {
        let categoria = valor.split('');
        const categoriaArray = categoria.map((e) => {
            if (e == 1) {
                return true;
            } else {
                return false;
            }
        });

        categoria = {
            cliente: categoriaArray[0],
            fornecedor: categoriaArray[1],
            prestador_servico: categoriaArray[2],
            transportador: categoriaArray[3],
            banco: categoriaArray[4],
            broker: categoriaArray[5]
            // adm_cartao: categoriaArray[5],
            // adm_convenio: categoriaArray[6]
        }

        this.setState({ clienteCategoria: categoria })

    }

    carregaCodigos = async () => {
        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'PR'
        }).then(
            async res => {
                await this.setState({ planoContaCodigoReduzido: res.data[0].Proximo })
            }
        )


        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'PL'
        }).then(
            async res => {
                await this.setState({ planoContaChave: res.data[0].Proximo })
            }
        )
    }

    setPlanoConta = async (plano) => {
        if (plano.value == 0) {
            await apiEmployee.post('getPlanoContaNivel.php', {
                token: true,
                nivel: 1
            }).then(
                async res => {
                    const codigosPlanos = res.data.map(e => parseInt(e.Codigo));


                    this.setState({ planoContaNivel: 1, planoContaCodigo: `${Math.max(...codigosPlanos, 0) + 1}.` })
                },
                async err => console.log(`erro: ` + err)
            )
        } else {

            let codigoCorrigido = plano.value.split('.').filter((e, i) => i <= plano.nivel);
            codigoCorrigido.splice(plano.nivel - 1);
            if (codigoCorrigido[0]) {
                codigoCorrigido = `${codigoCorrigido.join('.')}.`;
            } else {
                codigoCorrigido = codigoCorrigido.join('.');
            }

            await apiEmployee.post('getPlanoContaCodigo.php', {
                token: true,
                codigo: codigoCorrigido
            }).then(
                async res => {
                    const planosContas = res.data;

                    const codigosPlanos = planosContas.filter((e) => e.Nivel == parseInt(plano.nivel)).map(e => parseInt(e.Codigo.split('.')[parseInt(e.Nivel) - 1]));
                    let codigo = await this.checkCodigo(`${codigoCorrigido.trim()}${(Math.max(...codigosPlanos, 0) + 1)}`)

                    if (plano.nivel != 6) {
                        codigo = `${codigo}.`;
                    }

                    await this.setState({ planoContaCodigo: codigo, planoContaNivel: plano.nivel })

                },
                async err => console.log(`erro: ` + err)
            )
        }
    }

    checkCodigo = async (value) => {
        let valueArray = value.split('.');

        if (valueArray[3] && valueArray[3].length < 2) {
            valueArray[3] = `0${valueArray[3]}`
        }
        if (valueArray[4] && valueArray[4].length < 2) {
            valueArray[4] = `0${valueArray[4]}`
        }

        if (valueArray[5] && valueArray[5].length < 2) {
            valueArray[5] = `0${valueArray[5]}`
        }
        if (valueArray[5] && valueArray[5].length < 3) {
            valueArray[5] = `0${valueArray[5]}`
        }

        if (valueArray[6] && valueArray[6].length < 2) {
            valueArray[6] = `0${valueArray[6]}`
        }
        if (valueArray[6] && valueArray[6].length < 3) {
            valueArray[6] = `0${valueArray[6]}`
        }

        return valueArray.join('.')

    }

    setNivel = async (value) => {
        let nivel = '?';

        if (value.length == 1) {
            nivel = 1;
        } else if (value.length == 2) {
            nivel = 2;
        } else if (value.length == 3) {
            nivel = 3;
        } else if (value.length == 5) {
            nivel = 4;
        } else if (value.length == 7) {
            nivel = 5;
        } else if (value.length == 10) {
            nivel = 6;
        } else if (value.length == 13) {
            nivel = 7;
        }

        this.setState({ planoContaNivel: nivel })
    }

    salvarPlanoConta = async (validFormPlanoConta) => {
        const codigo = this.state.planoContaCodigo.split('').filter((e) => e != "_");

        if (codigo[codigo.length - 1] == ".") {
            codigo.pop()
        }

        await this.setState({ planoContaCodigo: codigo.join('') })

        if (this.state.planoContaContaInativa) {
            await this.setState({ planoContaContaInativa: 1 })
        } else {
            await this.setState({ planoContaContaInativa: 0 })
        }

        if (this.state.planoContaGrupo.length == 1) {
            await this.setState({ planoContaGrupo: `0${this.state.grupo}` });
        }

        this.setState({ planoContaBloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Descricao', valor: this.state.planoContaNome },
                { titulo: 'Nivel', valor: this.state.planoContaNivel },
                { titulo: 'Conta_Inativa', valor: this.state.planoContaContaInativa },
                { titulo: 'Indicador', valor: this.state.planoContaIndicador },
                { titulo: 'grupo', valor: this.state.planoContaGrupo },
                { titulo: 'Codigo', valor: this.state.planoContaCodigo }
            ]
        });

        if (parseInt(this.state.planoContaChave) === 0 && validFormPlanoConta) {
            await this.carregaCodigos();
            await apiEmployee.post(`insertPlanoConta.php`, {
                token: true,
                values: `'${this.state.planoContaChave}', '${this.state.planoContaCodigo}.', '${this.state.planoContaCodigoReduzido}', '${this.state.planoContaNivel}', '${this.state.planoContaIndicador}', '${this.state.planoContaNome}', '${this.state.planoContaContaInativa}', '${this.state.planoContaGrupo}'`,
                codigo: this.state.planoContaCodigoReduzido,
                chave: this.state.planoContaChave
            }).then(
                async res => {
                    await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, null, "Inclusão", this.state.planoContaChave);

                    this.props.alteraPlanoConta(this.state.planoContaChave, this.state.planoContaIndicador)
                    this.setState({
                        planoContaBloqueado: false,
                        planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
                        planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),
                    })
                },
                async res => await console.log(`Erro: ${res}`)
            )
        } else if (validFormPlanoConta) {
            await apiEmployee.post(`updatePlanoConta.php`, {
                token: true,
                Chave: this.state.planoContaChave,
                Codigo: `${this.state.planoContaCodigo}.`,
                Nivel: this.state.planoContaNivel,
                Indicador: this.state.planoContaIndicador,
                Descricao: this.state.planoContaNome,
                Conta_Inativa: this.state.planoContaContaInativa,
                grupo: this.state.planoContaGrupo
            }).then(
                async res => {
                    await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.planoContaChave, `PLANO DE CONTA: ${this.state.planoContaNome}`);
                    this.props.alteraPlanoConta(this.state.planoContaChave, this.state.planoContaIndicador)
                    this.setState({
                        planoContaBloqueado: false,
                        planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
                        planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),
                    })
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    salvarNavio = async (validFormNavio) => {
        if (!validFormNavio) {
            return;
        }
        this.setState({ navioBloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'nome', valor: this.state.navioNome },
                { titulo: 'bandeira', valor: this.state.navioBandeira },
                { titulo: 'imo', valor: this.state.navioImo },
                { titulo: 'grt', valor: this.state.navioGrt },
                { titulo: 'dwt', valor: this.state.navioDwt },
                { titulo: 'loa', valor: this.state.navioLoa },
                { titulo: 'beam', valor: this.state.navioBeam },
            ]
        })

        if (this.state.navioChave == 0) {
            await apiEmployee.post('insertNavioBasico.php', {
                token: true,
                values: `'${this.state.navioNome}', '${this.state.navioBandeira}', '${this.state.navioImo}', '${this.state.navioGrt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.navioDwt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.navioLoa?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.navioBeam?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}'`,
            }).then(
                async res => {
                    await loader.salvaLogs('os_navios', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    this.props.alteraNavio(res.data[0].chave)
                    this.setState({ navioBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updateShip.php`, {
                token: true,
                chave: this.state.navioChave,
                nome: this.state.navioNome,
                bandeira: this.state.navioBandeira,
                imo: this.state.navioImo,
                grt: this.state.navioGrt?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
                dwt: this.state.navioDwt?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
                loa: this.state.navioLoa?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
                beam: this.state.navioBeam?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
            }).then(
                async res => {
                    await loader.salvaLogs('os_navios', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.navioChave, `NAVIO: ${this.state.navioNome}`);

                    this.props.alteraNavio(this.state.navioChave)
                    this.setState({ navioBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }

    }

    salvarPorto = async (validFormPorto) => {
        if (!validFormPorto) {
            return;
        }
        this.setState({ portoBloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'Descricao', valor: this.state.portoNome },
                { titulo: 'Codigo', valor: this.state.portoSigla }
            ]
        })

        if (this.state.portoChave == 0) {
            await apiEmployee.post('insertPortoBasico.php', {
                token: true,
                values: `'${this.state.portoSigla.toUpperCase()}', '${this.state.portoNome}'`
            }).then(
                async res => {
                    await loader.salvaLogs('os_portos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    this.props.alteraPorto(res.data[0].Chave);
                    this.setState({ portoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updatePorto.php`, {
                token: true,
                Chave: this.state.portoChave,
                Descricao: this.state.portoNome,
                Codigo: this.state.portoSigla
            }).then(
                async res => {
                    await loader.salvaLogs('os_portos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.portoChave, `PORTO: ${this.state.portoNome}`);

                    this.props.alteraPorto(this.state.portoChave)
                    this.setState({ portoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }
    }

    salvarCliente = async (validFormCliente) => {
        if (!validFormCliente) {
            return;
        }

        this.setState({ clienteBloqueado: true })
        if (this.state.clienteCpfLimpo) {
            await this.testaCpf();
            if (!this.state.cpfAprovado) {
                return;
            }
        }

        let categoria = [this.state.clienteCategoria.cliente ? 1 : 0, this.state.clienteCategoria.fornecedor ? 1 : 0, this.state.clienteCategoria.prestador_servico ? 1 : 0, this.state.clienteCategoria.transportador ? 1 : 0, this.state.clienteCategoria.banco ? 1 : 0, this.state.clienteCategoria.broker ? 1 : 0];
        categoria = categoria.join('');

        await this.setState({
            dadosFinais: [
                { titulo: 'Nome', valor: this.state.clienteNome },
                { titulo: 'Nome_Fantasia', valor: this.state.clienteNomeFantasia },
                { titulo: 'Cnpj_Cpf', valor: this.state.clienteCpfLimpo },
                { titulo: 'Nascimento_Abertura', valor: this.state.clienteNascimento },
                { titulo: 'Rg_Ie', valor: this.state.clienteRG },
                { titulo: 'Inscricao_Municipal', valor: this.state.clienteInscricaoMunicipal },
                { titulo: 'Conta_Contabil', valor: this.state.clienteContaContabil },
                { titulo: 'Conta_Provisao', valor: this.state.clienteContaProvisao },
                { titulo: 'Conta_Fatura', valor: this.state.clienteContaFatura }
            ]
        })


        if (this.state.clienteChave == 0) {
            await apiEmployee.post('insertPessoaBasico.php', {
                token: true,
                values: `'${this.state.clienteNome}', '${this.state.clienteNomeFantasia}', '${this.state.clienteCpfLimpo}', '${this.state.clienteRG}', '${this.state.clienteInscricaoMunicipal}','${this.state.clienteNascimento}', '${moment().format('YYYY-MM-DD')}', '${categoria}', '${this.state.clienteContaContabil}', '${this.state.clienteContaProvisao}', '${this.state.clienteContaFatura}'`
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    this.props.alteraCliente(res.data[0].Chave, categoria)
                    this.setState({ clienteBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updatePessoa.php`, {
                token: true,
                Chave: this.state.clienteChave,
                Nome: this.state.clienteNome,
                Nome_Fantasia: this.state.clienteNomeFantasia,
                Cnpj_Cpf: this.state.clienteCpfLimpo,
                Rg_Ie: this.state.clienteRG,
                Inscricao_Municipal: this.state.clienteInscricaoMunicipal,
                Nascimento_Abertura: this.state.clienteNascimento,
                Categoria: categoria,
                Conta_Contabil: this.state.clienteContaContabil,
                Conta_Provisao: this.state.clienteContaProvisao,
                Conta_Fatura: this.state.clienteContaFatura
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.clienteChave, `PESSOA: ${this.state.clienteNome}`);

                    console.log(categoria);
                    this.props.alteraCliente(this.state.clienteChave, categoria);
                    this.setState({ clienteBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }
    }

    testaCpf = async () => {
        await apiEmployee.post('testaCpf.php', {
            token: true,
            Cnpj_Cpf: this.state.clienteCpfLimpo
        }).then(
            async res => {
                if (!res.data[0] || res.data[0].Chave == this.state.clienteChave || !this.state.clienteCpfLimpo) {
                    await this.setState({ cpfAprovado: true })
                } else {
                    this.setState({
                        clienteNome: res.data[0].Nome,
                        clienteNomeFantasia: res.data[0].Nome_Fantasia,
                        clienteCpf: res.data[0].Cnpj_Cpf,
                        clienteRG: res.data[0].Rg_Ie,
                        clienteInscricaoMunicipal: res.data[0].Inscricao_Municipal,
                        clienteNascimento: res.data[0].Nascimento_Abertura,
                        clienteInclusao: res.data[0].Inclusao,
                        clienteChave: res.data[0].Chave,
                        clienteContaContabil: res.data[0].Conta_Contabil,
                        clienteContaFatura: res.data[0].Conta_Fatura,
                        clienteContaProvisao: res.data[0].Conta_Provisao,
                        cpfAprovado: false
                    })
                }
            },
            async err => { console.log(err) }
        )
    }

    salvarEndereco = async (validFormEndereco) => {
        this.setState({ enderecoBloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Cep', valor: this.state.enderecoCep },
                { titulo: 'bairro', valor: this.state.enderecoBairro },
                { titulo: 'UF', valor: this.state.enderecoUF },
                { titulo: 'Cidade', valor: this.state.enderecoCidade },
                { titulo: 'pais', valor: this.state.enderecoPais },
                { titulo: 'Endereco', valor: this.state.enderecoEndereco },
                { titulo: 'Numero', valor: this.state.enderecoNumero },
                { titulo: 'Complemento', valor: this.state.enderecoComplemento },
                { titulo: 'Tipo', valor: this.state.enderecoTipo },
                { titulo: 'Cidade_Descricao', valor: this.state.enderecoCidadeDescricao }
            ]
        })

        if (parseInt(this.state.enderecoChave) === 0 && validFormEndereco) {
            await apiEmployee.post(`insertEndereco.php`, {
                token: true,
                values: `'${this.state.enderecoTipo}', '${this.state.enderecoEndereco}', '${this.state.enderecoNumero}', '${this.state.enderecoComplemento}', ${this.state.enderecoCidade}, '${this.state.enderecoCepLimpo}', ${this.state.enderecoUF}, '${this.state.enderecoBairro}', '${this.state.enderecoCidadeDescricao}', '${this.state.enderecoPais}', ${this.state.clienteChave}`,
                Tipo: this.state.enderecoTipo,
                Chave_Pessoa: this.state.clienteChave
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    this.setState({ enderecoBloqueado: false })
                    this.fecharModal()
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validFormEndereco) {
            await apiEmployee.post(`updateEndereco.php`, {
                token: true,
                Chave: this.state.enderecoChave,
                Tipo: this.state.enderecoTipo,
                Endereco: this.state.enderecoEndereco,
                Numero: this.state.enderecoNumero,
                Complemento: this.state.enderecoComplemento,
                Cidade: this.state.enderecoCidade,
                Cep: this.state.enderecoCepLimpo,
                UF: this.state.enderecoUF,
                bairro: this.state.enderecoBairro,
                Cidade_Descricao: this.state.enderecoCidadeDescricao,
                pais: this.state.enderecoPais,
                Chave_Pessoa: this.state.clienteChave,
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.enderecoChave, `ENDERECO: ${this.state.enderecoEndereco}`);
                    this.setState({ enderecoBloqueado: false })
                    this.fecharModal()
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    salvarContato = async (validFormContato) => {
        this.setState({ contatoBloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Campo1', valor: this.state.contatoCampo1 },
                { titulo: 'Campo2', valor: this.state.contatoCampo2 },
                { titulo: 'Tipo', valor: this.state.contatoTipo }
            ]
        })

        if (parseInt(this.state.contatoChave) === 0 && validFormContato) {
            await apiEmployee.post(`insertContato.php`, {
                token: true,
                values: `'${this.state.contatoTipo}', '${this.state.contatoCampo1}', '${this.state.contatoCampo2}', ${this.state.clienteChave}`
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    this.setState({ contatoBloqueado: false })
                    this.fecharModal()
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validFormContato) {
            await apiEmployee.post(`updateContato.php`, {
                token: true,
                Chave: this.state.contatoChave,
                Tipo: this.state.contatoTipo,
                Campo1: this.state.contatoCampo1,
                Campo2: this.state.contatoCampo2,
                Chave_Pessoa: this.state.clienteChave,
            }).then(
                async res => {
                    await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.contatoChave, `CONTATO: ${this.state.contatoCampo1}`);
                    this.setState({ contatoBloqueado: false })
                    this.fecharModal()
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    salvarTipoServico = async (validFormTipoServico) => {
        if (!validFormTipoServico) {
            return;
        }
        this.setState({ tipoServicoBloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.tipoServicoNome },
                { titulo: 'prazo', valor: this.state.tipoServicoPrazo }
            ]
        })

        if (this.state.tipoServicoChave == 0) {
            await apiEmployee.post('insertTipoServicoBasico.php', {
                token: true,
                values: `'${this.state.tipoServicoNome}', '${this.state.tipoServicoPrazo}'`
            }).then(
                async res => {
                    await loader.salvaLogs('os_tipos_servicos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    this.props.alteraTipoServico(res.data[0].chave)
                    this.setState({ tipoServicoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updateTipoServico.php`, {
                token: true,
                chave: this.state.tipoServicoChave,
                descricao: this.state.tipoServicoNome,
                prazo: this.state.tipoServicoPrazo
            }).then(
                async res => {
                    await loader.salvaLogs('os_tipos_servicos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.tipoServicoChave, `TIPO DE SERVIÇO: ${this.state.tipoServicoNome}`);

                    this.props.alteraTipoServico(this.state.tipoServicoChave)
                    this.setState({ tipoServicoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }
    }

    salvarCentroCusto = async (validFormCentroCusto) => {
        if (!validFormCentroCusto) {
            return;
        }
        this.setState({ centroCustoBloqueado: true });
        if (!this.state.centroCustoCodigo) {
            await this.setState({ centroCustoCodigo: await loader.getCodigoCC() });
        }

        await this.setState({
            dadosFinais: [
                { titulo: 'Descricao', valor: this.state.centroCustoNome },
                { titulo: 'Cliente', valor: this.state.centroCustoCliente },
                { titulo: 'Data', valor: this.state.centroCustoData },
                { titulo: 'Encerrado', valor: this.state.centroCustoEncerramento },
                { titulo: 'Codigo', valor: this.state.centroCustoCodigo }
            ]
        })

        if (this.state.centroCustoChave == 0) {
            await apiEmployee.post('insertCentroCustoBasico.php', {
                token: true,
                values: `'${this.state.centroCustoNome}', '${moment(this.state.data).format('YYYY-MM-DD')}', '${this.state.centroCustoCliente}', '${this.state.centroCustoCodigo}'`,
                codigo: this.state.centroCustoCodigo,
                tipo: 'CC'
            }).then(
                async res => {
                    await loader.salvaLogs('centros_custos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    this.props.alteraCentroCusto(res.data[0].Chave)
                    this.setState({ centroCustoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updateCentroCusto.php`, {
                token: true,
                Chave: this.state.centroCustoChave,
                Descricao: this.state.centroCustoNome,
                Data: moment(this.state.centroCustoData).format('YYYY-MM-DD'),
                Encerrado: this.state.centroCustoEncerramento ? moment(this.state.centroCustoEncerramento).format('YYYY-MM-DD') : '',
                Cliente: this.state.centroCustoCliente,
                Codigo: this.state.centroCustoCodigo,
            }).then(
                async res => {
                    await loader.salvaLogs('centros_custos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.centroCustoChave, `CENTRO DE CUSTO: ${this.state.centroCustoNome}`);

                    this.props.alteraCentroCusto(this.state.centroCustoChave)
                    this.setState({ centroCustoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }
    }

    salvarSubgrupo = async (validFormSubgrupo) => {
        //this.getMaxNews()
        this.setState({ subgrupoBloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.subgrupoNome },
                { titulo: 'chave_grupo', valor: this.state.subgrupoGrupo }
            ]
        })

        if (parseInt(this.state.subgrupoChave) === 0 && validFormSubgrupo) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertSubgrupoBasico.php`, {
                token: true,
                values: `'${this.state.subgrupoNome}', '${this.state.subgrupoGrupo}'`
            }).then(
                async res => {
                    await loader.salvaLogs('os_subgrupos_taxas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    this.props.alteraSubgrupo(res.data[0].chave)
                    this.setState({ subgrupoBloqueado: false })
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validFormSubgrupo) {
            await apiEmployee.post(`updateSubgrupo.php`, {
                token: true,
                chave: this.state.subgrupoChave,
                descricao: this.state.subgrupoNome,
                grupo: this.state.subgrupoGrupo
            }).then(
                async res => {
                    await loader.salvaLogs('os_subgrupos_taxas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.subgrupoChave, `SUBGRUPOS DE TAXAS: ${this.state.subgrupoNome}`);

                    this.props.alteraSubgrupo(this.state.subgrupoChave)
                    this.setState({ subgrupoBloqueado: false })
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    salvarTaxa = async (validForm) => {
        //this.getMaxNews()
        if (this.state.taxaVariavel) {
            this.setState({ taxaVariavel: 1 })
        } else {
            this.setState({ taxaVariavel: 0 })
        }
        this.setState({ taxaBloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.taxaNome },
                { titulo: 'valor', valor: this.state.taxaValor },
                { titulo: 'variavel', valor: this.state.taxaVariavel },
                { titulo: 'Moeda', valor: this.state.taxaMoeda },
                { titulo: 'Tipo', valor: this.state.taxaTipo },
                { titulo: 'Conta_Contabil', valor: this.state.taxaConta_contabil },
                { titulo: 'conta_credito', valor: this.state.taxaConta_credito },
                { titulo: 'historico_padrao', valor: this.state.taxaHistorico_padrao },
                { titulo: 'formula_ate', valor: this.state.taxaFormula_ate },
                { titulo: 'sub_grupo', valor: this.state.taxaSubgrupo }
            ]
        })

        if (parseInt(this.state.taxaChave) === 0 && validForm) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertTaxa.php`, {
                token: true,
                values: `'${this.state.taxaNome}', '${parseFloat(this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.taxaVariavel}', '${this.state.taxaMoeda}', '${this.state.taxaTipo}', '${this.state.taxaConta_contabil}', '${this.state.taxaHistorico_padrao}', '${this.state.taxaFormula_ate}', '${this.state.taxaSubgrupo}'`
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('os_taxas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);


                        this.props.alteraTaxa(res.data[0].chave, res.data[0].tipo)
                        this.setState({ taxaBloqueado: false })

                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateTaxa.php`, {
                token: true,
                chave: this.state.taxaChave,
                descricao: this.state.taxaNome,
                valor: parseFloat(this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.')),
                variavel: this.state.taxaVariavel,
                Moeda: this.state.taxaMoeda,
                Tipo: this.state.taxaTipo,
                Conta_Contabil: this.state.taxaConta_contabil,
                conta_credito: this.state.taxaConta_credito,
                historico_padrao: this.state.taxaHistorico_padrao,
                formula_ate: this.state.taxaFormula_ate,
                sub_grupo: this.state.taxaSubgrupo
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os_taxas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `TAXA: ${this.state.taxaNome}`);

                        this.props.alteraTaxa(this.state.taxaChave, this.state.taxaTipo)
                        this.setState({ taxaBloqueado: false })
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    salvarDescricaoPadrao = async (validForm) => {
        if (!validForm) {
            return;
        }
        this.setState({ descricaoBloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.descricaoNome }
            ]
        })

        if (this.state.tipoServicoChave == 0) {
            await apiEmployee.post('insertDescricaoPadrao.php', {
                token: true,
                values: `'${this.state.descricaoNome}'`
            }).then(
                async res => {
                    await loader.salvaLogs('os_descricao_padrao', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    this.props.alteraDescricaoPadrao(this.state.descricaoNome)
                    this.setState({ descricaoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updateDescricaoPadrao.php`, {
                token: true,
                chave: this.state.descricaoChave,
                descricao: this.state.descricaoNome
            }).then(
                async res => {
                    await loader.salvaLogs('os_descricao_padrao', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.descricaoChave, `DESCRICAO PADRAO: ${this.state.descricaoNome}`);

                    this.props.alteraDescricaoPadrao(this.state.descricaoNome)
                    this.setState({ descricaoBloqueado: false })
                },
                async res => await console.log(`erro: ${res}`)
            )
        }
    }

    deleteShip = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Navio? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteShip.php`, {
                                        token: true,
                                        id_ship: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_navios', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deletePorto = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Porto? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deletePorto.php`, {
                                        token: true,
                                        id_porto: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_portos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deletePessoa = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Pessoa? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deletePessoa.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteEndereco = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Endereco? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteEndereco.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteContato = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Contato? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteContato.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteTipoServico = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Tipo de Serviço? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteTiposServico.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                //alert('Removido!')
                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteSubgrupo = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Subgrupo de Taxa? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteSubgrupo.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_subgrupos_taxas', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.alert(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deletePlanoConta = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Plano de Conta? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deletePlanoConta.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.alert(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteTaxa = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Taxa? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteTaxa.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_taxas', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.alert(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    deleteDescricaoPadrao = async (chave, nome) => {
        this.fecharModal()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Descrição Padrão? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteDescricaoPadrao.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                //alert('Removido!')
                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    filtrarPesquisa = (item) => {
        // Filtro por categoria (verificar bit específico)
        if (this.state.categoria) {
            const subCategoria = item.Categoria || '0';
            const posicao = parseInt(this.state.categoria) - 1;
            
            // Verificar se o bit na posição está ativo (1)
            if (subCategoria.length <= posicao || subCategoria[posicao] != '1') {
                return false;
            }
        }

        // Filtro por pesquisa
        if (!this.state.pesquisa) {
            return true;
        }
        if (this.state.tipoPesquisa == 1) {
            if (item.nome) {
                return item.nome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            } else if (item.Nome) {
                return item.Nome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            } else if (item.descricao) {
                return item.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            } else if (item.Descricao) {
                return item.Descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            }
        } else if (item.bandeira && this.state.tipoPesquisa == 2) {
            return item.bandeira.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 3) {
            if (this.state.pesquisaExata) {
                if (item.chave) {
                    return item.chave.toLowerCase() == this.state.pesquisa.toLowerCase()
                } else if (item.Chave) {
                    return item.Chave.toLowerCase() == this.state.pesquisa.toLowerCase()
                }
            } else {
                if (item.chave) {
                    return item.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
                } else if (item.Chave) {
                    return item.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
                }
            }
        } else if (this.state.tipoPesquisa == 4) {
            return item.Codigo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 5) {
            return item.Cnpj_Cpf.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 6) {
            return item.prazo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Cliente && this.state.tipoPesquisa == 7) {
            return item.Cliente.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 8) {
            return item.grupo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Endereco && this.state.tipoPesquisa == 9) {
            return item.Endereco.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.tipoNome && this.state.tipoPesquisa == 10) {
            return item.tipoNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Cep && this.state.tipoPesquisa == 11) {
            return item.Cep.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Campo1 && this.state.tipoPesquisa == 12) {
            return item.Campo1.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.valor && this.state.tipoPesquisa == 13) {
            return item.valor.includes(this.state.pesquisa)
        }

    }


    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }


    render() {

        const validationsNavio = [];
        validationsNavio.push(this.state.navioNome);
        validationsNavio.push(!this.state.navioBloqueado);

        const validFormNavio = validationsNavio.reduce((t, a) => t && a);

        const validationsPorto = [];
        validationsPorto.push(this.state.portoNome);
        validationsPorto.push(this.state.portoSigla && this.state.portoSigla.length == 3);
        validationsPorto.push(!this.state.portoBloqueado);

        const validFormPorto = validationsPorto.reduce((t, a) => t && a);

        const validationsCliente = [];
        validationsCliente.push(this.state.clienteNome);
        validationsCliente.push(!this.state.clienteCpfLimpo || (this.state.clienteCpfLimpo.length == 11 || this.state.clienteCpfLimpo.length == 14))
        validationsCliente.push(!this.state.clienteBloqueado);

        const validFormCliente = validationsCliente.reduce((t, a) => t && a);

        const validationsTipoServico = [];
        validationsTipoServico.push(this.state.tipoServicoNome);
        validationsTipoServico.push(this.state.tipoServicoPrazo && parseInt(this.state.tipoServicoPrazo) == this.state.tipoServicoPrazo);
        validationsTipoServico.push(!this.state.tipoServicoBloqueado);

        const validFormTipoServico = validationsTipoServico.reduce((t, a) => t && a);

        const validationsCentroCusto = [];
        validationsCentroCusto.push(this.state.centroCustoNome);
        validationsCentroCusto.push(!this.state.centroCustoBloqueado);

        const validFormCentroCusto = validationsCentroCusto.reduce((t, a) => t && a);

        const validationsSubgrupo = []
        validationsSubgrupo.push(this.state.subgrupoNome)
        validationsSubgrupo.push(this.state.subgrupoGrupo)
        validationsSubgrupo.push(!this.state.subgrupoBloqueado)

        const validFormSubgrupo = validationsSubgrupo.reduce((t, a) => t && a)

        const validationsPlanoConta = [];
        validationsPlanoConta.push(this.state.planoContaNome);
        validationsPlanoConta.push(this.state.planoContaNivel && this.state.planoContaNivel > 0 && this.state.planoContaNivel < 8 && this.state.planoContaNivel == parseInt(this.state.planoContaNivel));
        validationsPlanoConta.push(this.state.planoContaCodigo);
        validationsPlanoConta.push(this.state.planoContaIndicador && (this.state.planoContaIndicador == 'A' || this.state.planoContaIndicador == 'S'));
        validationsPlanoConta.push(this.state.planoContaGrupo && parseInt(this.state.planoContaGrupo) <= 5 && parseInt(this.state.planoContaGrupo) >= 0);
        validationsPlanoConta.push(!this.state.planoContaBloqueado);


        const validFormPlanoConta = validationsPlanoConta.reduce((t, a) => t && a)

        const validationsEndereco = []
        validationsEndereco.push(this.state.enderecoEndereco)
        validationsEndereco.push(this.state.enderecoUF == 81 || this.state.enderecoCepLimpo)
        validationsEndereco.push(this.state.enderecoPais)
        validationsEndereco.push(this.state.enderecoCidade || this.state.enderecoUF == 81)
        validationsEndereco.push(this.state.enderecoTipo || parseInt(this.state.enderecoTipo) === 0)
        validationsEndereco.push(!this.state.enderecoBloqueado)

        const validFormEndereco = validationsEndereco.reduce((t, a) => t && a)

        const validationsContato = []
        validationsContato.push(this.state.contatoCampo1)
        validationsContato.push(this.state.contatoTipo)
        validationsContato.push(!this.state.contatoBloqueado)

        const validFormContato = validationsContato.reduce((t, a) => t && a)

        const validationsTaxa = []
        validationsTaxa.push(this.state.taxaNome)
        validationsTaxa.push(this.state.taxaValor && parseFloat(this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.')) >= 0)
        validationsTaxa.push(this.state.taxaSubgrupo)
        validationsTaxa.push(this.state.taxaMoeda)
        validationsTaxa.push(this.state.taxaValor && this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.')))
        validationsTaxa.push(!this.state.taxaBloqueado)

        const validFormTaxa = validationsTaxa.reduce((t, a) => t && a)

        const validationsDescricao = []
        validationsDescricao.push(this.state.descricaoNome)
        validationsDescricao.push(!this.state.descricaoBloqueado)

        const validFormDescricao = validationsDescricao.reduce((t, a) => t && a)

        return (
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                open={this.props.modalAberto}
                onClose={async () => await this.setState({ modalAberto: false })}
            >
                <div className='modalContainer'>
                    {this.props.modal == 'listarNavios' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Navios</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false, pesquisaExata: false }) }}>
                                                    <option value={1}>Nome</option>
                                                    <option value={2}>Bandeira</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], navioChave: 0, navioNome: '', navioBandeira: '' }); this.props.alteraModal('criarNavio') }} className="btn btn-success">Adicionar Navio</button></div>
                                                    </div>}
                                            </div>

                                        </div>


                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Navio</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Bandeira</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraNavio(feed.chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraNavio(feed.chave)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.nome}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraNavio(feed.chave)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <h6>{feed.bandeira}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        dadosIniciais: [],
                                                                        navioChave: 0,
                                                                        navioNome: '',
                                                                        navioBandeira: '',
                                                                        navioImo: '',
                                                                        navioGrt: '0',
                                                                        navioDwt: '0',
                                                                        navioLoa: '0',
                                                                        navioBeam: '0',
                                                                    });
                                                                    this.props.alteraModal('criarNavio')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                    {/*to=
                                                                {{
                                                                    pathname: `/admin/addship/0`,
                                                                    state: { ship: { ...feed } }
                                                                }}*/}
                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        navioNome: feed.nome,
                                                                        navioBandeira: feed.bandeira,
                                                                        navioChave: feed.chave,
                                                                        navioImo: feed.imo,
                                                                        navioGrt: feed.grt,
                                                                        navioDwt: feed.dwt,
                                                                        navioLoa: feed.loa,
                                                                        navioBeam: feed.beam,
                                                                        dadosIniciais: [
                                                                            { titulo: 'nome', valor: feed.nome },
                                                                            { titulo: 'bandeira', valor: feed.bandeira },
                                                                            { titulo: 'imo', valor: feed.imo },
                                                                            { titulo: 'grt', valor: feed.grt },
                                                                            { titulo: 'dwt', valor: feed.dwt },
                                                                            { titulo: 'loa', valor: feed.loa },
                                                                            { titulo: 'beam', valor: feed.beam },
                                                                        ]
                                                                    }); this.props.alteraModal('criarNavio')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                                {/*to=
                                                                {{
                                                                    pathname: `/admin/addship/${feed.chave}`,
                                                                    state: { ship: { ...feed } }
                                                                }}*/}
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'NAVIOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteShip(feed.chave, feed.nome)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}


                    {this.props.modal == 'criarNavio' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Navios</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarNavio(validFormNavio)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.navioNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioNome} onChange={async e => { this.setState({ navioNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Bandeira</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.navioBandeira &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.paisesOptions} onChange={(e) => { this.setState({ navioBandeira: e.label }) }} autocomplete={'off'} placeholder={this.state.navioBandeira} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Imo</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioImo} onChange={async e => { this.setState({ navioImo: e.currentTarget.value }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Grt</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioGrt} onChange={async e => { this.setState({ navioGrt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') }) }} />
                                                        </div>
                                                        <div className="col-1"></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Dwt</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioDwt} onChange={async e => { this.setState({ navioDwt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') }) }} />
                                                        </div>
                                                        <div className="col-1"></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Loa</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioLoa} onChange={async e => { this.setState({ navioLoa: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') }) }} />
                                                        </div>
                                                        <div className="col-1"></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Beam</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.navioBeam} onChange={async e => { this.setState({ navioBeam: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') }) }} />
                                                        </div>
                                                        <div className="col-1"></div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormNavio} type="submit" style={validFormNavio ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>
                        </div>}


                    {this.props.modal == 'listarPortos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Portos</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Nome</option>
                                                    <option value={4}>Sigla</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], portoChave: 0, portoNome: '', portoSigla: '' }); this.props.alteraModal('criarPorto') }} className="btn btn-success">Adicionar Porto</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Porto</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Sigla</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraPorto(feed.Chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.Chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraPorto(feed.Chave)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.Descricao}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraPorto(feed.Chave)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left">
                                                            <h6>{feed.Codigo}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => { this.setState({ dadosIniciais: [], portoChave: 0, portoNome: '', portoSigla: '' }); this.props.alteraModal('criarPorto') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        portoNome: feed.Descricao,
                                                                        portoSigla: feed.Codigo,
                                                                        portoChave: feed.Chave,
                                                                        dadosIniciais: [
                                                                            { titulo: 'Descricao', valor: feed.Descricao },
                                                                            { titulo: 'Codigo', valor: feed.Codigo }
                                                                        ]
                                                                    }); this.props.alteraModal('criarPorto')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PORTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deletePorto(feed.Chave, feed.Descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarPorto' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Portos</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarPorto(validFormPorto)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.portoNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.portoNome} onChange={async e => { this.setState({ portoNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Código</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.portoSigla &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                            {this.state.portoSigla && this.state.portoSigla.length != 3 &&
                                                                <FontAwesomeIcon title='Três caracteres necessários' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.portoSigla} onChange={async e => { this.setState({ portoSigla: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormPorto} type="submit" style={validFormPorto ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'listarCliente' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>{this.state.categoria === "6" ? "Brokers" : "Pessoas"}</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2" placeholder="Categoria..." value={this.state.categoria} onChange={e => { this.setState({ categoria: e.currentTarget.value }) }}>
                                                    <option value="">Todas</option>
                                                    <option value="1">Cliente</option>
                                                    <option value="2">Fornecedor</option>
                                                    <option value="5">Banco</option>
                                                    <option value="6">Broker</option>
                                                </select>
                                                <select className="form-control tipoPesquisa col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Nome</option>
                                                    <option value={5}>Cpf/Cnpj</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-5 col-sm-5 col-md-5 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], clienteChave: 0, clienteNome: '', clienteNomeFantasia: '', clienteCpf: '', clienteCpfLimpo: '', clienteNascimento: '', clienteRG: '', clienteInscricaoMunicipal: "", clienteContaContabil: '', clienteContaProvisao: '', clienteContaFatura: '', clienteContaContabilInicial: '', clienteContaProvisaoInicial: '', clienteContaFaturaInicial: '' }); this.converteCategoria("0000000"); this.props.alteraModal('criarCliente') }} className="btn btn-success">Adicionar Pessoa</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Chave</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Pessoa</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Cnpj / Cpf</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Info</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-right">
                                                        <span className="subtituloships"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0]?.Nome != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.state.categoria === "6" ? this.props.alteraBroker(feed.Chave, feed.Categoria) : this.props.alteraCliente(feed.Chave, feed.Categoria)} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.Chave}</p>
                                                        </div>
                                                        <div onClick={() => this.state.categoria === "6" ? this.props.alteraBroker(feed.Chave, feed.Categoria) : this.props.alteraCliente(feed.Chave, feed.Categoria)} className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <h6 className="mobileajuster5">{feed.Nome}</h6>
                                                        </div>
                                                        <div onClick={() => this.state.categoria === "6" ? this.props.alteraBroker(feed.Chave, feed.Categoria) : this.props.alteraCliente(feed.Chave, feed.Categoria)} className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <h6>{feed.Cnpj_Cpf}</h6>
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='iconelixo giveMargin' type='button' onClick={async () => { await this.setState({ clienteChave: feed.Chave, tipoPesquisa: 12, pesquisa: "", pesquisaExata: false }); console.log(this.state.pesquisa); await this.getContatos(feed.Chave); await this.adicionaInformacaoContatos(); this.props.alteraModal('listarContatos') }}>
                                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                                </div>
                                                            }

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <div className='iconelixo giveMargin' type='button' onClick={async () => { await this.setState({ clienteChave: feed.Chave, tipoPesquisa: 9, pesquisa: "", pesquisaExata: false }); console.log(this.state.pesquisa); await this.getEnderecos(feed.Chave); this.props.alteraModal('listarEnderecos') }}>
                                                                        <FontAwesomeIcon icon={faHome} />
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        clienteChave: 0,
                                                                        clienteNome: '',
                                                                        clienteNomeFantasia: '',
                                                                        clienteCpf: '',
                                                                        clienteCpfLimpo: '',
                                                                        clienteNascimento: '',
                                                                        clienteRG: '',
                                                                        clienteInscricaoMunicipal: '',
                                                                        clienteContaContabil: '',
                                                                        clienteContaProvisao: '',
                                                                        clienteContaFatura: '',
                                                                        clienteContaContabilInicial: '',
                                                                        clienteContaProvisaoInicial: '',
                                                                        clienteContaFaturaInicial: '',
                                                                        dadosIniciais: []
                                                                    });
                                                                    await this.converteCategoria("0000000");
                                                                    await this.props.alteraModal('criarCliente')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        clienteNome: feed.Nome,
                                                                        clienteNomeFantasia: feed.Nome_Fantasia,
                                                                        clienteCpf: feed.Cnpj_Cpf,
                                                                        clienteNascimento: feed.Nascimento_Abertura,
                                                                        clienteRG: feed.Rg_Ie,
                                                                        clienteInscricaoMunicipal: feed.Inscricao_Municipal,
                                                                        clienteChave: feed.Chave,
                                                                        clienteContaContabil: feed.Conta_Contabil,
                                                                        clienteContaProvisao: feed.Conta_Provisao,
                                                                        clienteContaFatura: feed.Conta_Faturar,
                                                                        clienteContaContabilInicial: feed.Conta_Contabil,
                                                                        clienteContaProvisaoInicial: feed.Conta_Provisao,
                                                                        clienteContaFaturaInicial: feed.Conta_Faturar,

                                                                        dadosIniciais: [
                                                                            { titulo: 'Nome', valor: feed.Nome },
                                                                            { titulo: 'Nome_Fantasia', valor: feed.Nome_Fantasia },
                                                                            { titulo: 'Cnpj_Cpf', valor: feed.Cnpj_Cpf },
                                                                            { titulo: 'Nascimento_Abertura', valor: feed.Nascimento_Abertura },
                                                                            { titulo: 'Rg_Ie', valor: feed.Rg_Ie },
                                                                            { titulo: 'Inscricao_Municipal', valor: feed.Inscricao_Municipal },
                                                                            { titulo: 'Conta_Contabil', valor: feed.Conta_Contabil },
                                                                            { titulo: 'Conta_Provisao', valor: feed.Conta_Provisao },
                                                                            { titulo: 'Conta_Fatura', valor: feed.Conta_Fatura },
                                                                        ]
                                                                    });
                                                                    await this.getEnderecos(feed.Chave)
                                                                    await this.getContatos(feed.Chave)
                                                                    await this.adicionaInformacaoContatos();
                                                                    await this.converteCategoria(feed.Categoria);

                                                                    await this.props.alteraModal('criarCliente');

                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deletePessoa(feed.Chave, feed.Nome)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarCliente' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Pessoas</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarCliente(validFormCliente)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>CPF/CNPJ</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <InputMask type='text' mask={this.state.clienteCpfLimpo.length <= 11 ? '999.999.999-99' : '99.999.999/9999-99'} className='form-control' value={this.state.clienteCpfLimpo} onChange={e => this.setState({ clienteCpf: e.currentTarget.value })} onKeyDown={e => { if (this.state.clienteCpfLimpo.length == 11 && e.nativeEvent.key == parseInt(e.nativeEvent.key)) { this.setState({ clienteCpfLimpo: `${this.state.clienteCpfLimpo}${e.nativeEvent.key}` }) } }} />

                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.clienteNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.clienteNome} onChange={async e => { this.setState({ clienteNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nome Fantasia</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.clienteNomeFantasia} onChange={async e => { this.setState({ clienteNomeFantasia: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>RG/IE</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.clienteRG} onChange={async e => { this.setState({ clienteRG: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Inscrição Municipal</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.clienteInscricaoMunicipal} onChange={async e => { this.setState({ clienteInscricaoMunicipal: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nascimento / Abertura</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="date" value={this.state.clienteNascimento} onChange={async e => { this.setState({ clienteNascimento: e.currentTarget.value }) }} />
                                                        </div>
                                                        {this.state.clienteCategoria.cliente &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Contabil - Receber</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.clienteContaContabil)[0]} search={true} onChange={(e) => { this.setState({ clienteContaContabil: e.value, }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Contabil - Fatura</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.clienteContaFatura)[0]} search={true} onChange={(e) => { this.setState({ clienteContaFatura: e.value, }) }} />
                                                                </div>
                                                            </>
                                                        }
                                                        {this.state.clienteCategoria.fornecedor &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Contabil - Pagar</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.clienteContaProvisao)[0]} search={true} onChange={(e) => { this.setState({ clienteContaProvisao: e.value, }) }} />
                                                                </div>
                                                            </>
                                                        }
                                                        <div className="col-12">
                                                            <label className="center">Categorias</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Cliente</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='cliente' checked={this.state.clienteCategoria.cliente} onChange={async e => { await this.setState({ clienteCategoria: { ...this.state.clienteCategoria, cliente: e.target.checked } }); if (e.target.checked) { await this.setState({ clienteContaContabil: this.state.clienteContaContabilInicial, clienteContaFatura: this.state.clienteContaFaturaInicial }) } else { await this.setState({ clienteContaContabil: "", clienteContaFatura: "" }) } }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Fornecedor</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='fornecedor' checked={this.state.clienteCategoria.fornecedor} onChange={async e => { this.setState({ clienteCategoria: { ...this.state.clienteCategoria, fornecedor: e.target.checked } }); if (e.target.checked) { await this.setState({ clienteContaProvisao: this.state.clienteContaProvisaoInicial }) } else { await this.setState({ clienteContaProvisao: "" }) } }} />
                                                        </div>
                                                        {/* <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Prestador de Serviços</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='prestador_servicos' checked={this.state.clienteCategoria.prestador_servico} onChange={async e => { this.setState({ clienteCategoria: { ...this.state.clienteCategoria, prestador_servico: e.target.checked } }) }} />
                                                        </div> */}
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Banco</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='banco' checked={this.state.clienteCategoria.banco} onChange={async e => { this.setState({ clienteCategoria: { ...this.state.clienteCategoria, banco: e.target.checked } }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Broker</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='broker' checked={this.state.clienteCategoria.broker} onChange={async e => { this.setState({ clienteCategoria: { ...this.state.clienteCategoria, broker: e.target.checked } }) }} />
                                                        </div>

                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormCliente} type="submit" style={validFormCliente ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                                {this.state.clienteChave != 0 && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&

                                    <div>

                                        <div>
                                            <div>
                                                <div className="page-breadcrumb2"><h3>Endereços</h3></div>
                                            </div>
                                            <div>
                                                <div>
                                                    <div className="row" id="product-list">
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                        <div className="col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                            <div className="single-product-item">
                                                                <div className="row subtitulosTabela">
                                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                        <span className="subtituloships">Chave</span>
                                                                    </div>
                                                                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                        <span className="subtituloships">Endereço</span>
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                        <span className="subtituloships">Cep</span>
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                        {!this.state.enderecos[0] &&
                                                                            <div><button onClick={async () => {
                                                                                await this.setState({
                                                                                    enderecoChave: 0,
                                                                                    enderecoCep: '',
                                                                                    enderecoCepLimpo: '',
                                                                                    enderecoBairro: '',
                                                                                    enderecoUF: -1,
                                                                                    enderecoCidade: '',
                                                                                    enderecoPais: 1,
                                                                                    enderecoEndereco: '',
                                                                                    enderecoNumero: '',
                                                                                    enderecoComplemento: '',
                                                                                    enderecoTipo: 0,
                                                                                    enderecoCidadeDescricao: '',
                                                                                    enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                                    enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                                    enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                                    enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),
                                                                                    dadosIniciais: []
                                                                                });
                                                                                await this.setState({
                                                                                    enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                                                });
                                                                                await this.getLugares();
                                                                                this.props.alteraModal('criarEndereco')
                                                                            }} className="btn btn-success">Adicionar Endereco</button></div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                    </div>

                                                    <div id="product-list">


                                                        {this.state.enderecos[0] != undefined && this.state.enderecos.map((feed, index) => (
                                                            <div key={feed.Chave} className="row row-list">
                                                                <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                <div className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags par" : "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                                    <div className="row deleteMargin alignCenter">
                                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                            <p>{feed.Chave}</p>
                                                                        </div>
                                                                        <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                            <p>{feed.Endereco}</p>
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                            <p>{feed.Cep}</p>
                                                                        </div>
                                                                        <div className='col-1'></div>
                                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones iconesCrud">
                                                                            <div className='iconelixo giveMargin' type='button' >
                                                                                <div onClick={async () => {
                                                                                    await this.setState({
                                                                                        enderecoChave: 0,
                                                                                        enderecoCep: '',
                                                                                        enderecoCepLimpo: '',
                                                                                        enderecoBairro: '',
                                                                                        enderecoUF: -1,
                                                                                        enderecoCidade: '',
                                                                                        enderecoPais: 1,
                                                                                        enderecoEndereco: '',
                                                                                        enderecoNumero: '',
                                                                                        enderecoComplemento: '',
                                                                                        enderecoTipo: 0,
                                                                                        enderecoCidadeDescricao: '',
                                                                                        enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                                        enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                                        enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                                        enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),
                                                                                        dadosIniciais: []
                                                                                    });
                                                                                    await this.setState({
                                                                                        enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                                                    });
                                                                                    await this.getLugares();
                                                                                    this.props.alteraModal('criarEndereco')
                                                                                }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                                </div>
                                                                            </div>


                                                                            <div className='iconelixo giveMargin' type='button' >
                                                                                <div onClick={async () => {
                                                                                    await this.setState({
                                                                                        enderecoChave: feed.Chave,
                                                                                        enderecoCep: feed.Cep,
                                                                                        enderecoCepLimpo: feed.Cep,
                                                                                        enderecoBairro: feed.bairro,
                                                                                        enderecoUF: feed.UF,
                                                                                        enderecoCidade: feed.Cidade,
                                                                                        enderecoPais: feed.pais,
                                                                                        enderecoEndereco: feed.Endereco,
                                                                                        enderecoNumero: feed.Numero,
                                                                                        enderecoComplemento: feed.Complemento,
                                                                                        enderecoTipo: feed.Tipo,
                                                                                        enderecoCidadeDescricao: feed.Cidade_Descricao,
                                                                                        enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                                        enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                                        enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                                        enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),

                                                                                        dadosIniciais: [
                                                                                            { titulo: 'Cep', valor: feed.Cep },
                                                                                            { titulo: 'bairro', valor: feed.bairro },
                                                                                            { titulo: 'UF', valor: feed.UF },
                                                                                            { titulo: 'Cidade', valor: feed.Cidade },
                                                                                            { titulo: 'pais', valor: feed.pais },
                                                                                            { titulo: 'Endereco', valor: feed.Endereco },
                                                                                            { titulo: 'Numero', valor: feed.Numero },
                                                                                            { titulo: 'Complemento', valor: feed.Complemento },
                                                                                            { titulo: 'Tipo', valor: feed.Tipo },
                                                                                            { titulo: 'Cidade_Descricao', valor: feed.Cidade_Descricao }
                                                                                        ]
                                                                                    });
                                                                                    await this.setState({
                                                                                        enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                                                    });
                                                                                    await this.getLugares();
                                                                                    this.props.alteraModal('criarEndereco')
                                                                                }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                </div>
                                                                            </div>

                                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteEndereco(feed.Chave, feed.Endereco)} >
                                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                                </div>
                                                                            }
                                                                        </div>


                                                                    </div>
                                                                </div>
                                                                <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                }
                                {this.state.clienteChave != 0 && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                    <div style={{ display: `flex`, justifyContent: `center`, alignItems: `center` }}>
                                        <hr style={{ width: `50%` }} />
                                    </div>
                                }
                                {this.state.clienteChave != 0 && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                    <div>
                                        <div>
                                            <div>
                                                <div className="page-breadcrumb2"><h3>Contatos</h3></div>
                                            </div>
                                            <div>
                                                <div>
                                                    <div className="row" id="product-list">
                                                        <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                        <div className="col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                            <div className="single-product-item">
                                                                <div className="row subtitulosTabela">
                                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                        <span className="subtituloships">Chave</span>
                                                                    </div>
                                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                        <span className="subtituloships">Tipo</span>
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                        <span className="subtituloships">Campo 1</span>
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                        <span className="subtituloships">Campo 2</span>
                                                                    </div>
                                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                        {!this.state.contatos[0] &&

                                                                            <div><button onClick={async () => {
                                                                                await this.setState({
                                                                                    contatoChave: 0,
                                                                                    contatoCampo1: '',
                                                                                    contatoCampo2: '',
                                                                                    contatoTipo: '',
                                                                                    contatoTipoNome: '',
                                                                                    dadosIniciais: []
                                                                                });
                                                                                this.props.alteraModal('criarContato')
                                                                            }} className="btn btn-success">Adicionar Contato</button></div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                    </div>

                                                    <div id="product-list">
                                                        {this.state.contatos[0] != undefined && this.state.contatos.map((feed, index) => (
                                                            <div key={feed.Chave} className="row row-list">
                                                                <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                <div className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags par" : "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                                    <div className="row deleteMargin alignCenter">
                                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                            <p>{feed.Chave}</p>
                                                                        </div>
                                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                            <p>{feed.tipoNome}</p>
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                            <p>{feed.Campo1}</p>
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                            <p>{feed.Campo2}</p>
                                                                        </div>
                                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones iconesCrud">
                                                                            <div className='iconelixo giveMargin' type='button' >
                                                                                <div onClick={async () => {
                                                                                    await this.setState({
                                                                                        contatoChave: 0,
                                                                                        contatoCampo1: '',
                                                                                        contatoCampo2: '',
                                                                                        contatoTipo: '',
                                                                                        contatoTipoNome: '',
                                                                                        dadosIniciais: []
                                                                                    });
                                                                                    this.props.alteraModal('criarContato')
                                                                                }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                                </div>
                                                                            </div>


                                                                            <div className='iconelixo giveMargin' type='button' >
                                                                                <div onClick={async () => {
                                                                                    await this.setState({
                                                                                        contatoChave: feed.Chave,
                                                                                        contatoCampo1: feed.Campo1,
                                                                                        contatoCampo2: feed.Campo2,
                                                                                        contatoTipo: feed.Tipo,
                                                                                        contatoTipoNome: feed.tipoNome,

                                                                                        dadosIniciais: [
                                                                                            { titulo: 'Campo1', valor: feed.Campo1 },
                                                                                            { titulo: 'Campo2', valor: feed.Campo2 },
                                                                                            { titulo: 'Tipo', valor: feed.Tipo }
                                                                                        ]
                                                                                    });
                                                                                    this.props.alteraModal('criarContato')
                                                                                }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                </div>
                                                                            </div>

                                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
                                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                                </div>
                                                                            }
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                                <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>

                        </div>}




                    {this.props.modal == 'listarEnderecos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Endereço</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={9}>Endereço</option>
                                                    <option value={10}>Tipo</option>
                                                    <option value={11}>Cep</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.state.enderecos[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={async () => {
                                                            await this.setState({
                                                                enderecoChave: 0,
                                                                enderecoCep: '',
                                                                enderecoCepLimpo: '',
                                                                enderecoBairro: '',
                                                                enderecoUF: -1,
                                                                enderecoCidade: '',
                                                                enderecoPais: 1,
                                                                enderecoEndereco: '',
                                                                enderecoNumero: '',
                                                                enderecoComplemento: '',
                                                                enderecoTipo: 0,
                                                                enderecoCidadeDescricao: '',
                                                                enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),
                                                                dadosIniciais: [],
                                                            });
                                                            await this.setState({
                                                                enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                            });
                                                            await this.getLugares();
                                                            this.props.alteraModal('criarEndereco')
                                                        }} className="btn btn-success">Adicionar Endereco</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Chave</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Tipo</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Cep</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Endereço</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-right">
                                                        <span className="subtituloships"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.state.enderecos[0] != undefined && this.state.enderecos.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p>{feed.Chave}</p>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <p>{feed.tipoNome}</p>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <p>{feed.Cep}</p>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                            <p>{feed.Endereco}</p>
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones iconesCrud">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        enderecoChave: 0,
                                                                        enderecoCep: '',
                                                                        enderecoCepLimpo: '',
                                                                        enderecoBairro: '',
                                                                        enderecoUF: -1,
                                                                        enderecoCidade: '',
                                                                        enderecoPais: 1,
                                                                        enderecoEndereco: '',
                                                                        enderecoNumero: '',
                                                                        enderecoComplemento: '',
                                                                        enderecoTipo: 0,
                                                                        enderecoCidadeDescricao: '',
                                                                        enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                        enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                        enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                        enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),
                                                                        dadosIniciais: [],
                                                                    });
                                                                    await this.setState({
                                                                        enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                                    });
                                                                    await this.getLugares();
                                                                    this.props.alteraModal('criarEndereco')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        enderecoChave: feed.Chave,
                                                                        enderecoCep: feed.Cep,
                                                                        enderecoCepLimpo: feed.Cep,
                                                                        enderecoBairro: feed.bairro,
                                                                        enderecoUF: feed.UF,
                                                                        enderecoCidade: feed.Cidade,
                                                                        enderecoPais: feed.pais,
                                                                        enderecoEndereco: feed.Endereco,
                                                                        enderecoNumero: feed.Numero,
                                                                        enderecoComplemento: feed.Complemento,
                                                                        enderecoTipo: feed.Tipo,
                                                                        enderecoCidadeDescricao: feed.Cidade_Descricao,
                                                                        enderecoCidadeLock: (this.state.enderecoCidade ? true : false),
                                                                        enderecoUFLock: (this.state.enderecoUF ? true : false),
                                                                        enderecoBairroLock: (this.state.enderecoBairro ? true : false),
                                                                        enderecoEnderecoLock: (this.state.enderecoEndereco ? true : false),

                                                                        dadosIniciais: [
                                                                            { titulo: 'Cep', valor: feed.Cep },
                                                                            { titulo: 'bairro', valor: feed.bairro },
                                                                            { titulo: 'UF', valor: feed.UF },
                                                                            { titulo: 'Cidade', valor: feed.Cidade },
                                                                            { titulo: 'pais', valor: feed.pais },
                                                                            { titulo: 'Endereco', valor: feed.Endereco },
                                                                            { titulo: 'Numero', valor: feed.Numero },
                                                                            { titulo: 'Complemento', valor: feed.Complemento },
                                                                            { titulo: 'Tipo', valor: feed.Tipo },
                                                                            { titulo: 'Cidade_Descricao', valor: feed.Cidade_Descricao }
                                                                        ]
                                                                    });
                                                                    await this.setState({
                                                                        enderecoTipoNome: this.state.enderecoTipos[this.state.enderecoTipo].label
                                                                    });
                                                                    await this.getLugares();
                                                                    this.props.alteraModal('criarEndereco')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteEndereco(feed.Chave, feed.Endereco)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarEndereco' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Endereços</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarEndereco(validFormEndereco)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">

                                                        {this.state.enderecoUF != 81 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                                <label>Cep</label>
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF != 81 &&
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.enderecoCepLimpo &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF != 81 &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <InputMask type='text' mask='99.999-999' className='form-control' value={this.state.enderecoCep} onChange={e => { this.setState({ enderecoCep: e.currentTarget.value }); if (this.state.enderecoCep.length == 10) { this.buscarDadosCep(e.currentTarget.value) } }} />
                                                            </div>
                                                        }
                                                        <div className={this.state.enderecoUF == 81 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>UF</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.enderecoUF &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select isDisabled={this.state.enderecoUFLock} className='SearchSelect' value={this.state.enderecoUF} options={this.state.estadosOptions} onChange={async (e) => { await this.setState({ enderecoUF: e.value, enderecoUFNome: e.label, enderecoPais: e.pais }); if (this.state.enderecoUF == 81) { this.setState({ enderecoPais: null, enderecoCidade: null }) } }} placeholder={this.state.enderecoUFNome} />
                                                        </div>
                                                        {this.state.enderecoUF != 81 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Cidade</label>
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF != 81 &&
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.enderecoCidade &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF != 81 &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select isDisabled={this.state.enderecoCidadeLock} className='SearchSelect' value={this.state.enderecoCidade} options={this.state.cidadesOptions.filter((e) => (e.estado == this.state.enderecoUF))} onChange={(e) => { this.setState({ enderecoCidade: e.value, enderecoCidadeDescricao: e.label }) }} placeholder={this.state.enderecoCidadeDescricao} />
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF == 81 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>País</label>
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF == 81 &&
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.enderecoPais &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.enderecoUF == 81 &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select className='SearchSelect' value={this.state.enderecoPais} options={this.state.paisesOptions} onChange={(e) => { this.setState({ enderecoPais: e.value, enderecoPaisNome: e.label }) }} placeholder={this.state.enderecoPaisNome} />
                                                            </div>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Bairro</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field disabled={this.state.enderecoBairroLock} className="form-control" type="text" value={this.state.enderecoBairro} onChange={async e => { this.setState({ enderecoBairro: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Rua</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.enderecoEndereco &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field disabled={this.state.enderecoEnderecoLock} className="form-control" type="text" value={this.state.enderecoEndereco} onChange={async e => { this.setState({ enderecoEndereco: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Numero</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.enderecoNumero} onChange={async e => { this.setState({ enderecoNumero: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Complemento</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.enderecoComplemento} onChange={async e => { this.setState({ enderecoComplemento: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.enderecoTipo && this.state.enderecoTipo !== 0 &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' value={this.state.enderecoTipo} options={this.state.enderecoTipos} onChange={(e) => { this.setState({ enderecoTipo: e.value, enderecoTipoNome: e.label }) }} placeholder={this.state.enderecoTipoNome} />
                                                        </div>

                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormEndereco} type="submit" style={validFormEndereco ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>

                        </div>}


                    {this.props.modal == 'listarContatos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Contatos</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={12}>Campo</option>
                                                    <option value={10}>Tipo</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.state.contatos[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={async () => {
                                                            await this.setState({
                                                                contatoChave: 0,
                                                                contatoCampo1: '',
                                                                contatoCampo2: '',
                                                                contatoTipo: '',
                                                                contatoTipoNome: '',
                                                                dadosIniciais: []
                                                            });
                                                            this.props.alteraModal('criarContato')
                                                        }} className="btn btn-success">Adicionar Contato</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Chave</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <span className="subtituloships">Tipo</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Campo 1</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <span className="subtituloships">Campo 2</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-right">
                                                        <span className="subtituloships"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.state.contatos[0] != undefined && this.state.contatos.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p>{feed.Chave}</p>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p>{feed.tipoNome}</p>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <p>{feed.Campo1}</p>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <p>{feed.Campo2}</p>
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones iconesCrud">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        contatoChave: 0,
                                                                        contatoCampo1: '',
                                                                        contatoCampo2: '',
                                                                        contatoTipo: '',
                                                                        contatoTipoNome: '',
                                                                        dadosIniciais: [],
                                                                    });
                                                                    this.props.alteraModal('criarContato')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => {
                                                                    await this.setState({
                                                                        contatoChave: feed.Chave,
                                                                        contatoCampo1: feed.Campo1,
                                                                        contatoCampo2: feed.Campo2,
                                                                        contatoTipo: feed.Tipo,
                                                                        contatoTipoNome: feed.tipoNome,

                                                                        dadosIniciais: [
                                                                            { titulo: 'Campo1', valor: feed.Campo1 },
                                                                            { titulo: 'Campo2', valor: feed.Campo2 },
                                                                            { titulo: 'Tipo', valor: feed.Tipo }
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarContato')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarContato' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Contatos</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarContato(validFormContato)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.contatoTipo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' value={this.state.contato} options={this.state.contatoTiposOptions} onChange={(e) => { this.setState({ contatoTipo: e.value, contatoTipoNome: e.label }) }} placeholder={this.state.contatoTipoNome} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.contatoCampo1 &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.contatoCampo1} onChange={async e => { this.setState({ contatoCampo1: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Complemento</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            {this.state.contatoTipo != "PX" &&
                                                                <Field className="form-control" type="text" value={this.state.contatoCampo2} onChange={async e => { this.setState({ contatoCampo2: e.currentTarget.value }) }} />
                                                            }
                                                            {this.state.contatoTipo == "PX" &&
                                                                <select className="form-control" value={this.state.contatoCampo2} onChange={async e => { this.setState({ contatoCampo2: e.currentTarget.value }) }}>
                                                                    <option value="E-mail">E-mail</option>
                                                                    <option value="Telefone">Celular</option>
                                                                    <option value="CPF/CNPJ">CPF/CNPJ</option>
                                                                </select>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormContato} type="submit" style={validFormContato ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>

                        </div>}


                    {this.props.modal == 'listarSubgrupos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Subgrupos de Taxas</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descrição</option>
                                                    <option value={8}>Grupo</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], subgrupoChave: 0, subgrupoNome: '', subgrupoGrupo: '' }); this.props.alteraModal('criarSubgrupo') }} className="btn btn-success">Adicionar Subgrupo</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Descrição</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Grupo</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraSubgrupo(feed.chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraSubgrupo(feed.chave)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraSubgrupo(feed.chave)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left">
                                                            <h6>{feed.grupo}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => { this.setState({ dadosIniciais: [], subgrupoChave: 0, subgrupoNome: '', subgrupoGrupo: '' }); this.props.alteraModal('criarSubgrupo') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        subgrupoNome: feed.descricao,
                                                                        subgrupoGrupo: feed.chave_grupo,
                                                                        subgrupoChave: feed.chave,

                                                                        dadosIniciais: [
                                                                            { titulo: 'descricao', valor: feed.descricao },
                                                                            { titulo: 'chave_grupo', valor: feed.chave_grupo }
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarSubgrupo')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SUBGRUPOS_TAXAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteSubgrupo(feed.chave, feed.descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarSubgrupo' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Subgrupo de Taxas</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarSubgrupo(validFormSubgrupo)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.subgrupoNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.subgrupoNome} onChange={async e => { this.setState({ subgrupoNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Grupo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.subgrupoGrupo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.gruposOptions} value={this.state.gruposOptions.filter(option => option.value == this.state.subgrupoGrupo)} search={true} onChange={(e) => { this.setState({ subgrupoGrupo: e.value }) }} />
                                                        </div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormSubgrupo} type="submit" style={validFormSubgrupo ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>





                        </div>}


                    {this.props.modal == 'listarCentrosCustos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Centros de Custos</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descricao</option>
                                                    <option value={7}>Cliente</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], centroCustoChave: 0, centroCustoNome: '', centroCustoCliente: '', centroCustoData: moment().format('YYYY-MM-DD'), centroCustoEncerramento: '', centroCustoConta: '' }); this.props.alteraModal('criarPorto') }} className="btn btn-success">Adicionar Porto</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Descrição</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Cliente</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraCentroCusto(feed.Chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.Chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraCentroCusto(feed.Chave)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.Descricao}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraCentroCusto(feed.Chave)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left">
                                                            <h6>{feed.Cliente}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={async () => { this.setState({ dadosIniciais: [], centroCustoChave: 0, centroCustoNome: '', centroCustoCliente: '', centroCustoData: moment().format('YYYY-MM-DD'), centroCustoEncerramento: '', centroCustoCodigo: '' }); await this.carregaCodigos(); this.props.alteraModal('criarCentroCusto') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        centroCustoNome: feed.Descricao,
                                                                        centroCustoCliente: feed.Cliente,
                                                                        centroCustoChave: feed.Chave,
                                                                        centroCustoData: moment(feed.Data).format('YYYY-MM-DD'),
                                                                        centroCustoEncerramento: feed.Encerrado,
                                                                        centroCustoCodigo: feed.Codigo,

                                                                        dadosIniciais: [
                                                                            { titulo: 'Descricao', valor: feed.Descricao },
                                                                            { titulo: 'Cliente', valor: feed.Cliente },
                                                                            { titulo: 'Data', valor: feed.Data },
                                                                            { titulo: 'Encerrado', valor: feed.Encerrado },
                                                                            { titulo: 'Codigo', valor: feed.Codigo }
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarCentroCusto')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarCentroCusto' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Centro de Custos</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarCentroCusto(validFormCentroCusto)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Código</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                            <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled={this.state.centroCustoChave != 0} value={this.state.centroCustoCodigo} onChange={(e) => this.setState({centroCustoCodigo: e.currentTarget.value})} />
                                                        </div>
                                                        <div className="col-xl-5 col-lg-5 col-md-3 col-sm-1 col-1">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descricao</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.centroCustoNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.centroCustoNome} onChange={async e => { this.setState({ centroCustoNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.centroCustoData &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.centroCustoData} onChange={async e => { this.setState({ centroCustoData: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        {this.state.centroCustoChave != '0' &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Data Encerramento</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="date" value={this.state.centroCustoEncerramento} onChange={async e => { this.setState({ centroCustoEncerramento: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-1"></div>
                                                            </>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Cliente</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.centroCustoPessoasOptions.filter(e => this.filterSearch(e, this.state.centroCustoPessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centroCustoPessoasOptionsTexto: e }) }} value={this.state.centroCustoPessoasOptions.filter(option => option.value == this.state.centroCustoCliente)[0]} search={true} onChange={(e) => { this.setState({ centroCustoCliente: e.value, }) }} />
                                                        </div>
                                                        <div className="col-1"></div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormCentroCusto} type="submit" style={validFormCentroCusto ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>
                        </div>}


                    {this.props.modal == 'listarTiposServicos' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Tipos de Serviços</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descricao</option>
                                                    <option value={6}>Prazo</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], tipoServicoChave: 0, tipoServicoNome: '', tipoServicoPrazo: '' }); this.props.alteraModal('criarTipoServico') }} className="btn btn-success">Adicionar Tipo de Serviço</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Descrição</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Prazo</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraTipoServico(feed.chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraTipoServico(feed.chave)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraTipoServico(feed.chave)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left">
                                                            <h6>{feed.prazo} dias</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => { this.setState({ dadosIniciais: [], tipoServicoChave: 0, tipoServicoNome: '', tipoServicoPrazo: '' }); this.props.alteraModal('criarTipoServico') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        tipoServicoNome: feed.descricao,
                                                                        tipoServicoPrazo: feed.prazo,
                                                                        tipoServicoChave: feed.chave,

                                                                        dadosIniciais: [
                                                                            { titulo: 'descricao', valor: feed.descricao },
                                                                            { titulo: 'prazo', valor: feed.prazo }
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarTipoServico')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteTipoServico(feed.chave, feed.descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarTipoServico' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Tipo de Serviços</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarTipoServico(validFormTipoServico)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.tipoServicoNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.tipoServicoNome} onChange={async e => { this.setState({ tipoServicoNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Prazo</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.tipoServicoPrazo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                            {this.state.tipoServicoPrazo && this.state.tipoServicoPrazo != parseInt(this.state.tipoServicoPrazo) &&
                                                                <FontAwesomeIcon title='Apenas números inteiros são permitidos' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.tipoServicoPrazo} onChange={async e => { this.setState({ tipoServicoPrazo: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormTipoServico} type="submit" style={validFormTipoServico ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>





                        </div>}


                    {this.props.modal == 'listarPlanosContas' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Planos de Contas</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descrição</option>
                                                    <option value={9}>Código Reduzido</option>
                                                    <option value={3}>Codigo</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], planoContaChave: 0, planoContaNome: '', planoContaNivel: '', planoContaIndicador: 'S', planoContaInativa: false, planoContaGrupo: '05' }); this.setPlanoConta({ value: 0 }); this.props.alteraModal('criarPlanoConta') }} className="btn btn-success">Adicionar Plano de Conta</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Código</span>
                                                    </div>
                                                    <div className="col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                        <span className='subtituloships'>Descrição</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-center">
                                                        <span className='subtituloships'>Código Reduzido</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[1].Descricao != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraPlanoConta(feed.Chave, feed.Indicador)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                            <p className="mobileajuster5">{feed.Codigo}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraPlanoConta(feed.Chave, feed.Indicador)} className="col-lg-4 col-md-4 col-sm-4  col-4 text-left">
                                                            <h6 className="mobileajuster5">{feed.Descricao}</h6>
                                                        </div>
                                                        <div onClick={() => this.props.alteraPlanoConta(feed.Chave, feed.Indicador)} className="col-lg-3 col-md-3 col-sm-3  col-3 text-left">
                                                            <h6>{feed.Codigo_Red}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => { this.setState({ dadosIniciais: [], planoContaChave: 0, planoContaNome: '', planoContaNivel: '', planoContaIndicador: 'S', planoContaInativa: false, planoContaGrupo: '05' }); this.setPlanoConta({ value: feed.Codigo, nivel: feed.Nivel }); this.props.alteraModal('criarPlanoConta') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        planoContaNome: feed.Descricao,
                                                                        planoContaNivel: feed.Nivel,
                                                                        planoContaChave: feed.Chave,
                                                                        planoContaInativa: feed.Conta_Inativa == 1 ? true : false,
                                                                        planoContaIndicador: feed.Indicador,
                                                                        planoContaGrupo: feed.grupo,
                                                                        planoContaCodigo: feed.Codigo.trim(),
                                                                        codigoLimpo: feed.Codigo.replaceAll('.', '').trim(),

                                                                        dadosIniciais: [
                                                                            { titulo: 'Descricao', valor: feed.Descricao },
                                                                            { titulo: 'Nivel', valor: feed.Nivel },
                                                                            { titulo: 'Conta_Inativa', valor: feed.Conta_Inativa == 1 ? true : false },
                                                                            { titulo: 'Indicador', valor: feed.Indicador },
                                                                            { titulo: 'grupo', valor: feed.grupo },
                                                                            { titulo: 'Codigo', valor: feed.Codigo.replaceAll('.', '').trim() }
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarPlanoConta')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deletePlanoConta(feed.Chave, feed.Descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarPlanoConta' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Plano de Contas</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarPlanoConta(validFormPlanoConta)
                                        }}
                                    >
                                        <Form className="contact-form" >
                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Código</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.planoContaCodigo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                            <InputMask type='text' mask={
                                                                (this.state.planoContaCodigoLimpo.length == 1) ?
                                                                    '9'
                                                                    : (this.state.planoContaCodigoLimpo.length == 2) ?
                                                                        '9.9'
                                                                        : (this.state.planoContaCodigoLimpo.length == 3) ?
                                                                            '9.9.9'
                                                                            : (this.state.planoContaCodigoLimpo.length == 4 || this.state.planoContaCodigoLimpo.length == 5) ?
                                                                                '9.9.9.99'
                                                                                : (this.state.planoContaCodigoLimpo.length == 6 || this.state.planoContaCodigoLimpo.length == 7) ?
                                                                                    '9.9.9.99.99'
                                                                                    : (this.state.planoContaCodigoLimpo.length == 8 || this.state.planoContaCodigoLimpo.length == 9 || this.state.planoContaCodigoLimpo.length == 10) ?
                                                                                        '9.9.9.99.99.999'
                                                                                        : (this.state.planoContaCodigoLimpo.length == 11 || this.state.planoContaCodigoLimpo.length == 12 || this.state.planoContaCodigoLimpo.length == 13) ?
                                                                                            '9.9.9.99.99.999.999'
                                                                                            : '9'
                                                            } className='form-control' value={this.state.planoContaCodigoLimpo} onChange={async e => { await this.setState({ planoContaCodigo: e.currentTarget.value }); this.setNivel(this.state.planoContaCodigoLimpo); }} onKeyDown={e => { if ((this.state.planoContaCodigoLimpo.length == 1 || this.state.planoContaCodigoLimpo.length == 2 || this.state.planoContaCodigoLimpo.length == 3 || this.state.planoContaCodigoLimpo.length == 5 || this.state.planoContaCodigoLimpo.length == 7 || this.state.planoContaCodigoLimpo.length == 10) && e.nativeEvent.key == parseInt(e.nativeEvent.key)) { this.setState({ planoContaCodigoLimpo: `${this.state.planoContaCodigoLimpo}${e.nativeEvent.key}` }) } }} />
                                                        </div>
                                                        <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nível</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {(this.state.planoContaNivel < 1 || this.state.planoContaNivel > 7 || this.state.planoContaNivel != parseInt(this.state.planoContaNivel)) &&
                                                                <FontAwesomeIcon title='Valor Inválido' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                            <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.planoContaNivel} />
                                                        </div>
                                                        <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1">
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.planoContaNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.planoContaNome} onChange={async e => { this.setState({ planoContaNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Indicador</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.planoContaIndicador &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className="form-control" value={this.state.planoContaIndicador} onChange={(e) => { this.setState({ planoContaIndicador: e.currentTarget.value }) }}>
                                                                <option value='A'>Analítico</option>
                                                                <option value='S'>Sintético</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta Inativa</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input className='form_control' checked={this.state.planoContaInativa} onChange={(e) => { this.setState({ planoContaInativa: e.target.checked }) }} type="checkbox" />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Grupo</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.planoContaGrupo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className="form-control" value={this.state.planoContaGrupo} onChange={(e) => { this.setState({ planoContaGrupo: e.currentTarget.value }) }}>
                                                                <option value='00'>Contas de Ativo</option>
                                                                <option value='01'>Passivo Circulante e Não Circulante</option>
                                                                <option value='02'>Patrimônio Líquido</option>
                                                                <option value='03'>Contas de Resultado</option>
                                                                <option value='04'>Contas de Compensação</option>
                                                                <option value='05'>Outra</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-1"></div>
                                                    </div>


                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormPlanoConta} type="submit" style={validFormPlanoConta ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>





                        </div>}

                    {this.props.modal == 'listarTaxas' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Taxas</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descrição</option>
                                                    <option value={13}>Valor</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], taxaChave: 0, taxaNome: '', taxaValor: '', taxaVariavel: false, taxaMoeda: 5, taxaTipo: 'P', taxaConta_contabil: '', taxaConta_credito: '', taxaHistorico_padrao: '', taxaFormula_ate: '', taxaSubgrupo: '' }); this.props.alteraModal('criarPorto') }} className="btn btn-success">Adicionar Porto</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                        <span className="subtituloships">Chave</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className="subtituloships">Tipo de Serviço</span>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className="subtituloships">Grupo</span>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                        <span className="subtituloships">Valor</span>
                                                    </div>
                                                    <div className="col-2 text-right">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>
                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraTaxa(feed.chave, feed.Tipo)} className="col-2 text-left">
                                                            <p>{feed.chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraTaxa(feed.chave, feed.Tipo)} className="col-3 text-left">
                                                            <p>{feed.descricao}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraTaxa(feed.chave, feed.Tipo)} className="col-3 text-left">
                                                            <p>{feed.subgrupo}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraTaxa(feed.chave, feed.Tipo)} className="col-2 text-left">
                                                            <p>{feed.moeda_sigla} {parseFloat(feed.valor).toFixed(2).replaceAll('.', ',')}</p>
                                                        </div>
                                                        <div className="col-2 text-center icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        dadosIniciais: [],
                                                                        taxaChave: 0,
                                                                        taxaNome: '',
                                                                        taxaValor: '',
                                                                        taxaVariavel: false,
                                                                        taxaMoeda: 5,
                                                                        taxaTipo: 'P',
                                                                        taxaConta_contabil: '',
                                                                        taxaConta_credito: '',
                                                                        taxaHistorico_padrao: '',
                                                                        taxaFormula_ate: '',
                                                                        taxaSubgrupo: ''
                                                                    });
                                                                    this.props.alteraModal('criarTaxa')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        taxaChave: feed.chave,
                                                                        taxaNome: feed.descricao,
                                                                        taxaValor: feed.valor,
                                                                        taxaVariavel: (feed.variavel == 1) ? true : false,
                                                                        taxaMoeda: feed.Moeda,
                                                                        taxaTipo: feed.Tipo,
                                                                        taxaConta_contabil: feed.Conta_Contabil,
                                                                        taxaConta_credito: feed.conta_credito,
                                                                        taxaHistorico_padrao: feed.historico_padrao,
                                                                        taxaFormula_ate: feed.formula_ate,
                                                                        taxaSubgrupo: feed.sub_grupo,
                                                                        dadosIniciais: [
                                                                            { titulo: 'descricao', valor: feed.descricao },
                                                                            { titulo: 'valor', valor: feed.valor },
                                                                            { titulo: 'variavel', valor: feed.variavel },
                                                                            { titulo: 'Moeda', valor: feed.Moeda },
                                                                            { titulo: 'Tipo', valor: feed.Tipo },
                                                                            { titulo: 'Conta_Contabil', valor: feed.Conta_Contabil },
                                                                            { titulo: 'conta_credito', valor: feed.conta_credito },
                                                                            { titulo: 'historico_padrao', valor: feed.historico_padrao },
                                                                            { titulo: 'formula_ate', valor: feed.formula_ate },
                                                                            { titulo: 'sub_grupo', valor: feed.sub_grupo }
                                                                        ]
                                                                    }); this.props.alteraModal('criarTaxa')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteTaxa(feed.chave, feed.descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarTaxa' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Taxas</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarTaxa(validFormTaxa)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.taxaNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.taxaNome} onChange={async e => { this.setState({ taxaNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Valor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.taxaValor &&
                                                                <FontAwesomeIcon title='Preencha os campos' icon={faExclamationTriangle} />
                                                            }
                                                            {!this.state.taxaMoeda &&
                                                                <FontAwesomeIcon title='Preencha os campos' icon={faExclamationTriangle} />
                                                            }
                                                            {this.state.taxaValor != "0,00" && this.state.taxaValor && this.state.taxaMoeda && !this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.taxaValor.replaceAll('.', '').replaceAll(',', '.')) &&
                                                                <FontAwesomeIcon title='Apenas números são permitidos' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="fieldDividido col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className='form-control fieldDividido_1' value={this.state.taxaMoeda} onChange={(e) => { this.setState({ taxaMoeda: e.target.value }) }}>
                                                                {this.state.moedas.map((e) => (
                                                                    <option value={e.Chave}>{e.Sigla}</option>
                                                                ))}
                                                            </select>
                                                            <Field className="form-control fieldDividido_2 text-right" type="text" value={this.state.taxaValor} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ taxaValor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ taxaValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Grupo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.taxaSubgrupo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.subgruposOptions} value={this.state.subgruposOptions.filter(option => option.value == this.state.taxaSubgrupo)} search={true} onChange={(e) => { this.setState({ taxaSubgrupo: e.value }) }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className='form-control' value={this.state.taxaTipo} onChange={(e) => { this.setState({ taxaTipo: e.currentTarget.value }) }}>
                                                                <option value={'P'}>Pagar</option>
                                                                <option value={'R'}>Receber</option>
                                                                <option value={'GT'}>Government Taxes</option>
                                                                <option value={'BC'}>Bank Charges</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Variavel</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input className='form_control' checked={this.state.taxaVariavel} onChange={(e) => { this.setState({ taxaVariavel: e.target.checked }) }} type="checkbox" />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta Contabil</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.taxaConta_contabil)[0]} search={true} onChange={(e) => { this.setState({ taxaConta_contabil: e.value, }) }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Historico Padrao</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.historicosOptions.filter(e => this.filterSearch(e, this.state.historicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ historicosOptionsTexto: e }) }} value={this.state.historicosOptions.filter(option => option.value == this.state.taxaHistorico_padrao)[0]} search={true} onChange={(e) => { this.setState({ taxaHistorico_padrao: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Formula Ate</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="number" value={this.state.taxaFormula_ate} onChange={async e => { this.setState({ taxaFormula_ate: e.currentTarget.value }) }} />
                                                        </div>


                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormTaxa} type="submit" style={validFormTaxa ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>
                        </div>}


                    {this.props.modal == 'listarDescricoesPadrao' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Descrições Padrão</span>
                                </div>


                                <div className='modalLista'>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                        <div className="row mobileajuster3">
                                            <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                                <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value, pesquisaExata: false }) }}>
                                                    <option value={1}>Descricao</option>
                                                    <option value={3}>Chave</option>
                                                </select>
                                                <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value, pesquisaExata: false }) }} />
                                                {!this.props.modalLista[0] &&
                                                    <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-center">
                                                        <div><button onClick={() => { this.setState({ dadosIniciais: [], descricaoChave: 0, descricaoNome: '' }); this.props.alteraModal('criarDescricaoPadrao') }} className="btn btn-success">Adicionar Descrição Padrão</button></div>
                                                    </div>}
                                            </div>

                                        </div>
                                    </div>
                                    {this.state.loadingPesquisa &&
                                        <SkeletonPesquisa />
                                    }

                                    <div className="row deleteMargin" id="product-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                            <div className="single-product-item aasd">
                                                <div className="row subtitulosTabela">
                                                    <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-center">
                                                        <span className='subtituloships'>Chave</span>
                                                    </div>
                                                    <div className="col-7 text-center">
                                                        <span className='subtituloships'>Descrição</span>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                        <span className='subtituloships'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>

                                    <div className="row" id="product-list">
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                            {this.props.modalLista[0] != undefined && this.props.modalLista.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                                <div key={feed.id} className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 mix all dresses bags par lightHover" : "col-lg-12 col-md-12 col-sm-12 mix all dresses bags itemLista impar darkHover"}>

                                                    <div className="row ">
                                                        <div onClick={() => this.props.alteraDescricaoPadrao(feed.chave)} className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                            <p className="mobileajuster5">{feed.chave}</p>
                                                        </div>
                                                        <div onClick={() => this.props.alteraDescricaoPadrao(feed.chave)} className="col-7 text-left">
                                                            <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => { this.setState({ dadosIniciais: [], descricaoChave: 0, descricaoNome: '' }); this.props.alteraModal('criarDescricaoPadrao') }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} />

                                                                </div>
                                                            </div>


                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <div onClick={() => {
                                                                    this.setState({
                                                                        descricaoNome: feed.descricao,
                                                                        descricaoChave: feed.chave,

                                                                        dadosIniciais: [
                                                                            { titulo: 'descricao', valor: feed.descricaoNome },
                                                                        ]
                                                                    });
                                                                    this.props.alteraModal('criarDescricaoPadrao')
                                                                }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </div>
                                                            </div>

                                                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DESCRICOES_PADRAO') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                <div type='button' className='iconelixo' onClick={(a) => this.deleteDescricaoPadrao(feed.chave, feed.descricao)} >
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        {this.props.modalLista.filter(this.filtrarPesquisa)[this.state.load] &&
                                            <div className='loadMoreDiv'>
                                                <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                            </div>
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>}



                    {this.props.modal == 'criarDescricaoPadrao' &&
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => { await this.setState({ tipoPesquisa: 1 }); await this.fecharModal() }}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Descrições Padrão</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarDescricaoPadrao(validFormDescricao)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.descricaoNome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.descricaoNome} onChange={async e => { this.setState({ descricaoNome: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormDescricao} type="submit" style={validFormDescricao ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>

                                </div>
                            </div>





                        </div>}






                </div>
            </Modal >

        )
    }

}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(ModalListas)