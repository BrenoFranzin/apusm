// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoSearch.tsx
// ======================================================


interface Props {

  valor:string;

  onChange:
    (valor:string)=>void;

}


export default function AssociadoSearch({
  valor,
  onChange
}:Props){


return (

<input

value={valor}

onChange={(e)=>
onChange(e.target.value)
}

placeholder="
Buscar por nome ou telefone
"

className="
w-full
border
rounded-lg
p-3
outline-none
focus:ring-2
focus:ring-green-600
"

/>

);


}