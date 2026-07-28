// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: listaEspera.types.ts
// ======================================================

export interface EntradaListaEspera {
  id: string;
  associadoId: string;
  associadoNome: string;
  turmaId: string;
  turmaNome: string;
  modalidadeId: string;
  modalidadeNome: string;
  dataEntrada: string;
  posicao: number;
}