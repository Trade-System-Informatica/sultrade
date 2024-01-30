import React, { Component } from "react";
import "./styles.css";
import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import Modal from "@material-ui/core/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPen,
  faPlus,
  faDollarSign,
  faHome,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import "react-confirm-alert/src/react-confirm-alert.css";

const estadoInicial = {
  pesquisa: "",
  tipoPesquisa: 1,
  load: 100,
  anexoModal: "",
  anexoNomeModal: "",
};

class ModalInsertAnexo extends Component {
  state = {
    ...estadoInicial,
  };

  handleSubmit = async () => {
    if (this.state.anexoModal !== '' && this.state.anexoNomeModal !== ''){
      this.props.salvaAnexoTarifa(this.state.anexoModal, this.state.anexoNomeModal);
    }
  }

  componentDidMount = async () => {};

  fecharModal = () => {
    this.props.closeModal();
  };

  deleteItem = async () => {
    this.props.closeModal();
  };

  render() {
    return (
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        style={{ display: "flex", overflow: "scroll" }}
        open={this.props.modalAberto}
        onClose={async () => await this.setState({ ModalInsertAnexo: false })}
      >
        <div className="modalItemContainer darkBack">
          <div className="modalCriar">
            <div className="containersairlistprodmodal">
              <div
                className="botaoSairModal"
                onClick={async () => {
                  await this.fecharModal();
                }}
              >
                <span>X</span>
              </div>
            </div>
            <div className="modalContent darkBack">
              <div className="tituloModal">
                <span>Insira um novo anexo</span>
              </div>
            </div>
            <div className="col-lg-12" style={{ display: "flex", justifyContent: "center" }}>
              <Formik
                initialValues={{
                  valueAnexo: this.state.anexo,
                  valueAnexoNome: this.state.anexoNome,
                }}
                onSubmit={async (values) => {
                  await new Promise((r) => setTimeout(r, 1000));
                  this.handleSubmit();
                }}
              >
                <Form
                  className="contact-form alignCenter"
                  onBlur={() => {
                    /*this.verificadorspans()*/
                  }}
                ><div className="row">
                  <div
                    className={
                      "col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 labelForm firstLabel"
                    }
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <label style={{ display: "flex", justifyContent: "center", textAlign: "center", alignItems: "center", fontSize: 20 }}>Anexo</label>
                  </div>
                  </div>
                  <div className="row">
                  <div className="col-1 errorMessage"></div>
                  <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10 col-10 " style={{ display: "flex", justifyContent: "center" }} >
                    <Field
                      className="form-control"
                      type="file"
                      value={this.state.anexoNomeModal}
                      onChange={async (e) => {
                        this.setState({
                          anexoModal: e.currentTarget.files,
                          anexoNomeModal: e.currentTarget.value,
                        });
                      }}
                    />
                  </div>
                  </div>
                  <div className="row">
                    <div className="col-2"></div>
                    <div
                      className="col-8"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <button
                        type="submit"
                        disabled={this.state.anexoModal == '' ? true : false}
                        style={this.state.anexoModal == '' ? {
                          width: 300,
                          backgroundColor: 'gray',
                          color: 'gray'
                        } : {
                          width: 300,
                          backgroundColor: 'white'
                        }}
                      >
                        Enviar
                      </button>
                    </div>
                    <div className="col-2"></div>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ModalInsertAnexo;
