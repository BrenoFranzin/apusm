// ======================================================
// APUSM SaaS — Módulo Salas
// Arquivo: salas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { historicoService } from "@/modules/configuracoes/services/historico.service";
import type { Sala, CriarSalaDTO, AtualizarSalaDTO } from "../types/sala.types";

class SalasService {
  async listar(): Promise<Sala[]> {
    const { data, error } = await supabase.from("salas").select("*").order("nome");
    if (error) { console.error(error); return []; }
    return data as Sala[];
  }

  async criar(dados: CriarSalaDTO): Promise<Sala | undefined> {
    const { data, error } = await supabase.from("salas").insert(dados).select().single();
    if (error) { console.error(error); return undefined; }

    historicoService.registrar({
      desfazer: { tabela: "salas", operacao: "delete", payload: { id: data.id } },
      refazer: { tabela: "salas", operacao: "insert", payload: data },
    });

    return data as Sala;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const { data: linhaAntes } = await supabase.from("salas").select("*").eq("id", id).single();

    const { data, error } = await supabase.from("salas").update(dados).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }

    if (linhaAntes) {
      const payloadAnterior: Record<string, unknown> = { id };
      for (const campo of Object.keys(dados)) {
        payloadAnterior[campo] = (linhaAntes as any)[campo];
      }
      historicoService.registrar({
        desfazer: { tabela: "salas", operacao: "update", payload: payloadAnterior },
        refazer: { tabela: "salas", operacao: "update", payload: { id, ...dados } },
      });
    }

    return data as Sala;
  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("salas").select("*").eq("id", id).single();

    const { error } = await supabase.from("salas").delete().eq("id", id);
    if (error) { console.error(error); return; }

    if (linhaAntes) {
      historicoService.registrar({
        desfazer: { tabela: "salas", operacao: "insert", payload: linhaAntes },
        refazer: { tabela: "salas", operacao: "delete", payload: { id } },
      });
    }
  }
}

export const salasService = new SalasService();
export default salasService;