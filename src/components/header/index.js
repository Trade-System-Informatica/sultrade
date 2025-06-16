import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import { NOME_EMPRESA } from '../../config'
import { Link, Redirect } from 'react-router-dom'
import { logout, extendExpiration } from '../../store/actions/user'
import { connect } from 'react-redux'
import { apiEmployee } from '../../services/apiamrg'
import Logo from '../../img/logo.png'
import tradeLogo from '../../img/tradeLogo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'

import './styles.css'
import loader from '../../classes/loader'
import util from '../../classes/util'
import Alert from '../alert'
import Notification from '../notification'

class Header extends Component {
    state = {
        token: '',
        nome: '',
        redirect: false,
        menu: false,


        usuarioLogado: this.props.user,
        acessos: [],
        permissoes: [],
        acessosPermissoes: [],

        tarifasVencidas: [],
        anexosNaoValidados: [],
        alert: { msg: "", type: "" },

        osAviso: [],
    }

    fazerLogout = async () => {
        await this.props.onLogout()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Logout realizado!</p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-50"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Ok
                        </button>
                    </div>
                )
            }
        })
        await this.setState({ redirect: true })
    }

    expirarSessao = async () => {
        await this.props.onLogout()
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Tempo de sessão expirado!</p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-50"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Ok
                        </button>
                    </div>
                )
            }
        })
        await this.setState({ redirect: true })
    }

    sendEmails = async () => {
        this.setState({ alert: { msg: "", type: "" } })

        await loader.tarifasVencidasEmails(this.state.tarifasVencidas.filter((tarifa) => tarifa.value));
    }

    avisoOsSemEnvio = async (osList) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center' style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            borderBottom: '1px solid #eee',
                            paddingBottom: '15px',
                            marginBottom: '15px'
                        }}>
                            <h1 style={{
                                color: '#2c3e50',
                                fontSize: '1.5rem',
                                marginBottom: '5px'
                            }}>{NOME_EMPRESA}</h1>
                            <p style={{
                                color: '#7f8c8d',
                                fontSize: '1rem',
                                margin: 0
                            }}>Ordens de serviço sem data de envio</p>
                        </div>
                        
                        <div style={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto', 
                            margin: '15px 0',
                            textAlign: 'left'
                        }}>
                            {osList.map((os) => (
                                <div key={os.chave} style={{
                                    padding: '10px',
                                    margin: '5px 0',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        backgroundColor: '#e9ecef'
                                    }
                                }}>
                                    <a 
                                        href={`${window.location.origin}/ordensservico/addos/${os.Chave}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#3498db',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <span style={{
                                            display: 'inline-block',
                                            width: '24px',
                                            height: '24px',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '10px',
                                            fontSize: '0.8rem'
                                        }}>OS</span>
                                        {os.codigo}
                                        <span style={{
                                            marginLeft: 'auto',
                                            fontSize: '0.8rem',
                                            color: '#95a5a6'
                                        }}>
                                            {os.Data_Faturamento ? new Date(os.Data_Faturamento).toLocaleDateString() : 'Sem data'}
                                        </span>
                                    </a>
                                </div>
                            ))}
                        </div>
    
                        <button
                            onClick={onClose}
                            className="btn btn-success w-50"
                        >
                            OK
                        </button>
                    </div>
                );
            }
        });
    };

    componentDidMount = async () => {
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (!this.props.user.codigo && !this.props.login) {
            await this.setState({ redirect: true })
        } else if (this.props.user.codigo) {
            if (this.props.user.justLogged) {
                let permission = false;
                let permissionAviso = false;
                this.state.acessosPermissoes.map((e) => {
                    if ((e.acessoAcao == "ANEXOS" && e.permissaoEdita != 0)) {
                        permission = true;
                    }
                    if ((e.acessoAcao == "SEM_ENVIO" && e.permissoes == 1)) {
                        permissionAviso = true;
                    }
                })

                if (permission) {
                    const tarifas = await loader.testaTarifasVencimentos();

                    if (tarifas[0]) {
                        this.setState({ tarifasVencidas: tarifas.map((tarifa) => ({ ...tarifa, value: false })) });
                        this.setState({
                            alert: {
                                type: "confirm", msg: `Há tarifas vencidas. Deseja enviar emails automáticamente?`,
                                checkboxes: tarifas.map((tarifa) => ({ chave: tarifa.chave, value: tarifa.value, label: `${tarifa.fornecedorNome} - ${tarifa.servico}` })),
                                changeCheckbox: (chave) => this.changeCheckbox(chave)
                            }
                        })
                    }
                }
                if (permissionAviso) {
                    const osSemEnvio = await loader.getOsSemEnvio();

                    if (osSemEnvio[0]) {
                        await this.avisoOsSemEnvio(osSemEnvio);
                    }
                }

            }

            if (this.props.sair) {
                await this.getAnexos();
            }
            if (this.props.user.expiry && moment().isSameOrBefore(this.props.user.expiry)) {
                await this.props.extendExpiration({ ...this.props.user });
            } else {
                await this.expirarSessao();
            }

        }
    }

    getAnexos = async () => {
        let anexos = [];

        await apiEmployee.post(`getAnexosNaoValidados.php`, {
            token: true,
        }).then(
            async response => {
                anexos = [...response.data];
            },
            response => { this.erroApi(response) }
        )

        await apiEmployee.post(`getEventosNaoContabilizados.php`, {
            token: true
        }).then(
            async response => {
                response.data.map((evento) => {
                    anexos.unshift(({ fornecedor: evento.fornecedor, evento: evento.chave, eventoChave: evento.chave, anexo: "", validado: 2, validadoPor: -1, data: evento.data }))
                })
            },
            response => { this.erroApi(response) }
        )

        this.setState({
            anexosNaoValidados: anexos
        });
    }

    changeCheckbox = async (chave) => {
        console.log(chave);
        this.setState({
            tarifasVencidas: this.state.tarifasVencidas.map((tarifa) => tarifa.chave == chave ? ({ ...tarifa, value: !tarifa.value }) : ({ ...tarifa }))
        })
    }

    carregaTiposAcessos = async () => {
        await apiEmployee.post(`getTiposAcessos.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ acessos: res.data });
            },
            async err => { this.erroApi(err) }
        )
    }

    carregaPermissoes = async () => {
        await apiEmployee.post(`getPermissoes.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ permissoes: res.data })
            },
            async err => { this.erroApi(err) }
        )
    }

    testaAcesso = async () => {
        let permissao = '';

        const acessosPermissoes = this.state.acessos.map((e, i) => {
            permissao = this.state.permissoes.filter((permissao) => {
                if (permissao.Usuario == this.state.usuarioLogado.codigo && permissao.Acessos == e.Chave && permissao.Empresa == this.state.usuarioLogado.empresa) {
                    return permissao;
                }
            })[0]
            return {
                acesso: e.Chave,
                acessoAcao: e.Acao,
                permissoes: permissao ? permissao.Liberacao.split(``)[2] : 0
            }
        })

        await this.setState({ acessosPermissoes: acessosPermissoes });



    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    render() {
        return (
            <div className="headermobile">
                {this.state.redirect &&
                    <Redirect to={'/'} />
                }
                <div className="header">
                    <Alert
                        alert={this.state.alert}
                        setAlert={(e) => this.setState({ alert: e })}
                        alertFunction={() => this.sendEmails()}
                    />



                    {/*window.innerWidth >= 500 && this.state.anexosNaoValidados.filter((anexo) => 48 - (moment().diff(moment(anexo?.data), 'hour')) > 0).filter((e, index) => index <= 5).map((anexo, index) => {
                        const link = anexo.anexo ? util.completarDocuments(`fornDocs/${anexo.anexo}`) : false;
                        const editAnexo = anexo.validado == 0 ? { pathname: `/ordensservico/addanexo/${anexo.chave}`, state: { anexo } } : { pathname: `/ordensservico/addevento/${anexo.evento}` };
                        const hoursRemaining = 48 - (moment().diff(moment(anexo?.data), 'hour'));

                        return (
                            <Notification
                                notification={{ type: hoursRemaining <= 12 ? `urgent` : "", msg: `Evento-${anexo.eventoChave}: ${hoursRemaining} horas para ${anexo.anexo ? anexo.validado == 0 ? `aprovar` : `validar` : `contabilizar`}` }}
                                close={() => this.setState({ anexosNaoValidados: this.state.anexosNaoValidados.filter((an) => an.chave != anexo.chave) })}
                                link={link}
                                editAnexo={editAnexo}
                                index={index}
                            />
                        )
                    })*/}

                    <div className="headerSimbolos">
                        <div className="setaAcima">
                            {this.props.voltar &&
                                <Link to={{ pathname: `/inicio` }}>
                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTabelas &&
                                <Link to={{ pathname: `/tabelas` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarUtilitarios &&
                                <Link to={{ pathname: `/utilitarios` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarMovimentacao &&
                                <Link to={{ pathname: `/ordensservico` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarFinanceiro &&
                                <Link to={{ pathname: `/financeiro` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarFinanceiroTabelas &&
                                <Link to={{ pathname: `/financeiro` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarShips &&
                                <Link to={{ pathname: `/tabelas/navios`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTiposServicos &&
                                <Link to={{ pathname: `/tabelas/tiposservicos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarSubgrupos &&
                                <Link to={{ pathname: `/tabelas/subgrupos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>                            }
                            {this.props.voltarGrupos &&
                                <Link to={{ pathname: `/tabelas/grupos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarGruposClientes &&
                                <Link to={{ pathname: `/tabelas/gruposclientes`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarMoedas &&
                                <Link to={{ pathname: `/tabelas/moedas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoas &&
                                <Link to={{ pathname: `/tabelas/pessoas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoaContatos &&
                                <Link to={{ pathname: `/tabelas/pessoacontatos/${this.props.pessoa.Chave}`, state: { pessoa: this.props.pessoa, chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoaEnderecos &&
                                <Link to={{ pathname: `/tabelas/pessoaenderecos/${this.props.pessoa.Chave}`, state: { pessoa: this.props.pessoa, chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddPessoa &&
                                <Link to={{ pathname: `/tabelas/addpessoa/${this.props.pessoa}` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPortos &&
                                <Link to={{ pathname: `/tabelas/portos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTaxas &&
                                <Link to={{ pathname: `/tabelas/taxas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarHistoricosPadrao &&
                                <Link to={{ pathname: `/tabelas/historicospadrao`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarDescricoesPadrao &&
                                <Link to={{ pathname: `/tabelas/descricoespadrao`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTiposDocumentos &&
                                <Link to={{ pathname: `/tabelas/tiposdocumentos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarCategoriasDocumentos &&
                                <Link to={{ pathname: `/tableas/categoriasdocumentos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }



                            {this.props.voltarTarifas &&
                                <Link to={{ pathname: `/ordensservico/tarifas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAnexos &&
                                <Link to={{ pathname: `/ordensservico/anexos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarOperadores &&
                                <Link to={{ pathname: `/utilitarios/operadores`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarEventosTemplates &&
                                <Link to={{ pathname: `/utilitarios/eventostemplates`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarGruposTemplates &&
                                <Link to={{ pathname: `/utilitarios/grupostemplates`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPermissoes &&
                                <Link to={{ pathname: `/utilitarios/permissoes` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarOS &&
                                <Link to={{ pathname: `/ordensservico/os`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarOsOrcamento &&
                                <Link to={{ pathname: `/ordensservico/osOrcamento`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddOS &&
                                <Link to={{ pathname: `/ordensservico/addos/${this.props.os.Chave}`, state: { os: this.props.os } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddOsOrcamento &&
                                <Link to={{ pathname: `/ordensservico/addOsOrcamento/${this.props.os.Chave}`, state: { os: this.props.os } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarEventos &&
                                <Link to={{ pathname: `/ordensservico/eventos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddEvento &&
                                <Link to={{ pathname: `/ordensservico/addevento/${this.props.evento.chave}`, state: { evento: this.props.evento, os: this.props.os ? { ...this.props.os } : null } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarPlanosContas &&
                                <Link to={{ pathname: `/tabelas/planoscontas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarCentrosCustos &&
                                <Link to={{ pathname: `/tabelas/centroscustos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasAbertas &&
                                <Link to={{ pathname: `/financeiro/contasabertas` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasLiquidadas &&
                                <Link to={{ pathname: `/financeiro/contasliquidadas` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasPagar &&
                                <Link to={{ pathname: `/financeiro/contaspagar`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }

                            {this.props.voltarFaturas &&
                                <Link to={{ pathname: `/financeiro/faturas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarFaturasOS &&
                                <Link to={{ pathname: this.props.state.backTo, state: { os: this.props.state.os } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPagamentosLote &&
                                <Link to={{ pathname: `/financeiro/pagamentoslote` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasPagas &&
                                <Link to={{ pathname: `/financeiro/contaspagas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasReceber &&
                                <Link to={{ pathname: `/financeiro/contasreceber`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasRecebidas &&
                                <Link to={{ pathname: `/financeiro/contasrecebidas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarLancamentos &&
                                <Link to={{ pathname: `/financeiro/lancamentos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.sair && !this.state.menu &&
                                <FontAwesomeIcon cursor="pointer" className='seta' onClick={() => this.fazerLogout()} icon={faSignOutAlt} color="#d21524" size='2x' />
                            }


                        </div>

                        <div className='menuDropdown'>
                            {!this.props.login &&
                                <>
                                    <a className="nav-link dropdown-toggle categorias" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <FontAwesomeIcon icon={faBars} />
                                    </a>
                                    <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/tabelas` }}
                                                className="dropdown-item"
                                            >
                                                Tabelas

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'NAVIOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/navios` }}>
                                                            Navios
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PORTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/portos` }}>
                                                            Portos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/tiposservicos` }}>
                                                            Tipos de Serviço
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_CLIENTES') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/gruposclientes` }}>
                                                            Grupos de Clientes
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/grupos` }}>
                                                            Grupos de Taxas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SUBGRUPOS_TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/subgrupos` }}>
                                                            Subgrupos de Taxas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'MOEDAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/moedas` }}>
                                                            Moedas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/pessoas` }}>
                                                            Pessoas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/taxas` }}>
                                                            Taxas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CENTROS_CUSTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/centroscustos` }}>
                                                            Centros de Custos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/planoscontas` }}>
                                                            Planos de Contas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'HISTORICOS_PADRAO') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/historicospadrao` }}>
                                                            Históricos Padrão
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/tiposdocumentos` }}>
                                                            Tipos de Documentos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CATEGORIAS_TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/tabelas/categoriasdocumentos` }}>
                                                            Categorias de Documentos
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>
                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/ordensservico` }}
                                                className="dropdown-item"
                                            >
                                                Ordens de Serviço

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/ordensservico/os` }}>
                                                            OS
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/ordensservico/osOrcamento` }}>
                                                            OS - Orçamento
                                                        </Link>
                                                    }
                                                    {/* {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                            <Link className="dropdown-item" to={{ pathname: `/ordensservico/eventos` }}>
                                                                Solitações de Serviço
                                                            </Link>
                                                        } */}
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TARIFAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/ordensservico/tarifas` }}>
                                                            Tarifas de fornecedores
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>

                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/financeiro` }}
                                                className="dropdown-item"
                                            >
                                                Financeiro

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <div className="dropdown-item dropend text-left" >

                                                            <Link className="dropdown-item" to={{ pathname: `/financeiro/contasabertas` }}>
                                                                Contas em Aberto
                                                            </Link>
                                                            {window.innerWidth >= 940 &&
                                                                <ul className="dropdown-menu">
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/contasreceber` }}>
                                                                            Contas a receber
                                                                        </Link>
                                                                        {window.innerWidth >= 1150 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/financeiro/relatorio`, state: { backTo: 'contasReceber' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                    <div className="dropdown-item dropend" >

                                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/contaspagar` }}>
                                                                            Contas a pagar
                                                                        </Link>
                                                                        {window.innerWidth >= 1150 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/financeiro/relatorio`, state: { backTo: 'contasPagar' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                </ul>
                                                            }
                                                        </div>
                                                    }
                                                    {/* if (e.acessoAcao == 'CONTAS_LIQUIDADAS') INATIVADO*/}
                                                    {this.state.acessosPermissoes.filter((e) => { if (false) { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <div className="dropdown-item dropend" >
                                                            <Link className="dropdown-item" to={{ pathname: `/financeiro/contasliquidadas` }}>
                                                                Contas Liquidadas
                                                            </Link>
                                                            {window.innerWidth >= 940 &&
                                                                <ul className="dropdown-menu">
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/contasrecebidas` }}>
                                                                            Contas recebidas
                                                                        </Link>
                                                                        {window.innerWidth >= 1150 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/financeiro/relatorio`, state: { backTo: 'contasRecebidas' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/contaspagas` }}>
                                                                            Contas pagas
                                                                        </Link>
                                                                        {window.innerWidth >= 1150 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/financeiro/relatorio`, state: { backTo: 'contasPagas' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                </ul>
                                                            }
                                                        </div>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'FATURAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/faturas` }}>
                                                            Notas Fiscais de Serviço
                                                        </Link>
                                                    }
                                                    {/* if (e.acessoAcao == 'CONTAS_ABERTAS')  */}
                                                    {this.state.acessosPermissoes.filter((e) => { if (false) { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/pagamentoslote` }}>
                                                            Pagamentos em Lote
                                                        </Link>
                                                    }
                                                     {/* if (e.acessoAcao == 'CONTAS_ABERTAS')  */}
                                                    {this.state.acessosPermissoes.filter((e) => { if (false) { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/pagamentosmanual` }}>
                                                            Pagamentos Manual
                                                        </Link>
                                                    }
                                                    {/* if (e.acessoAcao == 'LANCAMENTOS') */}
                                                    {this.state.acessosPermissoes.filter((e) => { if (false) { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/lancamentos` }}>
                                                            Lançamentos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/financeiro/demonstrativoderesultado` }}>
                                                            Demonstrativo de resultado
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>
                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/utilitarios` }}
                                                className="dropdown-item"
                                            >
                                                Utilitários

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/utilitarios/operadores` }}>
                                                            Operadores
                                                        </Link>
                                                }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/utilitarios/permissoes` }}>
                                                            Permissoes
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/utilitarios/logs` }}>
                                                            Logs
                                                        </Link>
                                                }
                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                    <Link className="dropdown-item" to={{ pathname: `/utilitarios/eventostemplates` }}>
                                                        Templates de Eventos
                                                    </Link>
                                                }
                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_TEMPLATES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                    <Link className="dropdown-item" to={{ pathname: `/utilitarios/grupostemplates` }}>
                                                        Grupos de Templates
                                                    </Link>
                                                }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PARAMETROS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/utilitarios/parametros` }}>
                                                            Parametros
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>

                                    </div>
                                </>
                            }
                        </div>
                    </div>


                    <div className="headerTitulo">
                        <h3>{this.props.titulo}</h3>
                    </div>

                    <div className="headerImages">
                        {(this.props.sair || this.props.login) &&
                            <img alt='logo' className=" img-fluid logologado" src={Logo} style={{ alignItems: 'center', justifyContent: 'center' }} />
                        }

                        {!this.props.sair && !this.props.login &&
                            <Link to={{ pathname: `/inicio` }}>
                                <img alt='logo' className=" img-fluid logologado" src={Logo} style={{ alignItems: 'center', justifyContent: 'center' }} />
                            </Link>
                        }
                    </div>


                    {
                        window.innerWidth >= 860 &&
                        <div className="logoTrade">
                            <div>
                                <Link to={{ pathname: "http://tradesystem.com.br/" }} target={"_blank"}>
                                    <img alt='logo' className=" img-fluid tradelogado" src={tradeLogo} style={{ alignItems: 'center', justifyContent: 'center' }} />
                                </Link>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ user }) => {
    return {
        user: user,
        //online: servidor.online
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: user => dispatch(logout(user)),
        extendExpiration: user => dispatch(extendExpiration(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
