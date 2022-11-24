import React, {Component} from 'react'
import './styles.css'
import api from '../../services/api'
import Header from '../header'
import Rodape from '../rodape'
import axios from 'axios'
import {server, showError} from '../../common'
import semImagem from '../../img/products/no_image.jpg'
import util from '../../classes/util'

import {connect} from 'react-redux'
import {add} from '../../store/actions/produto'

class ProdutoDetalhe extends Component {
    
    async componentDidMount(){
        window.scrollTo(0, 0)
        const {produto} = this.props.match.params
        await this.loadData(produto)
        await this.setState({chavesProdutos: this.props.carrinho.map(function(e) { return e.chave})})
        console.log(this.state.chavesProdutos.map(function(e) { return e}))
    }

    loadData = async (produto) => {
        try{
            const res = await axios.get(`${server}/produtos/${this.props.match.params.id}`)
            this.setState({produtos: res.data})
        }catch(e){
            showError(e)
        }
    }

    state = {
        produtos: [],
        qtd: 1,
        total: 0,
        produtoAdd: [],
        chavesProdutos: []   
    }

   addProduto = async () => {
      
       
    let pos = await this.state.chavesProdutos.indexOf(parseInt(this.props.match.params.id))
    console.log(this.props.match.params.id)
    console.log(pos)
    console.log(this.state.chavesProdutos.map(function(e) { return e}))    
    if(pos == -1){
            
        let total = this.state.produtos[0].Preco_Venda * this.state.qtd
        let teste = this.state.produtos[0]
        teste.quantidade = this.state.qtd
        teste.total = total
        await this.setState({produtoAdd: teste, total})
        this.props.onProduto({...this.state})   
        alert(`${this.state.produtos[0].Descricao} com ${this.state.qtd} unidades adicionado!`)       
        await this.setState({chavesProdutos: [...this.state.chavesProdutos, this.state.produtos[0].chave]})
        //console.log(this.state.chavesProdutos)
        
        }else{
            alert("Faha ao adicionar o produto, já adicionado anteriormente")
        }
   }

   alterarQtd = async (alterar) => {
       let novaQuantidade = await this.state.qtd
       novaQuantidade = novaQuantidade + alterar
       novaQuantidade >=  1 ? await this.setState({qtd: novaQuantidade}) : await this.setState({qtd: 1})
   }

    render(){

        return(
            <div className="header">
                <Header />
                    <section className="page-add">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="page-breadcrumb">
                                    <h2>Detalhes do Produto<span>.</span></h2>
                                    <a href="#">Início</a>
                                    <a href="#">Detalhes</a>
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <img src={require('../../img/add.jpg')} alt="" />
                            </div>
                        </div>
                    </div>
                    </section>
                    <section className="product-page">
                        {this.state.produtos.map (produto => (

                       
                        <div key={produto.chave} className="container">
                            <div className="product-control">
                                <a href="#">Anterior</a>
                                <a href="#">Próximo</a>
                            </div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <figure>
                                    <img src={util.urlExists(produto.chave)}  onError={(e)=>{e.target.onerror = null; e.target.src=semImagem}} alt={produto.Descricao}/>
                                    </figure>   
                                </div>
                                <div className="col-lg-6">
                                    <div className="product-content">
                                        <h2>{produto.Descricao}</h2>
                                        <div className="pc-meta">
                                            <h5>{produto.Preco_Venda.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</h5>
                                            <div className="rating">
                                                <i className="fa fa-star"></i>
                                                <i className="fa fa-star"></i>
                                                <i className="fa fa-star"></i>
                                                <i className="fa fa-star"></i>
                                                <i className="fa fa-star"></i>
                                            </div>
                                        </div>
                                        <ul className="tags">
                                            <li><span>Categoria :</span> Roupas Masculinas</li>
                                            <li><span>Tags :</span> man, shirt, dotted, elegant, cool</li>
                                        </ul>
                                        <div className="product-quantity">
                                            <div className="pro-qty">
                                                <span onClick={() => this.alterarQtd(-1)} className="dec qtybtn">-</span>
                                                <input value={this.state.qtd} type="text" name="qtd" id="qtd" min={1} max={10} onChange={e => { 
                                                    if(e.currentTarget.value > 10){
                                                        e.currentTarget.value = 10 
                                                    }else{
                                                    this.setState({qtd: e.currentTarget.value})
                                                    }
                                                 }} />
                                                 <span onClick={() => this.alterarQtd(1)} className="inc qtybtn">+</span>
                                            </div>
                                        </div>
                                        <button onClick={() => this.addProduto()}  className="primary-btn pc-btn">Adicionar ao Carrinho</button>
                                        <ul className="p-info">
                                            <li>Informações do Produto</li>
                                            <li>Avaliações</li>
                                            <li>Cuidados com o Produto</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </section>
                    <Rodape />
                </div>
            )
        }
}

const mapDispatchToProps = dispatch => {
    return{
        onProduto: produto => dispatch(add(produto))
    }
}

const mapStateToProps = ({produtos}) => {
    return {
        carrinho: produtos.produtos
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ProdutoDetalhe)
