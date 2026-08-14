// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutores.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
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
    return data as Instrutor;
  }

  async atualizar(id: string, dados: AtualizarInstrutorDTO): Promise<Instrutor | undefined> {
    const { data, error } = await supabase.from("instrutores").update(dados).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }
    return data as Instrutor;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await supabase.from("instrutores").delete().eq("id", id);
    if (error) console.error(error);
  }
}

export const instrutoresService = new InstrutoresService();
export default instrutoresService;