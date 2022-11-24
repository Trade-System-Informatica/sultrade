import React, {Component} from 'react'
//import semImagem from '../../img/products/no_image.jpg'
//import util from '../../classes/util'
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css"

const urlFoto = 'http://rgfumigacao.com.br/api/pictures/'

const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ];

class Picture extends Component {

    state = {
        uris: [],
        images: images,
        photos: []
    }

    componentDidMount = async () => {
        await this.carregaFotos()
        await this.montaFotos()
    }

    carregaFotos = async () => {
        await this.setState({uris: this.props.fotos})
    }

    montaFotos = async () => {
        let photos = []
        await this.state.uris.map( uri => {
            photos.push(
                {
                    original: `${urlFoto}${uri}.png`,
                    thumbnail: `${urlFoto}${uri}.png`,
                },
            )
        })
        await this.setState({photos})
    }



    /*
    render(){
        return (
                    <div>
                        {this.state.pictures.map((foto, index) => (
                            <p key={index}>{foto}</p>
                        ))}
                    </div>
                       
        )
    }
    */
   render(){
       return (
           <ImageGallery items={this.state.photos} />
       )
   }
}

export default Picture

/**
 * <img
                            src={util.urlExists(this.props.picture)}
                            onError={(e)=>{e.target.onerror = null; e.target.src=semImagem}}
                        />
 */