// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidade.types.ts
// ======================================================

export interface Modalidade {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  salas: string[];
  instrutoresIds: string[];
}

export interface CriarModalidadeDTO {
  nome: string;
  icone: string;
  cor: string;
  salas: string[];
}

export type AtualizarModalidadeDTO = Partial<CriarModalidadeDTO>;