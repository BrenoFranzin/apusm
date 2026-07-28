# ======================================================
# APUSM ASSOCIADOS V3.1
# ROTAS + DETALHES + AÇÕES
# ======================================================


$base="src/modules/associados"



Write-Host "Atualizando Associados V3.1"



# ======================================================
# ASSOCIADOS PAGE
# ======================================================


@'
import {PageHeader} from "@/components/ui"

import {Link} from "react-router-dom"

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



<Link

to="/associados/novo"

className="
bg-green-700
text-white
px-4
py-2
rounded
inline-block
mb-5
"

>

+ Novo Associado

</Link>



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
# TABLE COM LINKS
# ======================================================


@'
import {Link} from "react-router-dom"

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

<table className="w-full bg-white">


<thead>

<tr>

<th>Nome</th>

<th>CPF</th>

<th>Status</th>

<th>Ações</th>

</tr>

</thead>



<tbody>


{dados.map(a=>(


<tr key={a.id}>


<td>

{a.nome}

</td>



<td>

{a.cpf}

</td>



<td>

{a.status}

</td>



<td className="space-x-2">


<Link

to={`/associados/${a.id}`}

className="bg-blue-500 text-white px-3 py-1 rounded"

>

Ver

</Link>



<Link

to={`/associados/editar/${a.id}`}

className="bg-yellow-500 text-white px-3 py-1 rounded"

>

Editar

</Link>



<button

onClick={()=>onExcluir(a.id)}

className="bg-red-500 text-white px-3 py-1 rounded"

>

Excluir

</button>


</td>


</tr>


))}


</tbody>


</table>

)

}
'@ | Set-Content "$base/components/AssociadoTable.tsx"





# ======================================================
# DETALHES ASSOCIADO
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

return <h1>Associado não encontrado</h1>

}



return (

<div>


<h1 className="text-3xl font-bold mb-5">

{associado.nome}

</h1>



<div className="space-y-3">


<p>
CPF: {associado.cpf}
</p>


<p>
Telefone: {associado.telefone}
</p>


<p>
Email: {associado.email}
</p>


<p>
Cidade: {associado.cidade}
</p>


<p>
Status: {associado.status}
</p>


<hr/>


<h2 className="font-bold">
Modalidades
</h2>


{
associado.modalidades.map(m=>(

<p key={m}>
{m}
</p>

))
}



<h2 className="font-bold">
Turmas
</h2>


{
associado.turmas.map(t=>(

<p key={t}>
{t}
</p>

))
}


</div>


</div>

)

}
'@ | Set-Content "$base/pages/DetalhesAssociadoPage.tsx"




Write-Host ""
Write-Host "ASSOCIADOS V3.1 FINALIZADO"
Write-Host ""
Write-Host "Executar:"
Write-Host "npm run build"