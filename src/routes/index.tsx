import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"
import RelatorioMatriculasPage from "@/modules/relatorios/pages/RelatorioMatriculasPage"
import ConfiguracoesPage from "@/modules/configuracoes/pages/ConfiguracoesPage"
import MainLayout from "@/components/layout/MainLayout"
import ConsultaAssociadoPage from "@/modules/relatorios/pages/ConsultaAssociadoPage"
import { AssociadosRoutes } from "@/modules/associados/routes/associados.routes"
import DashboardPage from "@/modules/dashboard/pages/DashboardPage"
import ModalidadesPage from "@/modules/modalidades/pages/ModalidadesPage"
import InstrutoresPage from "@/modules/instrutores/pages/InstrutoresPage"
import TurmasPage from "@/modules/turmas/pages/TurmasPage"
import AgendaPage from "@/modules/agenda/pages/AgendaPage"



export default function AppRoutes(){


return (

<BrowserRouter>


<Routes>

<Route element={<MainLayout/>}>
<Route path="/configuracoes" element={<ConfiguracoesPage/>} />
<Route path="/relatorios" element={<Navigate to="/relatorios/matriculas" replace />} />
<Route path="/relatorios/matriculas" element={<RelatorioMatriculasPage/>} />
<Route path="/relatorios/consulta" element={<ConsultaAssociadoPage/>} />

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