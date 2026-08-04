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