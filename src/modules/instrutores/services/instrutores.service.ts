// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutores.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { historicoService } from "@/modules/configuracoes/services/historico.service";
import type {
  Instrutor,
  CriarInstrutorDTO,
  AtualizarInstrutorDTO,
} from "../types/instrutor.types";

class InstrutoresService {
  async listar(): Promise<Instrutor[]> {
    const { data, error } = await supabase.from("instrutores").select("*").order("nome");
    if (error) { console.error(error); return []; }
    return data as Instrutor[];
  }

  async buscarPorId(id: string): Promise<Instrutor | undefined> {
    const { data, error } = await supabase.from("instrutores").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as Instrutor;
  }

  async criar(dados: CriarInstrutorDTO): Promise<Instrutor | undefined> {
    const { data, error } = await supabase.from("instrutores").insert(dados).select().single();
    if (error) { console.error(error); return undefined; }

    historicoService.registrar({
      desfazer: { tabela: "instrutores", operacao: "delete", payload: { id: data.id } },
      refazer: { tabela: "instrutores", operacao: "insert", payload: data },
    });

    return data as Instrutor;
  }

  async atualizar(id: string, dados: AtualizarInstrutorDTO): Promise<Instrutor | undefined> {
    const { data: linhaAntes } = await supabase.from("instrutores").select("*").eq("id", id).single();

    const { data, error } = await supabase.from("instrutores").update(dados).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }

    if (linhaAntes) {
      const payloadAnterior: Record<string, unknown> = { id };
      for (const campo of Object.keys(dados)) {
        payloadAnterior[campo] = (linhaAntes as any)[campo];
      }
      historicoService.registrar({
        desfazer: { tabela: "instrutores", operacao: "update", payload: payloadAnterior },
        refazer: { tabela: "instrutores", operacao: "update", payload: { id, ...dados } },
      });
    }

    return data as Instrutor;
  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("instrutores").select("*").eq("id", id).single();

    const { error } = await supabase.from("instrutores").delete().eq("id", id);
    if (error) { console.error(error); return; }

    if (linhaAntes) {
      historicoService.registrar({
        desfazer: { tabela: "instrutores", operacao: "insert", payload: linhaAntes },
        refazer: { tabela: "instrutores", operacao: "delete", payload: { id } },
      });
    }
  }
}

export const instrutoresService = new InstrutoresService();
export default instrutoresService;