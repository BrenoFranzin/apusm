// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadosPage.tsx
// ======================================================

import { useNavigate } from "react-router-dom";

import { useAssociados } from "../hooks/useAssociados";

import AssociadoSearch from "../components/AssociadoSearch";

import AssociadoFilters from "../components/AssociadoFilters";

import AssociadoTable from "../components/AssociadoTable";



export default function AssociadosPage(){


const navigate = useNavigate();


const {

associados,

busca,

setBusca,

statusFiltro,

setStatusFiltro,

excluir

}=useAssociados();




return (

<div className="space-y-6">


<div className="
flex
justify-between
items-center
">


<div>

<h1 className="
text-3xl
font-bold
" style={{ color: "var(--page-heading)" }}>

Associados

</h1>


<p style={{ color: "var(--page-subheading)" }}>

Gestão de associados APUSM

</p>


</div>



<button

onClick={()=>
navigate("/associados/novo")
}

className="
bg-green-900
text-white
px-5
py-3
rounded-lg
"

>

+ Novo Associado

</button>



</div>




<div className="
grid
grid-cols-3
gap-4
">


<div className="apusm-card">
  <p style={{ color: "var(--text-secondary)" }}>Total</p>
  <strong className="text-2xl" style={{ color: "var(--text-primary)" }}>
    {associados.length}
  </strong>
</div>




<div className="apusm-card">
  <p style={{ color: "var(--text-secondary)" }}>Ativos</p>
  <strong className="text-2xl" style={{ color: "var(--text-primary)" }}>
    {associados.filter(a => a.status === "ATIVO").length}
  </strong>
</div>



<div className="apusm-card">
  <p style={{ color: "var(--text-secondary)" }}>Pendentes</p>
  <strong className="text-2xl" style={{ color: "var(--text-primary)" }}>
    {associados.filter(a => a.status === "PENDENTE").length}
  </strong>
</div>



</div>





<AssociadoSearch

valor={busca}

onChange={setBusca}

/>



<AssociadoFilters

valor={statusFiltro}

onChange={setStatusFiltro}

/>




<AssociadoTable


associados={associados}



onVisualizar={(id)=>

navigate(
`/associados/${id}`
)

}



onEditar={(id)=>

navigate(
`/associados/${id}/editar`
)

}



onExcluir={(id)=>

{

if(
confirm(
"Excluir associado?"
)
)

excluir(id);


}

}



/>



</div>

);


}