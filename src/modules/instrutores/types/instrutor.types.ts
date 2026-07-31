// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutor.types.ts
// ======================================================

export interface Instrutor {
  id: string;
  nome: string;
  cor: string;
  especialidades: string[];
  terceirizado: boolean;
}

export interface CriarInstrutorDTO {
  nome: string;
  cor: string;
  especialidade: string;
  terceirizado: boolean;
}

export type AtualizarInstrutorDTO = Partial<CriarInstrutorDTO>;