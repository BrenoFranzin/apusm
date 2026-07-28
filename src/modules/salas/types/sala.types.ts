// ======================================================
// APUSM SaaS
// Módulo: Salas
// Arquivo: sala.types.ts
// ======================================================

export interface Sala {
  id: string;
  nome: string;
}

export interface CriarSalaDTO {
  nome: string;
}

export interface AtualizarSalaDTO {
  nome?: string;
}