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
        <p className="text-gray-500 text-sm">Nenhuma matrícula ativa ainda.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>Associado</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>Modalidade</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>Turma</th>
                <th style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>Matriculado em</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ associado, matricula }) => (
                <tr key={matricula.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{associado.nome}</td>
                  <td style={{ padding: "12px 16px" }}>{matricula.modalidadeNome}</td>
                  <td style={{ padding: "12px 16px" }}>{matricula.turmaNome}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{matricula.dataMatricula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}