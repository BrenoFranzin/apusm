// ======================================================
// APUSM SaaS — Módulo Salas
// Arquivo: salas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
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
    return data as Sala;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const { data, error } = await supabase.from("salas").update(dados).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }
    return data as Sala;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await supabase.from("salas").delete().eq("id", id);
    if (error) console.error(error);
  }
}

export const salasService = new SalasService();
export default salasService;