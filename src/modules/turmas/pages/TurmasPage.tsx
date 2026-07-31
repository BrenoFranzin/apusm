// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmasPage.tsx
// + Gerenciamento de Salas unificado com edição
// ======================================================

import { useState } from "react";

import { useTurmas } from "../hooks/useTurmas";
import TurmaForm from "../components/TurmaForm";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useSalas } from "@/modules/salas/hooks/useSalas";
import type { Turma } from "../types/turma.types";
import { useNotificacaoAulas } from "@/hooks/useNotificacaoAulas";


const DIAS_ORDEM: Turma["dia"][] = ["seg", "ter", "qua", "qui", "sex", "sab"];

const DIA_LABEL: Record<string, string> = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
};

export default function TurmasPage() {
  const { turmas, criar, excluir, erro } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { salas, criar: criarSala, editar: editarSala, excluir: excluirSala, erro: erroSala } = useSalas();


  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormSala, setMostrarFormSala] = useState(false);
  const [nomeSala, setNomeSala] = useState("");
  const [salaEditandoId, setSalaEditandoId] = useState<string | null>(null);

  const turmasPorDia = DIAS_ORDEM.map((dia) => ({
    dia,
    turmas: turmas
      .filter((t) => t.dia === dia)
      .slice()
      .sort((a, b) => a.horario.localeCompare(b.horario)),
  })).filter((grupo) => grupo.turmas.length > 0);

  function iniciarNovaSala() {
    setSalaEditandoId(null);
    setNomeSala("");
    setMostrarFormSala((v) => !v);
  }

  function iniciarEdicaoSala(id: string, nomeAtual: string) {
    setSalaEditandoId(id);
    setNomeSala(nomeAtual);
    setMostrarFormSala(true);
  }

  async function handleSalvarSala() {
    if (!nomeSala.trim()) return;

    const ok = salaEditandoId
      ? await editarSala(salaEditandoId, { nome: nomeSala.trim() })
      : await criarSala({ nome: nomeSala.trim() });

    if (ok) {
      setNomeSala("");
      setSalaEditandoId(null);
      setMostrarFormSala(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Turmas</h1>
          <p style={{ color: "var(--page-subheading)" }}>
            {turmas.length} turmas cadastradas em {turmasPorDia.length} dias
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="bg-green-900 text-white px-5 py-3 rounded-lg"
          >
            {mostrarForm ? "Fechar" : "+ Nova turma"}
          </button>

          <button
            onClick={iniciarNovaSala}
            className="bg-green-900 text-white px-5 py-3 rounded-lg"
          >
            {mostrarFormSala ? "Fechar" : "+ Nova sala"}
          </button>
        </div>
      </div>

      {/* ===== Bloco de Salas ===== */}
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          background: "var(--background-primary)",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)" }}>
          Salas cadastradas
        </p>

        {mostrarFormSala && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={nomeSala}
              onChange={(e) => setNomeSala(e.target.value)}
              placeholder="Nome da sala"
              style={{
                flex: 1,
                padding: 8,
                background: "var(--background-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                borderRadius: 6,
              }}
            />
            <button
              onClick={handleSalvarSala}
              className="bg-green-900 text-white px-4 py-2 rounded-lg"
            >
              {salaEditandoId ? "Salvar edição" : "Salvar"}
            </button>
          </div>
        )}
        {erroSala && <p style={{ color: "#dc2626", fontSize: 13, marginTop: -8, marginBottom: 8 }}>{erroSala}</p>}

        {salas.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Nenhuma sala cadastrada ainda.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {salas.map((sala) => (
              <div
                key={sala.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--background-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              >
                🚪 {sala.nome}
                <button
                  onClick={() => iniciarEdicaoSala(sala.id, sala.nome)}
                  style={{
                    border: "1px solid #93c5fd",
                    color: "#2563eb",
                    background: "transparent",
                    borderRadius: 6,
                    padding: "0 6px",
                    cursor: "pointer",
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Excluir a sala "${sala.nome}"?`)) {
                      excluirSala(sala.id);
                    }
                  }}
                  style={{
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                    background: "transparent",
                    borderRadius: 6,
                    padding: "0 6px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Bloco de Turmas ===== */}
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          background: "var(--background-primary)",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)" }}>
          Turmas por dia da semana
        </p>

        {mostrarForm && (
          <>
            <TurmaForm
              modalidades={modalidades}
              instrutores={instrutores}
              salas={salas}
              onSubmit={async (dados) => {
                const ok = await criar(dados);
                if (ok) setMostrarForm(false);
              }}
            />
            {erro && <p style={{ color: "#dc2626", fontSize: 13 }}>{erro}</p>}
          </>
        )}

        {turmasPorDia.length === 0 && (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Nenhuma turma cadastrada ainda.
          </p>
        )}

        {turmasPorDia.map(({ dia, turmas: turmasDoDia }) => (
          <div key={dia} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border-default)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                {DIA_LABEL[dia]}
              </p>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  background: "var(--background-tertiary)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {turmasDoDia.length} turma(s)
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Horário</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Modalidade</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Instrutor</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Sala</th>
                  <th style={{ padding: "10px 8px", width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {turmasDoDia.map((turma) => {
                  const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
                  const instrutor = instrutores.find((i) => i.id === turma.instrutorId);
                  const cor = modalidade?.cor ?? "#6b7280";
                  return (
                    <tr key={turma.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{turma.horario}</span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: cor, display: "inline-block", flexShrink: 0 }} />
                          {modalidade ? `${modalidade.icone} ${modalidade.nome}` : "Modalidade removida"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                        {instrutor?.nome ?? "Sem instrutor"}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                        {turma.sala}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            const confirmar = window.confirm(
                              `Excluir esta turma (${DIA_LABEL[turma.dia]} ${turma.horario})? Essa ação não pode ser desfeita.`
                            );
                            if (confirmar) excluir(turma.id);
                          }}
                          style={{
                            fontSize: 12,
                            color: "var(--color-danger)",
                            border: "1px solid var(--color-danger)",
                            borderRadius: 6,
                            padding: "5px 10px",
                            background: "var(--background-primary)",
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}