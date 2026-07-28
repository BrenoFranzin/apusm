// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidades.service.ts
// ======================================================

import { modalidadesMock } from "../data/modalidades.mock";

import type {
  Modalidade,
  CriarModalidadeDTO,
  AtualizarModalidadeDTO,
} from "../types/modalidade.types";

const STORAGE_KEY = "apusm:modalidades";

class ModalidadesService {

  private carregarStorage(): Modalidade[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modalidadesMock));
      return modalidadesMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(lista: Modalidade[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<Modalidade[]> {
    return this.carregarStorage();
  }

  async buscarPorId(id: string): Promise<Modalidade | undefined> {
    return this.carregarStorage().find((m) => m.id === id);
  }

  async criar(dados: CriarModalidadeDTO): Promise<Modalidade> {
    const lista = this.carregarStorage();

    const nova: Modalidade = {
      ...dados,
      id: crypto.randomUUID(),
      instrutoresIds: [],
    };

    lista.push(nova);
    this.salvarStorage(lista);

    return nova;
  }

  async atualizar(
    id: string,
    dados: AtualizarModalidadeDTO
  ): Promise<Modalidade | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((m) => m.id === id);

    if (index < 0) return undefined;

    lista[index] = { ...lista[index], ...dados };
    this.salvarStorage(lista);

    return lista[index];
  }

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage().filter((m) => m.id !== id);
    this.salvarStorage(lista);
  }

  async vincularInstrutores(id: string, instrutoresIds: string[]): Promise<void> {
    const lista = this.carregarStorage();
    const modalidade = lista.find((m) => m.id === id);
    if (!modalidade) return;

    modalidade.instrutoresIds = instrutoresIds;
    this.salvarStorage(lista);
  }
}

export const modalidadesService = new ModalidadesService();
export default modalidadesService;