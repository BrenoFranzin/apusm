// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: RelatorioMatriculasPage.tsx
// ======================================================
import { useEffect, useState } from "react";
import { associadosService } from "@/modules/associados/services/associados.service";
import type { Associado } from "@/modules/associados/types/associado.types";

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
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{matricula.dataMatricula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}