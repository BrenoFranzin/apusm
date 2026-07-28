# ======================================================
# APUSM MODALIDADES
# ASSOCIADOS V4 COMPLETO
# PARTE 1/4
# ======================================================


$base="src/modules/associados"


Write-Host "INICIANDO ASSOCIADOS V4"



# ======================================================
# TYPE COMPLETO
# ======================================================


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




# ======================================================
# SERVICE PREPARADO API
# ======================================================


@'
import {api} from "@/services/api"

import type {Associado} from "../types/associado.types"



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




# ======================================================
# HOOK CRUD PREPARADO
# ======================================================


@'
import {useMemo,useState} from "react"


import {associadosMock} from "../data/associados.mock"


import type {Associado}

from "../types/associado.types"



export function useAssociados(){



const [dados,setDados]=useState<Associado[]>(associadosMock)



const [busca,setBusca]=useState("")


const [status,setStatus]=useState("TODOS")




const associados=useMemo(()=>{


return dados.filter(a=>{


const texto=

busca.toLowerCase()



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


const confirmar=

window.confirm(
"Excluir associado?"
)


if(!confirmar)
return



setDados(

dados.filter(
a=>a.id!==id
)

)



}





function adicionar(novo:Associado){


setDados([

...dados,

novo

])


}




function atualizar(

id:string,

dadosEditados:Associado

){



setDados(

dados.map(

a=>

a.id===id

?

dadosEditados

:

a

)

)



}




return{


associados,


busca,

setBusca,


status,

setStatus,


excluir,


adicionar,


atualizar


}



}

'@ | Set-Content "$base/hooks/useAssociados.ts"




Write-Host "PARTE 1 OK"

# ======================================================
# ASSOCIADOS V4
# PARTE 2/4
# FORMULARIO COMPLETO
# ======================================================


$base="src/modules/associados"



@'
import {useForm} from "react-hook-form"

import {z} from "zod"

import {zodResolver} from "@hookform/resolvers/zod"

import type {Associado} from "../types/associado.types"



const schema=z.object({


nome:z.string()
.min(3,"Nome obrigatório"),


cpf:z.string()
.min(11,"CPF inválido"),


rg:z.string()
.optional(),


nascimento:z.string()
.optional(),


sexo:z.string()
.optional(),


telefone:z.string()
.min(8,"Telefone inválido"),


whatsapp:z.string()
.optional(),


email:z.string()
.email("Email inválido")
.optional()
.or(z.literal("")),



endereco:z.string()
.optional(),


cidade:z.string()
.optional(),


cep:z.string()
.optional(),


observacoes:z.string()
.optional(),



status:z.enum([
"ATIVO",
"PENDENTE",
"INATIVO"
])



})



type FormData=z.infer<typeof schema>




interface Props{

initial?:Partial<Associado>

onSave:(data:any)=>void

}



export function AssociadoForm({

initial,

onSave

}:Props){



const {

register,

handleSubmit,

formState:{errors}


}=useForm<FormData>({


resolver:zodResolver(schema),


defaultValues:{

status:"ATIVO",

...initial


}


})




return(



<form

onSubmit={

handleSubmit(onSave)

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





<input

{...register("rg")}

placeholder="RG"

className="border p-2 w-full"

/>





<input

type="date"

{...register("nascimento")}

className="border p-2 w-full"

/>





<select

{...register("sexo")}

className="border p-2 w-full"

>


<option value="">
Sexo
</option>


<option>
Masculino
</option>


<option>
Feminino
</option>


</select>





<input

{...register("telefone")}

placeholder="Telefone"

className="border p-2 w-full"

/>





<input

{...register("whatsapp")}

placeholder="WhatsApp"

className="border p-2 w-full"

/>





<input

{...register("email")}

placeholder="Email"

className="border p-2 w-full"

/>





<input

{...register("endereco")}

placeholder="Endereço"

className="border p-2 w-full"

/>





<input

{...register("cidade")}

placeholder="Cidade"

className="border p-2 w-full"

/>





<input

{...register("cep")}

placeholder="CEP"

className="border p-2 w-full"

/>





<textarea

{...register("observacoes")}

placeholder="Observações"

className="border p-2 w-full"

/>





<select

{...register("status")}

className="border p-2 w-full"

>


<option value="ATIVO">
Ativo
</option>


<option value="PENDENTE">
Pendente
</option>


<option value="INATIVO">
Inativo
</option>


</select>






<button

className="
bg-green-700
text-white
px-5
py-2
rounded
"

>

Salvar Associado

</button>



</form>


)


}

'@ | Set-Content "$base/components/AssociadoForm.tsx"




Write-Host "PARTE 2 OK"


# ======================================================
# ASSOCIADOS V4
# PARTE 3/4
# PAGINAS NOVO / EDITAR / DETALHES
# ======================================================


$base="src/modules/associados"



# ======================================================
# NOVO ASSOCIADO
# ======================================================


@'
import {PageHeader} from "@/components/ui"

import {useNavigate} from "react-router-dom"

import {AssociadoForm} from "../components/AssociadoForm"

import type {Associado} from "../types/associado.types"



export function NovoAssociadoPage(){


const navigate=useNavigate()



function salvar(data:any){


const novo:Associado={


id:crypto.randomUUID(),

cadastro:new Date()
.toISOString()
.substring(0,10),


modalidades:[],

turmas:[],

frequencia:0,

historico:[],

pagamentos:[],


...data


}



console.log(novo)


alert("Associado criado")


navigate("/associados")


}



return(

<div>


<PageHeader

title="Novo Associado"

description="Cadastro completo"

/>



<AssociadoForm

onSave={salvar}

/>


</div>

)


}

'@ | Set-Content "$base/pages/NovoAssociadoPage.tsx"





# ======================================================
# EDITAR ASSOCIADO
# ======================================================


@'
import {PageHeader} from "@/components/ui"

import {useParams,useNavigate} from "react-router-dom"

import {associadosMock} from "../data/associados.mock"

import {AssociadoForm} from "../components/AssociadoForm"



export function EditarAssociadoPage(){


const {id}=useParams()


const navigate=useNavigate()



const associado=

associadosMock.find(

a=>a.id===id

)



if(!associado){

return <h1>
Associado não encontrado
</h1>

}




function salvar(data:any){


console.log({

...associado,

...data

})


alert("Associado atualizado")


navigate("/associados")


}





return(

<div>


<PageHeader

title="Editar Associado"

description="Atualização cadastral"

/>



<AssociadoForm

initial={associado}

onSave={salvar}

/>


</div>

)


}

'@ | Set-Content "$base/pages/EditarAssociadoPage.tsx"






# ======================================================
# DETALHES PROFISSIONAL
# ======================================================


@'
import {useParams} from "react-router-dom"

import {associadosMock} from "../data/associados.mock"



export function DetalhesAssociadoPage(){


const {id}=useParams()



const associado=

associadosMock.find(

a=>a.id===id

)



if(!associado){

return (

<h1>

Associado não encontrado

</h1>

)

}



return(

<div className="space-y-5">



<h1 className="text-3xl font-bold">

{associado.nome}

</h1>




<div className="border rounded p-5 space-y-2">


<h2 className="font-bold text-xl">

Dados pessoais

</h2>


<p>
CPF: {associado.cpf}
</p>


<p>
RG: {associado.rg}
</p>


<p>
Nascimento: {associado.nascimento}
</p>


<p>
Sexo: {associado.sexo}
</p>


</div>





<div className="border rounded p-5 space-y-2">


<h2 className="font-bold text-xl">

Contato

</h2>


<p>
Telefone: {associado.telefone}
</p>


<p>
WhatsApp: {associado.whatsapp}
</p>


<p>
Email: {associado.email}
</p>


</div>





<div className="border rounded p-5">


<h2 className="font-bold text-xl">

Endereço

</h2>


<p>
{associado.endereco}
</p>


<p>
{associado.cidade}
</p>


<p>
{associado.cep}
</p>


</div>





<div className="border rounded p-5">


<h2 className="font-bold text-xl">

Modalidades

</h2>


{
associado.modalidades.map(item=>(

<p key={item}>
{item}
</p>

))

}


</div>





<div className="border rounded p-5">


<h2 className="font-bold text-xl">

Turmas

</h2>


{
associado.turmas.map(item=>(

<p key={item}>
{item}
</p>

))

}


</div>





</div>

)


}

'@ | Set-Content "$base/pages/DetalhesAssociadoPage.tsx"





Write-Host "PARTE 3 OK"

# ======================================================
# ASSOCIADOS V4
# PARTE 4/4
# ROTAS + TABELA + AJUSTES FINAIS
# ======================================================


$base="src/modules/associados"



# ======================================================
# ROTAS COMPLETAS
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



return(


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
# TABELA FINAL
# ======================================================


@'
import {Link} from "react-router-dom"

import type {Associado}

from "../types/associado.types"



interface Props{

dados:Associado[]

onExcluir:(id:string)=>void

}




export function AssociadoTable({

dados,

onExcluir

}:Props){



return(


<div className="overflow-auto">


<table className="w-full bg-white">


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


<th className="p-3">
Ações
</th>


</tr>


</thead>



<tbody>


{

dados.map(a=>(



<tr

key={a.id}

className="border-t"



>


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

{a.status}

</td>




<td className="p-3 flex gap-2">


<Link

to={`/associados/${a.id}`}

className="bg-blue-600 text-white px-3 py-1 rounded"

>

Ver

</Link>




<Link

to={`/associados/editar/${a.id}`}

className="bg-yellow-600 text-white px-3 py-1 rounded"

>

Editar

</Link>





<button

onClick={()=>onExcluir(a.id)}

className="bg-red-600 text-white px-3 py-1 rounded"

>

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





Write-Host ""
Write-Host "======================================="
Write-Host " ASSOCIADOS V4 INSTALADO "
Write-Host "======================================="
Write-Host ""

Write-Host "Agora execute:"
Write-Host ""

Write-Host "npm run build"

Write-Host ""

Write-Host "Depois:"
Write-Host "npm run dev"

