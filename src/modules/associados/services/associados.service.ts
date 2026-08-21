// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: associados.service.ts
// ======================================================

import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import { limitesService } from "@/modules/limites/services/limites.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { supabase } from "@/lib/supabaseClient";
import { syncQueueService } from "@/lib/syncQueue.service";
import { historicoService } from "@/modules/configuracoes/services/historico.service";

import type {
  Associado,
  CriarAssociadoDTO,
  AtualizarAssociadoDTO,
} from "../types/associado.types";

function capitalizarNome(nome: string): string {
  return nome.trim().toUpperCase();
}

function toAssociado(row: any): Associado {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone ?? "",
    status: row.status,
    dataCadastro: row.data_cadastro,
    matriculas: row.matriculas ?? [],
    frequencias: row.frequencias ?? [],
    historico: row.historico ?? [],
  };
}

class AssociadosService {
  async listar(): Promise<Associado[]> {
    const { data, error } = await supabase.from("associados").select("id, nome, telefone, status, data_cadastro, matriculas, frequencias").order("nome");
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toAssociado);
  }

  async buscarPorId(id: string): Promise<Associado | undefined> {
    const { data, error } = await supabase.from("associados").select("*").eq("id", id).single();
    if (error) return undefined;
    return toAssociado(data);
  }

  async criar(dados: CriarAssociadoDTO): Promise<Associado> {
    const nomeFormatado = capitalizarNome(dados.nome);

    const { data: existentes } = await supabase.from("associados").select("nome");
    const jaExiste = (existentes ?? []).some(
      (a: any) => a.nome.trim().toLowerCase() === nomeFormatado.toLowerCase()
    );
    if (jaExiste) {
      throw new Error(`Já existe um associado cadastrado com o nome "${dados.nome.trim()}".`);
    }

    const novoAssociado = {
      id: crypto.randomUUID(),
      nome: nomeFormatado,
      telefone: dados.telefone ?? "",
      status: dados.status,
      historico: [{ id: crypto.randomUUID(), data: new Date().toISOString(), descricao: "Cadastro criado" }],
      matriculas: [],
      frequencias: [],
    };

    await syncQueueService.gravar("associados", "insert", novoAssociado);
    historicoService.registrar("associados", "insert", null, novoAssociado);
    return toAssociado(novoAssociado);
  }

  async atualizar(id: string, dados: AtualizarAssociadoDTO): Promise<Associado | undefined> {
    const atual = await this.buscarPorId(id);
    if (!atual) return undefined;

    const historico = [
      ...atual.historico,
      { id: crypto.randomUUID(), data: new Date().toISOString(), descricao: "Dados do cadastro atualizados" },
    ];

    const payload: any = { historico };
    if (dados.nome !== undefined) payload.nome = capitalizarNome(dados.nome);
    if (dados.telefone !== undefined) payload.telefone = dados.telefone;
    if (dados.status !== undefined) payload.status = dados.status;

    payload.id = id;
    const antes: Record<string, unknown> = { id };
    for (const campo of Object.keys(payload)) {
      antes[campo] = (atual as any)[campo === "historico" ? "historico" : campo];
    }
    await syncQueueService.gravar("associados", "update", payload);
    historicoService.registrar("associados", "update", antes, payload);
    return toAssociado({ ...atual, ...payload });
  }

  async excluir(id: string): Promise<void> {
    const atual = await this.buscarPorId(id);
    await syncQueueService.gravar("associados", "delete", { id });
    if (atual) {
      historicoService.registrar("associados", "delete", atual as unknown as Record<string, unknown>, null);
    }
  }

  async contarMatriculasPorTurma(turmaId: string): Promise<number> {
    const lista = await this.listar();
    return lista.reduce((total, associado) => {
      const ativos = associado.matriculas.filter(
        (m) => m.turmaId === turmaId && m.status !== "CANCELADA"
      ).length;
      return total + ativos;
    }, 0);
  }

  async matricular(
    associadoId: string,
    dadosMatricula: { turmaId: string; turmaNome: string; modalidadeId: string; modalidadeNome: string }
  ): Promise<{ status: "MATRICULADO" | "LISTA_ESPERA"; associado?: Associado; posicaoFila?: number }> {
    const associado = await this.buscarPorId(associadoId);
    if (!associado) throw new Error("Associado não encontrado.");

    const jaMatriculadoNestaTurma = associado.matriculas.some(
      (m) => m.turmaId === dadosMatricula.turmaId && m.status !== "CANCELADA"
    );
    if (jaMatriculadoNestaTurma) {
      throw new Error(`${associado.nome} já está matriculado(a) em ${dadosMatricula.modalidadeNome} (${dadosMatricula.turmaNome}).`);
    }

    const turma = await turmasService.buscarPorId(dadosMatricula.turmaId);
    const limiteVagasTurma = turma?.limiteVagas ?? 10;
    const vagasOcupadas = await this.contarMatriculasPorTurma(dadosMatricula.turmaId);
    const turmaCheia = vagasOcupadas >= limiteVagasTurma;

    const limiteModalidade = await limitesService.obterLimiteDaModalidade(dadosMatricula.modalidadeId);
    const turmasNaModalidade = associado.matriculas.filter(
      (m) => m.modalidadeId === dadosMatricula.modalidadeId && m.status !== "CANCELADA"
    ).length;
    const atingiuLimiteModalidade = turmasNaModalidade >= limiteModalidade;

    if (turmaCheia || atingiuLimiteModalidade) {
      const entrada = await listaEsperaService.entrarNaFila({
        associadoId: associado.id,
        associadoNome: associado.nome,
        turmaId: dadosMatricula.turmaId,
        turmaNome: dadosMatricula.turmaNome,
        modalidadeId: dadosMatricula.modalidadeId,
        modalidadeNome: dadosMatricula.modalidadeNome,
      });

      const historico = [
        ...associado.historico,
        {
          id: crypto.randomUUID(),
          data: new Date().toISOString(),
          descricao: `Entrou na lista de espera de ${dadosMatricula.modalidadeNome} (${dadosMatricula.turmaNome}), posição ${entrada.posicao}`,
        },
      ];
      await supabase.from("associados").update({ historico }).eq("id", associadoId);

      return { status: "LISTA_ESPERA", posicaoFila: entrada.posicao };
    }

    const novaMatricula = {
      id: crypto.randomUUID(),
      modalidadeId: dadosMatricula.modalidadeId,
      modalidadeNome: dadosMatricula.modalidadeNome,
      turmaId: dadosMatricula.turmaId,
      turmaNome: dadosMatricula.turmaNome,
      dataMatricula: new Date().toISOString().substring(0, 10),
      status: "ATIVA",
    };

    const matriculas = [...associado.matriculas, novaMatricula];
    const historico = [
      ...associado.historico,
      { id: crypto.randomUUID(), data: new Date().toISOString(), descricao: `Matriculado em ${dadosMatricula.modalidadeNome} (${dadosMatricula.turmaNome})` },
    ];

    const { data, error } = await supabase
      .from("associados")
      .update({ matriculas, historico })
      .eq("id", associadoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { status: "MATRICULADO", associado: toAssociado(data) };
  }

  async cancelarMatricula(associadoId: string, matriculaId: string): Promise<Associado | undefined> {
    const associado = await this.buscarPorId(associadoId);
    if (!associado) return undefined;

    const matricula = associado.matriculas.find((m) => m.id === matriculaId);
    const matriculas = associado.matriculas.map((m) =>
      m.id === matriculaId ? { ...m, status: "CANCELADA" } : m
    );

    const historico = matricula
      ? [...associado.historico, { id: crypto.randomUUID(), data: new Date().toISOString(), descricao: `Cancelou matrícula em ${matricula.modalidadeNome} (${matricula.turmaNome})` }]
      : associado.historico;

    const { data, error } = await supabase
      .from("associados")
      .update({ matriculas, historico })
      .eq("id", associadoId)
      .select()
      .single();

    if (error) { console.error(error); return undefined; }
    return toAssociado(data);
  }

  async atualizarObservacaoMatricula(
    associadoId: string,
    matriculaId: string,
    observacao: string
  ): Promise<Associado | undefined> {
    const associado = await this.buscarPorId(associadoId);
    if (!associado) return undefined;

    const matricula = associado.matriculas.find((m) => m.id === matriculaId);
    const matriculas = associado.matriculas.map((m) =>
      m.id === matriculaId ? { ...m, observacao } : m
    );

    const historico = matricula
      ? [...associado.historico, { id: crypto.randomUUID(), data: new Date().toISOString(), descricao: `Observação atualizada em ${matricula.modalidadeNome} (${matricula.turmaNome}): "${observacao}"` }]
      : associado.historico;

    const { data, error } = await supabase
      .from("associados")
      .update({ matriculas, historico })
      .eq("id", associadoId)
      .select()
      .single();

    if (error) { console.error(error); return undefined; }
    return toAssociado(data);
  }

  async pesquisar(texto: string): Promise<Associado[]> {
    const busca = texto.trim();
    if (!busca) return [];

    const { data, error } = await supabase.rpc("buscar_associados", { termo: busca });
    if (error) { console.error(error); return []; }
    return (data ?? []).map(toAssociado);
  }

  async dashboard() {
    const lista = await this.listar();
    return {
      total: lista.length,
      ativos: lista.filter((a) => a.status === "ATIVO").length,
      pendentes: lista.filter((a) => a.status === "PENDENTE").length,
      inativos: lista.filter((a) => a.status === "INATIVO").length,
      bloqueados: lista.filter((a) => a.status === "BLOQUEADO").length,
    };
  }
}

export const associadosService = new AssociadosService();
export default associadosService;