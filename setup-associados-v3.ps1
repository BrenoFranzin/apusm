$base="src/modules/associados"

Write-Host "INICIANDO ASSOCIADOS V3"


# Criar pastas

$folders=@(
"$base/components",
"$base/data",
"$base/hooks",
"$base/pages",
"$base/routes",
"$base/services",
"$base/types",
"$base/utils"
)


foreach($folder in $folders){

New-Item -ItemType Directory -Force -Path $folder | Out-Null

}



# TYPES

@'
export type StatusAssociado =
"ATIVO" |
"PENDENTE" |
"INATIVO"


export interface Associado {

id:string

nome:string

cpf:string

rg:string

nascimento:string

sexo:string

telefone:string

whatsapp:string

email:string

endereco:string

cidade:string

cep:string

observacoes:string

status:StatusAssociado

cadastro:string


modalidades:string[]

turmas:string[]

frequencia:number

historico:string[]

pagamentos:string[]

}
'@ | Set-Content "$base/types/associado.types.ts"



# MOCK


@'
import { Associado } from "../types/associado.types"


export const associadosMock:Associado[]=[


{
id:"1",
nome:"João Silva",
cpf:"111.222.333-44",
rg:"123456",
nascimento:"1990-01-01",
sexo:"Masculino",
telefone:"51999999999",
whatsapp:"51999999999",
email:"joao@email.com",
endereco:"Rua A",
cidade:"Porto Alegre",
cep:"90000-000",
observacoes:"",
status:"ATIVO",
cadastro:"2026-01-10",
modalidades:["Pilates"],
turmas:["Segunda 14h"],
frequencia:90,
historico:["Cadastro criado"],
pagamentos:["Janeiro pago"]
},


{
id:"2",
nome:"Maria Souza",
cpf:"555.666.777-88",
rg:"654321",
nascimento:"1985-02-02",
sexo:"Feminino",
telefone:"51988888888",
whatsapp:"51988888888",
email:"maria@email.com",
endereco:"Rua B",
cidade:"Canoas",
cep:"92000-000",
observacoes:"",
status:"PENDENTE",
cadastro:"2026-02-10",
modalidades:["Yoga"],
turmas:["Terça 18h"],
frequencia:70,
historico:["Aguardando confirmação"],
pagamentos:["Pendente"]

}


]
'@ | Set-Content "$base/data/associados.mock.ts"



# SERVICE


@'
import api from "@/services/api"

import { Associado } from "../types/associado.types"


export const associadosService={


listar(){

return api.get<Associado[]>("/associados")

},


buscar(id:string){

return api.get<Associado>(`/associados/${id}`)

},


criar(data:Associado){

return api.post("/associados",data)

},


editar(id:string,data:Associado){

return api.put(`/associados/${id}`,data)

},


excluir(id:string){

return api.delete(`/associados/${id}`)

}


}
'@ | Set-Content "$base/services/associados.service.ts"



# HOOK


@'
import {useMemo,useState} from "react"

import {associadosMock} from "../data/associados.mock"


export function useAssociados(){


const [dados,setDados]=useState(associadosMock)

const [busca,setBusca]=useState("")

const [status,setStatus]=useState("TODOS")



const associados=useMemo(()=>{


return dados.filter(a=>{


const texto=busca.toLowerCase()


const encontrou=

a.nome.toLowerCase().includes(texto)
||
a.cpf.includes(texto)
||
a.telefone.includes(texto)
||
a.email.toLowerCase().includes(texto)


const filtro=

status==="TODOS"
||
a.status===status


return encontrou && filtro


})


},[dados,busca,status])



function excluir(id:string){

setDados(
dados.filter(
a=>a.id!==id
)
)

}



return {

associados,

busca,

setBusca,

status,

setStatus,

excluir

}


}
'@ | Set-Content "$base/hooks/useAssociados.ts"



Write-Host "PARTE 1 OK"

# ======================================================
# COMPONENTES ASSOCIADOS V3
# PARTE 2/5
# ======================================================


$base="src/modules/associados"



# ======================================================
# ASSOCIADO CARD
# ======================================================


@'
import {Card} from "@/components/ui"

import {Associado} from "../types/associado.types"



interface Props{

associados:Associado[]

}



export function AssociadoCard({associados}:Props){


const total=associados.length

const ativos=
associados.filter(
a=>a.status==="ATIVO"
).length


const pendentes=
associados.filter(
a=>a.status==="PENDENTE"
).length



return (

<div className="grid grid-cols-3 gap-4 mb-6">


<Card>

<h3>Total</h3>

<p className="text-3xl font-bold">
{total}
</p>

</Card>


<Card>

<h3>Ativos</h3>

<p className="text-3xl font-bold">
{ativos}
</p>

</Card>


<Card>

<h3>Pendentes</h3>

<p className="text-3xl font-bold">
{pendentes}
</p>

</Card>


</div>

)

}
'@ | Set-Content "$base/components/AssociadoCard.tsx"



