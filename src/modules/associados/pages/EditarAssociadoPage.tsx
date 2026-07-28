// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: EditarAssociadoPage.tsx
// ======================================================


import {
  useEffect,
  useState
} from "react";


import {
  useParams,
  useNavigate
} from "react-router-dom";


import {
  useAssociados
} from "../hooks/useAssociados";


import AssociadoForm
from "../components/AssociadoForm";


import type {
  Associado
} from "../types/associado.types";





export default function EditarAssociadoPage(){



const {
  buscarPorId,
  atualizar
}=useAssociados();



const {
 id
}=useParams();



const navigate =
useNavigate();




const [
 associado,
 setAssociado
]
=
useState<Associado | null>(null);



const [
 loading,
 setLoading
]
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

Carregando...

</div>

);

}




if(!associado){

return (

<div>

Associado não encontrado

</div>

);

}





return (

<div>


<h1
className="
text-3xl
font-bold
mb-5
"
>

Editar Associado

</h1>




<AssociadoForm


valoresIniciais={
associado
}


onSubmit={
async(dados)=>{


await atualizar(

associado.id,

dados

);



navigate(
"/associados"
);


}

}



/>


</div>

);


}