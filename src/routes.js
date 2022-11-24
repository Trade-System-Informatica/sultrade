import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'

import Login from './admin/login'
import Inicio from './admin/inicio'
import Tabelas from './admin/tabelas'
import OrdensServico from './admin/ordensservico'
import Utilitarios from './admin/utilitarios'
import Financeiro from './admin/financeiro'


import Ships from './admin/ships'
import TiposServicos from './admin/tiposservicos'
import Grupos from './admin/grupos'
import Subgrupos from './admin/subgrupos'
import Moedas from './admin/moedas'
import Taxas from './admin/taxas'
import Pessoas from './admin/pessoas'
import PessoaContatos from './admin/pessoaContatos'
import PessoaEnderecos from './admin/pessoaEnderecos'
import Portos from './admin/portos'
import CentrosCustos from './admin/centroscustos'
import PlanosContas from './admin/planoscontas'
import HistoricosPadrao from './admin/historicospadrao'
import TiposDocumentos from './admin/tiposdocumentos'

import AddShip from './admin/addship'
import AddTipoServico from './admin/addtiposervico'
import AddGrupo from './admin/addgrupo'
import AddSubgrupo from './admin/addsubgrupo'
import AddMoeda from './admin/addmoeda'
import AddTaxa from './admin/addtaxa'
import AddPessoa from './admin/addpessoa'
import AddPessoaContato from './admin/addpessoacontato'
import AddPessoaEndereco from './admin/addpessoaendereco'
import AddPorto from './admin/addporto'
import AddCentroCusto from './admin/addcentrocusto'
import AddPlanoConta from './admin/addplanoconta'
import AddHistorico from './admin/addhistorico'
import AddTipoDocumento from './admin/addtipodocumento'


import Operadores from './admin/operadores'
import Permissoes from './admin/permissoes'

import AddOperador from './admin/addoperador'


import OS from './admin/os'
import SolicitacoesServicos from './admin/solicitacoesservicos'
import Logs from './admin/logs'
import Parametros from './admin/parametros'

import AddOS from './admin/addos'
import AddSolicitacao from './admin/addsolicitacao'
import AddSolicitacaoFinanceiro from './admin/addsolicitacaofinanceiro'


import ContasAbertas from './admin/contasabertas'
import ContasReceber from './admin/contasreceber'
import ContasPagar from './admin/contaspagar'
import ContasLiquidadas from './admin/contasliquidadas'
import ContasRecebidas from './admin/contasrecebidas'
import ContasPagas from './admin/contaspagas'
import Relatorio from './admin/relatorio'
import PagamentosLote from './admin/pagamentoslote'
import PagamentosManual from './admin/pagamentosmanual'
//import RecebimentosPix from './admin/recebimentospix'
import Faturas from './admin/faturas'

import AddConta from './admin/addconta'
import AddFatura from './admin/addfatura'


export default function Routes(){
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Login}  />
                <Route path="/admin" exact component={Login} />
                <Route path="/admin/inicio" component={Inicio} />
                <Route path="/admin/tabelas" component={Tabelas} />
                <Route path="/admin/ordensservico" component={OrdensServico} />
                <Route path="/admin/utilitarios" component={Utilitarios} />
                <Route path="/admin/financeiro" component={Financeiro} />


                <Route path="/admin/navios" component={Ships} />
                <Route path="/admin/tiposservicos" component={TiposServicos} />
                <Route path="/admin/subgrupos" component={Subgrupos} />
                <Route path="/admin/grupos" component={Grupos} />
                <Route path="/admin/moedas" component={Moedas} />
                <Route path="/admin/taxas" component={Taxas} />
                <Route path="/admin/pessoas" component={Pessoas} />
                <Route path="/admin/pessoacontatos/:id" component={PessoaContatos} />
                <Route path="/admin/pessoaenderecos/:id" component={PessoaEnderecos} />
                <Route path="/admin/portos" component={Portos} />
                <Route path="/admin/centroscustos" component={CentrosCustos} />
                <Route path="/admin/planoscontas" component={PlanosContas} />
                <Route path="/admin/historicospadrao" component={HistoricosPadrao} />
                <Route path="/admin/tiposdocumentos" component={TiposDocumentos} />

                <Route path="/admin/addship/:id" component={AddShip} />
                <Route path="/admin/addtiposervico/:id" component={AddTipoServico} />
                <Route path="/admin/addsubgrupo/:id" component={AddSubgrupo} />
                <Route path="/admin/addgrupo/:id" component={AddGrupo} />
                <Route path="/admin/addmoeda/:id" component={AddMoeda} />
                <Route path="/admin/addtaxa/:id" component={AddTaxa} />
                <Route path="/admin/addpessoa/:id/" component={AddPessoa} />
                <Route path="/admin/addpessoacontato/:id/:ed" component={AddPessoaContato} />
                <Route path="/admin/addpessoaendereco/:id/:ed" component={AddPessoaEndereco} />
                <Route path="/admin/addporto/:id" component={AddPorto} />
                <Route path="/admin/addcentrocusto/:id/" component={AddCentroCusto} />
                <Route path="/admin/addplanoconta/:id/" component={AddPlanoConta} />
                <Route path="/admin/addhistorico/:id/" component={AddHistorico} />          
                <Route path="/admin/addtipodocumento/:id/" component={AddTipoDocumento} />          


                <Route path="/admin/operadores" component={Operadores} />
                <Route path="/admin/permissoes" component={Permissoes} />

                <Route path="/admin/addoperador/:id/" component={AddOperador} />


                <Route path="/admin/os" component={OS} />
                <Route path="/admin/solicitacoesservicos" component={SolicitacoesServicos} />
                <Route path="/admin/logs" component={Logs} />
                <Route path="/admin/parametros" component={Parametros} />
                
                <Route path="/admin/addos/:id/" component={AddOS} />
                <Route path="/admin/addsolicitacao/:id/" component={AddSolicitacao} />
                <Route path="/admin/addsolicitacaoFinanceiro/:id/" component={AddSolicitacaoFinanceiro} />


                <Route path="/admin/contasabertas" component={ContasAbertas} />
                <Route path="/admin/contasreceber" component={ContasReceber} />
                <Route path="/admin/contaspagar" component={ContasPagar} />
                <Route path="/admin/contasliquidadas" component={ContasLiquidadas} />
                <Route path="/admin/contasrecebidas" component={ContasRecebidas} />
                <Route path="/admin/contaspagas" component={ContasPagas} />
                <Route path="/admin/relatorio" component={Relatorio} />
                <Route path="/admin/pagamentoslote" component={PagamentosLote} />
                <Route path="/admin/pagamentosmanual" component={PagamentosManual} />
                {/*<Route path="/admin/recebimentospix" component={RecebimentosPix} />*/}
                <Route path="/admin/faturas" component={Faturas} />

                <Route path="/admin/addconta/:id/" component={AddConta} />
                <Route path="/admin/addfatura/:id/" component={AddFatura} />
            </Switch>
        </BrowserRouter>
    )
}