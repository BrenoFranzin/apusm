// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: StatusBadge.tsx
// ======================================================

import type { StatusAssociado } from "../types/associado.types";


interface Props {

  status: StatusAssociado;

}


export default function StatusBadge({
  status
}: Props) {


  const estilos = {

    ATIVO:
      "bg-green-100 text-green-700",

    PENDENTE:
      "bg-yellow-100 text-yellow-700",

    INATIVO:
      "bg-gray-100 text-gray-700",

    BLOQUEADO:
      "bg-red-100 text-red-700",

  };


  return (

    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${estilos[status]}
      `}
    >

      {status}

    </span>

  );

}