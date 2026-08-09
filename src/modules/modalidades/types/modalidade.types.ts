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
  descricao?: string;
}
export interface CriarModalidadeDTO {
  nome: string;
  icone: string;
  cor: string;
  salas: string[];
  descricao?: string;
  instrutoresIds?: string[];
}
export type AtualizarModalidadeDTO = Partial<CriarModalidadeDTO>;