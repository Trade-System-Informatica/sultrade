import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import { connect } from 'react-redux'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDollar, faMoneyCheck, faBoxOpen, faArchive, faIdCard, faCommentsDollar } from '@fortawesome/free-solid-svg-icons'

class Financeiro extends Component {

    state = {
        isLogado: true,
        loading: true,
        acessos: [],
        //Acessos: 1 - Taxas, 2 - TiposTaxas, 3 - Subgrupos, 4 - Moedas, 5 - Pessoas, 6 - enderecos, 7 - contatos, 8 - operadores.
        permissoes: [],
        acessosPermissoes: [
            /*{
                acesso:
                permissoes: []
            }*/
        ],
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        this.verificaLogado()
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
    verificaLogado = async () => {
        await apiEmployee.get(`app.php`, {
            token: this.props.token
        }).then(
            async response => {
                if (response.data == 'true') {
                    this.erroApi(response)
                } else {
                    await this.setState({ loading: false })
                }
            },
            async response => { this.erroApi(response) }
        )
        await this.setState({ loading: false })
    }

    erroApi = async (res) => {
        await this.setState({ isLogado: false })
        this.setState({ redirect: true })
    }

    render() {

        return (
            <div className='allContent'>

                <div>
                    {!this.state.isLogado &&
                        <Redirect to={'/'} />
                    }
                    {this.state.loading &&
                        <Skeleton />
                    }
                    <Header voltar titulo="Financeiro" />
                    <br />
                    <br />
                    {!this.state.loading &&
                        <div className="product-filter row">
                            <div className="col-12 text-center">
                                <div className="rounded">
                                    <ul className='itens_centro'>
                                        <li className=" text-left itemMenu list-group-item ">
                                            <Link className="semTextDecoration" to={{ pathname: `/financeiro/contasabertas` }}>
                                                <FontAwesomeIcon icon={faBoxOpen} size="2x" color="tomato" />
                                                <h4 className="textoMenu">Contas em Aberto</h4>
                                            </Link>
                                        </li>

                                        <li className=" text-left itemMenu list-group-item ">
                                            <Link className="semTextDecoration" to={{ pathname: `/financeiro/contasliquidadas` }}>
                                                <FontAwesomeIcon icon={faArchive} size="2x" color="tomato" />
                                                <h4 className="textoMenu">Contas Liquidadas</h4>
                                            </Link>
                                        </li>

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/pagamentoslote` }}>
                                                    <FontAwesomeIcon icon={faCommentDollar} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Pagamentos em Lote</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/pagamentosmanual` }}>
                                                    <FontAwesomeIcon icon={faMoneyCheck} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Pagamentos Manual</h4>
                                                </Link>
                                            </li>
                                        }

                                        {/*this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_RECEBER') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/recebimentospix` }}>
                                                    <FontAwesomeIcon icon={faCommentsDollar} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Recebimentos por Pix</h4>
                                                </Link>
                                            </li>
                                    */}

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'FATURAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/financeiro/faturas` }}>
                                                    <FontAwesomeIcon icon={faIdCard} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Notas Fiscais de Serviço</h4>
                                                </Link>
                                            </li>
                                        }

                                    </ul>
                                </div>
                            </div>

                        </div>
                    }
                </div>
                <Rodape />
            </div>
        )
    }

}

const mapStateToProps = ({ user }) => {
    return {
        user: user
    }
}

export default connect(mapStateToProps, null)(Financeiro)