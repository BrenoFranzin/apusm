import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import { lazy, Suspense } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { AssociadosRoutes } from "@/modules/associados/routes/associados.routes"

const RelatorioMatriculasPage = lazy(() => import("@/modules/relatorios/pages/RelatorioMatriculasPage"))
const RelatorioPresencaSemanalPage = lazy(() => import("@/modules/relatorios/pages/RelatorioPresencaSemanalPage"))
const ConfiguracoesPage = lazy(() => import("@/modules/configuracoes/pages/ConfiguracoesPage"))
const ConsultaAssociadoPage = lazy(() => import("@/modules/relatorios/pages/ConsultaAssociadoPage"))
const DashboardPage = lazy(() => import("@/modules/dashboard/pages/DashboardPage"))
const ModalidadesPage = lazy(() => import("@/modules/modalidades/pages/ModalidadesPage"))
const InstrutoresPage = lazy(() => import("@/modules/instrutores/pages/InstrutoresPage"))
const TurmasPage = lazy(() => import("@/modules/turmas/pages/TurmasPage"))
const AgendaPage = lazy(() => import("@/modules/agenda/pages/AgendaPage"))
const PlantaoPage = lazy(() => import("@/modules/plantao/pages/PlantaoPage"))
const ListasEsperaPage = lazy(() => import("@/modules/lista-espera/pages/ListasEsperaPage"))
const ModalidadeTurmasPage = lazy(() => import("@/modules/lista-espera/pages/ModalidadeTurmasPage"))
const AssociadoSituacaoPage = lazy(() => import("@/modules/associados/pages/AssociadoSituacaoPage"))




export default function AppRoutes(){


return (

<BrowserRouter>


<Routes>

<Route element={<MainLayout/>}>
<Route path="/configuracoes" element={<ConfiguracoesPage/>} />
<Route path="/relatorios" element={<Navigate to="/relatorios/matriculas" replace />} />
<Route path="/relatorios/matriculas" element={<RelatorioMatriculasPage/>} />
<Route path="/relatorios/presenca-semanal" element={<RelatorioPresencaSemanalPage/>} />
<Route path="/relatorios/consulta" element={<ConsultaAssociadoPage/>} />
<Route path="/plantao" element={<PlantaoPage/>} />
<Route path="/lista-espera" element={<ListasEsperaPage/>} />
<Route path="/lista-espera/:modalidadeId" element={<ModalidadeTurmasPage/>} />
<Route path="/associados/situacao" element={<AssociadoSituacaoPage/>} />




<Route

path="/"

element={<DashboardPage/>}

/>


<Route

path="/associados/*"

element={<AssociadosRoutes/>}

/>

<Route
path="/modalidades"
element={<ModalidadesPage/>}
/>

<Route
path="/instrutores"
element={<InstrutoresPage/>}
/>


<Route
path="/turmas"
element={<TurmasPage/>}
/>

<Route
path="/agenda"
element={<AgendaPage/>}
/>

</Route>


</Routes>


</BrowserRouter>

)

}