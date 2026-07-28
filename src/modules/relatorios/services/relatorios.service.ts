// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: relatorios.service.ts
// ======================================================

import { associadosService } from "@/modules/associados/services/associados.service";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import type { RelatorioAssociado } from "../types/relatorio.types";

class RelatoriosService {
  async gerarRelatorioMatriculas(): Promise<RelatorioAssociado[]> {
    const associados = await associadosService.listar();

    const relatorio: RelatorioAssociado[] = [];

    for (const associado of associados) {
      const turmas = associado.matriculas
        .filter((m) => m.status !== "CANCELADA")
        .map((m) => ({
          turmaId: m.turmaId,
          turmaNome: m.turmaNome,
          modalidadeNome: m.modalidadeNome,
          dataMatricula: m.dataMatricula,
        }));

      const filas = await listaEsperaService.listarPorAssociado(associado.id);

      const filasDeEspera = filas.map((f) => ({
        turmaId: f.turmaId,
        turmaNome: f.turmaNome,
        modalidadeNome: f.modalidadeNome,
        posicao: f.posicao,
      }));

      relatorio.push({
        associadoId: associado.id,
        associadoNome: associado.nome,
        turmas,
        filasDeEspera,
      });
    }

    return relatorio;
  }
}

export const relatoriosService = new RelatoriosService();
export default relatoriosService;