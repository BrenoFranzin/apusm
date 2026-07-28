// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: turmas.service.ts
// ======================================================

import { turmasMock } from "../data/turmas.mock";

import type {
  Turma,
  CriarTurmaDTO,
  AtualizarTurmaDTO,
} from "../types/turma.types";

const STORAGE_KEY = "apusm:turmas";

class TurmasService {

  private carregarStorage(): Turma[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turmasMock));
      return turmasMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(lista: Turma[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<Turma[]> {
    return this.carregarStorage();
  }

  async buscarPorId(id: string): Promise<Turma | undefined> {
    return this.carregarStorage().find((t) => t.id === id);
  }

  async criar(dados: CriarTurmaDTO): Promise<Turma> {
    const lista = this.carregarStorage();

    const conflito = lista.some(
      (t) => t.dia === dados.dia && t.horario === dados.horario && t.instrutorId === dados.instrutorId
    );

    if (conflito) {
      throw new Error("Este instrutor já tem uma turma nesse dia e horário");
    }

    const nova: Turma = {
      ...dados,
      id: crypto.randomUUID(),
    };

    lista.push(nova);
    this.salvarStorage(lista);

    return nova;
  }

  async atualizar(
    id: string,
    dados: AtualizarTurmaDTO
  ): Promise<Turma | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((t) => t.id === id);

    if (index < 0) return undefined;

    lista[index] = { ...lista[index], ...dados };
    this.salvarStorage(lista);

    return lista[index];
  }

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage().filter((t) => t.id !== id);
    this.salvarStorage(lista);
  }
}

export const turmasService = new TurmasService();
export default turmasService;