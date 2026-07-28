# ==========================================
# INTEGRACAO MODULO ASSOCIADOS
# ==========================================


Write-Host "Integrando Associados..." -ForegroundColor Green


# ===============================
# Atualizar rotas
# ===============================


$routeFile = "src/routes/index.tsx"


$content = Get-Content $routeFile -Raw


if($content -notmatch "AssociadosPage") {


$content = @"
import AssociadosRoutes from "@/modules/associados/routes/associados.routes"

$content
"@


}


Set-Content $routeFile $content



# ===============================
# Criar rota do módulo
# ===============================


@'
import {Routes,Route} from "react-router-dom"

import AssociadosPage from "../pages/AssociadosPage"

import NovoAssociadoPage from "../pages/NovoAssociadoPage"


export default function AssociadosRoutes(){

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


</Routes>

)

}

'@ | Set-Content "src/modules/associados/routes/associados.routes.tsx"



Write-Host ""
Write-Host "Integracao criada!" -ForegroundColor Green