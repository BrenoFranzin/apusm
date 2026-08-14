// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: turmas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { historicoService } from "@/modules/configuracoes/services/historico.service";
import type {
  Turma,
  CriarTurmaDTO,
  AtualizarTurmaDTO,
} from "../types/turma.types";

function toTurma(row: any): Turma {
  return {
    id: row.id,
    modalidadeId: row.modalidade_id,
    instrutorId: row.instrutor_id,
    dia: row.dia,
    horario: row.horario,
    sala: row.sala,
    limiteVagas: row.limite_vagas,
    limiteNovosAlunos: row.limite_novos_alunos,
  };
}

class TurmasService {
  async listar(): Promise<Turma[]> {
    const { data, error } = await supabase.from("turmas").select("*");
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toTurma);
  }

  async buscarPorId(id: string): Promise<Turma | undefined> {
    const { data, error } = await supabase.from("turmas").select("*").eq("id", id).single();
    if (error) return undefined;
    return toTurma(data);
  }

  async criar(dados: CriarTurmaDTO): Promise<Turma> {
    const lista = await this.listar();

    const conflitoInstrutor = lista.some(
      (t) => t.dia === dados.dia && t.horario === dados.horario && t.instrutorId === dados.instrutorId
    );
    if (conflitoInstrutor) {
      throw new Error("Este instrutor já tem uma turma nesse dia e horário.");
    }

    const conflitoSala = lista.some(
      (t) => t.dia === dados.dia && t.horario === dados.horario && t.sala === dados.sala
    );
    if (conflitoSala) {
      throw new Error(`A ${dados.sala} já está ocupada nesse dia e horário.`);
    }

    const { data, error } = await supabase
      .from("turmas")
      .insert({
        modalidade_id: dados.modalidadeId,
        instrutor_id: dados.instrutorId,
        dia: dados.dia,
        horario: dados.horario,
        sala: dados.sala,
        limite_vagas: dados.limiteVagas ?? 10,
        limite_novos_alunos: dados.limiteNovosAlunos ?? 9,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    historicoService.registrar({
      desfazer: { tabela: "turmas", operacao: "delete", payload: { id: data.id } },
      refazer: { tabela: "turmas", operacao: "insert", payload: data },
    });

    return toTurma(data);
  }

  async atualizar(id: string, dados: AtualizarTurmaDTO): Promise<Turma | undefined> {
    const lista = await this.listar();
    const atual = lista.find((t) => t.id === id);
    if (!atual) return undefined;

    const atualizada = { ...atual, ...dados };

    const conflitoInstrutor = lista.some(
      (t) =>
        t.id !== id &&
        t.dia === atualizada.dia &&
        t.horario === atualizada.horario &&
        t.instrutorId === atualizada.instrutorId
    );
    if (conflitoInstrutor) {
      throw new Error("Este instrutor já tem uma turma nesse dia e horário.");
    }

    const conflitoSala = lista.some(
      (t) =>
        t.id !== id &&
        t.dia === atualizada.dia &&
        t.horario === atualizada.horario &&
        t.sala === atualizada.sala
    );
    if (conflitoSala) {
      throw new Error(`A ${atualizada.sala} já está ocupada nesse dia e horário.`);
    }

    const payload: any = {};
    if (dados.modalidadeId !== undefined) payload.modalidade_id = dados.modalidadeId;
    if (dados.instrutorId !== undefined) payload.instrutor_id = dados.instrutorId;
    if (dados.dia !== undefined) payload.dia = dados.dia;
    if (dados.horario !== undefined) payload.horario = dados.horario;
    if (dados.sala !== undefined) payload.sala = dados.sala;
    if (dados.limiteVagas !== undefined) payload.limite_vagas = dados.limiteVagas;
    if (dados.limiteNovosAlunos !== undefined) payload.limite_novos_alunos = dados.limiteNovosAlunos;

    const { data: linhaAntes } = await supabase.from("turmas").select("*").eq("id", id).single();

    const { data, error } = await supabase.from("turmas").update(payload).eq("id", id).select().single();
    if (error) { console.error(error); return undefined; }

    if (linhaAntes) {
      const payloadAnterior: Record<string, unknown> = { id };
      for (const campo of Object.keys(payload)) {
        payloadAnterior[campo] = (linhaAntes as any)[campo];
      }
      historicoService.registrar({
        desfazer: { tabela: "turmas", operacao: "update", payload: payloadAnterior },
        refazer: { tabela: "turmas", operacao: "update", payload: { id, ...payload } },
      });
    }

    return toTurma(data);
  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("turmas").select("*").eq("id", id).single();

    const { error } = await supabase.from("turmas").delete().eq("id", id);
    if (error) { console.error(error); return; }

    if (linhaAntes) {
      historicoService.registrar({
        desfazer: { tabela: "turmas", operacao: "insert", payload: linhaAntes },
        refazer: { tabela: "turmas", operacao: "delete", payload: { id } },
      });
    }
  }
}

export const turmasService = new TurmasService();
export default turmasService;