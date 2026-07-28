# ==========================================
# FIX ASSOCIADOS V3
# ==========================================


# Corrigir imports de TYPE


$files=@(
"src/modules/associados/components/AssociadoCard.tsx",
"src/modules/associados/components/AssociadoTable.tsx",
"src/modules/associados/data/associados.mock.ts",
"src/modules/associados/services/associados.service.ts"
)


foreach($file in $files){

if(Test-Path $file){

$content=Get-Content $file -Raw


$content=$content -replace `
'import \{Associado\}',`
'import type { Associado }'


$content=$content -replace `
'import \{ Associado \}',`
'import type { Associado }'


Set-Content $file $content -Encoding UTF8


}

}



# Corrigir service axios

$service="src/modules/associados/services/associados.service.ts"


if(Test-Path $service){

$content=Get-Content $service -Raw


$content=$content -replace `
'import api from "@/services/api"',`
'import { api } from "@/services/api"'


Set-Content $service $content -Encoding UTF8

}



# Corrigir rota principal


$route="src/routes/index.tsx"


if(Test-Path $route){

$content=Get-Content $route -Raw


$content=$content -replace `
'import AssociadosRoutes from "../modules/associados/routes/associados.routes";',
'import { AssociadosRoutes } from "../modules/associados/routes/associados.routes";'


Set-Content $route $content -Encoding UTF8

}



Write-Host ""
Write-Host "================================"
Write-Host "CORREÇÕES APLICADAS"
Write-Host "================================"

Write-Host ""
Write-Host "Agora execute:"
Write-Host "npm run build"