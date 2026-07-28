# ==========================================
# FIX ASSOCIADOS V3 PARTE 2
# ==========================================


# corrigir imports type

(Get-Content "src\modules\associados\data\associados.mock.ts") `
-replace "import \{","import type {" |
Set-Content "src\modules\associados\data\associados.mock.ts"



(Get-Content "src\modules\associados\components\AssociadoTable.tsx") `
-replace 'import \{ Associado \}', 'import type { Associado }' |
Set-Content "src\modules\associados\components\AssociadoTable.tsx"



# corrigir enums typescript moderno

@"
export type StatusAssociado =
  | "ATIVO"
  | "PENDENTE"
  | "INATIVO"
  | "BLOQUEADO";


export type SexoAssociado =
  | "MASCULINO"
  | "FEMININO"
  | "OUTRO"
  | "NAO_INFORMADO";
"@ | Set-Content `
"src\modules\associados\types\associado.types.ts"



# corrigir rota

@"
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
"@ | Set-Content `
"src\modules\associados\routes\associados.routes.tsx"



Write-Host ""
Write-Host "==============================="
Write-Host "FIX APLICADO"
Write-Host "==============================="
Write-Host ""
Write-Host "Execute:"
Write-Host "npm run build"