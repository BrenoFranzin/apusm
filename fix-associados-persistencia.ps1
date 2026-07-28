$base="src/modules/associados"


@'
import {useMemo,useState} from "react"

import {associadosMock} from "../data/associados.mock"

import type {Associado} from "../types/associado.types"



const STORAGE="apusm_associados"



export function useAssociados(){


const [dados,setDados]=useState<Associado[]>(()=>{


const salvo=
localStorage.getItem(STORAGE)


return salvo
?
JSON.parse(salvo)
:
associadosMock


})



function salvar(lista:Associado[]){

setDados(lista)

localStorage.setItem(

STORAGE,

JSON.stringify(lista)

)

}




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





function adicionar(novo:Associado){


salvar([

...dados,

novo

])


}




function excluir(id:string){


salvar(

dados.filter(

a=>a.id!==id

)

)


}




function atualizar(

id:string,

novo:Associado

){


salvar(

dados.map(

a=>

a.id===id

?

novo

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

adicionar,

excluir,

atualizar


}


}

'@ | Set-Content "$base/hooks/useAssociados.ts"



Write-Host "Persistencia criada"