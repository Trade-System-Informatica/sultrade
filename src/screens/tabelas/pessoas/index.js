import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import Skeleton from '../../../components/skeleton'
import AddButton from '../../../components/addButton';
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faEnvelope, faHome, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import ModalItem from '../../../components/modalItem'


const estadoInicial = {
    name: '',
    pessoas: [],
    pesquisa: "",
    tipoPesquisa: 1,
    categoria: "",
    //Tipos de pesquisa: 1 (descricao), 2 (prazo)
    /*seaports: [],*/
    loading: true,
    redirect: false,
    chaveFocus: '',

    deletePessoa: false,

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemDelete: '',

    direcaoTabela: faChevronDown,
    acessos: [],
    permissoes: [],
    acessosPermissoes: []
}

class Pessoas extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll();

        if (this.state.chaveFocus) {
            if (this.refs.focusMe) {
                await this.refs.focusMe.focus();
            } else {
                await this.setState({ pesquisa: this.state.chaveFocus, tipoPesquisa: 3 })
            }
        }

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "PESSOAS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deletePessoa && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deletePessoa: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            pessoas: await loader.getBase('getPessoas.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })
        console.log(this.state.pessoas);
        
        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deletePessoa = async (chave, nome) => {
        this.setState({ deletePessoa: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Pessoa? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
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
                            className="btn btn-success w-25"
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

    reverterItens = async () => {
        await this.setState({ loading: true })
        const pessoas = this.state.pessoas.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ pessoas, loading: false });
    }

    filtrarPesquisa = (pessoas) => {
        // Filtro por categoria (verificar bit específico)
        if (this.state.categoria) {
            const subCategoria = pessoas.Categoria || '0';
            const posicao = parseInt(this.state.categoria) - 1;
            
            // Verificar se o bit na posição está ativo (1)
            if (subCategoria.length < posicao || subCategoria[posicao] != '1') {
                return false;
            }
        }

        // Filtro por pesquisa
        if (this.state.tipoPesquisa == 1) {
            return pessoas.Nome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 2) {
            return pessoas.Cnpj_Cpf.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return pessoas.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarTabelas pessoas titulo="Pessoas" />


                                <br />
                            </section>

                            <ModalItem
                                closeModal={() => { this.setState({ modalItemAberto: false }) }}
                                itens={this.state.itemInfo}
                                nome={this.state.itemNome}
                                chave={this.state.itemChave}
                                modalAberto={this.state.modalItemAberto}
                                itemPermissao={this.state.itemPermissao}
                                itemAdd={this.state.itemAdd}
                                itemEdit={this.state.itemEdit}
                                itemContatos={this.state.itemContatos}
                                itemEnderecos={this.state.itemEnderecos}
                                itemDelete={this.state.itemDelete}
                                acessosPermissoes={this.state.acessosPermissoes}
                            />

                            <AddButton addLink={{ pathname: `/tabelas/addpessoa/0` }}/>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <div className='col-1'></div>
                                            <span style={{marginRight: 8, fontSize: '1.1em', fontWeight: '500'}}>Categoria:</span>
                                            <select className="form-control tipoPesquisa col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2" placeholder="Categoria..." value={this.state.categoria} onChange={e => { this.setState({ categoria: e.currentTarget.value }) }}>
                                                <option value="">Todas</option>
                                                <option value="1">Cliente</option>
                                                <option value="2">Fornecedor</option>
                                                <option value="5">Banco</option>
                                                <option value="6">Broker</option>
                                            </select>
                                            <select className="form-control tipoPesquisa col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Nome</option>
                                                <option value={2}>CPF/CNPJ</option>
                                                <option value={3}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/tabelas/addpessoa/0` }}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>


                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Chave</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Cnpj / Cpf</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Pessoa</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Info</span>
                                                </div>
                                                <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                    <span className="subtituloships">Cnpj / Cpf</span>
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                    <span className="subtituloships">Pessoa</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Info</span>
                                                </div>
                                                <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.pessoas[0] != undefined && this.state.pessoas.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.Chave}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Cnpj_Cpf}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <p>{feed.Nome_Fantasia ? feed.Nome_Fantasia : feed.Nome}</p>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/tabelas/pessoacontatos/${feed.Chave}`,
                                                                        state: { pessoa: { ...feed } }
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                                </Link>
                                                            </div>
                                                        }

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/tabelas/pessoaenderecos/${feed.Chave}`,
                                                                        state: { pessoa: { ...feed } }
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faHome} />
                                                                </Link>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoa/0`,
                                                                    state: { pessoa: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoa/${feed.Chave}`,
                                                                    state: { pessoa: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deletePessoa(feed.Chave, feed.Nome)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                            }
                                            {window.innerWidth < 500 &&
                                                <div
                                                    onClick={() => {
                                                        this.setState({

                                                            modalItemAberto: true,
                                                            itemInfo: [
                                                                { titulo: 'Chave', valor: feed.Chave },
                                                                { titulo: 'Nome', valor: feed.Nome },
                                                                { titulo: 'Nome Fantasia', valor: feed.Nome_Fantasia },
                                                                { titulo: 'CPF/CNPJ', valor: feed.Cnpj_Cpf },
                                                                { titulo: 'RG/IE', valor: feed.Rg_Ie },
                                                                { titulo: 'Nascimento/Abertura', valor: moment(feed.Nascimento_Abertura).format('DD/MM/YYYY') != "Invalid date" ? moment(feed.Nascimento_Abertura).format('DD/MM/YYYY') : '' }
                                                            ],
                                                            itemPermissao: 'PESSOAS',
                                                            itemNome: feed.Nome,
                                                            itemChave: feed.Chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/addmoeda/0`,
                                                                state: { moeda: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/addmoeda/${feed.Chave}`,
                                                                state: { moeda: { ...feed } }
                                                            },
                                                            itemContatos: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 ? {
                                                                pathname: `/tabelas/pessoacontatos/${feed.Chave}`,
                                                                state: { pessoa: { ...feed } }
                                                            } : '',
                                                            itemEnderecos: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 ? {
                                                                pathname: `/tabelas/pessoaenderecos/${feed.Chave}`,
                                                                state: { pessoa: { ...feed } }
                                                            } : '',
                                                            itemDelete: this.deletePessoa
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-4 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Cnpj_Cpf}</p>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <p>{feed.Nome_Fantasia ? feed.Nome_Fantasia : feed.Nome}</p>
                                                    </div>
                                                    <div className="col-2  text-left  mobileajuster4 icones">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/tabelas/pessoacontatos/${feed.Chave}`,
                                                                        state: { pessoa: { ...feed } }
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                                </Link>
                                                            </div>
                                                        }

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <div className='iconelixo giveMargin' type='button' >
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/tabelas/pessoaenderecos/${feed.Chave}`,
                                                                        state: { pessoa: { ...feed } }
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faHome} />
                                                                </Link>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="col-2  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoa/0`,
                                                                    state: { pessoa: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoa/${feed.Chave}`,
                                                                    state: { pessoa: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deletePessoa(feed.Chave, feed.Nome)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
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

export default connect(mapStateToProps, null)(Pessoas)