# ======================================================
# TABELA PROFISSIONAL
# ======================================================


@'
import {Associado} from "../types/associado.types"



interface Props{

dados:Associado[]

onExcluir:(id:string)=>void

}



export function AssociadoTable({

dados,

onExcluir

}:Props){



return (

<div className="bg-white rounded-xl shadow overflow-hidden">


<table className="w-full">


<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
Nome
</th>


<th className="p-3 text-left">
CPF
</th>


<th className="p-3 text-left">
Telefone
</th>


<th className="p-3 text-left">
Cidade
</th>


<th className="p-3 text-left">
Status
</th>


<th className="p-3 text-left">
Cadastro
</th>


<th>
Ações
</th>


</tr>

</thead>



<tbody>


{

dados.map(a=>(


<tr key={a.id}
className="border-t">


<td className="p-3">
{a.nome}
</td>


<td className="p-3">
{a.cpf}
</td>


<td className="p-3">
{a.telefone}
</td>


<td className="p-3">
{a.cidade}
</td>


<td className="p-3">

<span className="px-3 py-1 rounded bg-gray-200">

{a.status}

</span>

</td>


<td className="p-3">
{a.cadastro}
</td>


<td className="p-3 flex gap-2">


<button
className="px-3 py-1 bg-blue-500 text-white rounded">

Ver

</button>



<button
className="px-3 py-1 bg-yellow-500 text-white rounded">

Editar

</button>



<button

onClick={()=>onExcluir(a.id)}

className="px-3 py-1 bg-red-500 text-white rounded">

Excluir

</button>


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



# ======================================================
# FORMULÁRIO REACT HOOK FORM + ZOD
# ======================================================


@'
import {useForm} from "react-hook-form"

import {zodResolver} from "@hookform/resolvers/zod"

import {z} from "zod"



const schema=z.object({

nome:z.string()
.min(3,"Informe o nome"),

cpf:z.string()
.min(11,"CPF inválido"),

email:z.string()
.email("Email inválido")
.optional()

})



type FormData=z.infer<typeof schema>



export function AssociadoForm(){



const {

register,

handleSubmit,

formState:{errors}

}=useForm<FormData>({

resolver:zodResolver(schema)

})



function salvar(data:FormData){

console.log(data)

}



return (

<form

onSubmit={
handleSubmit(salvar)
}

className="space-y-4"


>


<input

{...register("nome")}

placeholder="Nome completo"

className="border p-2 w-full"

/>


<p className="text-red-500">

{errors.nome?.message}

</p>




<input

{...register("cpf")}

placeholder="CPF"

className="border p-2 w-full"

/>


<p className="text-red-500">

{errors.cpf?.message}

</p>




<input

{...register("email")}

placeholder="Email"

className="border p-2 w-full"

/>



<p className="text-red-500">

{errors.email?.message}

</p>



<button

className="bg-green-600 text-white px-5 py-2 rounded"

>

Salvar Associado

</button>


</form>

)


}
'@ | Set-Content "$base/components/AssociadoForm.tsx"



Write-Host "PARTE 2 OK"

# ======================================================
# PAGINAS ASSOCIADOS V3
# PARTE 3/5
# ======================================================


$base="src/modules/associados"



# ======================================================
# LISTAGEM ASSOCIADOS
# ======================================================


@'
import {PageHeader} from "@/components/ui"

import {useAssociados} from "../hooks/useAssociados"

import {AssociadoCard} from "../components/AssociadoCard"

import {AssociadoTable} from "../components/AssociadoTable"



export function AssociadosPage(){


const {

associados,

busca,

setBusca,

status,

setStatus,

excluir

}=useAssociados()



return (

<div>


<PageHeader

title="Associados"

description="Gestão de associados APUSM"

/>



<AssociadoCard

associados={associados}

/>



<div className="flex gap-3 mb-5">


<input

value={busca}

onChange={
e=>setBusca(e.target.value)
}

placeholder="Buscar nome, CPF, telefone ou email"

className="border p-2 rounded flex-1"

/>



<select

value={status}

onChange={
e=>setStatus(e.target.value)
}

className="border p-2 rounded"

>


<option value="TODOS">
Todos
</option>


<option value="ATIVO">
Ativos
</option>


<option value="PENDENTE">
Pendentes
</option>


<option value="INATIVO">
Inativos
</option>


</select>



</div>




<AssociadoTable

dados={associados}

onExcluir={excluir}

/>



</div>

)

}
'@ | Set-Content "$base/pages/AssociadosPage.tsx"




# ======================================================
# NOVO ASSOCIADO
# ======================================================


@'
import {PageHeader} from "@/components/ui"

import {AssociadoForm} from "../components/AssociadoForm"



export function NovoAssociadoPage(){


return (

<div>


<PageHeader

title="Novo Associado"

description="Cadastrar novo associado"

/>


<AssociadoForm/>


</div>

)


}
'@ | Set-Content "$base/pages/NovoAssociadoPage.tsx"




# ======================================================
# EDITAR ASSOCIADO
# ======================================================


@'
import {PageHeader} from "@/components/ui"



export function EditarAssociadoPage(){


return (

<div>


<PageHeader

title="Editar Associado"

description="Alteração cadastral"

/>



<p>

Tela preparada para edição via API.

</p>



</div>

)


}
'@ | Set-Content "$base/pages/EditarAssociadoPage.tsx"





# ======================================================
# DETALHES ASSOCIADO
# ======================================================


@'
import {PageHeader} from "@/components/ui"



export function DetalhesAssociadoPage(){


return (

<div>


<PageHeader

title="Detalhes do Associado"

description="Ficha completa"

/>



<div className="grid gap-4">


<div className="border rounded p-4">

<h2 className="font-bold">

Dados pessoais

</h2>


<p>

Nome, CPF, RG, contatos e endereço.

</p>


</div>




<div className="border rounded p-4">


<h2 className="font-bold">

Modalidades

</h2>


<p>

Modalidades matriculadas.

</p>


</div>




<div className="border rounded p-4">


<h2 className="font-bold">

Turmas

</h2>


<p>

Turmas vinculadas.

</p>


</div>




<div className="border rounded p-4">


<h2 className="font-bold">

Frequência

</h2>


<p>

Histórico de presença.

</p>


</div>




<div className="border rounded p-4">


<h2 className="font-bold">

Financeiro

</h2>


<p>

Pagamentos e histórico.

</p>


</div>


</div>


</div>

)

}
'@ | Set-Content "$base/pages/DetalhesAssociadoPage.tsx"



Write-Host "PARTE 3 OK"

# ======================================================
# ROTAS ASSOCIADOS V3
# PARTE 4/5
# ======================================================


$base="src/modules/associados"



# ======================================================
# ROTAS DO MODULO
# ======================================================


@'
import {
Routes,
Route
}
from "react-router-dom"


import {AssociadosPage}

from "../pages/AssociadosPage"


import {NovoAssociadoPage}

from "../pages/NovoAssociadoPage"


import {EditarAssociadoPage}

from "../pages/EditarAssociadoPage"


import {DetalhesAssociadoPage}

from "../pages/DetalhesAssociadoPage"



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

path="/editar/:id"

element={<EditarAssociadoPage/>}

/>



<Route

path="/:id"

element={<DetalhesAssociadoPage/>}

/>


</Routes>

)


}
'@ | Set-Content "$base/routes/associados.routes.tsx"



# ======================================================
# INDEX DO MODULO
# ======================================================


@'
export * from "./pages/AssociadosPage"

export * from "./pages/NovoAssociadoPage"

export * from "./pages/EditarAssociadoPage"

export * from "./pages/DetalhesAssociadoPage"
'@ | Set-Content "$base/index.ts"




# ======================================================
# FINAL
# ======================================================


Write-Host ""
Write-Host "====================================="
Write-Host " ASSOCIADOS V3 ROTAS CRIADAS "
Write-Host "====================================="

# ======================================================
# FINAL ASSOCIADOS V3
# PARTE 5/5
# ======================================================


Write-Host ""
Write-Host "Configurando integração final..."



# ======================================================
# API AXIOS
# ======================================================


$apiPath="src/services/api.ts"


if(!(Test-Path $apiPath)){


New-Item -ItemType Directory -Force -Path "src/services" | Out-Null



@'
import axios from "axios"


const api = axios.create({

baseURL:"http://localhost:3000/api",

headers:{

"Content-Type":"application/json"

}

})


export default api

'@ | Set-Content $apiPath


Write-Host "api.ts criado"

}
else{

Write-Host "api.ts já existe"

}





# ======================================================
# CORREÇÃO INDEX EXPORT UI
# ======================================================


$indexPath="src/modules/associados/routes/associados.routes.tsx"


if(Test-Path $indexPath){

Write-Host "Rotas Associados encontradas"

}
else{

Write-Host "ATENÇÃO: rota não encontrada"

}




# ======================================================
# GARANTIR IMPORT NO ROUTER PRINCIPAL
# ======================================================


$routeMain="src/routes/index.tsx"


if(Test-Path $routeMain){


$content=Get-Content $routeMain -Raw



if($content -notmatch "associados.routes"){


Write-Host ""
Write-Host "IMPORTANTE:"
Write-Host "Adicionar manualmente no router:"
Write-Host "import { AssociadosRoutes } from '@/modules/associados/routes/associados.routes'"
Write-Host ""

}


}





# ======================================================
# FINAL
# ======================================================


Write-Host ""
Write-Host "====================================="
Write-Host " ASSOCIADOS V3 FINALIZADO "
Write-Host "====================================="

Write-Host ""

Write-Host "Agora execute:"

Write-Host "npm run build"

Write-Host ""

Write-Host "Depois:"

Write-Host "npm run dev"
