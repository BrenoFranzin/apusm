
// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: associados.store.ts
// ======================================================

import { create } from "zustand";

import type {
  Associado,
} from "../types/associado.types";


import {
  associadosService,
} from "../services/associados.service";


// ======================================================
// TIPAGEM DA STORE
// ======================================================

interface AssociadosStore {


  associados: Associado[];


  selecionado:
    Associado | null;


  loading:boolean;


  erro:string | null;



  carregar:
    () => Promise<void>;



  selecionar:
    (
      associado:Associado | null
    ) => void;



  adicionar:
    (
      associado:Associado
    ) => void;



  atualizar:
    (
      associado:Associado
    ) => void;



  remover:
    (
      id:string
    ) => void;


}



// ======================================================
// STORE
// ======================================================


export const useAssociadosStore =
create<AssociadosStore>((set)=>({



  associados:[],


  selecionado:null,


  loading:false,


  erro:null,



  // ==========================
  // CARREGAR
  // ==========================

  carregar:
  async()=>{


    try{


      set({
        loading:true,
        erro:null
      });



      const dados =
        await associadosService.listar();



      set({

        associados:dados,

        loading:false

      });



    }catch{


      set({

        erro:
        "Erro ao carregar associados",

        loading:false

      });


    }


  },



  // ==========================
  // SELECIONAR
  // ==========================

  selecionar:
  (associado)=>{


    set({

      selecionado:
      associado

    });


  },



  // ==========================
  // ADICIONAR
  // ==========================

  adicionar:
  (associado)=>{


    set((state)=>({

      associados:[
        ...state.associados,
        associado
      ]

    }));


  },



  // ==========================
  // ATUALIZAR
  // ==========================

  atualizar:
  (associado)=>{


    set((state)=>({


      associados:

      state.associados.map(
        (item)=>

        item.id === associado.id

        ?

        associado

        :

        item

      )


    }));


  },



  // ==========================
  // REMOVER
  // ==========================

  remover:
  (id)=>{


    set((state)=>({


      associados:

      state.associados.filter(

        (item)=>

        item.id !== id

      )


    }));


  },


}));