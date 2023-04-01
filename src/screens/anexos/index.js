import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import { Redirect } from 'react-router-dom'
import util from '../../classes/util'
import { connect } from 'react-redux'
import { login } from '../../store/actions/user'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { setserver } from '../../store/actions/server'
import { apiEmployee } from '../../services/apiamrg'
import { confirmAlert } from 'react-confirm-alert'
import { faUpload, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Select from 'react-select';
import Rodape from '../../components/rodape'
import Header from '../../components/header'
import moment from 'moment';
import { NOME_EMPRESA } from '../../config'
import loader from '../../classes/loader'

const estadoInicial = {
    evento: "",
    fornecedor: "",
    vencimento: moment().add(30, "days").format("YYYY-MM-DD"),
    sent: false,
    fileOver: false,
    bloqueado: false,
    files: []
}

class FornecedoresAnexos extends Component {

    state = {
        ...estadoInicial
    }

    constructor(props) {
        super(props);
        this.hiddenFileInput = React.createRef();
    }

    componentDidMount = async () => {
        await this.setState({
            evento: this.props.match.params.evento,
            fornecedor: this.props.match.params.fornecedor
        })

        const evento = await loader.getBody("testEventoFornecedor.php", {
            chave: this.state.evento,
            fornecedor: this.state.fornecedor
        });

        this.setState({ bloqueado: !evento });

    }

    sendFiles = async () => {
        if (this.state.files[0]) {
            await apiEmployee.post(`insertAnexoFornecedor.php`, {
                token: true,
                fornecedor: this.state.fornecedor,
                evento: this.state.evento,
                vencimento: moment(this.state.vencimento).format("YYYY-MM-DD"),
                envio: moment().format("YYYY-MM-DD"),
                files: this.state.files
            }).then(
                async res => {
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        }

        this.setState({ sent: true });
    }

    fileClick = (event) => {
        this.hiddenFileInput.current.click();
    };

    onDragOver = (e) => {
        let event = e;
        event.stopPropagation();
        event.preventDefault();
    }

    onDragLeave = (e) => {
        let event = e;
        event.stopPropagation();
        event.preventDefault();

        this.setState({ fileOver: false })
    }

    onDragEnter = (e) => {
        let event = e;
        event.stopPropagation();
        event.preventDefault();

        this.setState({ fileOver: true })
    }

    onFileDrop = async (e) => {
        let event = e;
        event.stopPropagation();
        event.preventDefault();

        const baseFiles = (e.dataTransfer ? e.dataTransfer.files : e.currentTarget.files);
        const { files } = this.state;

        const key = files[0] ? files[files.length - 1].key + 1 : 0

        for (let i = 0; i < baseFiles.length; i++) {
            files.push({
                key: key + i,
                file: await util.getBase64(baseFiles[i]),
                fullName: baseFiles[i].name,
                format: baseFiles[i].type,
                ext: baseFiles[i].name.split('.')[baseFiles[i].name.split('.').length - 1]
            })
        }

        this.setState({ fileOver: false, files });
    }

    render() {
        return (
            <div className='allContent'>

                <section>

                    <Header login titulo="Enviar Anexos" />
                </section>


                {!this.state.bloqueado &&
                    <>
                        {!this.state.sent &&
                            <div>
                                <div className='centerDiv'>
                                    <div
                                        className="sendAttachment"
                                        onDragEnter={this.onDragEnter}
                                        onDragOver={this.onDragOver}
                                        onDragLeave={this.onDragLeave}
                                        onDrop={this.onFileDrop}
                                    >
                                        <h3>Arraste arquivos até aqui</h3>
                                        {!this.state.fileOver &&
                                            <div>
                                                <h4 className='text-center'>ou</h4>
                                                <h3 onClick={() => this.fileClick()} className="fileInputLabel">Selecione um arquivo de seu aparelho</h3>
                                                <input multiple={true} type="file" ref={this.hiddenFileInput} style={{ display: "none" }} onChange={(e) => this.onFileDrop(e)} />
                                            </div>
                                        }
                                        {this.state.fileOver &&
                                            <div>
                                                <FontAwesomeIcon icon={faUpload} color={"white"} style={{ fontSize: 45 }} />
                                            </div>
                                        }

                                    </div >
                                </div>
                                {this.state.files[0] &&
                                    <div>
                                        <div className='filelistDiv'>
                                            {this.state.files.map((file) => (
                                                <div className='fileList'>
                                                    <span>{file.fullName}</span>
                                                    <span onClick={() => this.setState({ files: this.state.files.filter((f) => f.key != file.key) })} className='removeFile'>
                                                        <FontAwesomeIcon icon={faTimes} color={"red"} style={{ fontSize: 20 }} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <Formik
                                            initialValues={{
                                                name: '',
                                            }}
                                            onSubmit={async values => {
                                                await new Promise(r => setTimeout(r, 1000))
                                            }}
                                        >
                                            <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                                <div className="row">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                                        <div className="row addservicos">
                                                            <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                                <label>Vencimento</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field type="date" className='SearchSelect' value={this.state.vencimento} onChange={(e) => this.setState({ vencimento: e.currentTarget.value })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                </div>
                                            </Form>
                                        </Formik>
                                        <div className='centerDiv'>
                                            <button className='sendFileButton' onClick={() => this.sendFiles()}>Enviar</button>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                        {this.state.sent &&
                            <div>
                                <div className='centerDiv'>
                                    <div
                                        className="sendAttachment"
                                    >
                                        <h3>Enviado <FontAwesomeIcon icon={faCheck} color={"white"} /></h3>

                                    </div >
                                </div>
                            </div>
                        }
                    </>
                }

                <Rodape />
            </div >
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogin: (user) => dispatch(login(user)),
        onSetServidor: servidor => dispatch(setserver(servidor))
    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FornecedoresAnexos)