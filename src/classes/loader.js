
import { apiEmployee } from '../services/apiamrg'
import axios from 'axios'
import util from './util.js'
import moment from 'moment'

export default class loader {
    static async getCodigoCC() {
        return await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'CC'
        }).then(
            async res => {
                return res.data[0].Proximo;
            },
            async err => {
                alert(err);
            }
        )
    }

    static async getCodigo(tipo) {
        return await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: tipo
        }).then(
            async res => {
                return res.data[0].Proximo;
            },
            async err => {
                alert(err);
            }
        )
    }

    static async getLote() {
        return await apiEmployee.post(`getLote.php`, {
            token: true
        }).then(
            async res => {
                if (res.data[0]) {
                    return res.data[0].lote;
                }
            },
            err => { alert(err) }

        )
    }

    static async getUltimaTransacao() {
        return await apiEmployee.post(`getUltimaTransacao.php`, {
            token: true
        }).then(
            async res => {
                if (res.data[0]) {
                    return res.data[0].transacao;
                } else {
                    return 1
                }
            },
            err => { alert(err) }
        )
    }

    static async getContaTransacao(chave) {
        return await apiEmployee.post(`getContaTransacao.php`, {
            token: true,
            chave
        }).then(
            async res => {
                if (res.data[0]) {
                    return res.data[0].chave;
                } else {
                    return 1
                }
            },
            err => { alert(err) }
        )
    }

    static async getSolicitacoesOS(pesquisa, empresa) {
        return await apiEmployee.post(`getSolicitacoesOS.php`, {
            token: true,
            pesquisa: pesquisa,
            empresa: empresa
        }).then(
            async res => {
                return res.data;
            },
            err => { alert(err) }
        )
    }

    static async getOSPesquisa(pesquisa, tipoPesquisa, empresa) {
        const tipo = ["",
            "os.orcamento = 0 and os.codigo LIKE '%" + pesquisa + "%'",
            "os.orcamento = 0 and os_navios.nome LIKE '%" + pesquisa + "%'",
            "os.orcamento = 0 and os_tipos_servicos.descricao LIKE '%" + pesquisa + "%'",
            "os.orcamento = 0 and os_portos.descricao LIKE '%" + pesquisa + "%'",
            "os.orcamento = 0 and pessoas.nome LIKE '%"+ pesquisa + "%'"
        ][tipoPesquisa];
        return await apiEmployee.post(`getOSPesquisa.php`, {
            token: true,
            where: tipo,
            empresa: empresa
        }).then(
            async res => {
                return res.data;
            },
            err => { alert(err) }
        )
    }

    static async getOsOrcamentoPesquisa(pesquisa, tipoPesquisa, empresa) {
        const tipo = ["",
            "os.orcamento = 1 and os.codigo LIKE '%" + pesquisa + "%'",
            "os.orcamento = 1 and os_navios.nome LIKE '%" + pesquisa + "%'",
            "os.orcamento = 1 and os.Descricao LIKE '%" + pesquisa + "%'",
            "os.orcamento = 1 and os_portos.descricao LIKE '%" + pesquisa + "%'",
            "os.orcamento = 1 and pessoas.nome LIKE '%"+ pesquisa + "%'",
            "os.orcamento = 1 and os.sequencialOrcamento LIKE '%" + pesquisa + "%'"
        ][tipoPesquisa];
        return await apiEmployee.post(`getOSPesquisa.php`, {
            token: true,
            where: tipo,
            empresa: empresa
        }).then(
            async res => {
                return res.data;
            },
            err => { alert(err) }
        )
    }

    static async getTransacoesTipo(tipo) {
        return await apiEmployee.post(`getTransacoesTipo.php`, {
            token: true,
            tipo
        }).then(
            async res => {
                return res.data
            },
            async err => { alert(err) }
        )
    }

    static async getBase(url, empresa = null, limit = null, offset = null) {
        return await apiEmployee.post(url, {
            token: true,
            empresa: empresa,
            limit: limit,
            offset: offset
        }).then(
            async res => {
                return res.data
            },
            async err => { alert(err) }
        )
    }

    static async getBody(url, body) {
        return await apiEmployee.post(url, {
            ...body
        }).then(
            async res => {
                return res.data
            },
            async err => { alert(err) }
        )
    }

    static async getAllLogs(tabela, empresa) {
        return await apiEmployee.post(`getAllLogs.php`, {
            token: true,
            tabela,
            empresa
        }).then(
            async res => {
                return res.data
            },
            async err => { alert(err) }
        )
    }

    static async getOne(url, chave = null, empresa = null, body = null) {
        if (body) {
            return await apiEmployee.post(url, {
                ...body,
                token: true
            }).then(
                async res => {
                    return res.data[0]
                },
                async err => { alert(err) }
            )
        }

        return await apiEmployee.post(url, {
            token: true,
            chave: chave,
            empresa: empresa
        }).then(
            async res => {
                    return res.data[0]
            },
            async err => { alert(err) }
        )
    }

    static async getBaseOptions(url, label, chave, body = {}) {
        return await apiEmployee.post(url, {
            token: true,
            ...body
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e[label], value: e[chave] }
                })
                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getBaseOptionsCustomLabel(url, label, secondLabel, chave) {
        return await apiEmployee.post(url, {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    if ([secondLabel.toLowerCase().contains("cpf")]) {
                        return { label: `${e[label]}${e[secondLabel] ? ` - ${util.formataCPF(e[secondLabel])}` : ""}`, value: e[chave] }
                    } 
                    return { label: `${e[label]}${e[secondLabel] ? ` - ${e[secondLabel]}` : ""}`, value: e[chave] }
                })
                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getAuthToken(basic) {
        const body = new URLSearchParams();
        body.append('grant_type', 'client_credentials');

        return await axios.request({
            url: "/oauth/token",
            method: "post",
            baseURL: "https://oauth.bb.com.br",
            headers: {
                'Authorization': basic,
                'Content-Type': "application/x-www-form-urlencoded"
            },
            data: body
        }).then(res => {
            return res.data.access_token;
        });
    }

    static async getContaSolicitacao(chave) {
        return await apiEmployee.post(`getContaSolicitacao.php`, {
            token: true,
            chave: chave
        }).then(
            async res => {
                if (res.data[0]) {
                    return true;
                } else {
                    return false;
                }
            },
            async err => { alert(err) }
        )
    }


    //
    static async getPessoasOptions() {
        return await apiEmployee.post('getPessoas.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getFornecedoresOptions() {
        return await apiEmployee.post('getFornecedores.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getClientesOptions() {
        return await apiEmployee.post('getClientes.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getCentrosCustosOptions(url, label, chave) {
        return await apiEmployee.post('getCentrosCustos.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getHistoricosOptions() {
        return await apiEmployee.post('getHistoricos.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Descricao, value: e.chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getPlanosContasAnaliticasOptions() {
        return await apiEmployee.post('getPlanosContasAnaliticas.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getTiposLancamentoOptions() {
        return await apiEmployee.post('getTiposLancamento.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getMeiosPagamentosOptions() {
        return await apiEmployee.post('getMeiosPagamentos.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getBancosOptions() {
        return await apiEmployee.post('getBancos.php', {
            token: true
        }).then(
            async res => {
                const options = res.data.map((e) => {
                    return { label: e.Titular, value: e.Chave }
                })

                return options;
            },
            async err => { alert(err) }
        )
    }

    static async getContaPessoa(chave, tipo) {
        return await apiEmployee.post('getPessoa.php', {
            token: true,
            chave
        }).then(
            async res => {
                if (res.data[0]) {
                    if (tipo == "provisao") {
                        return res.data[0].Conta_Provisao == '0' || !res.data[0].Conta_Provisao ? '' : res.data[0].Conta_Provisao;
                    } else {
                        return res.data[0].Conta_Contabil == '0' || !res.data[0].Conta_Contabil ? '' : res.data[0].Conta_Contabil;
                    }
                }
            },
            async err => { alert(err) }
        )
    }

    static async getContaTaxa(chave) {
        return await apiEmployee.post('getTaxa.php', {
            token: true,
            chave
        }).then(
            async res => {
                return res.data[0].Conta_Contabil == '0' || !res.data[0].Conta_Contabil ? '' : res.data[0].Conta_Contabil;
            },
            async err => { alert(err) }
        )
    }

    static async getInformacoesBancarias(empresa) {
        return await apiEmployee.post('getInformacoesBancarias.php', {
            token: true,
            empresa,
            tipo: 1,
        }).then(
            async res => {
                let retorno = { ...res.data[0], chave_api: `?gw-dev-app-key=${res.data[0].chave_api}` }

                return retorno;
            }
        )
    }

    static async postContasDescontos(contas, chave_conta_aberto) {
        for (let i = 0; i<contas.length; i++) {
            const conta = contas[i];

            if (conta.check) {
                await apiEmployee.post(`insertContaDescontos.php`, {
                    token: true,
                    chave_conta_aberto,
                    chave_conta: conta.conta,
                    complemento: conta.complemento,
                    valor: conta.valor,
                    tipo: conta.tipo
                }).then(
                    async res => {                    },
                    async res => await console.log(`Erro: ${res.data}`)
                )
            } else {
                await apiEmployee.post('checkAndDeleteContaDescontos.php', {
                    token: true,
                    chave_conta_aberto,
                    tipo: conta.tipo
                }).then(
                    async res => {},
                    async res => await console.log(`Erro: ${res.data}`)
                )
            }
        }
    }
    //



    //
    static async testaAcesso(acessos, permissoes, usuarioLogado) {
        if (!acessos || !acessos[0] || !permissoes || !permissoes[0] || !usuarioLogado || !usuarioLogado.codigo) {
            return [];
        }
        
        let permissao = '';

        const acessosPermissoes = acessos.map((e, i) => {
            permissao = permissoes.filter((permissao) => {
                if ((permissao.Usuario == usuarioLogado.codigo || permissao.Usuario == usuarioLogado.grupo) && permissao.Acessos == e.Chave && permissao.Empresa == usuarioLogado.empresa) {
                    return permissao;
                }
            })[0]
            return {
                acesso: e.Chave,
                acessoAcao: e.Acao,
                permissaoInsere: permissao ? permissao.Liberacao.split(``)[0] : 0,
                permissaoEdita: permissao ? permissao.Liberacao.split(``)[1] : 0,
                permissaoConsulta: permissao ? permissao.Liberacao.split(``)[2] : 0,
                permissaoDeleta: permissao ? permissao.Liberacao.split(``)[3] : 0,
                permissaoImprime: permissao ? permissao.Liberacao.split(``)[4] : 0
            }
        })

        return acessosPermissoes;
    }
    //

    static async salvaLogs(Tabela, Operador, dadosIniciais, dadosFinais, ChaveAux, identificador = "") {
        let Campos = '';

        if (!dadosIniciais) {
            Campos = dadosFinais;
        } else {
            Campos = dadosFinais.filter((e) =>
                dadosIniciais.filter((el) => e.valor != el.valor && e.titulo == el.titulo)[0]).map((e) =>
                    `${e.titulo}: ${dadosIniciais.find((el) => e.titulo == el.titulo) ? ` (de)${dadosIniciais.find((el) => e.titulo == el.titulo).valor}` : ``} (para)${e.valor ? e.valor : ''}`).join('; ');
        }

        if (Campos) {
            await apiEmployee.post('salvaLogs.php', {
                values: `'${Tabela}', '${Operador}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${identificador} ${Campos}', '${ChaveAux}'`
            }).then(
                async res => {
                },
                async err => {
                    console.log(err);
                }
            )
        }

    }

    static async getLogs(Tabela, ChaveAux) {
        return await apiEmployee.post('getLogs.php', {
            token: true,
            Tabela,
            ChaveAux
        }).then(
            async res => {
                return res.data
            },
            async err => {
                console.log(err);
            }
        )

    }

    static async getLogsOS(chaveOS, chaveSI) {
        return await apiEmployee.post('getLogsOS.php', {
            token: true,
            chaveOS,
            chaveSI: chaveSI
        }).then(
            async res => {
                return res.data
            },
            async err => {
                console.log(err);
            }
        )

    }

    //
    static async testaTarifasVencimentos() {
        return await apiEmployee.post("tarifasVencimentos.php",{
            token: true
        }).then(
            async res => {
                return res.data;
            },
            async err => {
                console.log(err);
            }
        )
    }

    static async tarifasVencidasEmails(tarifas) {
        const chaves = tarifas.map((e) => e.chave);

        return await apiEmployee.post("emailTarifasVencidas.php",{
            token: true,
            chaves
        }).then(
            async res => {
                return res.data;
            },
            async err => {
                console.log(err);
            }
        )
    }

    static async valoresOS(chave) {
        return await apiEmployee.post("getValoresOS.php",{
            token: true,
            chave
        }).then(
            async res => {
                return res.data;
            },
            async err => {
                console.log(err);
            }
        )
    }
    //
    static async getOSPesquisaMultiple(pesquisa1, tipoPesquisa1, pesquisa2, tipoPesquisa2, empresa) {
        const tipos = ["",
            "os.orcamento = 0 and os.codigo LIKE '%[PESQUISA]%'",
            "os.orcamento = 0 and os_navios.nome LIKE '%[PESQUISA]%'",
            "os.orcamento = 0 and os_tipos_servicos.descricao LIKE '%[PESQUISA]%'",
            "os.orcamento = 0 and os_portos.descricao LIKE '%[PESQUISA]%'",
            "os.orcamento = 0 and pessoas.nome LIKE '%[PESQUISA]%'"
        ];
    
        const where1 = tipos[tipoPesquisa1].replace('[PESQUISA]', pesquisa1);
        const where2 = tipos[tipoPesquisa2].replace('[PESQUISA]', pesquisa2);
        const whereClause = pesquisa1 && pesquisa2 ? `(${where1}) AND (${where2})` : 
                           pesquisa1 ? where1 : 
                           pesquisa2 ? where2 : 
                           "os.orcamento = 0";
    
        return await apiEmployee.post(`getOSPesquisa.php`, {
            token: true,
            where: whereClause,
            empresa: empresa
        }).then(
            async res => {
                return res.data;
            },
            err => { alert(err) }
        );
    }

}