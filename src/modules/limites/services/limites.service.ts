// ======================================================
// APUSM SaaS — Módulo Limites
// Arquivo: limites.service.ts
// ======================================================

import { limitesMock } from "../data/limites.mock";
import type { ConfiguracaoLimites, LimiteModalidade } from "../types/limite.types";

const STORAGE_KEY = "apusm:limites";

class LimitesService {
  private carregarStorage(): ConfiguracaoLimites {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitesMock));
      return limitesMock;
    }

    return JSON.parse(dados);
  }

  private salvarStorage(config: ConfiguracaoLimites) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  async obterConfiguracao(): Promise<ConfiguracaoLimites> {
    return this.carregarStorage();
  }

  async obterLimiteDaModalidade(modalidadeId: string): Promise<number> {
    const config = this.carregarStorage();
    const excecao = config.excecoes.find((e) => e.modalidadeId === modalidadeId);
    return excecao ? excecao.limiteTurmas : config.limitePadrao;
  }

  async atualizarLimitePadrao(novoLimite: number): Promise<ConfiguracaoLimites> {
    const config = this.carregarStorage();
    config.limitePadrao = novoLimite;
    this.salvarStorage(config);
    return config;
  }

  async definirExcecao(excecao: LimiteModalidade): Promise<ConfiguracaoLimites> {
    const config = this.carregarStorage();
    const index = config.excecoes.findIndex((e) => e.modalidadeId === excecao.modalidadeId);

    if (index >= 0) {
      config.excecoes[index] = excecao;
    } else {
      config.excecoes.push(excecao);
    }

    this.salvarStorage(config);
    return config;
  }

  async removerExcecao(modalidadeId: string): Promise<ConfiguracaoLimites> {
    const config = this.carregarStorage();
    config.excecoes = config.excecoes.filter((e) => e.modalidadeId !== modalidadeId);
    this.salvarStorage(config);
    return config;
  }
}

export const limitesService = new LimitesService();
export default limitesService;