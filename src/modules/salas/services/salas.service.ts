// ======================================================
// APUSM SaaS — Módulo Salas
// Arquivo: salas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
import { historicoService } from "@/modules/configuracoes/services/historico.service";
import type { Sala, CriarSalaDTO, AtualizarSalaDTO } from "../types/sala.types";

class SalasService {
  async listar(): Promise<Sala[]> {
    const { data, error } = await supabase.from("salas").select("*").order("nome");
    if (error) { console.error(error); return []; }
    return data as Sala[];
  }

  async criar(dados: CriarSalaDTO): Promise<Sala | undefined> {
    const nova = { id: crypto.randomUUID(), ...dados };
    await syncQueueService.gravar("salas", "insert", nova);
    historicoService.registrar("salas", "insert", null, nova);
    return nova as Sala;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const { data: linhaAntes } = await supabase.from("salas").select("*").eq("id", id).single();
    const payload: any = { ...dados, id };
    await syncQueueService.gravar("salas", "update", payload);
    if (linhaAntes) {
      const antes: Record<string, unknown> = { id };
      for (const campo of Object.keys(dados)) {
        antes[campo] = (linhaAntes as any)[campo];
      }
      historicoService.registrar("salas", "update", antes, payload);
    }
    return payload as Sala;
  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("salas").select("*").eq("id", id).single();
    await syncQueueService.gravar("salas", "delete", { id });
    if (linhaAntes) {
      historicoService.registrar("salas", "delete", linhaAntes, null);
    }
  }
}

export const salasService = new SalasService();
export default salasService;