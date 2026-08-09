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
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [filas, setFilas] = useState<EntradaListaEspera[]>([]);
  const [selecionados, setSelecionados] = useState<Record<string, string[]>>({});
  const [decisaoTurmaId, setDecisaoTurmaId] = useState<string | null>(null);
  const [processandoDecisao, setProcessandoDecisao] = useState(false);

  useEffect(() => {
    async function carregar() {
      const [mods, instrutoresData] = await Promise.all([
        modalidadesService.listar(),
        instrutoresService.listar(),
      ]);
      setModalidade(mods.find((m) => m.id === modalidadeId) ?? null);
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
        .sort((a, b) => ORDEM_DIA.indexOf(a.dia) - ORDEM_DIA.indexOf(b.dia)),
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
      <span
        style={{
          marginLeft: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "#166534",
          background: "#dcfce7",
          padding: "1px 6px",
          borderRadius: 999,
        }}
      >
        {qtdFilas} filas
      </span>
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