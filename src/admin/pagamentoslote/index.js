import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../services/apiamrg'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import Skeleton from '../../components/skeleton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    API_BANCO,
    API_BANCO_GPS,
    API_BANCO_GPS_GET,
    API_BANCO_GRU,
    API_BANCO_GRU_GET,
    API_BANCO_DARF,
    API_BANCO_DARF_GET,
    API_BANCO_TRANS,
    API_BANCO_TRANS_GET,
    API_BANCO_BOL,
    API_BANCO_BOL_GET,
    API_LIBERAR
} from '../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import Select from 'react-select';
import loader from '../../classes/loader'

const estadoInicial = {
    name: '',
    contas: [],
    bancos: [],
    transacoes: [],
    dadosPagamento: [],
    tokenBB: '',


    vencimentoInicial: '',
    vencimentoFinal: '',
    lancamentoInicial: '',
    lancamentoFinal: '',
    total: '',
    pessoa: '',
    banco: '',
    status: '-',
    codigoTransacao: '',

    lote: '',
    transacao: '',
    transacaoInicial: '',

    bancosOptions: [],
    bancosOptionsTexto: '',
    statuses: [
        { label: '-----', value: '-' },
        { label: 'Aguardando Envio', value: '1' },
        { label: 'Aguardando Liberacao', value: '2' },
        { label: 'Aguardando Retorno', value: '3' },
        { label: 'Pago', value: '4' }
    ],

    meiosPagamentos: [],

    pesquisa: "",

    mostraFiltros: true,

    loading: true,
    requisicoesCarregando: [],
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100,

    requisicoesBloqueado: false,
    liberacoesBloqueado: false,

    errors: [],
}

