import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import ScreenSaver from './components/screensaver'

import FornecedoresAnexos from './screens/anexos'
import Login from './screens/login'
import Inicio from './screens/inicio'
import Tabelas from './screens/tabelas/inicio'
import OrdensServico from './screens/ordensservico/inicio'
import Utilitarios from './screens/utilitarios/inicio'
import Financeiro from './screens/financeiro/inicio'


import Ships from './screens/tabelas/ships'
import TiposServicos from './screens/tabelas/tiposservicos'
import Grupos from './screens/tabelas/grupos'
import Subgrupos from './screens/tabelas/subgrupos'
import Moedas from './screens/tabelas/moedas'
import Taxas from './screens/tabelas/taxas'
import Pessoas from './screens/tabelas/pessoas'
import PessoaContatos from './screens/tabelas/pessoaContatos'
import PessoaEnderecos from './screens/tabelas/pessoaEnderecos'
import Portos from './screens/tabelas/portos'
import CentrosCustos from './screens/tabelas/centroscustos'
import PlanosContas from './screens/tabelas/planoscontas'
import HistoricosPadrao from './screens/tabelas/historicospadrao'
import DescricoesPadrao from './screens/tabelas/descricoespadrao'
import TiposDocumentos from './screens/tabelas/tiposdocumentos'
import ContasPortos from './screens/tabelas/contasportos'

import AddShip from './screens/tabelas/addship'
import AddTipoServico from './screens/tabelas/addtiposervico'
import AddGrupo from './screens/tabelas/addgrupo'
import AddSubgrupo from './screens/tabelas/addsubgrupo'
import AddMoeda from './screens/tabelas/addmoeda'
import AddTaxa from './screens/tabelas/addtaxa'
import AddPessoa from './screens/tabelas/addpessoa'
import AddPessoaContato from './screens/tabelas/addpessoacontato'
import AddPessoaEndereco from './screens/tabelas/addpessoaendereco'
import AddPorto from './screens/tabelas/addporto'
import AddCentroCusto from './screens/tabelas/addcentrocusto'
import AddPlanoConta from './screens/tabelas/addplanoconta'
import AddHistorico from './screens/tabelas/addhistorico'
import AddDescricao from './screens/tabelas/adddescricao'
import AddTipoDocumento from './screens/tabelas/addtipodocumento'


import Operadores from './screens/utilitarios/operadores'
import Permissoes from './screens/utilitarios/permissoes'
import Logs from './screens/utilitarios/logs'
import Parametros from './screens/utilitarios/parametros'

import AddOperador from './screens/utilitarios/addoperador'


import OS from './screens/ordensservico/os'
import Eventos from './screens/ordensservico/eventos'
import RelatorioOS from './screens/ordensservico/relatorio'
import Tarifas from './screens/ordensservico/tarifas'
import Anexos from './screens/ordensservico/anexos'

import AddOS from './screens/ordensservico/addos'
import AddEvento from './screens/ordensservico/addevento'
import AddEventoFinanceiro from './screens/ordensservico/addeventofinanceiro'
import AddTarifa from './screens/ordensservico/addtarifa'
import AddAnexo from './screens/ordensservico/addanexo'


import PagamentosLote from './screens/financeiro/pagamentoslote'
import PagamentosManual from './screens/financeiro/pagamentosmanual'

import ContasAbertas from './screens/financeiro/contasabertas'
import ContasReceber from './screens/financeiro/contasreceber'
import ContasPagar from './screens/financeiro/contaspagar'
import ContasLiquidadas from './screens/financeiro/contasliquidadas'
import ContasRecebidas from './screens/financeiro/contasrecebidas'
import ContasPagas from './screens/financeiro/contaspagas'
import Relatorio from './screens/financeiro/relatorio'
import Faturas from './screens/financeiro/faturas'
import Lancamentos from './screens/financeiro/lancamentos'
import ExportarLancamentos from './screens/financeiro/exportarlancamentos'

import AddConta from './screens/financeiro/addconta'
import AddFatura from './screens/financeiro/addfatura'
import AddLancamento from './screens/financeiro/addlancamento'


