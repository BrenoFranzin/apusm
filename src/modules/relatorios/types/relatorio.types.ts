// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: relatorio.types.ts
// ======================================================

export interface TurmaDoAssociado {
  turmaId: string;
  turmaNome: string;
  modalidadeNome: string;
  dataMatricula: string;
}

export interface FilaDoAssociado {
  turmaId: string;
  turmaNome: string;
  modalidadeNome: string;
  posicao: number;
}

export interface RelatorioAssociado {
  associadoId: string;
  associadoNome: string;
  turmas: TurmaDoAssociado[];
  filasDeEspera: FilaDoAssociado[];
}