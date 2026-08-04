// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: DetalhesAssociadoPage.tsx
// ======================================================

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatarTelefone } from "../utils/telefone";
import { useAssociados } from "../hooks/useAssociados";
import type { Associado } from "../types/associado.types";

export default function DetalhesAssociadoPage() {
  const { buscarPorId } = useAssociados();
  const { id } = useParams();
  const [associado, setAssociado] = useState<Associado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!id) return;
      const dados = await buscarPorId(id);
      setAssociado(dados ?? null);
      setLoading(false);
    }
    carregar();
  }, [id, buscarPorId]);

  if (loading) {
    return <div style={{ color: "var(--text-secondary)" }}>Carregando associado...</div>;
  }

  if (!associado) {
    return <div style={{ color: "var(--text-secondary)" }}>Associado não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--page-heading)" }}>
        {associado.nome}
      </h1>

      <div
        style={{
          background: "var(--background-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
          padding: 24,
        }}
      >
        <p style={{ color: "var(--text-primary)" }}>Telefone: {formatarTelefone(associado.telefone)}</p>
        <p style={{ color: "var(--text-primary)" }}>Status: {associado.status}</p>
      </div>

      <div
        style={{
          background: "var(--background-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
          padding: 24,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: "var(--text-primary)" }}>Modalidades</h2>
        {associado.matriculas.map((item) => (
          <p key={item.id} style={{ color: "var(--text-primary)" }}>
            {item.modalidadeNome} - {item.turmaNome}
          </p>
        ))}
      </div>
    </div>
  );
}