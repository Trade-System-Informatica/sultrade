import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingUsd, faCashRegister } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'


const estadoInicial = {
    name: '',
    contas: [],
    pesquisa: "",
    tipoPesquisa: 1,
    pessoas: '',
    tipos: ['Receber', "Pagar"],


    loading: true,
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100
}

class ContasLiquidadas extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.getContasLiquidadas();
        await this.getPessoas();

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
                permissaoInsere: permissao ? permissao.Liberacao.split(``)[0] : 0,
                permissaoEdita: permissao ? permissao.Liberacao.split(``)[1] : 0,
                permissaoConsulta: permissao ? permissao.Liberacao.split(``)[2] : 0,
                permissaoDeleta: permissao ? permissao.Liberacao.split(``)[3] : 0
            }
        })

        await this.setState({ acessosPermissoes: acessosPermissoes });
        await this.setState({ loading: false })


    }

    getContasLiquidadas = async () => {
        await apiEmployee.post(`getContasLiquidadas.php`, {
            token: true
        }).then(
            async response => {
                await this.setState({ contas: response.data });
            },
            response => { this.erroApi(response) }

        )
    }

    getPessoas = async () => {
        await apiEmployee.post(`getPessoas.php`, {
            token: true,
        }).then(
            async response => {
                await this.setState({ pessoas: response.data })

                let pessoa = "";
                const contas = this.state.contas.map((e) => {
                    pessoa = this.state.pessoas.find((el) => { if (e.Operador != 0) { return (el.Chave == e.Operador) } else { return (el.Chave == e.Pessoa) } });
                    if (pessoa) {
                        return (
                            { ...e, pessoaNome: pessoa.Nome }
                        )
                    } else {
                        return (
                            { ...e, pessoaNome: '' }
                        )
                    }
                })

                await this.setState({ contas: contas })

            },
            response => { this.erroApi(response) }
        )
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteConta = async (chave, nome) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Conta? ({nome}?) </p>
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
                                    await apiEmployee.post(`deleteConta.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
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

    filtrarPesquisa = (conta) => {
        if (this.state.pesquisa.trim() == "") {
            return conta;
        }
        if (conta.pessoaNome && this.state.tipoPesquisa == 1) {
            return conta.pessoaNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Saldo && this.state.tipoPesquisa == 2) {
            return conta.Saldo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Chave && this.state.tipoPesquisa == 3) {
            return conta.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        }

    }



    render() {

        return (

            <div className='allContent'>

                <div>
                    {this.state.loading &&
                        <Skeleton />
                    }

                    {this.state.redirect &&
                        <Redirect to={'/'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarFinanceiroTabelas titulo="Contas Liquidadas"/>


                                <br />
                            </section>

                            <div className="row">
                                <div className="col-2"></div>
                                <div className="col-2"></div>
                            </div>
                        </div>
                    }
                    <ul className='itens_centro'>
                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_LIQUIDADAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                            <li className=" text-left itemMenu list-group-item ">
                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/contaspagas` }}>
                                    <FontAwesomeIcon icon={faHandHoldingUsd} size="2x" color="tomato" />
                                    <h4 className="textoMenu">Contas Pagas</h4>
                                </Link>
                            </li>
                        }

                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_LIQUIDADAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                            <li className=" text-left itemMenu list-group-item ">
                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/contasrecebidas` }}>
                                    <FontAwesomeIcon icon={faCashRegister} size="2x" color="tomato" />
                                    <h4 className="textoMenu">Contas Recebidas</h4>
                                </Link>
                            </li>
                        }

                    </ul>
                </div>
                <Rodape />
            </div>
        )

    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(ContasLiquidadas)