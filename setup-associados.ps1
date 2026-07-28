# ==========================================
# SETUP MÓDULO ASSOCIADOS - APUSM SaaS
# ==========================================

$base = "src/modules/associados"

Write-Host "Criando módulo Associados..." -ForegroundColor Green


# ===============================
# Criar pastas
# ===============================

$folders = @(
"$base/components",
"$base/pages",
"$base/services",
"$base/types",
"$base/hooks",
"$base/routes",
"$base/utils"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}


# ===============================
# TYPES
# ===============================

@'
export type AssociadoStatus =
  | "ATIVO"
  | "INATIVO"
  | "PENDENTE"


export interface Associado {

  id: string

  nome: string

  cpf: string

  rg?: string

  nascimento?: string

  sexo?: string

  telefone?: string

  whatsapp?: string

  email?: string

  endereco?: string

  cidade?: string

  cep?: string

  observacoes?: string

  status: AssociadoStatus

  createdAt?: string

  updatedAt?: string


  // Preparado SaaS

  matriculas?: string[]

  modalidades?: string[]

  turmas?: string[]

  frequencias?: string[]

  historico?: string[]

  pagamentos?: string[]

}

'@ | Set-Content "$base/types/associado.types.ts"


# ===============================
# SERVICE
# ===============================

@'
import api from "@/services/api"

import { Associado } from "../types/associado.types"


export const associadosService = {


async listar(){

return api.get<Associado[]>("/associados")

},


async buscar(id:string){

return api.get<Associado>(
`/associados/${id}`
)

},


async criar(data:Associado){

return api.post(
"/associados",
data
)

},


async atualizar(
id:string,
data:Associado
){

return api.put(
`/associados/${id}`,
data
)

},


async remover(id:string){

return api.delete(
`/associados/${id}`
)

}


}

'@ | Set-Content "$base/services/associados.service.ts"


# ===============================
# HOOK
# ===============================

@'
import {useEffect,useState} from "react"

import { Associado } from "../types/associado.types"


export function useAssociados(){

const [dados,setDados]=useState<Associado[]>([])

const [loading,setLoading]=useState(false)


async function carregar(){

setLoading(true)


// Mock inicial
// substituir pela API

setDados([])

setLoading(false)

}


useEffect(()=>{

carregar()

},[])


return {

dados,

loading,

recarregar:carregar

}

}

'@ | Set-Content "$base/hooks/useAssociados.ts"



# ===============================
# COMPONENT CARD
# ===============================

@'
import {Card} from "@/components/ui"

import {Associado} from "../types/associado.types"


interface Props{

associado:Associado

}


export function AssociadoCard({
associado
}:Props){

return (

<Card>

<h3 className="font-semibold">
{associado.nome}
</h3>


<p>
CPF: {associado.cpf}
</p>


<p>
Status:
{associado.status}
</p>


</Card>

)

}

'@ | Set-Content "$base/components/AssociadoCard.tsx"



# ===============================
# TABLE
# ===============================

@'
import {Associado} from "../types/associado.types"


interface Props{

dados:Associado[]

}


export function AssociadoTable({
dados
}:Props){

return (

<div>

<table className="w-full">

<thead>

<tr>

<th>Nome</th>
<th>CPF</th>
<th>Status</th>

</tr>

</thead>


<tbody>

{
dados.map(item=>(

<tr key={item.id}>

<td>
{item.nome}
</td>


<td>
{item.cpf}
</td>


<td>
{item.status}
</td>


</tr>

))
}


</tbody>

</table>

</div>

)

}

'@ | Set-Content "$base/components/AssociadoTable.tsx"



# ===============================
# FORM
# ===============================

@'
import {useForm} from "react-hook-form"

import {Associado} from "../types/associado.types"


export function AssociadoForm(){

const {
register,
handleSubmit
}=useForm<Associado>()


function salvar(data:Associado){

console.log(data)

}


return (

<form
onSubmit={handleSubmit(salvar)}
className="space-y-4"
>


<input
{...register("nome")}
placeholder="Nome completo"
/>


<input
{...register("cpf")}
placeholder="CPF"
/>


<input
{...register("telefone")}
placeholder="Telefone"
/>


<button>

Salvar

</button>


</form>

)

}

'@ | Set-Content "$base/components/AssociadoForm.tsx"



# ===============================
# PAGES
# ===============================


@'
import {PageHeader} from "@/components/ui"

import {useAssociados} from "../hooks/useAssociados"

import {AssociadoTable} from "../components/AssociadoTable"


export default function AssociadosPage(){

const {
dados
}=useAssociados()


return (

<div>

<PageHeader
title="Associados"
description="Gestão completa dos associados"
/>


<AssociadoTable
dados={dados}
/>


</div>

)

}

'@ | Set-Content "$base/pages/AssociadosPage.tsx"



@'
import {AssociadoForm} from "../components/AssociadoForm"


export default function NovoAssociadoPage(){

return (

<div>

<h1>
Novo Associado
</h1>


<AssociadoForm/>


</div>

)

}

'@ | Set-Content "$base/pages/NovoAssociadoPage.tsx"



@'
export default function EditarAssociadoPage(){

return (

<div>

Editar Associado

</div>

)

}

'@ | Set-Content "$base/pages/EditarAssociadoPage.tsx"



@'
export default function DetalhesAssociadoPage(){

return (

<div>

Detalhes Associado

</div>

)

}

'@ | Set-Content "$base/pages/DetalhesAssociadoPage.tsx"



# ===============================
# ROUTES
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

'@ | Set-Content "$base/routes/associados.routes.tsx"



# ===============================
# INDEX
# ===============================

@'
export {}
'@ | Set-Content "$base/utils/index.ts"



Write-Host ""
Write-Host "Modulo Associados criado com sucesso!" -ForegroundColor Green
Write-Host ""