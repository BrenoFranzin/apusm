// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: listaEspera.service.ts
// ======================================================

import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
import type { EntradaListaEspera } from "../types/listaEspera.types";

function capitalizarNome(nome: string): string {
  return nome.trim().toUpperCase();
}
function toEntrada(row: any): EntradaListaEspera {
  return {
    id: row.id,
    associadoId: row.associado_id,
    associadoNome: capitalizarNome(row.associado_nome ?? ""),
    turmaId: row.turma_id,
    turmaNome: row.turma_nome,
    modalidadeId: row.modalidade_id,
    modalidadeNome: row.modalidade_nome,
    dataEntrada: row.data_entrada,
    posicao: row.posicao,
    observacao: row.observacao ?? undefined,
  };
}

class ListaEsperaService {
  
  async listarTudo(): Promise<EntradaListaEspera[]> {
    const { data, error } = await supabase.from("lista_espera").select("*").order("posicao", { ascending: true });
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toEntrada);
  }

  async listarPorTurma(turmaId: string): Promise<EntradaListaEspera[]> {
    const { data, error } = await supabase
      .from("lista_espera")
      .select("*")
      .eq("turma_id", turmaId)
      .order("posicao", { ascending: true });
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toEntrada);
  }

  async listarPorAssociado(associadoId: string): Promise<EntradaListaEspera[]> {
    const { data, error } = await supabase
      .from("lista_espera")
      .select("*")
      .eq("associado_id", associadoId);
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toEntrada);
  }

  async entrarNaFila(dados: {
    associadoId: string;
    associadoNome: string;
    turmaId: string;
    turmaNome: string;
    modalidadeId: string;
    modalidadeNome: string;
  }): Promise<EntradaListaEspera> {
    const { count, error: erroContagem } = await supabase
      .from("lista_espera")
      .select("*", { count: "exact", head: true })
      .eq("turma_id", dados.turmaId);

    if (erroContagem) throw new Error(erroContagem.message);
    const proximaPosicao = (count ?? 0) + 1;

    const nova = {
      id: crypto.randomUUID(),
      associado_id: dados.associadoId,
      associado_nome: capitalizarNome(dados.associadoNome),
      turma_id: dados.turmaId,
      turma_nome: dados.turmaNome,
      modalidade_id: dados.modalidadeId,
      modalidade_nome: dados.modalidadeNome,
      posicao: proximaPosicao,
    };

    await syncQueueService.gravar("lista_espera", "insert", nova);
    return toEntrada(nova);
  }

  async sairDaFila(entradaId: string): Promise<void> {
    const { data: entrada, error: erroBusca } = await supabase
      .from("lista_espera")
      .select("*")
      .eq("id", entradaId)
      .single();
    if (erroBusca || !entrada) return;

    await supabase.from("lista_espera").delete().eq("id", entradaId);

    const { data: restante, error } = await supabase
      .from("lista_espera")
      .select("*")
      .eq("turma_id", entrada.turma_id)
      .order("posicao", { ascending: true });

    if (error || !restante) return;

    for (let i = 0; i < restante.length; i++) {
      const novaPosicao = i + 1;
      if (restante[i].posicao !== novaPosicao) {
        await supabase.from("lista_espera").update({ posicao: novaPosicao }).eq("id", restante[i].id);
      }
    }
  }

  async atualizarObservacao(entradaId: string, observacao: string): Promise<void> {
    await syncQueueService.gravar("lista_espera", "update", { id: entradaId, observacao });
  }

  async chamarProximo(turmaId: string): Promise<EntradaListaEspera | undefined> {
    const fila = await this.listarPorTurma(turmaId);
    return fila[0];
  }
}

export const listaEsperaService = new ListaEsperaService();
export default listaEsperaService;