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
  limiteVagas: z.coerce.number().int().min(1, "MÃ­nimo 1").default(10),
  limiteNovosAlunos: z.coerce.number().int().min(0, "MÃ­nimo 0").default(9),
});

export type TurmaFormData = z.infer<typeof turmaSchema>;