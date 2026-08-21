// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadosPage.tsx
// ======================================================
import { useNavigate } from "react-router-dom";
import { Plus, Users, UserCheck, Hourglass } from "lucide-react";

import { useAssociados } from "../hooks/useAssociados";
import AssociadoSearch from "../components/AssociadoSearch";
import AssociadoFilters from "../components/AssociadoFilters";
import AssociadoTable from "../components/AssociadoTable";

export default function AssociadosPage() {
  const navigate = useNavigate();

  const {
    associados,
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    excluir,
  } = useAssociados();

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--page-heading)" }}>
            Associados
          </h1>
          <p style={{ color: "var(--page-subheading)", marginTop: 2 }}>
            Gestão de associados APUSM
          </p>
        </div>

        <button
          onClick={() => navigate("/associados/novo")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            padding: "11px 20px",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "background 0.15s ease, transform 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
        >
          <Plus size={17} />
          Novo Associado
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard icone={Users} cor="#1E293B" bg="var(--background-tertiary)" titulo="Total" valor={associados.length} />
        <StatCard icone={UserCheck} cor="#166534" bg="var(--color-success-light)" titulo="Ativos" valor={associados.filter((a) => a.status === "ATIVO").length} />
        <StatCard icone={Hourglass} cor="#854D0E" bg="var(--color-warning-light)" titulo="Pendentes" valor={associados.filter((a) => a.status === "PENDENTE").length} />
      </div>

      <AssociadoSearch valor={busca} onChange={setBusca} />
      <AssociadoFilters valor={statusFiltro} onChange={setStatusFiltro} />

      <AssociadoTable
        associados={associados}
        onVisualizar={(id) => navigate(`/associados/${id}`)}
        onEditar={(id) => navigate(`/associados/${id}/editar`)}
        onExcluir={(id) => {
          if (confirm("Excluir associado?")) excluir(id);
        }}
      />
    </div>
  );
}

function StatCard({
  icone: Icone, cor, bg, titulo, valor,
}: { icone: typeof Users; cor: string; bg: string; titulo: string; valor: number }) {
  return (
    <div className="apusm-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 40, height: 40, borderRadius: "var(--radius-md)",
          background: bg, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icone size={19} color={cor} strokeWidth={2.2} />
      </div>
      <div>
        <p style={{ color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, margin: 0 }}>{titulo}</p>
        <strong style={{ fontSize: 24, color: "var(--text-primary)" }}>{valor}</strong>
      </div>
    </div>
  );
}