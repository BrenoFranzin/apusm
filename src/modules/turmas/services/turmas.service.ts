// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: turmas.service.ts
// ======================================================
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
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
    observacao: row.observacao ?? undefined,
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

    const nova = {
      id: crypto.randomUUID(),
      modalidade_id: dados.modalidadeId,
      instrutor_id: dados.instrutorId,
      dia: dados.dia,
      horario: dados.horario,
      sala: dados.sala,
      limite_vagas: dados.limiteVagas ?? 10,
      limite_novos_alunos: dados.limiteNovosAlunos ?? 9,
      observacao: dados.observacao ?? null,
    };

    await syncQueueService.gravar("turmas", "insert", nova);
    historicoService.registrar("turmas", "insert", null, nova);
    return toTurma(nova);
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
    if (dados.observacao !== undefined) payload.observacao = dados.observacao;

    payload.id = id;
    const antes: Record<string, unknown> = { id };
    for (const campo of Object.keys(payload)) {
      if (campo === "id") continue;
      antes[campo] = (nova => nova)(
        campo === "modalidade_id" ? atual.modalidadeId :
        campo === "instrutor_id" ? atual.instrutorId :
        campo === "limite_vagas" ? atual.limiteVagas :
        campo === "limite_novos_alunos" ? atual.limiteNovosAlunos :
        (atual as any)[campo]
      );
    }
    await syncQueueService.gravar("turmas", "update", payload);
    historicoService.registrar("turmas", "update", antes, payload);
    return toTurma({ ...atual, ...atualizada });

  }

  async excluir(id: string): Promise<void> {
    const { data: linhaAntes } = await supabase.from("turmas").select("*").eq("id", id).single();
    await syncQueueService.gravar("turmas", "delete", { id });
    if (linhaAntes) {
      historicoService.registrar("turmas", "delete", linhaAntes, null);
    }
  }
}

export const turmasService = new TurmasService();
export default turmasService;