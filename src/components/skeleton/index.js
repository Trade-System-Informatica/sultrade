import React, {Component} from 'react'
import './styles.css'

class ComponentSkeleton extends Component {

    render(){
        const { 
            size = 'normal', // 'small', 'normal', 'large'
            variant = 'overlay', // 'overlay', 'inline'
            color = 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
            text = 'Carregando...'
        } = this.props;

        const className = `loading-overlay ${variant} ${size} ${color}`;

        return (
            <div className={className}>
                <div className="loading-container">
                    <div className="circular-progress">
                        <div className="spinner"></div>
                    </div>
                    <div className="loading-text">
                        {text}
                    </div>
                </div>
            </div>
        )
    }
    
}

export default ComponentSkeleton