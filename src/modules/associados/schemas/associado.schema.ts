// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: associado.schema.ts
// Schema simplificado: nome + telefone
// ======================================================

import { z } from "zod";

import {
  StatusAssociado
} from "../types/associado.types";

export const associadoSchema = z.object({

  nome: z.string()
    .min(3, "Informe o nome completo")
    .max(150),

  telefone: z.string()
    .min(8, "Telefone inválido"),

  status: z.nativeEnum(
    StatusAssociado
  )

});

export type AssociadoFormData =
z.infer<typeof associadoSchema>;