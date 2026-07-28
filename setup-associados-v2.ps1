# ==========================================
# APUSM MODALIDADES
# ASSOCIADOS V2 COMPLETO
# ==========================================


$base="src\modules\associados"


# ==========================
# PASTAS
# ==========================

$folders=@(
"$base\components",
"$base\data",
"$base\hooks",
"$base\pages",
"$base\routes",
"$base\services",
"$base\types",
"$base\utils"
)


foreach($folder in $folders){

New-Item `
-ItemType Directory `
-Force `
-Path $folder | Out-Null

}



# ==========================
# TYPE
# ==========================

@'
export type AssociadoStatus =
"ATIVO" |
"INATIVO" |
"PENDENTE"


export interface Associado {

id:string

nome:string

cpf:string

rg?:string

nascimento?:string

sexo?:string

telefone?:string

whatsapp?:string

email?:string

endereco?:string

cidade?:string

cep?:string

observacoes?:string

status:AssociadoStatus


modalidades:string[]

turmas:string[]

historico:string[]

pagamentos:string[]

createdAt:string

}

'@ | Out-File "$base\types\associado.types.ts" -Encoding utf8




# ==========================
# MOCK
# ==========================

@'
import type {Associado} from "../types/associado.types"


export const associadosMock:Associado[]=[

{
id:"1",
nome:"João Silva",
cpf:"000.000.000-00",
rg:"123",
telefone:"99999-9999",
whatsapp:"99999-9999",
email:"joao@email.com",
status:"ATIVO",
modalidades:[
"Pilates"
],
turmas:[
"Segunda 14h"
],
historico:[],
pagamentos:[],
createdAt:"2026-01-01"
},


{
id:"2",
nome:"Maria Souza",
cpf:"111.111.111-11",
rg:"456",
telefone:"98888-8888",
whatsapp:"98888-8888",
email:"maria@email.com",
status:"PENDENTE",
modalidades:[],
turmas:[],
historico:[],
pagamentos:[],
createdAt:"2026-01-01"
}

]

'@ | Out-File "$base\data\associados.mock.ts" -Encoding utf8





# ==========================
# HOOK
# ==========================

@'
import {useState} from "react"

import type {Associado} from "../types/associado.types"

import {associadosMock} from "../data/associados.mock"


export function useAssociados(){


const [dados,setDados]=useState<Associado[]>(
associadosMock
)



function excluir(id:string){

setDados(
prev =>
prev.filter(
item=>item.id!==id
)
)

}



return {

dados,

total:dados.length,

ativos:dados.filter(
item=>item.status==="ATIVO"
).length,


pendentes:dados.filter(
item=>item.status==="PENDENTE"
).length,


excluir

}


}

'@ | Out-File "$base\hooks\useAssociados.ts" -Encoding utf8





# ==========================
# CARD
# ==========================

@'
interface Props{

titulo:string

valor:number

}


export default function AssociadoCard({
titulo,
valor
}:Props){


return(

<div className="border rounded-lg p-5">

<p>

{titulo}

</p>


<h2 className="text-3xl font-bold">

{valor}

</h2>


</div>

)

}

'@ | Out-File "$base\components\AssociadoCard.tsx" -Encoding utf8





# ==========================
# TABLE
# ==========================

@'
import type {Associado} from "../types/associado.types"


interface Props{

dados:Associado[]

excluir:(id:string)=>void

}



export default function AssociadoTable({

dados,

excluir

}:Props){


return(

<table className="w-full mt-6">


<thead>

<tr>

<th>Nome</th>

<th>CPF</th>

<th>Status</th>

<th>Ação</th>

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



<td>

<button

onClick={()=>
excluir(item.id)
}

>

Excluir

</button>


</td>


</tr>

))

}


</tbody>


</table>


)

}

'@ | Out-File "$base\components\AssociadoTable.tsx" -Encoding utf8





# ==========================
# PAGE
# ==========================

@'
import {PageHeader} from "@/components/ui"

import {useAssociados} from "../hooks/useAssociados"

import AssociadoCard from "../components/AssociadoCard"

import AssociadoTable from "../components/AssociadoTable"



export default function AssociadosPage(){


const {

dados,

total,

ativos,

pendentes,

excluir

}=useAssociados()



return(

<div>


<PageHeader

title="Associados"

description="Gestão de associados APUSM"

/>



<div className="grid grid-cols-3 gap-4">


<AssociadoCard

titulo="Total"

valor={total}

/>


<AssociadoCard

titulo="Ativos"

valor={ativos}

/>


<AssociadoCard

titulo="Pendentes"

valor={pendentes}

/>


</div>



<AssociadoTable

dados={dados}

excluir={excluir}

/>


</div>

)


}

'@ | Out-File "$base\pages\AssociadosPage.tsx" -Encoding utf8





# ==========================
# FORM
# ==========================

@'
import {useForm} from "react-hook-form"

import type {Associado} from "../types/associado.types"



export default function AssociadoForm(){


const {

register,

handleSubmit

}=useForm<Associado>()



function salvar(data:Associado){

console.log(data)

}



return(

<form

onSubmit={handleSubmit(salvar)}

className="space-y-3"

>


<input

{...register("nome")}

placeholder="Nome completo"

/>


<input

{...register("cpf")}

placeholder="CPF"

/>


<button>

Salvar

</button>


</form>

)


}

'@ | Out-File "$base\components\AssociadoForm.tsx" -Encoding utf8





# ==========================
# PAGES EXTRAS
# ==========================


@'
import AssociadoForm from "../components/AssociadoForm"


export default function NovoAssociadoPage(){

return(

<div>

<h1 className="text-2xl">

Novo Associado

</h1>


<AssociadoForm/>

</div>

)

}

'@ | Out-File "$base\pages\NovoAssociadoPage.tsx" -Encoding utf8




@'
export default function EditarAssociadoPage(){

return <div>Editar Associado</div>

}

'@ | Out-File "$base\pages\EditarAssociadoPage.tsx" -Encoding utf8




@'
export default function DetalhesAssociadoPage(){

return <div>Detalhes Associado</div>

}

'@ | Out-File "$base\pages\DetalhesAssociadoPage.tsx" -Encoding utf8





Write-Host ""
Write-Host "================================="
Write-Host " ASSOCIADOS V2 CRIADO "
Write-Host "================================="