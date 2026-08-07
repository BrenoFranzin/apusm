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

function calcularFaixaSemana(ano: number, mes: number, semana: number): string {
  const primeiroDia = new Date(ano, mes, 1);
  const inicioSemana1 = new Date(primeiroDia);
  inicioSemana1.setDate(1 - primeiroDia.getDay());
  const inicio = new Date(inicioSemana1);
  inicio.setDate(inicio.getDate() + (semana - 1) * 7);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  const fmt = (d: Date) => String(d.getDate()).padStart(2, "0");
  return `${fmt(inicio)}-${fmt(fim)}`;
}

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

  const turmasComModalidade = useMemo(() => {
    return turmas
      .map((t) => ({ turma: t, modalidade: modalidades.find((m) => m.id === t.modalidadeId) }))
      .filter((x) => x.modalidade)
      .sort((a, b) =>
        a.modalidade!.nome.localeCompare(b.modalidade!.nome) ||
        ORDEM_DIA.indexOf(a.turma.dia) - ORDEM_DIA.indexOf(b.turma.dia) ||
        a.turma.horario.localeCompare(b.turma.horario)
      );
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

      {turmasComModalidade.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Nenhuma turma cadastrada.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SEMANAS.map((semana) => (
          <div
            key={semana}
            style={{
              border: "2px solid var(--border-default)",
              borderRadius: 12,
              padding: 16,
              background: "var(--background-primary)",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 2px", color: "var(--text-primary)" }}>
              Semana {semana}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
              {calcularFaixaSemana(ano, mes, semana)} de {MESES[mes]}/{ano}
            </p>

            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Modalidade</th>
                  <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Turma</th>
                  <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Instrutor</th>
                  <th style={{ padding: "6px 8px", textAlign: "center", color: "var(--text-secondary)" }}>Total alunos</th>
                </tr>
              </thead>
              <tbody>
                {turmasComModalidade.map(({ turma, modalidade }) => {
                  const chave = `${turma.id}-${semana}`;
                  return (
                    <tr key={turma.id} style={{ borderTop: `2px solid ${modalidade!.cor}22` }}>
                      <td style={{ padding: "6px 8px", color: "var(--text-primary)", fontWeight: 600 }}>
                        <span style={{ color: modalidade!.cor }}>{modalidade!.icone}</span> {modalidade!.nome}
                      </td>
                      <td style={{ padding: "6px 8px", color: "var(--text-primary)" }}>
                        {DIA_LABEL[turma.dia]} {turma.horario}
                      </td>
                      <td style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>
                        {instrutorNome(turma.instrutorId)}
                      </td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>
                        <input
                          type="number"
                          min={0}
                          defaultValue={valorAtual(turma.id, semana)}
                          key={`${chave}-${valorAtual(turma.id, semana)}`}
                          onBlur={(e) => handleAlterar(turma.id, semana, e.target.value)}
                          style={{
                            width: 50,
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