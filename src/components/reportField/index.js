import React, {Component} from 'react'
import './styles.css'

class ReportField extends Component {
 
    state = {
        titulo: '',
        subtitulo: '',
    }

    render(){
        return (
            <div className="container bordaExterna">
                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center titulo">
                        <h4>{this.props.titulo ? this.props.titulo : this.state.titulo}</h4>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center subtitulo">
                        <h4>{this.props.subtitulo ? this.props.subtitulo : this.state.subtitulo}</h4>
                    </div>
                </div>
            </div>
        )
    }
}

export default ReportField