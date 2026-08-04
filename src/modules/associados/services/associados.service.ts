// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: associados.service.ts
// ======================================================

import { api } from "@/services/api";
import { limitesService } from "@/modules/limites/services/limites.service";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import { associadosMock } from "../data/associados.mock";

import type {
  Associado,
  CriarAssociadoDTO,
  AtualizarAssociadoDTO,
} from "../types/associado.types";

const STORAGE_KEY = "apusm:associados";

class AssociadosService {
  // ==========================
  // LOCAL STORAGE
  // ==========================

  private normalizar(a: any): Associado {
    return {
      id: a?.id ?? crypto.randomUUID(),
      nome: a?.nome ?? "Sem nome",
      telefone: a?.telefone ?? "",
      status: a?.status ?? "ATIVO",
      dataCadastro: a?.dataCadastro ?? new Date().toISOString().substring(0, 10),
      matriculas: Array.isArray(a?.matriculas) ? a.matriculas : [],
      frequencias: Array.isArray(a?.frequencias) ? a.frequencias : [],
      pagamentos: Array.isArray(a?.pagamentos) ? a.pagamentos : [],
      historico: Array.isArray(a?.historico) ? a.historico : [],
    };
  }

  private carregarStorage(): Associado[] {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(associadosMock)
      );

