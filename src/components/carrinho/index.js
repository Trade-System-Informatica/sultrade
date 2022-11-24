import React, {Component} from 'react'
import './styles.css'
import api from '../../services/api'
import Header from '../header'
import Rodape from '../rodape'
import axios from 'axios'
import {server, showError, showSuccess} from '../../common'
import util from '../../classes/util'
import {connect} from 'react-redux'
import {limpar, remove, selecionaFrete, removeFrete} from '../../store/actions/produto'
import semImagem from '../../img/products/no_image.jpg'
import { LIMPAR_CARRINHO } from '../../store/actions/actionTypes'
import moment from 'moment'
import { Form, Formik, Field } from 'formik'

class Carrinho extends Component {
    
    state = {
        carrinho: [],
        qtd: 1,
        tiposEntrega: [],
        tipoEntrega: null,
        condicoes: [],
        condicao: null,
        posicao: null,
        totalProduto: null   
    }

    async componentDidMount(){
        await window.scrollTo(0, 0)
        //const {produto} = this.props.match.params
        //await this.loadData(produto)
        await this.loadProdutos()
        await this.loadTiposEntrega()
        await this.loadCondicoes()
    }

    loadData = async (produto) => {
        try{
            const res = await axios.get(`${server}/produtos/${this.props.match.params.id}`)
            this.setState({produtos: res.data})
        }catch(e){
            showError(e)
        }
    }

    loadProdutos =  async () => {
        try{
            await this.setState({carrinho: this.props.carrinho })
        }catch(e){
            showError(e)
        }
    }

    loadTiposEntrega = async () => {
        try{
            const res = await axios.get(`${server}/tiposentrega`)
            this.setState({tiposEntrega: res.data})
        }catch(e){
            showError(e)
        }
    }

    alteraTipoEntrega = async tipoEntrega => {
        await this.setState({tipoEntrega})
        //alert(this.state.tipoEntrega)
    }

    loadCondicoes = async () => {
        try{
            const res = await axios.get(`${server}/condicoes`)
            this.setState({condicoes: res.data})
        }catch(e){
            showError(e)
        }
    }

    alteraCondicao = async condicao => {
        await this.setState({condicao})
        //alert(this.state.condicao)
    } 

    teste = () => {
        const teste = 'Teste categoria'
        return teste
    }

    removerItem = async (posicao, totalProduto) => {
        await this.setState({posicao, totalProduto})
        await this.props.onRemoverItem({...this.state})
        alert(`Item removido do carrinho`)
    }

    limpaCarrinho = async () => {
        try{
            this.props.onLimpar({...this.state})
            alert('Itens removidos do Carrinho')
        }catch(e){
            alert("Erro ao limpar o carrinho")
        }
    }

    finalizarCompra = async () => {
        
        try{
            if(this.props.chave){
                if(!this.state.condicao){
                    alert("escolha a condição de pagamento!")
                }else if(!this.state.tipoEntrega){
                    alert("escolha a forma de entrega!")
                }else{
                    const resCod = await axios.get(`${server}/codigos`)
                    let proximo = await resCod.data.proximo
                    const resMov = await axios.get(`${server}/movimentacao`)
                    let chaveMov = await resMov.data.chave
                    chaveMov++
                    const dataHora = moment().format('YYYY-MM-DD HH:mm:ss')
                    const data = moment().format('YYYY-MM-DD')    
                    await axios.post(`${server}/movimentacao`, {
                        tipo: 'P',
                        valorFrete: this.props.frete,
                        empresa: this.props.empresa.Chave,
                        notaFiscal: proximo,
                        dadosAdic: 'Pedido Feito Pelo Site',
                        subTotal: this.props.total + this.props.frete,
                        valorProdutos: this.props.total,
                        total: this.props.total + this.props.frete,
                        nomePessoa: this.props.nome,
                        pessoa: this.props.chave,
                        condicao: this.state.condicao,
                        emissao: moment().format(),
                        lancamento: moment().format(),
                        dataSaida: moment().format(),
                        tipoEntrega: this.state.tipoEntrega
                    })
                        
                    await this.props.carrinho.forEach(adicionaItens)
                        
                    proximo++
                    await axios.put(`${server}/codigos`, {
                        proximo: proximo
                    })
                        
                    showSuccess('Compra efetuada com sucesso!')
                    //await this.setState({produtos: []})
                    //await this.setState({totalProdutos: 0})
                    this.props.onLimpar({...this.state})
                }
            }else{
                alert("Faça login para poder finalizar o seu pedido!")
            }               
            
        }catch(e){
            showError(e)
        }
        

        async function adicionaItens(element, index, array) {
            try{
                const resMov = await axios.get(`${server}/movimentacao`)
                let chaveMov = await resMov.data.chave
                const resGIcms = await axios.get(`${server}/grupoicms/${element.gIcms}`)
                let situacaoTributaria = resGIcms.data.Situacao_Tributaria
                console.log(situacaoTributaria)
                    
                await axios.post(`${server}/movitens`, {
                    chavemov: chaveMov,
                    descricao: `${element.Descricao}`,
                    codigoProduto: element.chave,
                    quantidade: element.quantidade,
                    valorUnitario: element.Preco_Venda,
                    valorTotal: element.total,
                    situacaoTributaria: situacaoTributaria,
                    un: `${element.Unid_med}`
                })
                    
            }catch(e){
                showError(e)
            }
        }
                
    }

