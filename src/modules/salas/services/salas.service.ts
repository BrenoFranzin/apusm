// ======================================================
// APUSM SaaS — Módulo Salas
// Arquivo: salas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
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
    return nova as Sala;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const payload: any = { ...dados, id };
    await syncQueueService.gravar("salas", "update", payload);
    return payload as Sala;
  }

  async excluir(id: string): Promise<void> {
    await syncQueueService.gravar("salas", "delete", { id });
  }
}

export const salasService = new SalasService();
export default salasService;