// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidades.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
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
    const { data, error } = await supabase
      .from("modalidades")
      .insert({
        nome: dados.nome,
        icone: dados.icone,
        cor: dados.cor,
        salas: dados.salas,
        descricao: dados.descricao,
        instrutores_ids: dados.instrutoresIds ?? [],
      })
      .select()
      .single();
    if (error) { console.error(error); return undefined; }

    historicoService.registrar({
      desfazer: { tabela: "modalidades", operacao: "delete", payload: { id: data.id } },
      refazer: { tabela: "modalidades", operacao: "insert", payload: data },
    });

    return toModalidade(data);
  }

  async atualizar(id: string, dados: AtualizarModalidadeDTO): Promise<Modalidade | undefined> {
    const payload: any = {};
    if (dados.nome !== undefined) payload.nome = dados.nome;
    if (dados.icone !== undefined) payload.icone = dados.icone;
    if (dados.cor !== undefined) payload.cor = dados.cor;
    if (dados.salas !== undefined) payload.salas = dados.salas;
    if (dados.descricao !== undefined) payload.descricao = dados.descricao;
    if (dados.instrutoresIds !== undefined) payload.instrutores_ids = dados.instrutoresIds;

    const { data: linhaAntes } = await supabase.from("modalidades").select("*").eq("id", id).single();

    const { data, error } = await supabase.from("modalidades").update(payload).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }

    if (linhaAntes) {
      const payloadAnterior: Record<string, unknown> = { id };
      for (const campo of Object.keys(payload)) {
        payloadAnterior[campo] = (linhaAntes as any)[campo];
      }
      historicoService.registrar({
        desfazer: { tabela: "modalidades", operacao: "update", payload: payloadAnterior },
        refazer: { tabela: "modalidades", operacao: "update", payload: { id, ...payload } },
      });
    }

    return toModalidade(data);
  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("modalidades").select("*").eq("id", id).single();

    const { error } = await supabase.from("modalidades").delete().eq("id", id);
    if (error) { console.error(error); return; }

    if (linhaAntes) {
      historicoService.registrar({
        desfazer: { tabela: "modalidades", operacao: "insert", payload: linhaAntes },
        refazer: { tabela: "modalidades", operacao: "delete", payload: { id } },
      });
    }
  }

  async vincularInstrutores(id: string, instrutoresIds: string[]): Promise<void> {
    const { error } = await supabase.from("modalidades").update({ instrutores_ids: instrutoresIds }).eq("id", id);
    if (error) console.error(error);
  }
}

export const modalidadesService = new ModalidadesService();
export default modalidadesService;