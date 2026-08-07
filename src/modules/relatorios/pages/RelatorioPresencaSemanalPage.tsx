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

function calcularQtdSemanas(ano: number, mes: number): number {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const inicioSemana1 = new Date(primeiroDia);
  inicioSemana1.setDate(1 - primeiroDia.getDay());
  const diffDias = Math.floor((ultimoDia.getTime() - inicioSemana1.getTime()) / 86400000);
  return Math.floor(diffDias / 7) + 1;
}
const ORDEM_DIA = ["seg", "ter", "qua", "qui", "sex", "sab"];
const ORDINAL = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];

function calcularFaixaSemana(ano: number, mes: number, semana: number): { inicio: Date; fim: Date; label: string } {
  const primeiroDia = new Date(ano, mes, 1);
  const inicioSemana1 = new Date(primeiroDia);
  inicioSemana1.setDate(1 - primeiroDia.getDay());
  const inicio = new Date(inicioSemana1);
  inicio.setDate(inicio.getDate() + (semana - 1) * 7);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  const fmt = (d: Date) => String(d.getDate()).padStart(2, "0");
  return { inicio, fim, label: `${fmt(inicio)} a ${fmt(fim)}` };
}

// ------------------------------------------------------
// Modal de uma semana
// ------------------------------------------------------
function SemanaModal({
  semana,
  ano,
  mes,
  turmasComModalidade,
  registros,
  salvando,
  onAlterar,
  instrutorNome,
  onFechar,
}: {
  semana: number;
  ano: number;
  mes: number;
  turmasComModalidade: { turma: any; modalidade: any }[];
  registros: RegistroPresencaSemanal[];
  salvando: string | null;
  onAlterar: (turmaId: string, semana: number, valor: string) => void;
  instrutorNome: (id: string) => string;
  onFechar: () => void;
}) {
  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const fmtCompleto = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  function valorAtual(turmaId: string): number {
    const r = registros.find((r) => r.turmaId === turmaId && r.semana === semana);
    return r?.totalAlunos ?? 0;
  }

  return (
    <div
      onClick={onFechar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-modal)" as unknown as number,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apusm-card"
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "var(--text-primary)" }}>
            {ORDINAL[semana - 1]} Semana — {MESES[mes]}/{ano}
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          {fmtCompleto(inicio)} até {fmtCompleto(fim)}
        </p>

        {turmasComModalidade.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
        ) : (
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
                        defaultValue={valorAtual(turma.id)}
                        key={`${chave}-${valorAtual(turma.id)}`}
                        onBlur={(e) => onAlterar(turma.id, semana, e.target.value)}
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
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// PÃ¡gina principal
// ------------------------------------------------------
export default function RelatorioPresencaSemanalPage() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [registros, setRegistros] = useState<RegistroPresencaSemanal[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [semanaAberta, setSemanaAberta] = useState<number | null>(null);
  const qtdSemanas = useMemo(() => calcularQtdSemanas(ano, mes), [ano, mes]);
  const semanas = useMemo(() => Array.from({ length: qtdSemanas }, (_, i) => i + 1), [qtdSemanas]);

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

      {/* Abas de mÃªs */}
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

      {/* Botões de semana */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {SEMANAS.map((semana) => {
          const { label } = calcularFaixaSemana(ano, mes, semana);
          return (
            <button
              key={semana}
              onClick={() => setSemanaAberta(semana)}
              className="apusm-card"
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                border: "2px solid var(--border-default)",
                background: "var(--background-primary)",
                cursor: "pointer",
                textAlign: "left",
                minWidth: 160,
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px", color: "var(--text-primary)" }}>
                {ORDINAL[semana - 1]} SEMANA
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {semanaAberta !== null && (
        <SemanaModal
          semana={semanaAberta}
          ano={ano}
          mes={mes}
          turmasComModalidade={turmasComModalidade}
          registros={registros}
          salvando={salvando}
          onAlterar={handleAlterar}
          instrutorNome={instrutorNome}
          onFechar={() => setSemanaAberta(null)}
        />
      )}
    </div>
  );
}