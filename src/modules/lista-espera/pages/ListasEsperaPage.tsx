// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: ListasEsperaPage.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";

import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useAssociados } from "@/modules/associados/hooks/useAssociados";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import { instrutoresService } from "@/modules/instrutores/services/instrutores.service";
import { listaEsperaService } from "../services/listaEspera.service";
import { associadosService } from "@/modules/associados/services/associados.service";

import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import type { Instrutor } from "@/modules/instrutores/types/instrutor.types";
import type { EntradaListaEspera } from "../types/listaEspera.types";

const DIA_LABEL: Record<string, string> = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
};

export default function ListasEsperaPage() {
  const { turmas } = useTurmas();
  const { todos: associados, carregar: recarregarAssociados } = useAssociados();

  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [filas, setFilas] = useState<EntradaListaEspera[]>([]);
  const [modalidadeAberta, setModalidadeAberta] = useState<string | null>(null);

  async function carregarTudo() {
    const [modalidadesData, instrutoresData, filasData] = await Promise.all([
      modalidadesService.listar(),
      instrutoresService.listar(),
      listaEsperaService.listarPorAssociado(""), // placeholder, trocado abaixo
    ]);
    setModalidades(modalidadesData);
    setInstrutores(instrutoresData);

    // listarPorAssociado("") não existe de fato como "listar tudo",
    // então buscamos direto do storage via um turmaId vazio não funciona.
    // Usamos o service por turma, uma vez por turma carregada:
    void filasData;
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  // Carrega TODAS as entradas da lista de espera (todas as turmas) de uma vez
  useEffect(() => {
    async function carregarFilas() {
      const todasEntradas = await Promise.all(
        turmas.map((t) => listaEsperaService.listarPorTurma(t.id))
      );
      setFilas(todasEntradas.flat());
    }
    if (turmas.length > 0) carregarFilas();
  }, [turmas]);

  // Contadores por associado: quantas turmas ativas + quantas filas
  const contadoresPorAssociado = useMemo(() => {
    const mapa: Record<string, { turmas: number; filas: number }> = {};

    associados.forEach((a) => {
      const turmasAtivas = a.matriculas.filter((m) => m.status !== "CANCELADA").length;
      mapa[a.id] = { turmas: turmasAtivas, filas: 0 };
    });

    filas.forEach((f) => {
      if (!mapa[f.associadoId]) mapa[f.associadoId] = { turmas: 0, filas: 0 };
      mapa[f.associadoId].filas += 1;
    });

    return mapa;
  }, [associados, filas]);

  function instrutorNome(id: string) {
    return instrutores.find((i) => i.id === id)?.nome ?? "—";
  }

  async function handleEditarObservacaoMatricula(
    associadoId: string,
    matriculaId: string,
    valorAtual: string
  ) {
    const novo = window.prompt("Observação:", valorAtual);
    if (novo === null) return;
    await associadosService.atualizarObservacaoMatricula(associadoId, matriculaId, novo);
    await recarregarAssociados();
  }

  async function handleEditarObservacaoFila(entradaId: string, valorAtual: string) {
    const novo = window.prompt("Observação:", valorAtual);
    if (novo === null) return;
    await listaEsperaService.atualizarObservacao(entradaId, novo);
    const todasEntradas = await Promise.all(
      turmas.map((t) => listaEsperaService.listarPorTurma(t.id))
    );
    setFilas(todasEntradas.flat());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>
          Listas de Espera
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>
          {modalidades.length} modalidades
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {[...modalidades]
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((mod) => {
            const cor = mod.cor || "#374151";
            const ativa = modalidadeAberta === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => setModalidadeAberta(ativa ? null : mod.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 10,
                  background: cor + "1a",
                  color: cor,
                  border: `2px solid ${cor}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  minHeight: 60,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  opacity: modalidadeAberta && !ativa ? 0.55 : 1,
                  boxShadow: ativa ? `0 0 0 2px ${cor}` : "none",
                }}
              >
                <span style={{ fontSize: 20 }}>{mod.icone}</span>
                {mod.nome}
              </button>
            );
          })}
      </div>
            {mod.icone} {mod.nome}
          </button>
        ))}
      </div>

      {modalidadeAberta &&
        (() => {
          const mod = modalidades.find((m) => m.id === modalidadeAberta);
          if (!mod) return null;

          const turmasDaModalidade = turmas.filter((t) => t.modalidadeId === mod.id);

          if (turmasDaModalidade.length === 0) {
            return (
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Nenhuma turma cadastrada para {mod.nome}.
              </p>
            );
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {turmasDaModalidade.map((turma) => {
                const matriculados = associados
                  .map((a) => ({
                    associado: a,
                    matricula: a.matriculas.find(
                      (m) => m.turmaId === turma.id && m.status !== "CANCELADA"
                    ),
                  }))
                  .filter((x) => x.matricula);

                const filaDaTurma = filas
                  .filter((f) => f.turmaId === turma.id)
                  .sort((a, b) => a.posicao - b.posicao);

                return (
                  <div
                    key={turma.id}
                    style={{
                      border: "1px solid var(--border-default)",
                      borderRadius: 12,
                      padding: "1rem 1.25rem",
                      background: "var(--background-primary)",
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px", color: "var(--text-primary)" }}>
                      {DIA_LABEL[turma.dia]} — {turma.horario} — {turma.sala}
                    </p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>
                      Instrutor: {instrutorNome(turma.instrutorId)}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {/* Matriculados */}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                          Matriculados ({matriculados.length})
                        </p>
                        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left", color: "#6b7280" }}>
                              <th style={{ padding: "4px 6px" }}>Nome</th>
                              <th style={{ padding: "4px 6px" }}>Turmas</th>
                              <th style={{ padding: "4px 6px" }}>Filas</th>
                              <th style={{ padding: "4px 6px" }}>Obs.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matriculados.map(({ associado, matricula }) => (
                              <tr key={associado.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                                <td style={{ padding: "6px" }}>{associado.nome}</td>
                                <td style={{ padding: "6px" }}>{contadoresPorAssociado[associado.id]?.turmas ?? 0}</td>
                                <td style={{ padding: "6px" }}>{contadoresPorAssociado[associado.id]?.filas ?? 0}</td>
                                <td style={{ padding: "6px" }}>
                                  <button
                                    onClick={() =>
                                      handleEditarObservacaoMatricula(
                                        associado.id,
                                        matricula!.id,
                                        matricula!.observacao ?? ""
                                      )
                                    }
                                    style={{
                                      fontSize: 12,
                                      border: "1px solid var(--border-default)",
                                      borderRadius: 6,
                                      padding: "2px 8px",
                                      background: "transparent",
                                      cursor: "pointer",
                                    }}
                                    title={matricula!.observacao || "Adicionar observação"}
                                  >
                                    {matricula!.observacao ? "📝" : "+"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {matriculados.length === 0 && (
                              <tr>
                                <td colSpan={4} style={{ padding: "6px", color: "#6b7280" }}>
                                  Nenhum matriculado.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Lista de espera */}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                          Lista de espera ({filaDaTurma.length})
                        </p>
                        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left", color: "#6b7280" }}>
                              <th style={{ padding: "4px 6px" }}>#</th>
                              <th style={{ padding: "4px 6px" }}>Nome</th>
                              <th style={{ padding: "4px 6px" }}>Turmas</th>
                              <th style={{ padding: "4px 6px" }}>Filas</th>
                              <th style={{ padding: "4px 6px" }}>Obs.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filaDaTurma.map((entrada) => (
                              <tr key={entrada.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                                <td style={{ padding: "6px" }}>{entrada.posicao}º</td>
                                <td style={{ padding: "6px" }}>{entrada.associadoNome}</td>
                                <td style={{ padding: "6px" }}>{contadoresPorAssociado[entrada.associadoId]?.turmas ?? 0}</td>
                                <td style={{ padding: "6px" }}>{contadoresPorAssociado[entrada.associadoId]?.filas ?? 0}</td>
                                <td style={{ padding: "6px" }}>
                                  <button
                                    onClick={() =>
                                      handleEditarObservacaoFila(entrada.id, entrada.observacao ?? "")
                                    }
                                    style={{
                                      fontSize: 12,
                                      border: "1px solid var(--border-default)",
                                      borderRadius: 6,
                                      padding: "2px 8px",
                                      background: "transparent",
                                      cursor: "pointer",
                                    }}
                                    title={entrada.observacao || "Adicionar observação"}
                                  >
                                    {entrada.observacao ? "📝" : "+"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filaDaTurma.length === 0 && (
                              <tr>
                                <td colSpan={5} style={{ padding: "6px", color: "#6b7280" }}>
                                  Ninguém na fila.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
    </div>
  );
}