import React, {Component} from 'react'
//import Skeleton from 'react-loading-skeleton'
import {Spinner} from 'react-activity'
import 'react-activity/dist/react-activity.css'

import './styles.css'

class SkeletonPesquisa extends Component {

    render(){
        return (
            <div className="row" style={{marginBottom: 1000}}>
                <div className="col-12 text-center">
                    <h1 style={{textAlign: 'auto', marginBottom: 50}}>Carregando...</h1>
                    <Spinner speed={0.8}  size={200} />
                </div>      
            </div>
            
        )
    }
}

export default SkeletonPesquisa

/**
<Skeleton count={2} style={{alignItems: 'center', justifyContent: 'center'}} height={20} duration={0.7}/>   
 */