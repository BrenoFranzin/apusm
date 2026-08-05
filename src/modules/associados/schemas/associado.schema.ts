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
    .max(150)
    .transform((v) => v.toUpperCase()),
  telefone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 0 || v.length === 10 || v.length === 11, {
      message: "Telefone incompleto: informe com DDD (10 ou 11 dígitos) ou deixe em branco",
    }),
  status: z.nativeEnum(
    StatusAssociado
  )
});
export type AssociadoFormData =
z.infer<typeof associadoSchema>;