import React, {Component} from 'react'
import Skeleton from 'react-loading-skeleton'

import './styles.css'

class ComponentSkeleton extends Component {

    render(){
        return (
            <div className="skeleton-container row">
                <div className="skeleton-title col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                    <Skeleton style={{alignItems: 'center', justifyContent: 'center'}} height={1200} width={'100%'} />
                </div>
            </div>
        )
    }
    
}

export default ComponentSkeleton