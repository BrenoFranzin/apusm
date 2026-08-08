// ======================================================
// APUSM SaaS — Módulo Associados
// Arquivo: associado.types.ts
// ======================================================

export const StatusAssociado = {
  ATIVO: "ATIVO",
  PENDENTE: "PENDENTE",
  INATIVO: "INATIVO",
  BLOQUEADO: "BLOQUEADO",
} as const;

export type StatusAssociado = typeof StatusAssociado[keyof typeof StatusAssociado];

export interface Associado {
  id: string;
  nome: string;
  telefone: string;
  status: StatusAssociado;
  dataCadastro: string;

  matriculas: MatriculaAssociado[];
  frequencias: FrequenciaAssociado[];
  historico: HistoricoAssociado[];
}

export interface MatriculaAssociado {
  id: string;
  modalidadeId: string;
  modalidadeNome: string;
  turmaId: string;
  turmaNome: string;
  dataMatricula: string;
  status: string;
  observacao?: string;
}

export interface FrequenciaAssociado {
  id: string;
  data: string;
  presente: boolean;
}

export interface HistoricoAssociado {
  id: string;
  data: string;
  descricao: string;
}

export interface CriarAssociadoDTO {
  nome: string;
  telefone: string;
  status: StatusAssociado;
}

export type AtualizarAssociadoDTO = Partial<CriarAssociadoDTO>;