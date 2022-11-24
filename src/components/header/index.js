import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import { NOME_EMPRESA } from '../../config'
import { Link, Redirect } from 'react-router-dom'
import { logout } from '../../store/actions/user'
import { connect } from 'react-redux'
import { apiEmployee } from '../../services/apiamrg'
import Logo from '../../img/logo.png'
import tradeLogo from '../../img/tradeLogo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons'


import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import './styles.css'

class Header extends Component {



    state = {
        token: '',
        nome: '',
        redirect: false,
        menu: false,


        usuarioLogado: this.props.user,
        acessos: [],
        permissoes: [],
        acessosPermissoes: []
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

    componentDidMount = async () => {
        if (!this.props.user.codigo) {
            await this.setState({ redirect: true })
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()
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
                    <Redirect to={'/admin'} />
                }
                <div className="header">
                    <div className="headerSimbolos">
                        <div className="setaAcima">
                            {this.props.voltar &&
                                <Link to={{ pathname: `/admin/inicio` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTabelas &&
                                <Link to={{ pathname: `/admin/tabelas` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarUtilitarios &&
                                <Link to={{ pathname: `/admin/utilitarios` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarMovimentacao &&
                                <Link to={{ pathname: `/admin/ordensservico` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarFinanceiro &&
                                <Link to={{ pathname: `/admin/financeiro` }}>

                                    <FontAwesomeIcon className='seta' cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarShips &&
                                <Link to={{ pathname: `/admin/navios`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTiposServicos &&
                                <Link to={{ pathname: `/admin/tiposservicos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarSubgrupos &&
                                <Link to={{ pathname: `/admin/subgrupos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarGrupos &&
                                <Link to={{ pathname: `/admin/grupos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarMoedas &&
                                <Link to={{ pathname: `/admin/moedas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoas &&
                                <Link to={{ pathname: `/admin/pessoas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoaContatos &&
                                <Link to={{ pathname: `/admin/pessoacontatos/${this.props.pessoa.Chave}`, state: { pessoa: this.props.pessoa, chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPessoaEnderecos &&
                                <Link to={{ pathname: `/admin/pessoaenderecos/${this.props.pessoa.Chave}`, state: { pessoa: this.props.pessoa, chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddPessoa &&
                                <Link to={{ pathname: `/admin/addpessoa/${this.props.pessoa.Chave}`, state: { pessoa: this.props.pessoa } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPortos &&
                                <Link to={{ pathname: `/admin/portos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTaxas &&
                                <Link to={{ pathname: `/admin/taxas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarHistoricosPadrao &&
                                <Link to={{ pathname: `/admin/historicospadrao`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarTiposDocumentos &&
                                <Link to={{ pathname: `/admin/tiposdocumentos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarOperadores &&
                                <Link to={{ pathname: `/admin/operadores`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPermissoes &&
                                <Link to={{ pathname: `/admin/permissoes` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarOS &&
                                <Link to={{ pathname: `/admin/os`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddOS &&
                                <Link to={{ pathname: `/admin/addos/${this.props.os.Chave}`, state: { os: this.props.os } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarSolicitacoes &&
                                <Link to={{ pathname: `/admin/solicitacoesservicos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarAddSolicitacao &&
                                <Link to={{ pathname: `/admin/addsolicitacao/${this.props.solicitacao.chave}`, state: { solicitacao: this.props.solicitacao, os: this.props.os ? { ...this.props.os } : null } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }


                            {this.props.voltarPlanosContas &&
                                <Link to={{ pathname: `/admin/planoscontas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarCentrosCustos &&
                                <Link to={{ pathname: `/admin/centroscustos`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasAbertas &&
                                <Link to={{ pathname: `/admin/contasabertas` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasLiquidadas &&
                                <Link to={{ pathname: `/admin/contasliquidadas` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasPagar &&
                                <Link to={{ pathname: `/admin/contaspagar`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }

                            {this.props.voltarFaturas &&
                                <Link to={{ pathname: `/admin/faturas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarPagamentosLote &&
                                <Link to={{ pathname: `/admin/pagamentoslote` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {/*this.props.voltarRecebimentosPix &&
                                <Link to={{ pathname: `/admin/recebimentospix` }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>*/
                            }
                            {this.props.voltarContasPagas &&
                                <Link to={{ pathname: `/admin/contaspagas`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasReceber &&
                                <Link to={{ pathname: `/admin/contasreceber`, state: { chave: this.props.chave } }}>
                                    <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                                </Link>
                            }
                            {this.props.voltarContasRecebidas &&
                                <Link to={{ pathname: `/admin/contasrecebidas`, state: { chave: this.props.chave } }}>
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
                                                to={{ pathname: `/admin/tabelas` }}
                                                className="dropdown-item"
                                            >
                                                Tabelas

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'NAVIOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/navios` }}>
                                                            Navios
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/tiposservicos` }}>
                                                            Tipos de Serviço
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SUBGRUPOS_TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/admin/subgrupos` }}>
                                                            Subgrupos de Taxas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'MOEDAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/moedas` }}>
                                                            Moedas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/pessoas` }}>
                                                            Pessoas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PORTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/portos` }}>
                                                            Portos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <Link className="dropdown-item" to={{ pathname: `/admin/taxas` }}>
                                                            Taxas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CENTROS_CUSTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/centroscustos` }}>
                                                            Centros de Custos
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/planoscontas` }}>
                                                            Planos de Contas
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'HISTORICOS_PADRAO') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/historicospadrao` }}>
                                                            Históricos Padrão
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/tiposdocumentos` }}>
                                                            Tipos de Documentos
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>
                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/admin/ordensservico` }}
                                                className="dropdown-item"
                                            >
                                                Ordens de Serviço

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/os` }}>
                                                            OS
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/solicitacoesservicos` }}>
                                                            Solitações de Serviço
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>

                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/admin/financeiro` }}
                                                className="dropdown-item"
                                            >
                                                Financeiro

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&

                                                        <div className="dropdown-item dropend text-left" >

                                                            <Link className="dropdown-item" to={{ pathname: `/admin/contasabertas` }}>
                                                                Contas em Aberto
                                                            </Link>
                                                            {window.innerWidth >= 780 &&
                                                                <ul className="dropdown-menu">
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/admin/contasreceber` }}>
                                                                            Contas a receber
                                                                        </Link>
                                                                        {window.innerWidth >= 915 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/admin/relatorio`, state: { backTo: 'contasReceber' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                    <div className="dropdown-item dropend" >

                                                                        <Link className="dropdown-item" to={{ pathname: `/admin/contaspagar` }}>
                                                                            Contas a pagar
                                                                        </Link>
                                                                        {window.innerWidth >= 915 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/admin/relatorio`, state: { backTo: 'contasPagar' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                </ul>
                                                            }
                                                        </div>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <div className="dropdown-item dropend" >
                                                            <Link className="dropdown-item" to={{ pathname: `/admin/contasliquidadas` }}>
                                                                Contas Liquidadas
                                                            </Link>
                                                            {window.innerWidth >= 780 &&
                                                                <ul className="dropdown-menu">
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/admin/contasrecebidas` }}>
                                                                            Contas recebidas
                                                                        </Link>
                                                                        {window.innerWidth >= 915 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/admin/relatorio`, state: { backTo: 'contasRecebidas' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                    <div className="dropdown-item dropend" >
                                                                        <Link className="dropdown-item" to={{ pathname: `/admin/contaspagas` }}>
                                                                            Contas pagas
                                                                        </Link>
                                                                        {window.innerWidth >= 915 && !this.props.relatorio &&
                                                                            <ul className="dropdown-menu">
                                                                                <Link className="dropdown-item" to={{ pathname: `/admin/relatorio`, state: { backTo: 'contasPagas' } }}>
                                                                                    Relatório
                                                                                </Link>
                                                                            </ul>
                                                                        }
                                                                    </div>
                                                                </ul>
                                                            }
                                                        </div>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_PAGAR') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/pagamentoslote` }}>
                                                            Pagamentos em Lote
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_PAGAR') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/pagamentosmanual` }}>
                                                            Pagamentos Manual
                                                        </Link>
                                                    }
                                                    {/*this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_RECEBER') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/recebimentospix` }}>
                                                            Recebimentos por Pix
                                                        </Link>
                                                    */}
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'FATURAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/faturas` }}>
                                                            Notas Fiscais de Serviço
                                                        </Link>
                                                    }
                                                </ul>
                                            }
                                        </div>
                                        <div className="dropdown-item dropend" >
                                            <Link
                                                to={{ pathname: `/admin/utilitarios` }}
                                                className="dropdown-item"
                                            >
                                                Utilitários

                                                <p style={{ color: 'white' }}></p>
                                            </Link>
                                            {window.innerWidth >= 650 &&
                                                <ul className="dropdown-menu">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/operadores` }}>
                                                            Operadores
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/permissoes` }}>
                                                            Permissoes
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/logs` }}>
                                                            Logs
                                                        </Link>
                                                    }
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PARAMETROS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                                        <Link className="dropdown-item" to={{ pathname: `/admin/parametros` }}>
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
                        {this.props.sair &&
                            <img alt='logo' className=" img-fluid logologado" src={Logo} style={{ alignItems: 'center', justifyContent: 'center' }} />
                        }

                        {!this.props.sair &&
                            <Link to={{ pathname: `/admin/inicio` }}>
                                <img alt='logo' className=" img-fluid logologado" src={Logo} style={{ alignItems: 'center', justifyContent: 'center' }} />
                            </Link>
                        }
                    </div>


                    {window.innerWidth >= 860 &&
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
        onLogout: user => dispatch(logout(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)