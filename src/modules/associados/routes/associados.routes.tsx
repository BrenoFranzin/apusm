import { Routes, Route } from "react-router-dom";

import AssociadosPage from "../pages/AssociadosPage";
import NovoAssociadoPage from "../pages/NovoAssociadoPage";
import EditarAssociadoPage from "../pages/EditarAssociadoPage";
import DetalhesAssociadoPage from "../pages/DetalhesAssociadoPage";


export function AssociadosRoutes(){

return (

<Routes>

<Route 
path="/" 
element={<AssociadosPage/>}
/>

<Route
path="/novo"
element={<NovoAssociadoPage/>}
/>

<Route
path="/:id"
element={<DetalhesAssociadoPage/>}
/>

<Route
path="/:id/editar"
element={<EditarAssociadoPage/>}
/>

</Routes>

)

}
