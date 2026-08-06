// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: turma.types.ts
// ======================================================

export const DiaSemana = {
  SEG: "seg",
  TER: "ter",
  QUA: "qua",
  QUI: "qui",
  SEX: "sex",
  SAB: "sab",
} as const;

export type DiaSemana = typeof DiaSemana[keyof typeof DiaSemana];

export interface Turma {
  id: string;
  modalidadeId: string;
  instrutorId: string;
  dia: DiaSemana;
  horario: string;
  sala: string;
  limiteVagas?: number;
  limiteNovosAlunos?: number;
}

export interface CriarTurmaDTO {
  modalidadeId: string;
  instrutorId: string;
  dia: DiaSemana;
  horario: string;
  sala: string;
  limiteVagas?: number;
  limiteNovosAlunos?: number;
}

export type AtualizarTurmaDTO = Partial<CriarTurmaDTO>;