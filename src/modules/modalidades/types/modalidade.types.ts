// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidade.types.ts
// ======================================================

export interface Modalidade {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  sala: string;
  instrutoresIds: string[];
}

export interface CriarModalidadeDTO {
  nome: string;
  icone: string;
  cor: string;
  sala: string;
}

export type AtualizarModalidadeDTO = Partial<CriarModalidadeDTO>;