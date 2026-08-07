

// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: presencaSemanal.service.ts
// ======================================================

import type { RegistroPresencaSemanal, SalvarPresencaSemanalDTO, StatusSemana, StatusSemanalRegistro } from "../types/presencaSemanal.types";
const STORAGE_KEY = "apusm:presencaSemanal";
const STATUS_STORAGE_KEY = "apusm:presencaSemanal:status";

class PresencaSemanalService {
  private normalizar(r: any): RegistroPresencaSemanal {
    return {
      id: r?.id ?? crypto.randomUUID(),
      turmaId: r?.turmaId ?? "",
      ano: r?.ano ?? new Date().getFullYear(),
      mes: r?.mes ?? new Date().getMonth(),
      semana: r?.semana ?? 1,
      totalAlunos: r?.totalAlunos ?? 0,
      observacao: r?.observacao ?? "",
    };
  }

  private carregarStorage(): RegistroPresencaSemanal[] {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return [];
    const bruto = JSON.parse(dados);
    return (Array.isArray(bruto) ? bruto : []).map((r) => this.normalizar(r));
  }

  private salvarStorage(lista: RegistroPresencaSemanal[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listarPorMes(ano: number, mes: number): Promise<RegistroPresencaSemanal[]> {
    return this.carregarStorage().filter((r) => r.ano === ano && r.mes === mes);
  }

  async salvar(dados: SalvarPresencaSemanalDTO): Promise<RegistroPresencaSemanal> {
    const lista = this.carregarStorage();

    const existente = lista.find(
      (r) => r.turmaId === dados.turmaId && r.ano === dados.ano && r.mes === dados.mes && r.semana === dados.semana
    );

    if (existente) {
      existente.totalAlunos = dados.totalAlunos;
      existente.observacao = dados.observacao;
      this.salvarStorage(lista);
      return existente;
    }

    const novo: RegistroPresencaSemanal = { ...dados, id: crypto.randomUUID() };
    lista.push(novo);
    this.salvarStorage(lista);
    return novo;
  }
private carregarStatusStorage(): StatusSemanalRegistro[] {
    const dados = localStorage.getItem(STATUS_STORAGE_KEY);
    if (!dados) return [];
    const bruto = JSON.parse(dados);
    return Array.isArray(bruto) ? bruto : [];
  }

  private salvarStatusStorage(lista: StatusSemanalRegistro[]) {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(lista));
  }

  async listarStatusPorMes(ano: number, mes: number): Promise<StatusSemanalRegistro[]> {
    return this.carregarStatusStorage().filter((r) => r.ano === ano && r.mes === mes);
  }

  async salvarStatus(ano: number, mes: number, semana: number, status: StatusSemana | null, turmaId?: string): Promise<void> {
    const lista = this.carregarStatusStorage().filter(
      (r) => !(r.ano === ano && r.mes === mes && r.semana === semana && r.turmaId === turmaId)
    );
    if (status) {
      lista.push({ id: crypto.randomUUID(), ano, mes, semana, status, turmaId });
    }
    this.salvarStatusStorage(lista);
  }
}
export const presencaSemanalService = new PresencaSemanalService();
export default presencaSemanalService;