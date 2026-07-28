// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: DetalhesAssociadoPage.tsx
// ======================================================

import {
  useEffect,
  useState
} from "react";


import {
  useParams
} from "react-router-dom";

import { 
  formatarTelefone 
} from "../utils/telefone";

import {
  useAssociados
} from "../hooks/useAssociados";


import type {
  Associado
} from "../types/associado.types";



export default function DetalhesAssociadoPage(){


const {
  buscarPorId
}=useAssociados();



const {
  id
}=useParams();



const [associado,setAssociado]
=
useState<Associado | null>(null);



const [loading,setLoading]
=
useState(true);




useEffect(()=>{


async function carregar(){


if(!id)
return;


const dados =
await buscarPorId(id);



setAssociado(
  dados ?? null
);


setLoading(false);


}



carregar();



},[
id,
buscarPorId
]);





if(loading){

return (

<div>

Carregando associado...

</div>

);

}




if(!associado){

return (

<div>

Associado não encontrado.

</div>

);

}





return (

<div
className="space-y-6"
>


<h1
className="
text-3xl
font-bold
"
>

{associado.nome}

</h1>




<div
className="
bg-white
rounded-xl
shadow
p-6
space-y-3
"
>


<p>

Telefone:
{formatarTelefone(associado.telefone)}

</p>


<p>

Status:
{associado.status}

</p>


</div>





<div
className="
bg-white
rounded-xl
shadow
p-6
"
>


<h2
className="
font-bold
text-xl
mb-3
"
>

Modalidades

</h2>




{
associado.matriculas.map(

(item)=>(

<p
key={item.id}
>

{item.modalidadeNome}

-

{item.turmaNome}

</p>

)

)

}



</div>




</div>

);


}