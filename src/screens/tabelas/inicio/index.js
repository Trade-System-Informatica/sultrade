import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import './styles.css'
import { NAVIOS } from '../../../config'
import { apiEmployee } from '../../../services/apiamrg'
import { connect } from 'react-redux'
import { GiShipBow } from "react-icons/gi"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faFileAlt, faUserFriends, faWater, faPaperclip, faBalanceScale, faCreditCard, faListUl, faDollarSign, faScroll, faLayerGroup } from '@fortawesome/free-solid-svg-icons'

class Tabelas extends Component {

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
        //alert('Você precisa estar logado para poder acessar esta página!')
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
                    <Header voltar titulo="Tabelas" />
                    <br />
                    <br />
                    {!this.state.loading &&
                        <div className="product-filter row">
                            <div className="col-12 text-center">
                                <div className="rounded">
                                    <ul className='itens_centro'>
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'NAVIOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item  ">
                                                <Link to={{ pathname: `/tabelas/navios` }} className="semTextDecoration">
                                                    <GiShipBow size="2em" color="tomato" />
                                                    <h4 className="textoMenu">{NAVIOS}</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/tiposservicos` }}>
                                                    <FontAwesomeIcon icon={faBriefcase} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Tipos de Serviços</h4>
                                                </Link>
                                            </li>
                                        } 
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_CLIENTES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/gruposclientes` }}>
                                                    <FontAwesomeIcon icon={faLayerGroup} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Grupos de Clientes</h4>
                                                </Link>
                                            </li>
                                        }
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/grupos` }}>
                                                    <FontAwesomeIcon icon={faLayerGroup} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Grupos de Taxas</h4>
                                                </Link>
                                            </li>
                                        }
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SUBGRUPOS_TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/subgrupos` }}>
                                                    <FontAwesomeIcon icon={faPaperclip} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Subgrupos de Taxas</h4>
                                                </Link>
                                            </li>
                                        }
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'MOEDAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/moedas` }}>
                                                    <FontAwesomeIcon icon={faDollarSign} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Moedas</h4>
                                                </Link>
                                            </li>
                                        }
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/pessoas` }}>
                                                    <FontAwesomeIcon icon={faUserFriends} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Pessoas</h4>
                                                </Link>
                                            </li>
                                        }
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PORTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/portos` }}>
                                                    <FontAwesomeIcon icon={faWater} size="2x" color="tomato" />

                                                    <h4 className="textoMenu">Portos</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/taxas` }}>
                                                    <FontAwesomeIcon icon={faScroll} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Taxas</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CENTROS_CUSTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item  ">
                                                <Link to={{ pathname: `/tabelas/centroscustos` }} className="semTextDecoration">
                                                    <FontAwesomeIcon icon={faBalanceScale} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Centros de Custos</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/planoscontas` }}>
                                                    <FontAwesomeIcon icon={faCreditCard} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Planos de Contas</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'HISTORICOS_PADRAO') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/historicospadrao` }}>
                                                    <FontAwesomeIcon icon={faListUl} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Históricos Padrão</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DESCRICOES_PADRAO') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/descricoespadrao` }}>
                                                    <FontAwesomeIcon icon={faListUl} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Descrições Padrão</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/tiposdocumentos` }}>
                                                    <FontAwesomeIcon icon={faFileAlt} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Tipos de Documentos</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CATEGORIAS_TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/tabelas/categoriasdocumentos` }}>
                                                    <FontAwesomeIcon icon={faFileAlt} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Categorias de Documentos</h4>
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
        user: user,
        //online: servidor.online
    }
}

export default connect(mapStateToProps, null)(Tabelas)

/*
                                <li className="w-100 text-left itemMenu list-group-item ">
                                    <Link className="semTextDecoration" to={{pathname: `/tabelas/employees`}}>
                                        <FontAwesomeIcon icon={faUsersCog} size="2x" color="tomato" />
                                        <h4 className="textoMenu">Users</h4>
                                    </Link>
                                </li>
*/