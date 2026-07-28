// ======================================================
// APUSM SaaS — Dashboard
// ======================================================

import { Link } from "react-router-dom";
import { useAssociados } from "@/modules/associados/hooks/useAssociados";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";

export default function DashboardPage() {
  const { associados } = useAssociados();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { turmas } = useTurmas();

  const ativos = associados.filter((a) => a.status === "ATIVO").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-500">Visão geral da Academia APUSM</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <Card cor="#166534" bg="#dcfce7" titulo="Associados ativos" valor={ativos} total={associados.length} />
        <Card cor="#712B13" bg="#FAECE7" titulo="Modalidades" valor={modalidades.length} />
        <Card cor="#3C3489" bg="#EEEDFE" titulo="Instrutores" valor={instrutores.length} />
        <Card cor="#0f6e56" bg="#E1F5EE" titulo="Turmas" valor={turmas.length} />
      </div>

      <div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Acesso rápido</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          <Atalho to="/associados" emoji="👥" label="Associados" />
          <Atalho to="/modalidades" emoji="🏷️" label="Modalidades" />
          <Atalho to="/instrutores" emoji="🧑‍🏫" label="Instrutores" />
          <Atalho to="/turmas" emoji="📋" label="Turmas" />
          <Atalho to="/agenda" emoji="📅" label="Agenda" />
          <Atalho to="/relatorios/consulta" emoji="🔍" label="Consultar associado" />
          <Atalho to="/relatorios/matriculas" emoji="📊" label="Relatório de matrículas" />
          <Atalho to="/configuracoes" emoji="⚙️" label="Configurações" />
        </div>
      </div>
    </div>
  );
}

function Card({
  cor, bg, titulo, valor, total,
}: { cor: string; bg: string; titulo: string; valor: number; total?: number }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "1.1rem 1.25rem" }}>
      <p style={{ fontSize: 12, color: cor, fontWeight: 500, margin: 0 }}>{titulo}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: cor, margin: "4px 0 0" }}>
        {valor}
        {total !== undefined && (
          <span style={{ fontSize: 14, fontWeight: 400 }}> / {total}</span>
        )}
      </p>
    </div>
  );
}

function Atalho({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "14px 16px",
        textDecoration: "none",
        color: "#111827",
        fontWeight: 500,
        fontSize: 14,
      }}
    >
      <span style={{ fontSize: 18 }}>{emoji}</span>
      {label}
    </Link>
  );
}