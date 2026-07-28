// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoCard.tsx
// Estrutura simplificada
// ======================================================


import type {
  Associado
} from "../types/associado.types";



interface Props {

  associado: Associado;

  onEditar?: (
    associado: Associado
  ) => void;


  onExcluir?: (
    id:string
  ) => void;

}




export function AssociadoCard({

  associado,

  onEditar,

  onExcluir

}:Props){



return (

<div
style={{
border:"1px solid #ddd",
borderRadius:"12px",
padding:"16px",
marginBottom:"12px"
}}
>


<h3>
{associado.nome}
</h3>



<p>
📞 {associado.telefone}
</p>



<p>
Status:
{" "}
<strong>
{associado.status}
</strong>
</p>



<p>
Cadastro:
{" "}
{associado.dataCadastro}
</p>





<div
style={{
display:"flex",
gap:"10px",
marginTop:"15px"
}}
>


{
onEditar && (

<button

onClick={()=>onEditar(associado)}

>

Editar

</button>

)
}




{
onExcluir && (

<button

onClick={()=>onExcluir(associado.id)}

>

Excluir

</button>

)

}



</div>



</div>

);


}