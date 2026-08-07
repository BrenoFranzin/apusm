// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: presencaSemanal.types.ts
// ======================================================

export interface RegistroPresencaSemanal {
  id: string;
  turmaId: string;
  ano: number;
  mes: number; // 0-11
  semana: number; // 1 a 5
  totalAlunos: number;
  observacao?: string;
}

export type SalvarPresencaSemanalDTO = Omit<RegistroPresencaSemanal, "id">;

export type StatusSemana = "cancelada" | "ferias" | "evento";

export interface StatusSemanalRegistro {
  id: string;
  ano: number;
  mes: number;
  semana: number;
  status: StatusSemana;
  turmaId?: string;
  motivo?: string;
}