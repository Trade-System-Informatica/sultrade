import React, {Component} from 'react'
import './styles.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck, faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import {apiEmployee} from '../../services/apiamrg'
import Skeleton from '../../components/skeleton'

const estadoInicial = {
    nome: '',
    news: [],
    loading: true,
}


class Home_inicio extends Component{
// This will implicitly create the canvas and PDF objects before saving.

    state = {
        ...estadoInicial
    }

    componentDidMount = () => {
      this.getNews()
      this.setState({loading: false})
    }
    getNews = async() => {
      await apiEmployee.post(`getNews.php`, {
        token: this.props.token
    }).then(
        async response => { 
          if (response.data != "false"){ 
            await this.setState({news: response.data})

        }else {
          alert('Erro ao pegar as Noticias')
        }
      },
        )
    }
  
    render(){

        return(
          <div style={{backgroundColor:'aliceblue'}}>
          {this.state.loading &&
            <Skeleton />
          }
            <div className='container-fluid' style={{position:'relative', paddingLeft: 0 , paddingRight: 0}}> 
                <div className='row headertodo' >
                    <div className='col-4 logoheaderinicio' >
                        <img src={require('./logo_brand.png')} className='img-fluid img_logo_inicio'/>
                    </div>
                    <div className='col-8 row submenuinicio'>
                        <span className='col-2 subtext' type='button'>News</span>
                        <span className='col-2 subtext' type='button'>Where are we?</span>
                        <span className='col-2 subtext' type='button'>Contacts</span>
                        <span className='col-2 subtext' type='button'>Links</span>
                    </div>
                </div>
                <main className='container-fluid row'>
                <div className='col-3'></div>
                <div className='col-6'>
                <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
  <div className="carousel-inner">
  {this.state.news.map((feed,index) => {
    
    if(feed.inativo == 0 && index < 3){
      return(
        <div className={index == 0 ? "carousel-item active" : "carousel-item" } key={feed.id}>
            <img src={`http://ftptrade.ddns.net/amrg/api/pictures/${feed.imagem}`} className="imgs-sliders"/>
             <h5 style={{textAlign:'center', paddingTop:30}}>{feed.titulo}</h5>
              </div>)

    }
    
    })




}
  </div>
</div>
</div>
<div className='col-3'></div>
            <div className='col-3'></div>
            <div className='col-6 container_subnoticias'>
            <OwlCarousel className='owl-theme'  autoplayTimeout={5000} autoplay={true} loop={true} margin={10} nav items={3} dots={false}>
            {this.state.news.map((feed,index) => {
    
    if(feed.inativo == 0 && index >= 3){
      return(
        <div className='item' key={feed.id}>
          <img src={`http://ftptrade.ddns.net/amrg/api/pictures/${feed.imagem}`} alt='500x500' style={{width:'100%'}}/>
                              </div>)
    }
    })
}
</OwlCarousel>

            </div>
            <div className='col-3'></div>
            <div className='col-12 we_fundo row'>
                <div className='col-2'></div>
                <div className='col-8 containerwe'>
                <span className='we_titulo'>Who are We</span>

<span className='we_texto'> The CARGONAVE Group (Agência Marítima CARGONAVE Ltda. and AMRG - Agência Marítima Rio Grande Ltda.) is an independent shipping group with uninterrupted activities since 1987. During these years it has formed a very attractive commercial relationship with the Shipping World. It is proud of having built solid expertise and reliability in the Brazilian export and import market. CARGONAVE Group offers a personalized service for each client and the best turnaround for its ships port operations, defending the individual client’s interests fairly, with reliable and recognized work.{'\n'}{'\n'}
<p></p>The Group attends more than 800 vessels per year and with its extensive knowledge of port regulations, legislation, contractual and commercial practices enables CARGONAVE Group can provide a complete and wide number of services for its clients vessels, crews and cargoes. The operations and turnaround are planned beforehand to ensure that the vessel spends the shortest possible time in port, thereby reducing lay time costs without sacrificing efficiency. The Group provides the best and most efficient preparation of documents, quickly, which require no amendments or corrections allowing its clients to pass on property of goods quicker, collect payment faster and avoid possible legal matters. The provision of accurate and precise relevant information for our clients is an important differential that reduces costs and increases efficiency for its operations creating an added value to CARGONAVE Group's services. Apart from the export market, the CARGONAVE Group started its activities in the importation of fertilizers in 2008 in the ports where it has its own offices, as well as at other ports using reliable sub-agents. CARGONAVE Group, today, attends the fertilizer market giving receivers, producers, traders, brokers, owners, charterers, etc... all the necessary support, as a reliable and recognized agency, for their vessels calling at Brazilian ports.{'\n'}{'\n'}
<p></p>The CARGONAVE Group has its own offices to attend vessels in Rio Grande, São Francisco do Sul, Paranaguá, Porto Alegre, Santos, Sao Luis (Itaqui) and Pará (Barcarena) & (Santarém).</span>
                </div>
<div className='col-2'></div>
            </div>
            <div className='col-12 row'>
              <div className='col-2'></div>
              <div className='col-8 containerctt'>
                    <span style={{fontSize:32, fontWeight:'bold'}}>Contato</span>
                    <div className='containerimgctt'>
                      <img src={require('./logoamrg.png')} className='img-fluid logoamrg'></img>
                      <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
                        <span style={{color:'#f7980a', fontSize:24, fontWeight:'bold'}}>AMRG</span>
                        <span style={{fontSize:20, fontWeight:'bold'}}>Agência Marítima Rio Grande Ltda</span>
                      </div>
                    </div>
              <div className='containercontatos'>
                <div className='lugaresctt'>
                  <span style={{color:'#f7980a', fontSize:16, fontWeight:'bold', textAlign:'center'}}>Rio Grande (RS)</span>
                  <span>Rua General Bacelar, 493</span>
                  <span>Zip Code: 96.200-370</span>
                  <span>Phone: +55(53)3235-3332</span>
                  <span>Fax: +55(53)3235-3332</span>
                  <span>Email: amrg@amrg.com.br</span>
                </div>
                <div className='lugaresctt'>
                  <span style={{color:'#f7980a', fontSize:16, fontWeight:'bold', textAlign:'center'}}>Porto Alegre(RS)</span>
                  <span>Rua Sarmento Leite, 288 | Room 21</span>
                  <span>Zip Code: 90.050-170</span>
                  <span>Phone: +55(51)3276-4512</span>
                  <span>Fax: +55(51)3276-4512</span>
                  <span>Email: amrg@amrg.com.br</span>
                </div>
              </div>
              <span style={{fontSize:24, fontWeight:'bold', marginTop:30, marginBottom:20}}>Directors</span>
              <div style={{display: 'flex', flexDirection:'column'}}>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>KURT MAX ENKE</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>FABIO PINHO</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>GUILLERMO CUNNINGHAM</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>ORLANDO CASADO</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>ALBANO PINTO</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>VICTOR PINTO</span>
                <span style={{display:'flex', flexDirection:'row', marginTop:15, marginBottom:10, marginLeft:5, marginRight:5}}><FontAwesomeIcon className="lupa" icon={faCheck} style={{marginRight:5}} color='green'/>FERNANDO CORTEZ</span>
              </div>
              <span style={{fontSize:24, fontWeight:'bold', marginTop:30, marginBottom:20, paddingRight:12}}>Quality Certifiers</span>
              </div>
              <div className='col-2'></div>
            </div>

                </main>
            </div>
            </div>
        )



    }
}
export default Home_inicio