class PagamentosLote extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        this.setState({requisicoesCarregando: []})
        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "REQUISICOES_PAGAMENTOS" && e.permissaoInsere == 0) {
                this.setState({ requisicoesBloqueado: true })
            }
            if (e.acessoAcao == "LIBERACOES_PAGAMENTOS" && e.permissaoInsere == 0) {
                this.setState({ liberacoesBloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            transacao: await loader.getUltimaTransacao(),
            transacaoInicial: await loader.getUltimaTransacao(),
            lote: await loader.getLote(),
            pessoas: await loader.getBase('getPessoas.php'),
            pessoasOptions: await loader.getBaseOptions('getPessoas.php', 'Nome', 'Chave'),
            meiosPagamentos: await loader.getBase('getMeiosPagamentos.php'),
            bancos: await loader.getBase('getBancos.php'),
            bancosOptions: await loader.getBaseOptions('getBancos.php', 'Titular', 'Chave'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            bbCodigos: await loader.getBase('getCodigosBB.php'),

            vencimentoInicial: moment().format('YYYY-MM-DD'),
            vencimentoFinal: moment().format('YYYY-MM-DD'),

            lancamentoInicial: moment('1900-01-01').format('YYYY-MM-DD'),
            lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD')

        });

        const bancosOptions = this.state.bancosOptions;
        bancosOptions.unshift({ value: "", label: "TODOS" });

        await this.setState({ bancosOptions })

        await this.getTransacoesPagas();

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            bbGet: this.state.bbCodigos.filter((e) => e.tipo == 'get'),
            bbErr: this.state.bbCodigos.filter((e) => e.tipo == 'erro'),
            bbTrc: this.state.bbCodigos.filter((e) => e.tipo == 'trc'),
            loading: false
        })

        await this.getContasAbertas();
    }

    getTransacoesPagas = async () => {
        const transacoes = await loader.getBase(`getTransacoesPagas.php`, this.state.usuarioLogado.empresa);

        if (transacoes.find((e) => e.meio_pagamento)) {
            await this.setState({ transacoes: transacoes.filter((e) => e.meio_pagamento) });
        } else {
            await this.setState({ transacoes: [] });
        }
    }

    getContasAbertas = async () => {
        await apiEmployee.post(`getContasAbertas.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async res => {
                const contasFiltradas = res.data.filter((e) => e.meio_pagamento != "0" && e.meioPagamento && e.Tipo == 1);
                const contas = [];

                for (let i = 0; i < contasFiltradas.length; i++) {
                    let e = contasFiltradas[i]

                    contas.push({
                        ...e,
                        check: false,
                        pos: i,
                        error: this.state.errors.filter((el) => el.conta == e.Chave).map((el) => (el.mensagem)),
                        status: e.status,
                        statusId: e.statusId,
                        transacao: e.transacao,
                        liberado: e.liberado,
                        operador: e.operador_envio,
                        existe: e.transacao ? true : false
                    })

                }

                await this.setState({ contas });
            },
            err => { this.erroApi(err) }

        )
    }

    checkConta = async (index) => {
        let conta = this.state.contas;

        if (index == 'all') {
            let contaFiltrada = conta.filter(this.filtrarPesquisa).filter((cont) => (this.state.status != 2 || cont.operador != this.state.usuarioLogado.codigo)).splice(0, this.state.load);

            conta = conta.map((e) => {
                if (contaFiltrada.find((el) => e.Chave == el.Chave)) {
                    return ({ ...e, check: true });
                } else {
                    return ({ ...e, check: false });
                }
            })
            return this.setState({ contas: conta });
        }

        conta = conta.map((e) => {
            if (e.Chave == index) {
                return ({ ...e, check: !e.check })
            } else {
                return ({ ...e, check: e.check })
            }
        })

        this.setState({ contas: conta });
    }

    enviarLote = async () => {
        await this.setState({ loading: true });
        const contas = this.state.contas.filter((e) => this.filtrarPesquisa && e.check).splice(0, this.state.load);

        for (let i = 0; i < contas.length; i++) {
            let e = contas[i];
            let codigo = await loader.getCodigo('TR')

            await this.setState({ codigoTransacao: codigo, });

            e.transacao = this.state.transacao;
            await this.setState({ transacao: parseInt(this.state.transacao) + 1 })

            if (e.meioPagamento == 'TRC') {
                let transacaoCodigo = await loader.getTransacoesTipo('TRC');

                transacaoCodigo = transacaoCodigo.filter((e) => moment(e.Data).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))[0] ? parseInt(transacaoCodigo.filter((e) => moment(e.Data).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))[0].id_transacao) + 1 : 0;
                await this.setState({ codigoTransacao: transacaoCodigo })
                await apiEmployee.post(`enviaTRC.php`, {
                    token: true,
                    url: `${API_BANCO}${API_BANCO_TRANS}`,
                    pessoa: e.Pessoa,
                    conta: e,
                    codigo,
                    empresa: this.state.usuarioLogado.empresa,
                    operador: this.state.usuarioLogado.codigo,
                    lote: this.state.lote
                }).then(
                    async res => {
                        const requisicoes = this.state.requisicoesCarregando;
                        const id = this.state.bbTrc.find((e) => e.codigo == res.data.estadoPagamento).status;

                        requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - ${id == 3 ? "Aceita" : id == 0 ? "Rejeitada" : "Paga"}`);

                        await this.setState({ requisicoesCarregando: requisicoes })

                    }
                )
            } else if (e.meioPagamento == 'PIX') {


            } else if (e.meioPagamento == "BOL") {
                await apiEmployee.post(`enviaBOL.php`, {
                    token: true,
                    url: `${API_BANCO}${API_BANCO_BOL}`,
                    pessoa: e.Pessoa,
                    conta: e,
                    codigo,
                    empresa: this.state.usuarioLogado.empresa,
                    operador: this.state.usuarioLogado.codigo,
                    lote: this.state.lote
                }).then(
                    async res => {
                        //console.log(res);
                        //console.log(res.data);
                        
                        const requisicoes = this.state.requisicoesCarregando;
                        const id = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                        requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - ${id == 3 ? "Aceita" : id == 0 ? "Rejeitada" : "Paga"}`);
                        await this.setState({ requisicoesCarregando: requisicoes })

                    }
                )

            } else if (e.meioPagamento == "GRU") {
                const dadosComplementares = await apiEmployee.post('getContasComplementar.php', {
                    token: true,
                    chave: e.Chave
                }).then(
                    async res => {
                        return res.data[0];
                    },
                    async err => console.log(`erro: ` + err)
                )

                await apiEmployee.post(`enviaGRU.php`, {
                    token: true,
                    url: `${API_BANCO}${API_BANCO_GRU}`,
                    pessoa: e.Pessoa,
                    conta: e,
                    codigo,
                    empresa: this.state.usuarioLogado.empresa,
                    operador: this.state.usuarioLogado.codigo,
                    lote: this.state.lote,
                    dadosComplementares
                }).then(
                    async res => {
                        const requisicoes = this.state.requisicoesCarregando;
                        const id = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                        requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - ${id == 3 ? "Aceita" : id == 0 ? "Rejeitada" : "Paga"}`);

                        await this.setState({ requisicoesCarregando: requisicoes })

                    }
                )

            } else if (e.meioPagamento == "DARF") {
                const dadosComplementares = await apiEmployee.post('getContasComplementar.php', {
                    token: true,
                    chave: e.Chave
                }).then(
                    async res => {
                        return res.data[0];
                    },
                    async err => console.log(`erro: ` + err)
                )

                await apiEmployee.post(`enviaDARF.php`, {
                    token: true,
                    url: `${API_BANCO}${API_BANCO_DARF}`,
                    pessoa: e.Pessoa,
                    conta: e,
                    codigo,
                    empresa: this.state.usuarioLogado.empresa,
                    operador: this.state.usuarioLogado.codigo,
                    lote: this.state.lote,
                    dadosComplementares
                }).then(
                    async res => {
                        const requisicoes = this.state.requisicoesCarregando;
                        const id = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                        requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - ${id == 3 ? "Aceita" : id == 0 ? "Rejeitada" : "Paga"}`);

                        await this.setState({ requisicoesCarregando: requisicoes })

                    }
                )

            } else if (e.meioPagamento == "GPS") {
                const dadosComplementares = await apiEmployee.post('getContasComplementar.php', {
                    token: true,
                    chave: e.Chave
                }).then(
                    async res => {
                        return res.data[0];
                    },
                    async err => console.log(`erro: ` + err)
                )

                await apiEmployee.post(`enviaGPS.php`, {
                    token: true,
                    url: `${API_BANCO}${API_BANCO_GPS}`,
                    pessoa: e.Pessoa,
                    conta: e,
                    codigo,
                    empresa: this.state.usuarioLogado.empresa,
                    operador: this.state.usuarioLogado.codigo,
                    lote: this.state.lote,
                    dadosComplementares
                }).then(
                    async res => {
                        const requisicoes = this.state.requisicoesCarregando;
                        const id = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                        requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - ${id == 3 ? "Aceita" : id == 0 ? "Rejeitada" : "Paga"}`);
                        await this.setState({ requisicoesCarregando: requisicoes })

                    }
                )
            }
        }

        await this.getContasAbertas();
        await this.setState({ loading: false, lote: parseInt(this.state.lote) + 1, requisicoesCarregando: [] });
    }

    liberarPagamentos = async () => {
        const contas = this.state.contas.filter((e) => this.filtrarPesquisa && e.check).splice(0, this.state.load);
        await this.setState({ loading: true });

        for (let i = 0; i < contas.length; i++) {
            const e = contas[i];
            const chave_transacao = await loader.getBody(`getUltimaTransacaoConta.php`, { chave: e.Chave });

            await apiEmployee.post(`liberarPagamento.php`, {
                url: `${API_BANCO}${API_LIBERAR}`,
                indicadorFloat: "S",
                numeroRequisicao: e.transacao,
                chave_conta: chave_transacao[0].chave,
                operador: this.state.usuarioLogado.codigo,
                empresa: this.state.usuarioLogado.empresa
            }).then(
                async res => {
                    const requisicoes = this.state.requisicoesCarregando;

                    requisicoes.push(`Conta ${e.Historico} (chave ${e.Chave}) - Liberada`);
                    await this.setState({ requisicoesCarregando: requisicoes })

                    await loader.salvaLogs("transacoes", this.state.usuarioLogado.codigo, null, `transacao liberado por ${this.state.usuarioLogado.nome}`, e.chave);
                },
                async err => {
                }
            )
        }

        await this.getContasAbertas();
        await this.setState({ loading: false, requisicoesCarregando: [] })
    }


    consultarLote = async () => {
        await this.setState({ loading: true });
        const contas = this.state.contas.filter((e) => this.filtrarPesquisa && e.check).splice(0, this.state.load);
        const dados = [];

        for (let i = 0; i < contas.length; i++) {
            let e = contas[i];

            if (e.meioPagamento == 'TRC') {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.Vencimento,
                                historico: e.Historico,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                statusId: e.statusId,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }
                )
            } else if (e.meioPagamento == 'PIX') {

            } else if (e.meioPagamento == "BOL") {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.data_hora_envio,
                                historico: e.Historico,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                statusId: e.statusId,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }

                )

            } else if (e.meioPagamento == "GRU") {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.data_hora_envio,
                                historico: e.Historico,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                statusId: e.statusId,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }

                )

            } else if (e.meioPagamento == "DARF") {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.data_hora_envio,
                                historico: e.Historico,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                statusId: e.statusId,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }

                )

            } else if (e.meioPagamento == "GPS") {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.data_hora_envio,
                                historico: e.Historico,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                statusId: e.statusId,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }

                )
            }
        }
        await this.setState({ dadosPagamento: dados })

        this.consultaApi(this.state.dadosPagamento);
    }

    consultaApi = async (dados) => {
        const status = [];

        for (let i = 0; i < dados.length; i++) {
            let e = dados[i];

            if (!e.dadosBase.error) {
                if (e.dadosBase.meio == 'TRC') {
                    await apiEmployee.post(`consultaTRC.php`, {
                        token: true,
                        url: `${API_BANCO}${API_BANCO_TRANS_GET}${e.dadosBase.cpf}/transferencias`,
                        url2: `&dataInicio=${moment(e.dadosBase.data).format('DDMMYYYY')}&dataFim=${moment(e.dadosBase.data).format('DDMMYYYY')}&indice=0&tipoBeneficiario=${e.dadosBase.cpf?.length == 11 ? 1 : 2}`,
                        empresa: this.state.usuarioLogado.empresa,
                        id: e.id
                    }).then(
                        async res => {
                            //console.log(res)
                            //console.log(res.data)

                            if (res.data && !res.data.erros) {
                                let trans = {};

                                if (res.data.transferencias && res.data.transferencias[0]) {
                                    trans = res.data.transferencias.find((trans) => trans.valorTransferencia == e.dadosBase.valor && parseFloat(trans.cpfCnpjBeneficiario) == parseFloat(e.dadosBase.cpf));
                                }

                                if (trans && trans.estadoPagamento) {
                                    let statusId = 0;
                                    if (["AGENDADO", "AGUARDANDO SALDO", "CONSISTENTE", "PENDENTE"].includes(trans.estadoPagamento)) {
                                        statusId = e.dadosBase.statusId == 2 ? 2 : 3;
                                    } else if (["DEBITADO", "PAGO"].includes(trans.estadoPagamento)) {
                                        statusId = 4;
                                    } else if (["BLOQUEADO", "CANCELADO", "INCONSISTENTE", "REJEITADO", "VENCIDO"]) {
                                        statusId = 1;
                                    }
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: `${trans.estadoPagamento} ${statusId == 1 ? " - Tente novamente" : ""}`,
                                        statusId,
                                        errors: ''
                                    })
                                    const requisicoes = this.state.requisicoesCarregando;

                                    requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - ${statusId == 3 ? "Aceita" : statusId == 0 ? "Rejeitada" : "Paga"}`);

                                    await this.setState({ requisicoesCarregando: requisicoes })
                                } else {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: "Não encontrado.",
                                        statusId: 0,
                                        errors: ''
                                    })
                                    const requisicoes = this.state.requisicoesCarregando;

                                    requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);

                                    await this.setState({ requisicoesCarregando: requisicoes })
                                }
                            } else {
                                try {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                    transacao_chave: e.dadosBase.transacao_chave,
                                    transacao: e.dadosBase.transacao,
                                    existe: e.dadosBase.existe,
                                    valor: e.dadosBase.valor,
                                    saldo: e.dadosBase.saldo,
                                    status: this.state.bbErr.find((e) => e.codigo == res.data.lancamentos[0].erros[0]).mensagem,
                                    statusId: 0,
                                    errors: ''
                                })
                            } catch(err) {
                                status.push({
                                    conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: "Erro Desconhecido",
                                statusId: 0,
                                errors: ''
                            }) 
                            }

                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                                await this.setState({ requisicoesCarregando: requisicoes })
                            }
                        },
                        async err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: false,
                                statusId: 0,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'
                            })
                            const requisicoes = this.state.requisicoesCarregando;

                            requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                            await this.setState({ requisicoesCarregando: requisicoes })
                        }
                    )
                } else if (e.dadosBase.meio == 'PIX') {

                } else if (e.dadosBase.meio == 'BOL') {
                    await apiEmployee.post(`consultaBOL.php`, {
                        token: true,
                        url: `${API_BANCO}${API_BANCO_BOL_GET}${e.id}/solicitacao`,
                        empresa: this.state.usuarioLogado.empresa
                    }).then(
                        async res => {
                            //console.log(res)
                            //console.log(res.data)

                            if (res.data && !res.data.lancamentos[0].erros[0]) {
                                const newStatusId = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;
                                //console.log(newStatusId)
                                //console.log(e.dadosBase.statusId)

                                status.push({
                                    conta: e.dadosBase.chave,
                                    transacao_chave: e.dadosBase.transacao_chave,
                                    transacao: e.dadosBase.transacao,
                                    existe: e.dadosBase.existe,
                                    valor: e.dadosBase.valor,
                                    saldo: e.dadosBase.saldo,
                                    status: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).mensagem,
                                    statusId: newStatusId == 3 && e.dadosBase.statusId == 2 ? 2 : newStatusId,
                                    errors: ''
                                })
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - ${newStatusId == 3 ? "Aceita" : newStatusId == 0 ? "Rejeitada" : "Paga"}`);
                                await this.setState({ requisicoesCarregando: requisicoes })


                            } else {
                                try {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: this.state.bbErr.find((e) => e.codigo == res.data.lancamentos[0].erros[0]).mensagem,
                                        statusId: 0,
                                        errors: ''
                                    })
                                } catch (err) {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: "Erro Desconhecido",
                                        statusId: 0,
                                        errors: ''
                                    })
                                }
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                                await this.setState({ requisicoesCarregando: requisicoes })
                            }
                        },
                        async err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: false,
                                statusId: 0,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'
                            })
                            const requisicoes = this.state.requisicoesCarregando;

                            requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                            await this.setState({ requisicoesCarregando: requisicoes })
                        }
                    )
                } else if (e.dadosBase.meio == 'GRU') {
                    await apiEmployee.post(`consultaGRU.php`, {
                        token: true,
                        url: `${API_BANCO}${API_BANCO_GRU_GET}${e.id}/solicitacao`,
                        empresa: this.state.usuarioLogado.empresa
                    }).then(
                        async res => {
                            //console.log(res)
                            //console.log(res.data)

                            if (res.data && !res.data.lancamentos[0].erros[0]) {
                                const newStatusId = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                                status.push({
                                    conta: e.dadosBase.chave,
                                    transacao_chave: e.dadosBase.transacao_chave,
                                    transacao: e.dadosBase.transacao,
                                    existe: e.dadosBase.existe,
                                    valor: e.dadosBase.valor,
                                    saldo: e.dadosBase.saldo,
                                    status: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).mensagem,
                                    statusId: newStatusId == 3 && e.dadosBase.statusId == 2 ? 2 : newStatusId,
                                    errors: ''
                                })
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - ${newStatusId == 3 ? "Aceita" : newStatusId == 0 ? "Rejeitada" : "Paga"}`);
                                await this.setState({ requisicoesCarregando: requisicoes })

                            } else {
                                try {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: this.state.bbErr.find((e) => e.codigo == res.data.lancamentos[0].erros[0]).mensagem,
                                        statusId: 0,
                                        errors: ''
                                    })
                                } catch (err) {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: "Erro Desconhecido",
                                        statusId: 0,
                                        errors: ''
                                    })
                                }
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                                await this.setState({ requisicoesCarregando: requisicoes })
                            }
                        },
                        async err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: false,
                                statusId: 0,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'
                            })
                            const requisicoes = this.state.requisicoesCarregando;

                            requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                            await this.setState({ requisicoesCarregando: requisicoes })
                        }
                    )
                } else if (e.dadosBase.meio == 'DARF') {
                    await apiEmployee.post(`consultaDARF.php`, {
                        token: true,
                        url: `${API_BANCO}${API_BANCO_DARF_GET}${e.id}/solicitacao`,
                        empresa: this.state.usuarioLogado.empresa
                    }).then(
                        async res => {
                            //console.log(res)
                            //console.log(res.data)

                            if (res.data && !res.data.lancamentos[0].erros[0]) {
                                const newStatusId = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                                status.push({
                                    conta: e.dadosBase.chave,
                                    transacao_chave: e.dadosBase.transacao_chave,
                                    transacao: e.dadosBase.transacao,
                                    existe: e.dadosBase.existe,
                                    valor: e.dadosBase.valor,
                                    saldo: e.dadosBase.saldo,
                                    status: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).mensagem,
                                    statusId: newStatusId == 3 && e.dadosBase.statusId == 2 ? 2 : newStatusId,
                                    errors: ''
                                })
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - ${newStatusId == 3 ? "Aceita" : newStatusId == 0 ? "Rejeitada" : "Paga"}`);
                                await this.setState({ requisicoesCarregando: requisicoes })

                            } else {
                                try {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: this.state.bbErr.find((e) => e.codigo == res.data.lancamentos[0].erros[0]).mensagem,
                                        statusId: 0,
                                        errors: ''
                                    })
                                } catch (err) {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: "Erro Desconhecido",
                                        statusId: 0,
                                        errors: ''
                                    })
                                }
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                                await this.setState({ requisicoesCarregando: requisicoes })
                            }
                        },
                        async err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                statusId: 0,
                                status: false,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'
                            })
                            const requisicoes = this.state.requisicoesCarregando;

                            requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                            await this.setState({ requisicoesCarregando: requisicoes })
                        }
                    )
                } else if (e.dadosBase.meio == 'GPS') {
                    await apiEmployee.post(`consultaGPS.php`, {
                        token: true,
                        url: `${API_BANCO}${API_BANCO_GPS_GET}${e.id}/solicitacao`,
                        empresa: this.state.usuarioLogado.empresa
                    }).then(
                        async res => {
                            //console.log(res)
                            //console.log(res.data)

                            if (res.data && !res.data.lancamentos[0].erros[0]) {
                                const newStatusId = this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status;

                                status.push({
                                    conta: e.dadosBase.chave,
                                    transacao_chave: e.dadosBase.transacao_chave,
                                    transacao: e.dadosBase.transacao,
                                    existe: e.dadosBase.existe,
                                    valor: e.dadosBase.valor,
                                    saldo: e.dadosBase.saldo,
                                    status: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).mensagem,
                                    statusId: newStatusId == 3 && e.dadosBase.statusId == 2 ? 2 : newStatusId,
                                    errors: ''
                                })
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - ${newStatusId == 3 ? "Aceita" : newStatusId == 0 ? "Rejeitada" : "Paga"}`);
                                await this.setState({ requisicoesCarregando: requisicoes })

                            } else {
                                try {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: this.state.bbErr.find((e) => e.codigo == res.data.lancamentos[0].erros[0]).mensagem,
                                        statusId: 0,
                                        errors: ''
                                    })
                                } catch (err) {
                                    status.push({
                                        conta: e.dadosBase.chave,
                                        transacao_chave: e.dadosBase.transacao_chave,
                                        transacao: e.dadosBase.transacao,
                                        existe: e.dadosBase.existe,
                                        valor: e.dadosBase.valor,
                                        saldo: e.dadosBase.saldo,
                                        status: "Erro Desconhecido",
                                        statusId: 0,
                                        errors: ''
                                    })
                                }
                                const requisicoes = this.state.requisicoesCarregando;

                                requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                                await this.setState({ requisicoesCarregando: requisicoes })

                            }
                        },
                        async err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: false,
                                statusId: 0,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'

                            })
                            const requisicoes = this.state.requisicoesCarregando;

                            requisicoes.push(`Conta ${e.dadosBase.historico} (chave ${e.dadosBase.chave}) - Rejeitada`);
                            await this.setState({ requisicoesCarregando: requisicoes })
                        }
                    )
                }
            } else {
                status.push({
                    conta: e.dadosBase.chave,
                    valor: e.dadosBase.valor,
                    saldo: e.dadosBase.saldo,
                    transacao: e.transacao,
                    status: false,
                    statusId: 0,
                    error: e.dadosBase.error
                })
            }
        }

        const errors = [];

        status.map(async (e) => {
            if (!e.status) {
                errors.push({ conta: e.conta, mensagem: e.error ? e.error : "Erro desconhecido, tente novamente" });
            }
            await apiEmployee.post(`pagarConta.php`, {
                token: true,
                chave: e.conta,
                status: e.status === false ? e.error : `${e.status} ${e.errors[0] ? e.errors.join(' ') : ''}`,
                transacao: e.transacao,
                valor: e.statusId != 4 ? 0 : e.valor,
                data_pagto: moment().format('YYYY-MM-DD'),
                saldo: e.saldo,
                id_status: e.statusId
            }).then(
                async res => {
                    if (res.data[0]) {
                        if (e.statusId == 4) {
                            await loader.salvaLogs(
                                'contas_aberto',
                                this.state.usuarioLogado.codigo,
                                null,
                                "Saldo (de)" + (e.valor) + " (para)" + (parseFloat(e.saldo) - parseFloat(e.valor)) + "; Data_Pagto " + moment().format('YYYY-MM-DD') + "; Valor_Pago " + e.valor + ";",
                                e.conta);
                        }

                        await loader.salvaLogs(
                            'transacoes',
                            this.state.usuarioLogado.codigo,
                            null,
                            "status " + (e.status === false ? e.error : `${e.status} ${e.errors[0] ? e.errors.join(' ') : ''}`) + "; id_status " + (e.statusId ? e.statusId : 0),
                            res.data[0].chave
                        );

                    } else {
                        console.log(JSON.stringify(res))
                    }
                },
                async err => {
                    alert(JSON.stringify(err))
                }
            )
            await this.setState({ errors })
            await this.getContasAbertas();
        })

        await this.setState({ loading: false, requisicoesCarregando: [] });
    }



    erroApi = async (err) => {
        alert(err)
    }

    filtrarPesquisa = (conta) => {

        if (this.state.banco && conta.contaCorrente != this.state.banco) {
            return false;
        }

        if (this.state.vencimentoInicial && !moment(conta.Vencimento).isSameOrAfter(this.state.vencimentoInicial)) {
            return false;
        }

        if (this.state.vencimentoFinal && !moment(conta.Vencimento).isSameOrBefore(this.state.vencimentoFinal)) {
            return false;
        }

        if (this.state.lancamentoInicial && !moment(conta.Vencimento).isSameOrAfter(this.state.lancamentoInicial)) {
            return false;
        }

        if (this.state.lancamentoFinal && !moment(conta.Vencimento).isSameOrBefore(this.state.lancamentoFinal)) {
            return false;
        }

        if (!conta.statusId && this.state.status == 1) {
            return true;
        }

        if (this.state.status && conta.statusId != this.state.status) {
            if (conta.statusId == 0 && conta.liberado == 1 && (this.state.status == 3 || this.state.status == 1)) {
            } else if (conta.statusId == 0 && conta.liberado == 0 && (this.state.status == 1 || this.state.status == 2)) {
            } else {
                return false;
            }
        }

        return true;

    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    render() {
        return (

            <div className='allContent' >

                <div>
                    {this.state.loading &&
                        <>
                            {this.state.requisicoesCarregando[0] &&
                                <div style={{ position: "absolute", zIndex: "2", height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                    {this.state.requisicoesCarregando.map((requisicao) => (
                                        <div style={{ width: "100%" }}>
                                            <h5 style={{ textAlign: "center" }}>{requisicao}</h5>
                                        </div>
                                    ))}
                                </div>
                            }
                            <Skeleton />
                        </>
                    }

                    {this.state.redirect &&
                        <Redirect to={'/admin'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarFinanceiro titulo="Pagamentos em Lote" />


                                <br />
                            </section>

                            {this.state.errorFooter &&
                                <div className="erroFooter">
                                    <span>
                                        {this.state.error}
                                    </span>
                                </div>
                            }
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>
                                    {!this.state.mostraFiltros &&
                                        <div className='row addservicos' style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: true })}>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 ">
                                                <label><h3>Filtros</h3></label>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 ">
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-right">
                                                <label><h3><FontAwesomeIcon icon={faChevronDown} /></h3></label>
                                            </div>
                                        </div>
                                    }
                                    {this.state.mostraFiltros &&
                                        <div className="row addservicos">
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                                <label><h3>Filtros</h3></label>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-right" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                                <label><h3><FontAwesomeIcon icon={faChevronUp} /></h3></label>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Banco:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <Select className='SearchSelect' options={this.state.bancosOptions.filter(e => this.filterSearch(e, this.state.bancosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ bancosOptionsTexto: e }) }} value={this.state.bancosOptions.filter(option => option.value == this.state.banco)[0]} search={true} onChange={(e) => { this.setState({ banco: e.value, }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Situação:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <Select className='SearchSelect' options={this.state.statuses} value={this.state.statuses.find(option => option.value == this.state.status)} search={true} onChange={async (e) => { await this.setState({ status: e.value }); if (e.value == 3 || e.value == 2) { await this.checkConta("all"); await this.consultarLote() } if (e.value == 4) { await this.getTransacoesPagas() } }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Vencimento Inicial:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.vencimentoInicial} onChange={e => { this.setState({ vencimentoInicial: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Vencimento Final:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.vencimentoFinal} onChange={e => { this.setState({ vencimentoFinal: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Lancamento Inicial:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.lancamentoInicial} onChange={e => { this.setState({ lancamentoInicial: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Lancamento Final:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.lancamentoFinal} onChange={e => { this.setState({ lancamentoFinal: e.currentTarget.value }) }} />
                                            </div>
                                        </div>
                                    }
                                    <div className="col-2 col-sm-2 col-md-3 col-lg-3 col-xl-3  text-right pesquisa mobileajuster1 ">
                                    </div>
                                    <div className="col-5 col-sm-5 col-md-6 col-lg-6 col-xl-6  text-right pesquisa mobileajuster1 ">
                                        {this.state.status == "1" &&
                                            <div>
                                                <button className="btn btn-success" disabled={this.state.requisicoesBloqueado} style={{ padding: '10px', fontSize: '1.2em', borderRadius: '20px' }} onClick={() => { if (!this.state.requisicoesBloqueado) { this.enviarLote() } }}>Pagar</button>
                                            </div>
                                        }
                                        {this.state.status == "2" &&
                                            <div>
                                                <button className="btn btn-success" disabled={this.state.liberacoesBloqueado} style={{ padding: '10px', fontSize: '1.2em', borderRadius: '20px' }} onClick={() => { if (!this.state.liberacoesBloqueado) { this.liberarPagamentos() } }}>Liberar</button>
                                            </div>
                                        }
                                        {this.state.status == "3" &&
                                            <div>
                                                <button className="btn btn-success" style={{ padding: '10px', fontSize: '1.2em', borderRadius: '20px' }} onClick={() => this.consultarLote()}>Consultar</button>
                                            </div>
                                        }
                                    </div>


                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>


                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        <div className="row subtitulosTabela">
                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships">Histórico</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships" style={{ overflowWrap: 'anywhere' }}>Vencimento</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Fornecedor</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Valor</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                {this.state.contas[0] &&
                                                    <input type="checkbox" checked={false} onChange={() => this.checkConta('all')} />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.status != 4 &&
                                    <>
                                        {this.state.contas[0] != undefined && this.state.contas.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <>
                                                <div key={feed.Chave} className="row row-list">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                    <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.Chave}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/admin/addconta/${feed.Chave}`,
                                                                        state: { conta: { ...feed }, to: 'pagamentoslote' }
                                                                    }}
                                                                >
                                                                    <p>{feed.Historico}</p>
                                                                </Link>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.pessoaNome}</p>
                                                            </div>
                                                            <div style={{ overflowWrap: 'anywhere' }} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <input className='pagamentosCheckbox' type="checkbox" disabled={this.state.status == 2 && feed.operador == this.state.usuarioLogado.codigo} checked={feed.check} onChange={() => { if (!(this.state.status == 2 && feed.operador == this.state.usuarioLogado.codigo)) { this.checkConta(feed.Chave) } }} />
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                                </div>
                                                <div className={feed.statusId == '0' ? 'errorMessageTable' : 'successMessageTable'}>
                                                    <span>{feed.status}</span>
                                                </div>
                                            </>
                                        ))}
                                    </>
                                }
                                {this.state.status == 4 &&
                                    <>
                                        {this.state.transacoes[0] != undefined && this.state.transacoes.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <>
                                                <div key={feed.Chave} className="row row-list">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                    <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-1 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.Chave}</p>
                                                            </div>
                                                            <div className="col-3 text-left">
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/admin/addconta/${feed.Chave}`,
                                                                        state: { conta: { ...feed }, to: 'pagamentoslote' }
                                                                    }}
                                                                >
                                                                    <p>{feed.Historico}</p>
                                                                </Link>
                                                            </div>
                                                            <div className="col-2 text-left">
                                                                <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                            </div>

                                                            <div className="col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.pessoaNome}</p>
                                                            </div>
                                                            <div style={{ overflowWrap: 'anywhere' }} className="col-2 text-left">
                                                                <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                                </div>
                                                <div className={feed.statusId == '0' ? 'errorMessageTable' : 'successMessageTable'}>
                                                    <span>{feed.status}</span>
                                                </div>
                                            </>
                                        ))}
                                    </>
                                }
                                {this.state.contas.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                    </div>
                                }
                                <br />
                            </div>
                        </div>
                    }
                </div>
                <Rodape />
            </div >
        )

    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(PagamentosLote)
