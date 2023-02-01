import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import 'react-confirm-alert/src/react-confirm-alert.css'

import './styles.css'

class ScreenSaver extends Component {
    state = {
        timer: "",
        ativo: false,
        imgAtiva: false,
        imgPosX: (window.innerWidth / 2) - 75,
        imgPosY: (window.innerHeight / 2) - 75,
        imgSpeedX: Math.floor(Math.random() * 2) % 2 == 0 ? 2 : -2,
        imgSpeedY: Math.floor(Math.random() * 2) % 2 == 0 ? 2 : -2,


        imgTimer: ""
    }

    componentDidMount = () => {
        this.setState({ timer: setTimeout(() => this.setState({ ativo: true }), 300000) });
    }

    componentDidUpdate = (prevprops, prevstates) => {
        if (prevstates.ativo != this.state.ativo && this.state.ativo == true) {
            setTimeout(() => this.setState({ imgAtiva: true }), 1000);
        }

        if (this.state.imgAtiva && this.state.imgAtiva != prevstates.imgAtiva) {
            this.moveImage()
        }

        if (!this.state.imgAtiva && this.state.imgAtiva != prevstates.imgAtiva || !this.state.ativo && this.state.imgAtiva) {
            clearTimeout(this.state.imgTimer);
            this.setState({ imgAtiva: false, imgPosX: (window.innerWidth / 2) - 75, imgPosY: (window.innerHeight / 2) - 75 })
        }
    }

    moveImage = async () => {
        if (this.state.imgAtiva) {
            if (this.state.imgPosX+150 >= window.innerWidth || this.state.imgPosX <= 0) {
                this.setState({imgSpeedX: this.state.imgSpeedX*-1});
            }
            if (this.state.imgPosY+150 >= window.innerHeight || this.state.imgPosY <= 0 ) {
                this.setState({imgSpeedY: this.state.imgSpeedY*-1})
            }
            this.setState({ imgTimer: setTimeout(() => { this.setState({ imgPosX: this.state.imgPosX + this.state.imgSpeedX, imgPosY: this.state.imgPosY + this.state.imgSpeedY }); this.moveImage() }, 10) });
        }
    }

    resetTimer = () => {
        clearTimeout(this.state.timer);
        this.setState({ imgAtiva: false, ativo: false, timer: setTimeout(() => this.setState({ ativo: true }), 300000) });
    }

    render() {
        return (
            <>
                <div
                    className={`screenSaver ${!this.state.ativo ? "" : "screenSaverActive"}`}
                    onClick={() => { this.resetTimer() }}
                    onMouseMove={() => { this.resetTimer() }}
                >
                    <img src="https://i.ibb.co/nmMZy7J/screensaver.png" style={this.state.imgAtiva ? { width: 150, height: 150, position: "absolute", left: this.state.imgPosX, top: this.state.imgPosY } : { display: "none" }} />
                </div>
            </>
        )
    }
}

export default (ScreenSaver)