import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Modal from '@material-ui/core/Modal';
import Select from 'react-select';
import 'react-confirm-alert/src/react-confirm-alert.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen } from '@fortawesome/free-solid-svg-icons';
import { touchRippleClasses } from '@mui/material';
import loader from '../../classes/loader';

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,

    tipoCampo: 'PREENCHIDOS',
    camposPreenchidos: [],
    camposBrancos: [],


    camposExpandidos: [],

    campoForm: false,
    campoFormTitulo: '',
    campoFormValor: '',
    campoFormEventosAfetados: [],
    campoFormSubgrupos: [],
    campoFormSubgruposEscolhidos: [],

    todosEventos: [],
    todosSubgrupos: [],
    
    subgruposOptions: [],
    optionsTexto: "",
}


class ModalCamposOS extends Component {
    state = {
        ...estadoInicial,
    }

    componentDidMount = () => {
        const { campos } = this.props;

        const camposPreenchidosFormatados = [];
        const camposBrancosFormatados = [];
        const todosEventos = [];
        const todosSubgrupos = [];


        campos.forEach((campo) => {
            if (!todosEventos.find((e) => e.value === campo.eventoChave)) {
                todosEventos.push({
                    value: campo.eventoChave,
                    label: campo.eventoNome,
                    subgrupo: campo.subgrupo
                });
            }

            if (!todosSubgrupos.find((e) => e.value === campo.subgrupo)) {
                todosSubgrupos.push({
                    value: campo.subgrupo,
                    label: campo.subgrupoNome
                })
            }

            if (campo.eventoCampoValor?.trim()) {
                const index = camposPreenchidosFormatados.findIndex((c) => c.eventoCampoValor?.trim() == campo.eventoCampoValor?.trim() && c.nome == campo.nome && c.tipo == campo.tipo);

                if (index == -1) {
                    camposPreenchidosFormatados.push({
                        ...campo,
                        key: camposPreenchidosFormatados.length + 1,
                        chave: [campo.chave],
                        eventoCampoChave: [campo.eventoCampoChave],
                        eventoCampoValor: campo.eventoCampoValor?.trim(),
                        eventoChave: [campo.eventoChave],
                        eventoNome: [campo.eventoNome],
                        subgrupo: [campo.subgrupo],
                        subgrupoNome: [campo.subgrupoNome]
                    });
                } else {
                    camposPreenchidosFormatados[index].chave.push(campo.chave);
                    camposPreenchidosFormatados[index].eventoCampoChave.push(campo.eventoCampoChave);
                    camposPreenchidosFormatados[index].eventoChave.push(campo.eventoChave);
                    camposPreenchidosFormatados[index].eventoNome.push(campo.eventoNome);

                    if (!camposPreenchidosFormatados[index].subgrupo.includes(campo.subgrupo)) {
                        camposPreenchidosFormatados[index].subgrupo.push(campo.subgrupo);
                        camposPreenchidosFormatados[index].subgrupoNome.push(campo.subgrupoNome);
                    }
                }
            } else {
                const index = camposBrancosFormatados.findIndex((c) => c.nome == campo.nome && c.tipo == campo.tipo);

                if (index == -1) {
                    camposBrancosFormatados.push({
                        ...campo,
                        key: camposBrancosFormatados.length + 1,
                        chave: [campo.chave],
                        eventoCampoChave: [campo.eventoCampoChave],
                        eventoChave: [campo.eventoChave],
                        eventoNome: [campo.eventoNome],
                        subgrupo: [campo.subgrupo],
                        subgrupoNome: [campo.subgrupoNome],
                    })
                } else {
                    camposBrancosFormatados[index].chave.push(campo.chave);
                    camposBrancosFormatados[index].eventoCampoChave.push(campo.eventoCampoChave);
                    camposBrancosFormatados[index].eventoChave.push(campo.eventoChave);
                    camposBrancosFormatados[index].eventoNome.push(campo.eventoNome);

                    if (!camposBrancosFormatados[index].subgrupo.includes(campo.subgrupo)) {
                        camposBrancosFormatados[index].subgrupo.push(campo.subgrupo);
                        camposBrancosFormatados[index].subgrupoNome.push(campo.subgrupoNome);
                    }
                }
            }
        })


        this.setState({
            camposPreenchidos: camposPreenchidosFormatados,
            camposBrancos: camposBrancosFormatados,
            todosEventos,
            todosSubgrupos
        });
    }