    render(){

        return(
            <div>
                <Header />
                <section className="page-add">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="page-breadcrumb">
                                    <h2>Carrinho<span>.</span></h2>
                                    <a href="#">Início</a>
                                    <a href="#">Carrinho</a>
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <img src="img/add.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="cart-page">
                    <div className="container">
                        <div className="cart-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="product-h">Produto</th>
                                        <th>Preço Unitário</th>
                                        <th className="quan">Quantidade</th>
                                        <th>Total</th>
                                        <th>Remover Produto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.carrinho.map((produto, index) => (
                                        <tr key={index}>
                                            <td className="product-col">
                                                <img src={util.urlExists(produto.chave)}  onError={(e)=>{e.target.onerror = null; e.target.src=semImagem}} alt={produto.Descricao}/>
                                                <div className="p-title">
                                                <h5>{produto.Descricao}</h5>
                                                </div>
                                            </td>
                                            <td className="price-col">{produto.Preco_Venda.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                            <td className="quantity-col">
                                                <div className="pro-qty">
                                                    <input type="text" value={produto.quantidade} />
                                                </div>
                                            </td>
                                            <td className="total">{produto.total.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                            <td className="product-close" onClick={() => this.removerItem(index, produto.total)}>X</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="cart-btn">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="coupon-input">
                                        <input type="text" placeholder="Digite o código do cupom" />
                                    </div>
                                </div>
                                {this.props.carrinho.length > 0 &&
                                <div className="col-lg-5 offset-lg-1 text-left text-lg-right">
                                    <div className="site-btn clear-btn" onClick={() => this.limpaCarrinho()}>Limpar Carrinho</div>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="shopping-method">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="">
                                    <Formik
                                        initialValues={{
                                            tipoEntrega: "",
                                            key: 0
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 500));
                                            alert(JSON.stringify(values, null, 2));
                                        }}
                                        >
                                        {({ values }) => (
                                            <Form>                                     
                                            <div id="my-radio-group"><h5>Escolha o envio</h5></div>
                                            <div className="chose-shipping" role="group" aria-labelledby="my-radio-group">
                                            {this.state.tiposEntrega.map(condicao => (
                                              <div style={{display: 'inline-block', marginRight: '3em', fontFamily: 'Montserrat', fontWeight: "bold"}} key={condicao.chave} className="cs-item">
                                                    <Field  onClick={() => this.alteraTipoEntrega(condicao.chave)} type="radio" name="condicao" value={`${condicao.chave}`} />
                                                    <label style={{marginLeft: 5}} htmlFor={`${condicao.chave}`}>   
                                                    {condicao.descricao}
                                                    </label>
                                                </div>
                                                
                                            ))}
                                            </div>
                                            </Form>                                            
                                        )}

                                    </Formik>
                                    </div>

                                    <div className="info">
                                    <Formik
                                        initialValues={{
                                            condicao: "",
                                            key: 0
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 500));
                                            alert(JSON.stringify(values, null, 2));
                                        }}
                                        >
                                        {({ values }) => (
                                            <Form>                                     
                                            <div id="my-radio-group"><h5>Escolha a forma de pagamento</h5></div>
                                            <div className="chose-shipping" role="group" aria-labelledby="my-radio-group">
                                            {this.state.condicoes.map(condicao => (
                                              <div style={{display: 'inline-block', marginRight: '3em', fontFamily: 'Montserrat', fontWeight: "bold"}} key={condicao.chave} className="cs-item">
                                                    <Field onClick={() => this.alteraCondicao(condicao.chave)} type="radio" name="condicao" value={`${condicao.chave}`} />
                                                    <label style={{marginLeft: 5}} htmlFor={`${condicao.chave}`}>   
                                                    {condicao.descricao}
                                                    </label>
                                                </div>
                                                
                                            ))}
                                            </div>
                                            </Form>                                            
                                        )}

                                    </Formik>
                                    </div>
                                    <div className="total-info">
                                        <div className="total-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Total</th>
                                                        <th>Subtotal</th>
                                                        <th>Entrega</th>
                                                        <th className="total-cart">Total Carrinho</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="total">{this.props.total == 0 ? 0 : this.props.total.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                                        <td className="sub-total">{this.props.total == 0 ? 0 : this.props.total.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                                        <td className="shipping">{this.props.frete == 0 ? 0 : this.props.frete.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                                        <td className="total-cart-p">{(this.props.total + this.props.frete) == 0 ? 0 : (this.props.total + this.props.frete).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {this.props.carrinho.length > 0 && 
                                        <div className="row">
                                            <div className="col-lg-12 text-right">
                                                <div className="site-btn clear-btn" onClick={() => this.finalizarCompra()}>Finalizar Compra</div>
                                            </div>
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Rodape />
            </div>
            )
        }
}

const mapStateToProps = ({ produtos, user, empresa }) => {
    return {
        total: produtos.totalVenda, carrinho: produtos.produtos, frete: produtos.frete,
        empresa: empresa.empresa,
        usuario: user.email,
        chave: user.chave,
        nome: user.nome
    }
}

const mapDispatchToProps = dispatch => {
    return{
        onLimpar: () => dispatch(limpar()),
        onRemoverItem: (item) => dispatch(remove(item)),
        onFrete: (frete) => dispatch(selecionaFrete(frete)),
        onRemoveFrete: () => dispatch(removeFrete())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Carrinho)

////<a href="#" className="primary-btn chechout-btn">Finalizar Compra</a>
/*

*/