      return associadosMock;
    }

    const bruto = JSON.parse(dados);
    return (Array.isArray(bruto) ? bruto : []).map((a) => this.normalizar(a));
  }

  private salvarStorage(lista: Associado[]) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lista)
    );
  }

  // ==========================
  // LISTAR
  // ==========================

  async listar(): Promise<Associado[]> {
    return this.carregarStorage();
  }

  // ==========================
  // BUSCAR
  // ==========================

  async buscarPorId(
    id: string
  ): Promise<Associado | undefined> {
    const lista = this.carregarStorage();

    return lista.find((a) => a.id === id);
  }

  // ==========================
  // CRIAR
  // ==========================

  async criar(
    dados: CriarAssociadoDTO
  ): Promise<Associado> {
    const lista = this.carregarStorage();

    const nomeNormalizado = dados.nome.trim().toLowerCase();
    const jaExiste = lista.some(
      (a) => a.nome.trim().toLowerCase() === nomeNormalizado
    );

    if (jaExiste) {
      throw new Error(`Já existe um associado cadastrado com o nome "${dados.nome.trim()}".`);
    }

    const novo: Associado = {
      ...dados,
      id: crypto.randomUUID(),
      dataCadastro: new Date().toISOString().substring(0, 10),
      historico: [],
      matriculas: [],
      frequencias: [],
      pagamentos: [],
    };

    lista.push(novo);

    this.salvarStorage(lista);

    return novo;
  }

  // ==========================
  // EDITAR
  // ==========================

  async atualizar(
    id: string,
    dados: AtualizarAssociadoDTO
  ): Promise<Associado | undefined> {
    const lista = this.carregarStorage();

    const index = lista.findIndex((a) => a.id === id);

    if (index < 0) return undefined;

    lista[index] = {
      ...lista[index],
      ...dados,
    };

    this.salvarStorage(lista);

    return lista[index];
  }

  // ==========================
  // EXCLUIR
  // ==========================

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage();

    const novaLista = lista.filter((a) => a.id !== id);

    this.salvarStorage(novaLista);
  }


  // ==========================
  // MATRICULAR EM TURMA (limite 10 vagas)
  // ==========================

  async contarMatriculasPorTurma(turmaId: string): Promise<number> {
    const lista = this.carregarStorage();

    return lista.reduce((total, associado) => {
      const ativos = associado.matriculas.filter(
        (m) => m.turmaId === turmaId && m.status !== "CANCELADA"
      ).length;
      return total + ativos;
    }, 0);
  }

  async matricular(
    associadoId: string,
    dadosMatricula: {
      turmaId: string;
      turmaNome: string;
      modalidadeId: string;
      modalidadeNome: string;
    }
  ): Promise<{ status: "MATRICULADO" | "LISTA_ESPERA"; associado?: Associado; posicaoFila?: number }> {
    const LIMITE_VAGAS_TURMA = 10;

    const lista = this.carregarStorage();
    const index = lista.findIndex((a) => a.id === associadoId);

    if (index < 0) {
      throw new Error("Associado não encontrado.");
    }

    const associado = lista[index];

    // Checa limite de turmas por modalidade (padrão 2, exceções tipo Bike/Jiu-Jitsu = 1)
    const limiteModalidade = await limitesService.obterLimiteDaModalidade(dadosMatricula.modalidadeId);

    const turmasNaModalidade = associado.matriculas.filter(
      (m) => m.modalidadeId === dadosMatricula.modalidadeId && m.status !== "CANCELADA"
    ).length;

    if (turmasNaModalidade >= limiteModalidade) {
      throw new Error(
        `Limite atingido: essa pessoa já está em ${turmasNaModalidade} turma(s) de ${dadosMatricula.modalidadeNome} (limite: ${limiteModalidade}).`
      );
    }

    // Checa vaga na turma. Se estiver cheia, cai na lista de espera
    const vagasOcupadas = await this.contarMatriculasPorTurma(dadosMatricula.turmaId);

    if (vagasOcupadas >= LIMITE_VAGAS_TURMA) {
      const entrada = await listaEsperaService.entrarNaFila({
        associadoId: associado.id,
        associadoNome: associado.nome,
        turmaId: dadosMatricula.turmaId,
        turmaNome: dadosMatricula.turmaNome,
        modalidadeId: dadosMatricula.modalidadeId,
        modalidadeNome: dadosMatricula.modalidadeNome,
      });

      lista[index].historico.push({
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        descricao: `Entrou na lista de espera de ${dadosMatricula.modalidadeNome} (posição ${entrada.posicao})`,
      });
      this.salvarStorage(lista);

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

    lista[index].matriculas.push(novaMatricula);
    lista[index].historico.push({
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      descricao: `Matriculado em ${dadosMatricula.modalidadeNome} (${dadosMatricula.turmaNome})`,
    });
    this.salvarStorage(lista);

    return { status: "MATRICULADO", associado: lista[index] };
  }

  async cancelarMatricula(associadoId: string, matriculaId: string): Promise<Associado | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((a) => a.id === associadoId);

    if (index < 0) return undefined;

    const matriculaCancelada = lista[index].matriculas.find((m) => m.id === matriculaId);

    lista[index].matriculas = lista[index].matriculas.map((m) =>
      m.id === matriculaId ? { ...m, status: "CANCELADA" } : m
    );

    if (matriculaCancelada) {
      lista[index].historico.push({
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        descricao: `Cancelou matrícula em ${matriculaCancelada.modalidadeNome} (${matriculaCancelada.turmaNome})`,
      });
    }

    this.salvarStorage(lista);

    // Promove o próximo da lista de espera, se houver vaga liberada
    if (matriculaCancelada) {
      const proximo = await listaEsperaService.chamarProximo(matriculaCancelada.turmaId);

      if (proximo) {
        const listaAtualizada = this.carregarStorage();
        const indexPromovido = listaAtualizada.findIndex((a) => a.id === proximo.associadoId);

        if (indexPromovido >= 0) {
          const novaMatricula = {
            id: crypto.randomUUID(),
            modalidadeId: proximo.modalidadeId,
            modalidadeNome: proximo.modalidadeNome,
            turmaId: proximo.turmaId,
            turmaNome: proximo.turmaNome,
            dataMatricula: new Date().toISOString().substring(0, 10),
            status: "ATIVA",
          };

          listaAtualizada[indexPromovido].matriculas.push(novaMatricula);
          this.salvarStorage(listaAtualizada);
        }

        await listaEsperaService.sairDaFila(proximo.id);
      }
    }

    return this.carregarStorage().find((a) => a.id === associadoId);
  }

  

  async atualizarObservacaoMatricula(
    associadoId: string,
    matriculaId: string,
    observacao: string
  ): Promise<Associado | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((a) => a.id === associadoId);

    if (index < 0) return undefined;

    lista[index].matriculas = lista[index].matriculas.map((m) =>
      m.id === matriculaId ? { ...m, observacao } : m
    );

    this.salvarStorage(lista);

    return lista[index];
  }

  // ==========================
  // PESQUISAR
  // ==========================

  async pesquisar(
    texto: string
  ): Promise<Associado[]> {
    const lista = this.carregarStorage();

    const busca = texto.toLowerCase();

    return lista.filter((a) => {
      return (
        a.nome.toLowerCase().includes(busca) ||
        a.telefone.includes(busca)
      );
    });
  }

  // ==========================
  // ESTATÍSTICAS
  // ==========================

  async dashboard() {
    const lista = this.carregarStorage();

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