    expandirCampo = (key) => {
        const index = this.state.camposExpandidos.findIndex((c) => c === key);

        if (index == -1) {
            this.setState({ camposExpandidos: [...this.state.camposExpandidos, key] });
        } else {
            this.setState({ camposExpandidos: this.state.camposExpandidos.filter((c) => c !== key) });
        }
    }

    setOptions = (campo, preenchido = false) => {
        const eventos = campo.eventoChave.map((evento) => ({
            subgrupo: this.state.todosEventos.find((ev) => ev.value == evento)?.subgrupo
        }));

        if (preenchido) {
            this.state.camposBrancos.filter((branco) => branco.subgrupo.find((grupo) => this.state.campoFormSubgrupos.includes(grupo))).forEach((branco) => {
                branco.eventoChave.forEach((evento) => {
                    if (!eventos.find((opt) => opt.value == evento)) {
                        eventos.push({
                            subgrupo: this.state.todosEventos.find((ev) => ev.value == evento)?.subgrupo
                        })
                    }
                })
            })
        }

        const subgruposOptions = [];

        eventos.forEach((evento) => {
            if (!subgruposOptions.find((sub) => sub.value == evento.subgrupo))
            subgruposOptions.push({
                value: evento.subgrupo,
                label: this.state.todosSubgrupos.find((sub) => sub.value == evento.subgrupo)?.label
            });
        });
        
        this.setState({
            subgruposOptions
        })

    }

    saveCampo = async () => {
        this.setState({
            campoForm: false,
        })
        
        const eventosEscolhidos = this.state.todosEventos.filter((evento) => this.state.campoFormSubgruposEscolhidos.find((sub) => sub == evento.subgrupo));

        const eventosDeletados = this.state.campoFormEventosAfetados.filter((evento) => !eventosEscolhidos.find((e) => e.value == evento)).map((evento) => ({ chave: evento, subgrupo: this.state.todosEventos.find((ev) => ev.value == evento)?.subgrupo }));
        const eventos = eventosEscolhidos.map((evento) => ({ chave: evento.value, subgrupo: evento.subgrupo }));

        await loader.getBody('saveCamposOS.php', {
            token: true,
            eventosDeletados,
            eventos,
            campoNome: this.state.campoFormTitulo,
            valor: this.state.campoFormValor
        })

        this.props.submit();
    }

    fecharModal = () => {
        this.props.closeModal();
    }

