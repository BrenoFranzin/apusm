// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: plantao.service.ts
// ======================================================

import { plantaoMock } from "../data/plantao.mock";
import type { EntradaPlantao, DiaSemanaPlantao } from "../types/plantao.types";

const STORAGE_KEY = "apusm:plantao";

class PlantaoService {
  private carregarStorage(): EntradaPlantao[] {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plantaoMock));
      return plantaoMock;
    }
    return JSON.parse(dados);
  }

  private salvarStorage(lista: EntradaPlantao[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<EntradaPlantao[]> {
    return this.carregarStorage();
  }

  async adicionar(instrutorId: string, dia: DiaSemanaPlantao, horario: string): Promise<void> {
    const lista = this.carregarStorage();

    const jaExiste = lista.some(
      (e) => e.instrutorId === instrutorId && e.dia === dia && e.horario === horario
    );

    if (jaExiste) return;

    lista.push({ id: crypto.randomUUID(), instrutorId, dia, horario });
    this.salvarStorage(lista);
  }

  async remover(instrutorId: string, dia: DiaSemanaPlantao, horario: string): Promise<void> {
    const lista = this.carregarStorage().filter(
      (e) => !(e.instrutorId === instrutorId && e.dia === dia && e.horario === horario)
    );
    this.salvarStorage(lista);
  }

  async definirEmMassa(instrutorId: string, entradas: { dia: DiaSemanaPlantao; horario: string }[]): Promise<void> {
    const lista = this.carregarStorage().filter((e) => e.instrutorId !== instrutorId);

    for (const entrada of entradas) {
      lista.push({ id: crypto.randomUUID(), instrutorId, dia: entrada.dia, horario: entrada.horario });
    }

    this.salvarStorage(lista);
  }
}

export const plantaoService = new PlantaoService();
export default plantaoService;