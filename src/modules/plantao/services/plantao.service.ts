// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: plantao.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import type { EntradaPlantao, DiaSemanaPlantao } from "../types/plantao.types";

class PlantaoService {
  async listar(): Promise<EntradaPlantao[]> {
    const { data, error } = await supabase.from("plantao").select("*");
    if (error) { console.error(error); return []; }
    return data.map((d) => ({
      id: d.id,
      instrutorId: d.instrutor_id,
      dia: d.dia,
      horario: d.horario,
    })) as EntradaPlantao[];
  }

  async adicionar(instrutorId: string, dia: DiaSemanaPlantao, horario: string): Promise<void> {
    const { error } = await supabase
      .from("plantao")
      .insert({ instrutor_id: instrutorId, dia, horario });
    if (error) console.error(error);
  }

  async remover(instrutorId: string, dia: DiaSemanaPlantao, horario: string): Promise<void> {
    const { error } = await supabase
      .from("plantao")
      .delete()
      .eq("instrutor_id", instrutorId)
      .eq("dia", dia)
      .eq("horario", horario);
    if (error) console.error(error);
  }

  async definirEmMassa(instrutorId: string, entradas: { dia: DiaSemanaPlantao; horario: string }[]): Promise<void> {
    const { error: erroDelete } = await supabase
      .from("plantao")
      .delete()
      .eq("instrutor_id", instrutorId);
    if (erroDelete) { console.error(erroDelete); return; }

    if (entradas.length === 0) return;

    const { error: erroInsert } = await supabase
      .from("plantao")
      .insert(entradas.map((e) => ({ instrutor_id: instrutorId, dia: e.dia, horario: e.horario })));
    if (erroInsert) console.error(erroInsert);
  }
}

export const plantaoService = new PlantaoService();
export default plantaoService;