    filterSearch = (e, state) => {
        if (this.state.campoFormSubgruposEscolhidos.find((ev) => ev == e.value)) {
            return false;
        }

        if (e == "") {
            return true;
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text));
    }

    render() {

        return (

            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                open={this.props.open}
                onClose={async () => this.fecharModal()}
            >
                <div className='modalContainer' style={{width: '80%', minWidth: 300}}>
                    <div className='modalCriar'>
                        <div className='containersairlistprodmodal'>
                            <div className='botaoSairModal' onClick={async () => this.fecharModal()}>
                                <span>X</span>
                            </div>
                        </div>
                        <div className='modalContent'>
                            {!this.state.campoForm &&
                                <>
                                    {this.state.tipoCampo === 'PREENCHIDOS' &&
                                        <>
                                            <div className='tipos_campos_os'>
                                                <div className='tipo_campos_os_ativo'>Preenchidos</div>
                                                <div onClick={() => this.setState({ tipoCampo: 'EM_BRANCO' })} className='tipo_campos_os'>Em branco</div>
                                            </div>
                                            <div className='campos_os_preenchidos'>
                                                {this.state.camposPreenchidos.map((c) => (
                                                    <div className="campo_os_preenchido" key={c.key}>
                                                        <div className="campo_os_preenchido_titulos" onClick={() => this.expandirCampo(c.key)}>
                                                            <div className='campo_os_preenchido_nome'>{c.nome}</div>
                                                            <div className='campo_os_preenchido_valor'>
                                                                {c.eventoCampoValor.length > 25 ? `${c.eventoCampoValor.substring(0, 25)}...` : c.eventoCampoValor}
                                                                <div className='campo_os_preenchido_editar'>
                                                                    <FontAwesomeIcon
                                                                        icon={faPen}
                                                                        size='1x'
                                                                        onClick={async () => {
                                                                            await this.setState({
                                                                                campoForm: true,
                                                                                campoFormTitulo: c.nome,
                                                                                campoFormValor: c.eventoCampoValor,
                                                                                campoFormEventosAfetados: c.eventoChave,
                                                                                campoFormSubgrupos: c.subgrupo,
                                                                                campoFormSubgruposEscolhidos: c.subgrupo,
                                                                            });
                                                                            this.setOptions(c, true);
                                                                        }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {this.state.camposExpandidos.find((campo) => campo == c.key) &&
                                                            <div className='campo_detalhes'>
                                                                <div className='campo_valor_completo'>
                                                                    <div className='campo_valor_titulo'>Valor:</div>
                                                                    <div className='campo_valor_valor'>{c.eventoCampoValor}</div>
                                                                </div>
                                                                <div className='campo_eventos'>
                                                                    <div className='campo_eventos_titulo'>Vouchers:</div>
                                                                    {c.subgrupoNome.map((s) => (
                                                                        <div className='campo_evento_nome'>{s}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                ))}
                                                {this.state.camposPreenchidos.length === 0 &&
                                                    <div className='aviso_campos_vazios'>
                                                        -- Nenhum campo em branco encontrado --
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    }
                                    {this.state.tipoCampo === 'EM_BRANCO' &&
                                        <>
                                            <div className='tipos_campos_os'>
                                                <div onClick={() => this.setState({ tipoCampo: 'PREENCHIDOS' })} className='tipo_campos_os'>Preenchidos</div>
                                                <div className='tipo_campos_os_ativo'>Em branco</div>
                                            </div>
                                            <div className='campos_os_branco'>
                                                {this.state.camposBrancos.map((c) => (
                                                    <div className="campo_os_preenchido" key={c.key}>
                                                        <div className="campo_os_preenchido_titulos" onClick={async () => {
                                                            await this.setState({
                                                                campoForm: true,
                                                                campoFormTitulo: c.nome,
                                                                campoFormValor: c.eventoCampoValor,
                                                                campoFormSubgrupos: c.subgrupo,
                                                            });
                                                            this.setOptions(c);
                                                        }}>
                                                            <div className='campo_os_preenchido_nome'>{c.nome}</div>
                                                            <div className='campo_os_preenchido_valor'>
                                                                <FontAwesomeIcon
                                                                    icon={faPen}
                                                                    size='1x'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {this.state.camposBrancos.length === 0 &&
                                                    <div className='aviso_campos_vazios'>
                                                        -- Nenhum campo em branco encontrado --
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    }
                                </>}
                            {this.state.campoForm &&
                                <>
                                    <div className='tituloModal' style={{position: 'relative'}}>
                                        <span>{this.state.campoFormTitulo}</span>
                                    <div className='voltar_campos_os' onClick={() => {
                                        this.setState({
                                            campoForm: false,
                                            campoFormTitulo: '',
                                            campoFormValor: '',
                                            campoFormEventosAfetados: [],
                                            campoFormSubgruposEscolhidos: [],
                                            campoFormSubgrupos: [],
                                        });
                                        }}>
                                            <FontAwesomeIcon icon={faArrowLeft} size='1x'/>
                                        </div>
                                    </div>
                                    <div className='modalForm'>
                                        <Formik
                                            initialValues={{
                                                name: '',
                                            }}
                                            onSubmit={async values => {
                                                await new Promise(r => setTimeout(r, 1000))
                                                await this.saveCampo();

                                            }}
                                        >
                                            <Form className="contact-form" >


                                                <div className="row">

                                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                        <div className="row addservicos">
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Valor:</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">

                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control textareaFix" as={"textarea"} rows={4} value={this.state.campoFormValor} onChange={async e => { this.setState({ campoFormValor: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Vouchers:</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">

                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.subgruposOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 75)} onInputChange={e => { this.setState({ optionsTexto: e }) }} search={true} onChange={(e) => { this.setState({ campoFormSubgruposEscolhidos: [...this.state.campoFormSubgruposEscolhidos, e.value] }) }} />
                                                                {this.state.campoFormSubgruposEscolhidos.map((e, i) => {
                                                                    return (
                                                                        <span class="click_to_erase" style={{ color: 'white' }} onClick={() => this.setState({ campoFormSubgruposEscolhidos: this.state.campoFormSubgruposEscolhidos.filter((c) => c != e) })}>{this.state.subgruposOptions.find((ev) => ev.value == e)?.label}{i != this.state.campoFormSubgruposEscolhidos.length - 1 ? ', ' : ' '}</span>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-2"></div>
                                                    <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button type="submit" style={{ width: 300 }} >Salvar</button>
                                                    </div>
                                                    <div className="col-2"></div>
                                                </div>

                                            </Form>
                                        </Formik>

                                    </div>

                                </>
                            }

                        </div>





                    </div >

                </div >
            </Modal >

        )
    }

}

export default (ModalCamposOS)