// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: ModalidadeTurmasPage.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pdfService } from "@/modules/configuracoes/services/pdf.service";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useAssociados } from "@/modules/associados/hooks/useAssociados";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import { instrutoresService } from "@/modules/instrutores/services/instrutores.service";
import { listaEsperaService } from "../services/listaEspera.service";
import { associadosService } from "@/modules/associados/services/associados.service";




import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import type { Turma } from "@/modules/turmas/types/turma.types";
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

const ORDEM_DIA = ["seg", "ter", "qua", "qui", "sex", "sab"];

export default function ModalidadeTurmasPage() {
  const { modalidadeId } = useParams<{ modalidadeId: string }>();
  const navigate = useNavigate();

  const { turmas } = useTurmas();
  const { todos: associados, carregar: recarregarAssociados } = useAssociados();

  const [modalidade, setModalidade] = useState<Modalidade | null>(null);
const [todasModalidades, setTodasModalidades] = useState<Modalidade[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [filas, setFilas] = useState<EntradaListaEspera[]>([]);
  const [selecionados, setSelecionados] = useState<Record<string, string[]>>({});
  const [associadoFilasAberto, setAssociadoFilasAberto] = useState<{ id: string; nome: string } | null>(null);
  const [decisaoTurmaId, setDecisaoTurmaId] = useState<string | null>(null);
  const [outrasTurmasAberto, setOutrasTurmasAberto] = useState(false);
  const [inserindoTurmaId, setInserindoTurmaId] = useState<string | null>(null);
  const [processandoDecisao, setProcessandoDecisao] = useState(false);

  useEffect(() => {
    async function carregar() {
      const [mods, instrutoresData] = await Promise.all([
        modalidadesService.listar(),
        instrutoresService.listar(),
      ]);
      setModalidade(mods.find((m) => m.id === modalidadeId) ?? null);
setTodasModalidades(mods);
      setInstrutores(instrutoresData);
    }
    carregar();
  }, [modalidadeId]);

  useEffect(() => {
    async function carregarFilas() {
      const todasEntradas = await Promise.all(
        turmas.map((t) => listaEsperaService.listarPorTurma(t.id))
      );
      setFilas(todasEntradas.flat());
    }
    if (turmas.length > 0) carregarFilas();
  }, [turmas]);

  const turmasDaModalidade = useMemo(
    () =>
      turmas
        .filter((t) => t.modalidadeId === modalidadeId)
        .sort(
          (a, b) =>
            ORDEM_DIA.indexOf(a.dia) - ORDEM_DIA.indexOf(b.dia) ||
            a.horario.localeCompare(b.horario)
        ),
    [turmas, modalidadeId]
  );

  function instrutorNome(id: string) {
    return instrutores.find((i) => i.id === id)?.nome ?? "—";
  }

  async function recarregarFilas() {
    const todasEntradas = await Promise.all(
      turmas.map((t) => listaEsperaService.listarPorTurma(t.id))
    );
    setFilas(todasEntradas.flat());
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
    await recarregarFilas();
  }

  function toggleSelecionado(turmaId: string, entradaId: string) {
    setSelecionados((prev) => {
      const atual = prev[turmaId] ?? [];
      const novo = atual.includes(entradaId)
        ? atual.filter((id) => id !== entradaId)
        : [...atual, entradaId];
      return { ...prev, [turmaId]: novo };
    });
  }

  async function handleInserirOutraTurma(turma: Turma, modalidadeNome: string) {
    if (!associadoFilasAberto) return;
    setInserindoTurmaId(turma.id);
    try {
      await associadosService.matricular(associadoFilasAberto.id, {
        turmaId: turma.id,
        turmaNome: `${DIA_LABEL[turma.dia]} ${turma.horario}`,
        modalidadeId: turma.modalidadeId,
        modalidadeNome,
      });
      await recarregarAssociados();
      await recarregarFilas();
    } finally {
      setInserindoTurmaId(null);
    }
  }


  async function handleEscolherParaVaga(turmaId: string, entrada: EntradaListaEspera) {
    setProcessandoDecisao(true);
    try {
      await associadosService.matricular(entrada.associadoId, {
        turmaId: entrada.turmaId,
        turmaNome: entrada.turmaNome,
        modalidadeId: entrada.modalidadeId,
        modalidadeNome: entrada.modalidadeNome,
      });
      await listaEsperaService.sairDaFila(entrada.id);
      await recarregarAssociados();
      await recarregarFilas();
      setSelecionados((prev) => ({ ...prev, [turmaId]: [] }));
      setDecisaoTurmaId(null);
    } finally {
      setProcessandoDecisao(false);
    }
  }

  if (!modalidade) return null;

  const cor = modalidade.cor || "#374151";

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate("/lista-espera")}
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            padding: "6px 12px",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Voltar
        </button>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--page-heading)", display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: cor,
              border: "1px solid var(--border-default)",
              display: "inline-block",
            }}
          />
          <span>{modalidade.icone}</span>
          {modalidade.nome}
        </h1>
      </div>

      {turmasDaModalidade.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Nenhuma turma cadastrada para {modalidade.nome}.
        </p>
      )}

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

            <button
              onClick={() => {
                const agora = new Date();
                pdfService.exportarFolhaPresenca(turma.id, agora.getMonth(), agora.getFullYear());
              }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                background: "var(--color-primary)",
                color: "#fff",
                cursor: "pointer",
                marginBottom: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🖨️ Imprimir folha de presença
            </button>


            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
              Instrutor: {instrutorNome(turma.instrutorId)}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
  <div
    style={{
      background: "var(--background-secondary)",
      border: "1px solid var(--border-default)",
      borderRadius: 10,
      padding: 14,
    }}
  >
    <p
      style={{
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10,
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      ✅ Matriculados
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "var(--background-tertiary)",
          padding: "2px 8px",
          borderRadius: 999,
        }}
      >
        {matriculados.length}/10 — {10 - matriculados.length} vaga(s)
      </span>
    </p>
    <table style={{ width: "100%", fontSize: 13, borderCollapse: "separate", borderSpacing: 0, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-default)" }}>
      <thead>
        <tr style={{ textAlign: "left", color: "var(--text-secondary)", background: "var(--background-tertiary)" }}>
          <th style={{ padding: "6px 8px" }}>Nome</th>
          <th style={{ padding: "6px 8px" }}>Obs.</th>
        </tr>
      </thead>
      <tbody>
        {matriculados.map(({ associado, matricula }) => (
          <tr key={associado.id} style={{ borderTop: "1px solid var(--border-default)" }}>
            <td style={{ padding: "8px" }}>{associado.nome}</td>
            <td style={{ padding: "8px" }}>
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
            <td colSpan={2} style={{ padding: "10px 8px", color: "var(--text-secondary)", textAlign: "center" }}>
              Nenhum matriculado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    {associadoFilasAberto && (
        <div
          onClick={() => setAssociadoFilasAberto(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--background-primary)",
              borderRadius: 12,
              padding: 20,
              width: "90vw",
              maxWidth: 1800,
              minWidth: 320,
              maxHeight: "90vh",
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--text-primary)" }}>
              {associadoFilasAberto.nome}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
              Está em fila de espera em:
            </p>

<div style={{ marginTop: 4, columnCount: 3, columnGap: 12, maxHeight: "30vh", overflowY: "auto", flexShrink: 0, paddingRight: 4 }}>
            {(() => {
              const filasDoAssociado = filas
                .filter((f) => f.associadoId === associadoFilasAberto.id)
                .sort((a, b) => a.modalidadeNome.localeCompare(b.modalidadeNome));

              const porModalidade = new Map<string, typeof filasDoAssociado>();
              filasDoAssociado.forEach((f) => {
                if (!porModalidade.has(f.modalidadeNome)) porModalidade.set(f.modalidadeNome, []);
                porModalidade.get(f.modalidadeNome)!.push(f);
              });

              return Array.from(porModalidade.entries()).map(([nomeMod, entradas]) => {
                const mod = todasModalidades.find((m) => m.id === entradas[0].modalidadeId || m.nome === nomeMod);
                const cor = mod?.cor || "#374151";
                return (
                  <div
                    key={nomeMod}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      marginBottom: 10,
                      background: cor + "1a",
                      border: `1px solid ${cor}`,
                      breakInside: "avoid",
                      WebkitColumnBreakInside: "avoid",
                    } as React.CSSProperties}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: cor, flexShrink: 0 }} />
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                        {mod?.icone ? `${mod.icone} ` : ""}{nomeMod}
                      </p>
                    </div>
                    {entradas.map((f) => (
                      <p key={f.id} style={{ fontSize: 12, margin: "2px 0 0 16px", color: "var(--text-secondary)" }}>
                        {f.turmaNome} — {f.posicao}º na fila
                      </p>
                    ))}
                  </div>
                );
              });
            })()}
            </div>

            <button
              onClick={() => setOutrasTurmasAberto((v) => !v)}
              style={{
                marginTop: 14,
                width: "100%",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                borderRadius: 8,
                padding: "12px 14px",
                background: "var(--color-primary)",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              {outrasTurmasAberto ? "▲ Ocultar outras turmas" : "+ Inserir em outras turmas"}
            </button>

            {outrasTurmasAberto && (() => {
              const associadoAtual = associados.find((a) => a.id === associadoFilasAberto.id);
              const matriculaTurmaIds = (associadoAtual?.matriculas ?? [])
                .filter((m) => m.status !== "CANCELADA")
                .map((m) => m.turmaId);
              const filaTurmaIds = filas
                .filter((f) => f.associadoId === associadoFilasAberto.id)
                .map((f) => f.turmaId);

              const outrasTurmas = turmas.filter(
                (t) => !matriculaTurmaIds.includes(t.id) && !filaTurmaIds.includes(t.id)
              );

              if (outrasTurmas.length === 0) {
                return (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10, textAlign: "center" }}>
                    Já está inserido(a) em todas as turmas disponíveis.
                  </p>
                );
              }

              const porModalidade = new Map<string, Turma[]>();
              outrasTurmas.forEach((t) => {
                const nomeMod = todasModalidades.find((m) => m.id === t.modalidadeId)?.nome ?? "Outras";
                if (!porModalidade.has(nomeMod)) porModalidade.set(nomeMod, []);
                porModalidade.get(nomeMod)!.push(t);
              });

              const gruposOrdenados = Array.from(porModalidade.entries()).sort((a, b) =>
                a[0].localeCompare(b[0])
              );

              const NUM_COLUNAS = 3;
              const colunas: [string, Turma[]][][] = Array.from({ length: NUM_COLUNAS }, () => []);
              const alturaColunas = Array(NUM_COLUNAS).fill(0);

              gruposOrdenados.forEach((grupo) => {
                const alturaEstimada = 1 + grupo[1].length;
                const indexMenor = alturaColunas.indexOf(Math.min(...alturaColunas));
                colunas[indexMenor].push(grupo);
                alturaColunas[indexMenor] += alturaEstimada;
              });

              return (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 12,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    paddingRight: 4,
                    paddingBottom: 8,
                  }}
                >
                  {colunas.map((coluna, colIndex) => (
                    <div key={colIndex} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                      {coluna.map(([nomeMod, turmasDoGrupo]) => {
                    const mod = todasModalidades.find((m) => m.nome === nomeMod);
                    const cor = mod?.cor || "#374151";
                    return (
                      <div
                        key={nomeMod}
                        style={{
                          border: `2px solid ${cor}`,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "var(--background-primary)",
                          marginBottom: 12,
                          breakInside: "avoid",
                          WebkitColumnBreakInside: "avoid",
                        } as React.CSSProperties}
                      >
                        <div
                          style={{
                            background: cor,
                            padding: "6px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                            {mod?.icone ? `${mod.icone} ` : ""}{nomeMod}
                          </span>
                        </div>

                        <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                          {turmasDoGrupo
                            .slice()
                            .sort(
                              (a, b) =>
                                ORDEM_DIA.indexOf(a.dia) - ORDEM_DIA.indexOf(b.dia) ||
                                a.horario.localeCompare(b.horario)
                            )
                            .map((t) => {
                              const qtdMatriculados = associados.filter((a) =>
                                a.matriculas.some((m) => m.turmaId === t.id && m.status !== "CANCELADA")
                              ).length;
                              const vagas = t.limiteVagas ?? 10;
                              const temVaga = qtdMatriculados < vagas;
                              const qtdNaFila = filas.filter((f) => f.turmaId === t.id).length;

                              return (
                                <div
                                  key={t.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 6,
                                    padding: "6px 8px",
                                    borderRadius: 6,
                                    background: cor + "14",
                                  }}
                                >
                                  <p style={{ fontSize: 12, margin: 0, color: "var(--text-primary)", fontWeight: 500 }}>
                                    {DIA_LABEL[t.dia]} — {t.horario}
                                  </p>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 6px",
                                        borderRadius: 999,
                                        whiteSpace: "nowrap",
                                        color: temVaga ? "#166534" : "#9a3412",
                                        background: temVaga ? "#dcfce7" : "#ffedd5",
                                      }}
                                    >
                                      {temVaga ? "Vaga" : `Fila (${qtdNaFila} na frente)`}
                                    </span>
                                    <button
                                      disabled={inserindoTurmaId === t.id}
                                      onClick={() => handleInserirOutraTurma(t, nomeMod)}
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "5px 9px",
                                        background: cor,
                                        color: "#fff",
                                        cursor: inserindoTurmaId === t.id ? "not-allowed" : "pointer",
                                      }}
                                    >
                                      {inserindoTurmaId === t.id ? "..." : "Inserir"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}

            <button
              onClick={() => { setAssociadoFilasAberto(null); setOutrasTurmasAberto(false); }}
              style={{
                marginTop: 14,
                width: "100%",
                fontSize: 14,
                fontWeight: 700,
                border: "2px solid var(--border-default)",
                borderRadius: 8,
                padding: "10px 12px",
                background: "var(--background-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
  </div>

  <div
    style={{
      background: "var(--background-secondary)",
      border: "1px solid var(--border-default)",
      borderRadius: 10,
      padding: 14,
    }}
  >
    <p
      style={{
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 10,
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      ⏳ Lista de espera
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "var(--background-tertiary)",
          padding: "2px 8px",
          borderRadius: 999,
        }}
      >
        {filaDaTurma.length}
      </span>
    </p>
    <table style={{ width: "100%", fontSize: 13, borderCollapse: "separate", borderSpacing: 0, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-default)" }}>
      <thead>
        <tr style={{ textAlign: "left", color: "var(--text-secondary)", background: "var(--background-tertiary)" }}>
          <th style={{ padding: "6px 8px" }}></th>
          <th style={{ padding: "6px 8px" }}>#</th>
          <th style={{ padding: "6px 8px" }}>Nome</th>
          <th style={{ padding: "6px 8px" }}>Obs.</th>
        </tr>
      </thead>
      <tbody>
        {filaDaTurma.map((entrada) => (
          <tr key={entrada.id} style={{ borderTop: "1px solid var(--border-default)" }}>
            <td style={{ padding: "8px" }}>
              <input
                type="checkbox"
                checked={(selecionados[turma.id] ?? []).includes(entrada.id)}
                onChange={() => toggleSelecionado(turma.id, entrada.id)}
              />
            </td>
            <td style={{ padding: "8px" }}>{entrada.posicao}º</td>
            <td style={{ padding: "8px" }}>
  {entrada.associadoNome}
  {(() => {
  const qtdFilas = filas.filter((f) => f.associadoId === entrada.associadoId).length;
  return qtdFilas > 1 ? (
    <button
      onClick={() => setAssociadoFilasAberto({ id: entrada.associadoId, nome: entrada.associadoNome })}
      style={{
        marginLeft: 6,
        fontSize: 11,
        fontWeight: 700,
        color: "#166534",
        background: "#dcfce7",
        padding: "1px 6px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
      }}
    >
      {qtdFilas} filas
    </button>
  ) : null;
})()}
</td>
            <td style={{ padding: "8px" }}>
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
            <td colSpan={4} style={{ padding: "10px 8px", color: "var(--text-secondary)", textAlign: "center" }}>
              Ninguém na fila.
            </td>
          </tr>
        )}
      </tbody>
    </table>

    {(selecionados[turma.id] ?? []).length >= 1 && (10 - matriculados.length) > 0 && (
      <button
        onClick={() => setDecisaoTurmaId(turma.id)}
        style={{ marginTop: 10, fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, padding: "6px 12px", background: "var(--color-primary)", color: "#fff", cursor: "pointer" }}
      >
        Liberar vaga para selecionado(s)
      </button>
    )}

    {decisaoTurmaId === turma.id && (
      <div style={{ marginTop: 10, border: "1px solid var(--color-primary)", borderRadius: 8, padding: 12, background: "var(--background-tertiary)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
          Colocar quem na vaga?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {filaDaTurma
            .filter((e) => (selecionados[turma.id] ?? []).includes(e.id))
            .map((e) => (
              <button
                key={e.id}
                disabled={processandoDecisao}
                onClick={() => handleEscolherParaVaga(turma.id, e)}
                style={{ fontSize: 12, border: "1px solid var(--color-primary)", borderRadius: 6, padding: "6px 12px", background: "var(--background-primary)", color: "var(--color-primary)", cursor: "pointer" }}
              >
                {e.associadoNome}
              </button>
            ))}
        </div>
        <button
          onClick={() => setDecisaoTurmaId(null)}
          style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "6px 12px", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
        >
          Cancelar
        </button>
      </div>
    )}
  </div>
</div>
          </div>
        );
      })}
    </div>
  );
}