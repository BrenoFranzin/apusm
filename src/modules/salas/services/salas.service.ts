// ======================================================
// APUSM SaaS
// Módulo: Salas
// Arquivo: salas.service.ts
// ======================================================

import { salasMock } from "../data/salas.mock";
import type { Sala, CriarSalaDTO, AtualizarSalaDTO } from "../types/sala.types";

const STORAGE_KEY = "apusm:salas";

class SalasService {
  private carregarStorage(): Sala[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasMock));
      return salasMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(lista: Sala[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<Sala[]> {
    return this.carregarStorage();
  }

  async criar(dados: CriarSalaDTO): Promise<Sala> {
    const lista = this.carregarStorage();

    const nova: Sala = {
      id: crypto.randomUUID(),
      nome: dados.nome,
    };

    lista.push(nova);
    this.salvarStorage(lista);

    return nova;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((s) => s.id === id);

    if (index < 0) return undefined;

    lista[index] = { ...lista[index], ...dados };
    this.salvarStorage(lista);

    return lista[index];
  }

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage();
    const novaLista = lista.filter((s) => s.id !== id);
    this.salvarStorage(novaLista);
  }
}

export const salasService = new SalasService();

export default salasService;