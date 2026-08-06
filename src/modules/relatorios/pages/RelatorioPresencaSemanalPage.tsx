// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: RelatorioPresencaSemanalPage.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { presencaSemanalService } from "../services/presencaSemanal.service";
import type { RegistroPresencaSemanal } from "../types/presencaSemanal.types";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const DIA_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb",
};

const SEMANAS = [1, 2, 3, 4, 5];
const ORDEM_DIA = ["seg", "ter", "qua", "qui", "sex", "sab"];

export default function RelatorioPresencaSemanalPage() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [registros, setRegistros] = useState<RegistroPresencaSemanal[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null);

  const { turmas } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();

  async function carregar() {
    const lista = await presencaSemanalService.listarPorMes(ano, mes);
    setRegistros(lista);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  const turmasPorModalidade = useMemo(() => {
    return modalidades.map((mod) => ({
      modalidade: mod,
      turmas: turmas
        .filter((t) => t.modalidadeId === mod.id)
        .slice()
        .sort((a, b) => ORDEM_DIA.indexOf(a.dia) - ORDEM_DIA.indexOf(b.dia) || a.horario.localeCompare(b.horario)),
    })).filter((g) => g.turmas.length > 0);
  }, [modalidades, turmas]);

  function valorAtual(turmaId: string, semana: number): number {
    const r = registros.find((r) => r.turmaId === turmaId && r.semana === semana);
    return r?.totalAlunos ?? 0;
  }

  async function handleAlterar(turmaId: string, semana: number, valor: string) {
    const totalAlunos = Number(valor) || 0;
    const chave = `${turmaId}-${semana}`;
    setSalvando(chave);
    await presencaSemanalService.salvar({ turmaId, ano, mes, semana, totalAlunos });
    await carregar();
    setSalvando(null);
  }

  function instrutorNome(id: string) {
    return instrutores.find((i) => i.id === id)?.nome ?? "—";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)" }}>
          Presença Semanal por Modalidade
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>
          Registro manual do total de alunos por turma, semana a semana
        </p>
      </div>

      {/* Abas de mês */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MESES.map((nome, i) => (
          <button
            key={nome}
            onClick={() => setMes(i)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${mes === i ? "var(--color-primary)" : "var(--border-default)"}`,
              background: mes === i ? "var(--color-primary)" : "var(--background-primary)",
              color: mes === i ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {nome}
          </button>
        ))}
      </div>

      {turmasPorModalidade.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Nenhuma modalidade com turmas cadastradas.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {turmasPorModalidade.map(({ modalidade, turmas: turmasMod }) => (
          <div
            key={modalidade.id}
            style={{
              border: `2px solid ${modalidade.cor}`,
              borderRadius: 12,
              padding: 16,
              background: "var(--background-primary)",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 4px", color: "var(--text-primary)" }}>
              {modalidade.icone} {modalidade.nome}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
              {MESES[mes]}/{anoAtual}
            </p>

            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--background-tertiary)", textAlign: "center" }}>
                  <th style={{ padding: "6px 4px", textAlign: "left", color: "var(--text-secondary)" }}>Turma</th>
                  {SEMANAS.map((s) => (
                    <th key={s} style={{ padding: "6px 4px", color: "var(--text-secondary)" }}>S{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {turmasMod.map((turma) => (
                  <tr key={turma.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                    <td style={{ padding: "6px 4px", color: "var(--text-primary)" }}>
                      {DIA_LABEL[turma.dia]} {turma.horario}
                      <br />
                      <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                        {instrutorNome(turma.instrutorId)}
                      </span>
                    </td>
                    {SEMANAS.map((semana) => {
                      const chave = `${turma.id}-${semana}`;
                      return (
                        <td key={semana} style={{ padding: "4px", textAlign: "center" }}>
                          <input
                            type="number"
                            min={0}
                            defaultValue={valorAtual(turma.id, semana)}
                            key={`${chave}-${valorAtual(turma.id, semana)}`}
                            onBlur={(e) => handleAlterar(turma.id, semana, e.target.value)}
                            style={{
                              width: 42,
                              padding: "4px 2px",
                              textAlign: "center",
                              border: "1px solid var(--border-default)",
                              borderRadius: 4,
                              background: salvando === chave ? "var(--color-primary-light)" : "var(--background-primary)",
                              color: "var(--text-primary)",
                              fontSize: 12,
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}