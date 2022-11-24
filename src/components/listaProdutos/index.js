import React, {Component} from 'react'
import {api} from '../../services/api'
import util from '../../classes/util'
import semImagem from '../../img/products/no_image.jpg'
import './styles.css'
import {Link} from 'react-router-dom'


const estadoInicial = {
    produtos: [],
    familias: [],
    paginacao: 0,
    paginas: [],
    tamanho: 0,
    porPagina: 12,
    pags: 0,
    grupo: null
}

class ListaProdutos extends Component {
    
    state = {
        ...estadoInicial
    }

    componentDidMount = async () => {
        await this.carregaFamilias()
        await this.carregaProdutos()
        await this.carregaPaginas()
    }


    componentDidUpdate = async (prevProps, prevState) => {
        if(this.state.paginacao !== prevState.paginacao){
            this.carregaProdutos()
        }else if(this.state.grupo !== prevState.grupo){
            this.carregaProdutos()
            this.setState({paginacao: 0})
        }
    }

    carregaProdutos = async () => {
        const empresa = 0
        let url = this.state.grupo ? `produtos/${empresa}/${this.state.grupo}/10000/0` : `produtos/${empresa}/10000/0`
        await api.get(url, {
        }).then(resp => {
            this.setState({tamanho: resp.data.length})
            this.carregaPaginas()
        })
        url = this.state.grupo ? `produtos/${empresa}/${this.state.grupo}/${this.state.porPagina}/${this.state.paginacao}` : `produtos/${empresa}/${this.state.porPagina}/${this.state.paginacao}`
        await api.get(url, {
            }).then(response => {
            this.setState({produtos: []})    
            this.setState({produtos: response.data})
            }
        )
    }

    carregaFamilias = async () => {
        const empresa = 1
        await api.get(`familias/${empresa}`, {
            }).then(response => {
            this.setState({familias: response.data})
            }
        )
    }
    
    carregaPaginas = async () => {
        await this.setState({pags: Math.ceil((this.state.tamanho / this.state.porPagina))})
        let paginas = []
        for(let i=0;i<this.state.pags;i++){
            paginas.push(i)
        }
        await this.setState({paginas: []})
        await this.setState({paginas})
        //alert(this.state.pags)
    }
    
    mostrarChave = (chave) => {
        var chaveAlt = util.completarZerosEsquerda(chave, 6)
        console.log(chaveAlt)
   }

    render(){
        return (
            <section className="latest-products spad">
                <div className="container">
                    <div className="product-filter">
                        <div className="row">
                            <div className="col-lg-12 text-center">
                                <div className="section-title">
                                    <h2>Últimas Novidades</h2>
                                </div>
                                <ul className="product-controls">
                                <li onClick={() => this.setState({grupo: null})}>Todas</li>
                                    {this.state.familias.map(familia => (
                                        <li onClick={() => this.setState({grupo: familia.Chave})} key={familia.Chave}>{familia.Descricao}</li> 
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="product-filter">
                        <div className="row">
                            <div className="col-lg-12 text-center">
                                <ul className="product-controls">
                                    {this.state.paginas.map(pagina => (
                                        <li key={pagina} onClick={() => this.setState({paginacao: pagina})}>{(pagina + 1)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row" id="product-list">
                        {this.state.produtos.map(produto => (
                            <div key={produto.chave} className="col-lg-3 col-sm-6 mix all dresses bags">
                            <div className="single-product-item">
                                <Link to={{pathname: `/detalhes/${produto.chave}`, state: produto.chave}}>
                                    <figure>
                                        <img src={util.urlExists(produto.chave)}  onError={(e)=>{e.target.onerror = null; e.target.src=semImagem}} alt={produto.Descricao}/>
                                    </figure>
                                </Link>
                                <div className="product-text">
                                    <h6>{produto.Descricao}</h6>
                                    <p>{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.Preco_Venda)}</p>
                                </div>
                            </div>
                            </div>  
                        ))}
                    </div>
                <div className="product-filter">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <ul className="product-controls">
                                {this.state.paginas.map(pagina => (
                                    <li key={pagina} onClick={() => this.setState({paginacao: pagina})} >{(pagina + 1)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>                
            </div>
        </section> 
        )
    }
}

export default ListaProdutos
