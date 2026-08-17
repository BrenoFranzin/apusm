// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: RelatorioMatriculasPage.tsx
// ======================================================
import { useEffect, useState } from "react";
import { associadosService } from "@/modules/associados/services/associados.service";
import type { Associado } from "@/modules/associados/types/associado.types";

const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function formatarDataMatricula(isoString: string): string {
  const data = new Date(isoString);
  if (isNaN(data.getTime())) return isoString;

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  const segundo = String(data.getSeconds()).padStart(2, "0");
  const diaSemana = DIAS_SEMANA[data.getDay()];

  return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo} / ${diaSemana}`;
}

export default function RelatorioMatriculasPage() {
  const [associados, setAssociados] = useState<Associado[]>([]);

  useEffect(() => {
    associadosService.listar().then(setAssociados);
  }, []);

  const linhas = associados.flatMap((a) =>
    a.matriculas
      .filter((m) => m.status !== "CANCELADA")
      .map((m) => ({ associado: a, matricula: m }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)" }}>Relatório de Matrículas</h1>
        <p style={{ color: "var(--page-subheading)" }}>{linhas.length} matrículas ativas no sistema</p>
      </div>
      {linhas.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhuma matrícula ativa ainda.</p>
      ) : (
        <div
          style={{
            background: "var(--background-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Associado</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Modalidade</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Turma</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Matriculado em</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ associado, matricula }) => (
                <tr key={matricula.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>{associado.nome}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{matricula.modalidadeNome}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{matricula.turmaNome}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{formatarDataMatricula(matricula.dataMatricula)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}