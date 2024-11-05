import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import loader from '../../../classes/loader'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import AddButton from '../../../components/addButton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPlus, faChevronDown, faChevronUp, faTimes , faArrowUp, faArrowDown, faSave} from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

const estadoInicial = {
    name: '',
    grupos: [],
    pesquisa: "",
    tipoPesquisa: 1,
    chaveFocus: '',
    loading: true,
    redirect: false,
    status: 1,

    deleteGrupo: false,

    direcaoTabela: faChevronDown,
    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
    ordemModificada: false,
}

class GruposTemplates extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user,
        maxOrdem: 1
    }

    componentDidMount = async () => {
        await this.loadAll();

        if (this.state.chaveFocus) {
            if (this.refs.focusMe) {
                await this.refs.focusMe.focus();
            }
        }

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "GRUPOS_TEMPLATES" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteGrupo && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteGrupo: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            grupos: await loader.getBase('getGruposTemplates.php', this.state.usuarioLogado.empresa),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        })

        // Determinar a maior ordem encontrada nos grupos
        this.setState(prevState => ({
            maxOrdem: this.state.grupos.reduce((max, grupo) => Math.max(max, grupo.ordem), 1)
        }));

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteGrupoTemplate = async (chave, nome) => {
        this.setState({ deleteGrupo: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja excluir este grupo de templates? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteGrupoTemplate.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('grupos_templates', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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
        const grupos = this.state.grupos.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ grupos, loading: false });
    }

    filtrarPesquisa = (grupos) => {
        if (!this.state.pesquisa) {
            return true;
        }
        
        if (this.state.tipoPesquisa == 1) {
            return grupos.nome.toLowerCase().includes(this.state.pesquisa.toLowerCase());
        } else {
            return grupos.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase());
        }

    }

    moveUp(index) {
        const grupos = [...this.state.grupos];
        const length = grupos.length;
        // Usando módulo para calcular o índice anterior de forma circular
        const previousIndex = (index - 1 + length) % length;
        [grupos[previousIndex], grupos[index]] = [grupos[index], grupos[previousIndex]];
        this.setState({ grupos, ordemModificada: true });
      }
      
      moveDown(index) {
        const grupos = [...this.state.grupos];
        const length = grupos.length;
        // Usando módulo para calcular o próximo índice de forma circular
        const nextIndex = (index + 1) % length;
        [grupos[nextIndex], grupos[index]] = [grupos[index], grupos[nextIndex]];
        this.setState({ grupos, ordemModificada: true });
      }

    salvarOrdem = async () => {
        this.setState({ loading: true });
      
        // Mapear grupos e criar as requisições para salvar a ordem no backend
        const promises = this.state.grupos.map((grupo, index) => {
          return apiEmployee.post(`updateGruposTemplateOrdem.php`, {
            chave: grupo.chave, // Identificador do grupo a ser atualizado
            ordem: index + 1,    // Define a nova ordem baseada na posição do array
          });
        });
      
        // Executa todas as requisições e espera elas terminarem
        try {
          await Promise.all(promises);
          console.log("Ordem dos grupos salva com sucesso.");
          
          this.setState({ loading: false });
          window.location.reload();
        } catch (error) {
          console.error("Erro ao salvar ordem dos grupos: ", error);
          this.setState({ loading: false });
        }
      };

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
                                <Header voltarUtilitarios grupos titulo="Grupos de Templates" />

                                <br />

                            </section>


                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className='col-1'></div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <div className='col-2'></div>
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Nome</option>
                                                <option value={2}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/utilitarios/addgrupotemplate/0` }}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>
                                        <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                        </div>
                                    </div>
                                    <div className='col-1 col-sm-2 col-md-2 col-lg-4 col-xl-4'>
                                    </div>
                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3">
                                    </div>
                                    <div>
                                    </div>

                                </div>
                            </div>


                            <AddButton addLink={{
                                pathname: `/utilitarios/addgrupotemplate/0`,
                                state: { grupo: { ordem: this.state.maxOrdem + 1}}
                            }} />

                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item">
                                        <div className="row subtitulosTabela">
                                            <div className="col-2 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-2 text-left">
                                                    <span className="subtituloships">Ordem</span>
                                            </div>
                                            <div className="col-6 text-left">
                                                <span className="subtituloships">Nome</span>
                                            </div>
                                            <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.grupos[0] != undefined && this.state.grupos.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            <div className="row deleteMargin alignCenter">
                                                <div className="col-2 text-left">
                                                    <p>{feed.chave}</p>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <p>{feed.ordem}{' '}
                                                      <span type="button" className="iconelixo giveMargin" onClick={(e) => {this.moveUp(index);}}>
                                                        <FontAwesomeIcon icon={faArrowUp} />
                                                      </span>
                                                      <span type="button" className="iconelixo" onClick={(e) => {this.moveDown(index);}}>
                                                        <FontAwesomeIcon icon={faArrowDown} />
                                                      </span></p>
                                                </div>
                                                <div className="col-6 text-left">
                                                    <p>{feed.nome}</p>
                                                </div>
                                                <div className="col-2 text-left mobileajuster4 icones">
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                            pathname: `/utilitarios/addgrupotemplate/0`,
                                                                state: { grupo: { ...feed } }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </Link>
                                                    </div>
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                            pathname: `/utilitarios/addgrupotemplate/${feed.chave}`,
                                                                state: { grupo: { ...feed } }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </Link>
                                                    </div>

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_TEMPLATES') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteGrupoTemplate(feed.chave, feed.nome)} >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </div>
                                                    }
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                    </div>
                                ))}
                                {this.state.ordemModificada && (
                                      <button className='salvarOrdem' onClick={this.salvarOrdem} disabled={this.state.loading}>
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
                    }
                </div>
                <Rodape />
            </div >
        )

    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(GruposTemplates)