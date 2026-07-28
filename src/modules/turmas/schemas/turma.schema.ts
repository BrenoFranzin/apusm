// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: turma.schema.ts
// ======================================================

import { z } from "zod";
import { DiaSemana } from "../types/turma.types";

export const turmaSchema = z.object({
  modalidadeId: z.string().min(1, "Selecione a modalidade"),
  instrutorId: z.string().min(1, "Selecione o instrutor"),
  dia: z.nativeEnum(DiaSemana),
  horario: z.string().min(1, "Selecione o horário"),
  sala: z.string().min(1, "Selecione a sala"),
});

export type TurmaFormData = z.infer<typeof turmaSchema>;