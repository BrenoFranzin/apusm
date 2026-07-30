// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmasPage.tsx
// Layout reorganizado: agrupado por dia da semana
// + Gerenciamento de Salas unificado
// ======================================================

import { useState } from "react";

import { useTurmas } from "../hooks/useTurmas";
import { TurmaCard } from "../components/TurmaCard";
import TurmaForm from "../components/TurmaForm";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useSalas } from "@/modules/salas/hooks/useSalas";
import type { Turma } from "../types/turma.types";

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
  const { salas, criar: criarSala, excluir: excluirSala, erro: erroSala } = useSalas();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormSala, setMostrarFormSala] = useState(false);
  const [nomeSala, setNomeSala] = useState("");

  const turmasPorDia = DIAS_ORDEM.map((dia) => ({
    dia,
    turmas: turmas
      .filter((t) => t.dia === dia)
      .slice()
      .sort((a, b) => a.horario.localeCompare(b.horario)),
  })).filter((grupo) => grupo.turmas.length > 0);

  async function handleCriarSala() {
    if (!nomeSala.trim()) return;
    const ok = await criarSala({ nome: nomeSala.trim() });
    if (ok) {
      setNomeSala("");
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
            onClick={() => setMostrarFormSala((v) => !v)}
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
              onClick={handleCriarSala}
              className="bg-green-900 text-white px-4 py-2 rounded-lg"
            >
              Salvar
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
                  background: "#f3f4f6",
                  fontSize: 13,
                }}
              >
                🚪 {sala.nome}
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
          <div key={dia} style={{ marginBottom: 8 }}>
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
                  color: "#6b7280",
                  background: "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {turmasDoDia.length} turma(s)
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
                marginBottom: 8,
              }}
            >
              {turmasDoDia.map((turma) => (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  modalidade={modalidades.find((m) => m.id === turma.modalidadeId)}
                  instrutor={instrutores.find((i) => i.id === turma.instrutorId)}
                  onExcluir={excluir}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}