// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmasPage.tsx
// Layout reorganizado: agrupado por dia da semana
// ======================================================

import { useState } from "react";

import { useTurmas } from "../hooks/useTurmas";
import { TurmaCard } from "../components/TurmaCard";
import TurmaForm from "../components/TurmaForm";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
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
  const [mostrarForm, setMostrarForm] = useState(false);

  const turmasPorDia = DIAS_ORDEM.map((dia) => ({
    dia,
    turmas: turmas
      .filter((t) => t.dia === dia)
      .slice()
      .sort((a, b) => a.horario.localeCompare(b.horario)),
  })).filter((grupo) => grupo.turmas.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Turmas</h1>
          <p style={{ color: "var(--page-subheading)" }}>
            {turmas.length} turmas cadastradas em {turmasPorDia.length} dias
          </p>
        </div>

        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Nova turma"}
        </button>
      </div>

      {mostrarForm && (
        <>
          <TurmaForm
            modalidades={modalidades}
            instrutores={instrutores}
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
  );
}