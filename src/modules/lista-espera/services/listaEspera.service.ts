// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: listaEspera.service.ts
// ======================================================

import { listaEsperaMock } from "../data/listaEspera.mock";
import type { EntradaListaEspera } from "../types/listaEspera.types";

const STORAGE_KEY = "apusm:lista-espera";

class ListaEsperaService {
  private carregarStorage(): EntradaListaEspera[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaEsperaMock));
      return listaEsperaMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(lista: EntradaListaEspera[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listarPorTurma(turmaId: string): Promise<EntradaListaEspera[]> {
    return this.carregarStorage()
      .filter((e) => e.turmaId === turmaId)
      .sort((a, b) => a.posicao - b.posicao);
  }

  async listarPorAssociado(associadoId: string): Promise<EntradaListaEspera[]> {
    return this.carregarStorage().filter((e) => e.associadoId === associadoId);
  }

  async entrarNaFila(dados: {
    associadoId: string;
    associadoNome: string;
    turmaId: string;
    turmaNome: string;
    modalidadeId: string;
    modalidadeNome: string;
  }): Promise<EntradaListaEspera> {
    const lista = this.carregarStorage();

    const filaDaTurma = lista.filter((e) => e.turmaId === dados.turmaId);
    const proximaPosicao = filaDaTurma.length + 1;

    const nova: EntradaListaEspera = {
      id: crypto.randomUUID(),
      ...dados,
      dataEntrada: new Date().toISOString(),
      posicao: proximaPosicao,
    };

    lista.push(nova);
    this.salvarStorage(lista);

    return nova;
  }

  async sairDaFila(entradaId: string): Promise<void> {
    const lista = this.carregarStorage();
    const entrada = lista.find((e) => e.id === entradaId);

    if (!entrada) return;

    const restante = lista.filter((e) => e.id !== entradaId);

    const filaDaTurma = restante
      .filter((e) => e.turmaId === entrada.turmaId)
      .sort((a, b) => a.posicao - b.posicao);

    filaDaTurma.forEach((e, i) => {
      e.posicao = i + 1;
    });

    this.salvarStorage(restante);
  }

  async chamarProximo(turmaId: string): Promise<EntradaListaEspera | undefined> {
    const fila = await this.listarPorTurma(turmaId);
    return fila[0];
  }
}

export const listaEsperaService = new ListaEsperaService();
export default listaEsperaService;