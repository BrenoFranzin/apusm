// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutores.service.ts
// ======================================================

import { instrutoresMock } from "../data/instrutores.mock";

import type {
  Instrutor,
  CriarInstrutorDTO,
  AtualizarInstrutorDTO,
} from "../types/instrutor.types";

const STORAGE_KEY = "apusm:instrutores";

class InstrutoresService {

  private carregarStorage(): Instrutor[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(instrutoresMock));
      return instrutoresMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(lista: Instrutor[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<Instrutor[]> {
    return this.carregarStorage();
  }

  async buscarPorId(id: string): Promise<Instrutor | undefined> {
    return this.carregarStorage().find((i) => i.id === id);
  }

  async criar(dados: CriarInstrutorDTO): Promise<Instrutor> {
    const lista = this.carregarStorage();

    const novo: Instrutor = {
      ...dados,
      id: crypto.randomUUID(),
    };

    lista.push(novo);
    this.salvarStorage(lista);

    return novo;
  }

  async atualizar(
    id: string,
    dados: AtualizarInstrutorDTO
  ): Promise<Instrutor | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((i) => i.id === id);

    if (index < 0) return undefined;

    lista[index] = { ...lista[index], ...dados };
    this.salvarStorage(lista);

    return lista[index];
  }

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage().filter((i) => i.id !== id);
    this.salvarStorage(lista);
  }
}

export const instrutoresService = new InstrutoresService();
export default instrutoresService;