import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import Skeleton from '../../components/skeleton'
import './styles.css'
import Util from '../../classes/util'
import { apiEmployee } from '../../services/apiamrg'
import { connect } from 'react-redux'
import Logo from '../../img/logo.png'
import { IoBusiness } from "react-icons/io5";
import { GiCargoCrate, GiShipBow } from "react-icons/gi"


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTable, faUserTie, faClipboard, faMoneyBillWave, faWater, faPaperclip, faDollyFlatbed, faSignal, faCartPlus, faTv, faDollarSign, faScroll, faScrewdriver } from '@fortawesome/free-solid-svg-icons'

class Inicio extends Component {

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
                permissoes: permissao ? permissao.Liberacao.split(``)[2] : 0
            }
        })

        await this.setState({ acessosPermissoes: acessosPermissoes });
        


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
                        <Redirect to={'/admin'} />
                    }
                    {this.state.loading &&
                        <Skeleton />
                    }
                    <Header sair titulo="Inicio"/>
                    
                    <br/>
                    <br/>
                    {!this.state.loading &&
                        <div className="product-filter row">
                            <div className="col-12 text-center">
                                <div className="rounded">
                                    <ul className='itens_centro'>
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/tabelas` }}>
                                                    <FontAwesomeIcon icon={faTable} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Tabelas</h4>
                                                </Link>
                                            </li>

                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/ordensservico` }}>
                                                    <FontAwesomeIcon icon={faUserTie} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Ordens de Serviço</h4>
                                                </Link>
                                            </li>
                                            
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/financeiro` }}>
                                                    <FontAwesomeIcon icon={faMoneyBillWave} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Financeiro</h4>
                                                </Link>
                                            </li>

                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/utilitarios` }}>
                                                    <FontAwesomeIcon icon={faClipboard} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Utilitários</h4>
                                                </Link>
                                            </li>

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
        user: user,
        //online: servidor.online
    }
}

export default connect(mapStateToProps, null)(Inicio)

/*
                                <li className="w-100 text-left itemMenu list-group-item ">
                                    <Link className="semTextDecoration" to={{pathname: `/admin/employees`}}>
                                        <FontAwesomeIcon icon={faUsersCog} size="2x" color="tomato" />
                                        <h4 className="textoMenu">Users</h4>
                                    </Link>
                                </li>
*/