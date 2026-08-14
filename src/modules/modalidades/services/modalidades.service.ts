// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidades.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
import { historicoService } from "@/modules/configuracoes/services/historico.service";
import type {
  Modalidade,
  CriarModalidadeDTO,
  AtualizarModalidadeDTO,
} from "../types/modalidade.types";

function toModalidade(row: any): Modalidade {
  return {
    id: row.id,
    nome: row.nome,
    icone: row.icone,
    cor: row.cor,
    salas: row.salas ?? [],
    instrutoresIds: row.instrutores_ids ?? [],
    descricao: row.descricao ?? undefined,
  };
}

class ModalidadesService {
  async listar(): Promise<Modalidade[]> {
    const { data, error } = await supabase.from("modalidades").select("*").order("nome");
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toModalidade);
  }

  async buscarPorId(id: string): Promise<Modalidade | undefined> {
    const { data, error } = await supabase.from("modalidades").select("*").eq("id", id).single();
    if (error) return undefined;
    return toModalidade(data);
  }

  async criar(dados: CriarModalidadeDTO): Promise<Modalidade | undefined> {
    const nova = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      icone: dados.icone,
      cor: dados.cor,
      salas: dados.salas,
      descricao: dados.descricao,
      instrutores_ids: dados.instrutoresIds ?? [],
    };
    await syncQueueService.gravar("modalidades", "insert", nova);
    historicoService.registrar("modalidades", "insert", null, nova);
    return toModalidade(nova);
  }

  async atualizar(id: string, dados: AtualizarModalidadeDTO): Promise<Modalidade | undefined> {
    const payload: any = {};
    if (dados.nome !== undefined) payload.nome = dados.nome;
    if (dados.icone !== undefined) payload.icone = dados.icone;
    if (dados.cor !== undefined) payload.cor = dados.cor;
    if (dados.salas !== undefined) payload.salas = dados.salas;
    if (dados.descricao !== undefined) payload.descricao = dados.descricao;
    if (dados.instrutoresIds !== undefined) payload.instrutores_ids = dados.instrutoresIds;
    payload.id = id;
    const atual = await this.buscarPorId(id);
    await syncQueueService.gravar("modalidades", "update", payload);
    if (atual) {
      const antes: Record<string, unknown> = { id };
      for (const campo of Object.keys(payload)) {
        if (campo === "id") continue;
        const campoOriginal = campo === "instrutores_ids" ? "instrutoresIds" : campo;
        antes[campo] = (atual as any)[campoOriginal];
      }
      historicoService.registrar("modalidades", "update", antes, payload);
    }
    return atual ? toModalidade({ ...atual, ...payload }) : undefined;
  }

  async excluir(id: string): Promise<void> {
    const atual = await this.buscarPorId(id);
    await syncQueueService.gravar("modalidades", "delete", { id });
    if (atual) {
      historicoService.registrar("modalidades", "delete", atual as unknown as Record<string, unknown>, null);
    }
  }

  async vincularInstrutores(id: string, instrutoresIds: string[]): Promise<void> {
    const { error } = await supabase.from("modalidades").update({ instrutores_ids: instrutoresIds }).eq("id", id);
    if (error) console.error(error);
  }
}

export const modalidadesService = new ModalidadesService();
export default modalidadesService;