// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: plantao.types.ts
// ======================================================

export const DiaSemanaPlantao = {
  SEG: "seg",
  TER: "ter",
  QUA: "qua",
  QUI: "qui",
  SEX: "sex",
} as const;

export type DiaSemanaPlantao = typeof DiaSemanaPlantao[keyof typeof DiaSemanaPlantao];

export interface EntradaPlantao {
  id: string;
  instrutorId: string;
  dia: DiaSemanaPlantao;
  horario: string;
}