export default function Routes(){
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Login}  />
                <Route path="/anexos/:evento/:fornecedor" exact component={FornecedoresAnexos}  />
                <Route path="/inicio" exact component={Inicio} />
                <Route path="/tabelas" exact component={Tabelas} />
                <Route path="/ordensservico" exact component={OrdensServico} />
                <Route path="/utilitarios" exact component={Utilitarios} />
                <Route path="/financeiro" exact component={Financeiro} />


                <Route path="/tabelas/navios" component={Ships} />
                <Route path="/tabelas/tiposservicos" component={TiposServicos} />
                <Route path="/tabelas/subgrupos" component={Subgrupos} />
                <Route path="/tabelas/grupos" component={Grupos} />
                <Route path="/tabelas/moedas" component={Moedas} />
                <Route path="/tabelas/taxas" component={Taxas} />
                <Route path="/tabelas/pessoas" component={Pessoas} />
                <Route path="/tabelas/pessoacontatos/:id" component={PessoaContatos} />
                <Route path="/tabelas/pessoaenderecos/:id" component={PessoaEnderecos} />
                <Route path="/tabelas/portos" component={Portos} />
                <Route path="/tabelas/centroscustos" component={CentrosCustos} />
                <Route path="/tabelas/planoscontas" component={PlanosContas} />
                <Route path="/tabelas/historicospadrao" component={HistoricosPadrao} />
                <Route path="/tabelas/descricoespadrao" component={DescricoesPadrao} />
                <Route path="/tabelas/tiposdocumentos" component={TiposDocumentos} />
                <Route path="/tabelas/contasportos" component={ContasPortos} />

                <Route path="/tabelas/addship/:id" component={AddShip} />
                <Route path="/tabelas/addtiposervico/:id" component={AddTipoServico} />
                <Route path="/tabelas/addsubgrupo/:id" component={AddSubgrupo} />
                <Route path="/tabelas/addgrupo/:id" component={AddGrupo} />
                <Route path="/tabelas/addmoeda/:id" component={AddMoeda} />
                <Route path="/tabelas/addtaxa/:id" component={AddTaxa} />
                <Route path="/tabelas/addpessoa/:id/" component={AddPessoa} />
                <Route path="/tabelas/addpessoacontato/:id/:ed" component={AddPessoaContato} />
                <Route path="/tabelas/addpessoaendereco/:id/:ed" component={AddPessoaEndereco} />
                <Route path="/tabelas/addporto/:id" component={AddPorto} />
                <Route path="/tabelas/addcentrocusto/:id/" component={AddCentroCusto} />
                <Route path="/tabelas/addplanoconta/:id/" component={AddPlanoConta} />
                <Route path="/tabelas/addhistorico/:id/" component={AddHistorico} />          
                <Route path="/tabelas/adddescricao/:id/" component={AddDescricao} />          
                <Route path="/tabelas/addtipodocumento/:id/" component={AddTipoDocumento} />          


                <Route path="/utilitarios/operadores" component={Operadores} />
                <Route path="/utilitarios/permissoes" component={Permissoes} />
                <Route path="/utilitarios/logs" component={Logs} />
                <Route path="/utilitarios/parametros" component={Parametros} />

                <Route path="/utilitarios/addoperador/:id/" component={AddOperador} />


                <Route path="/ordensservico/os" component={OS} />
                <Route path="/ordensservico/eventos" component={Eventos} />
                <Route path="/ordensservico/relatorio" component={RelatorioOS} />
                <Route path="/ordensservico/tarifas" component={Tarifas} />
                <Route path="/ordensservico/anexos" component={Anexos} />
                
                <Route path="/ordensservico/addos/:id/" component={AddOS} />
                <Route path="/ordensservico/addevento/:id/" component={AddEvento} />
                <Route path="/ordensservico/addeventoFinanceiro/:id/" component={AddEventoFinanceiro} />
                <Route path="/ordensservico/addtarifa/:id/" component={AddTarifa} />          
                <Route path="/ordensservico/addanexo/:id/" component={AddAnexo} />          


                <Route path="/financeiro/pagamentoslote" component={PagamentosLote} />
                <Route path="/financeiro/pagamentosmanual" component={PagamentosManual} />

                <Route path="/financeiro/contasabertas" component={ContasAbertas} />
                <Route path="/financeiro/contasreceber" component={ContasReceber} />
                <Route path="/financeiro/contaspagar" component={ContasPagar} />
                <Route path="/financeiro/contasliquidadas" component={ContasLiquidadas} />
                <Route path="/financeiro/contasrecebidas" component={ContasRecebidas} />
                <Route path="/financeiro/contaspagas" component={ContasPagas} />
                <Route path="/financeiro/relatorio" component={Relatorio} />
                <Route path="/financeiro/faturas" component={Faturas} />
                <Route path="/financeiro/lancamentos" component={Lancamentos} />
                <Route path="/financeiro/exportarlancamentos" component={ExportarLancamentos} />          

                <Route path="/financeiro/addconta/:id/" component={AddConta} />
                <Route path="/financeiro/addfatura/:id/" component={AddFatura} />
                <Route path="/financeiro/addlancamento/:id/" component={AddLancamento} />          
            </Switch>
        </BrowserRouter>
    )
}