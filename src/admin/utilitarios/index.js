import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import Skeleton from '../../components/skeleton'
import './styles.css'
import { apiEmployee } from '../../services/apiamrg'
import { connect } from 'react-redux'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faCheckCircle, faAddressCard, faCogs} from '@fortawesome/free-solid-svg-icons'

class Utilitarios extends Component {

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
                    <Header voltar movimentacao titulo="Utilitários" />
                    <br />
                    <br />
                    {!this.state.loading &&
                        <div className="product-filter row">
                            <div className="col-12 text-center">
                                <div className="rounded">
                                    <ul className='itens_centro'>
                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item  ">
                                                <Link to={{ pathname: `/admin/operadores` }} className="semTextDecoration">
                                                    <FontAwesomeIcon icon={faAddressCard} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Operadores</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PERMISSOES') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/permissoes` }}>
                                                    <FontAwesomeIcon icon={faCheckCircle} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Permissões</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/logs` }}>
                                                    <FontAwesomeIcon icon={faBookOpen} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Logs</h4>
                                                </Link>
                                            </li>
                                        }

                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PARAMETROS') { return e } }).map((e) => e.permissoes)[0] == 1 &&
                                            <li className=" text-left itemMenu list-group-item ">
                                                <Link className="semTextDecoration" to={{ pathname: `/admin/parametros` }}>
                                                    <FontAwesomeIcon icon={faCogs} size="2x" color="tomato" />
                                                    <h4 className="textoMenu">Parametros</h4>
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

export default connect(mapStateToProps, null)(Utilitarios)