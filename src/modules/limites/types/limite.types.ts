// ======================================================
// APUSM SaaS — Módulo Limites
// Arquivo: limite.types.ts
// ======================================================

export interface LimiteModalidade {
  modalidadeId: string;
  modalidadeNome: string;
  limiteTurmas: number;
}

export interface ConfiguracaoLimites {
  limitePadrao: number;
  excecoes: LimiteModalidade[];
}