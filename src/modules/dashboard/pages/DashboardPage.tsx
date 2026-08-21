// ======================================================
// APUSM SaaS — Dashboard
// ======================================================
import { Link } from "react-router-dom";
import { useAssociados } from "@/modules/associados/hooks/useAssociados";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import {
  Users,
  Tag,
  GraduationCap,
  ClipboardList,
  CalendarDays,
  Search,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export default function DashboardPage() {
  const { associados } = useAssociados();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { turmas } = useTurmas();

  const ativos = associados.filter((a) => a.status === "ATIVO").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--page-heading)" }}>
          Painel Administrativo
        </h1>
        <p style={{ color: "var(--page-subheading)", marginTop: 2 }}>
          Visão geral da Academia APUSM
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <Card icone={Users} cor="#166534" bg="#DCFCE7" titulo="Associados ativos" valor={ativos} total={associados.length} />
        <Card icone={Tag} cor="#9A3412" bg="#FFEDD5" titulo="Modalidades" valor={modalidades.length} />
        <Card icone={GraduationCap} cor="#3730A3" bg="#E0E7FF" titulo="Instrutores" valor={instrutores.length} />
        <Card icone={ClipboardList} cor="#0F766E" bg="#CCFBF1" titulo="Turmas" valor={turmas.length} />
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
          Acesso rápido
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
          }}
        >
          <Atalho to="/associados" icone={Users} label="Associados" />
          <Atalho to="/modalidades" icone={Tag} label="Modalidades" />
          <Atalho to="/instrutores" icone={GraduationCap} label="Instrutores" />
          <Atalho to="/turmas" icone={ClipboardList} label="Turmas" />
          <Atalho to="/agenda" icone={CalendarDays} label="Agenda" />
          <Atalho to="/relatorios/consulta" icone={Search} label="Consultar associado" />
          <Atalho to="/relatorios/matriculas" icone={BarChart3} label="Relatório de matrículas" />
          <Atalho to="/configuracoes" icone={Settings} label="Configurações" />
        </div>
      </div>
    </div>
  );
}

function Card({
  icone: Icone, cor, bg, titulo, valor, total,
}: { icone: LucideIcon; cor: string; bg: string; titulo: string; valor: number; total?: number }) {
  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--radius-md)",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icone size={20} color={cor} strokeWidth={2.2} />
      </div>
      <div>
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600, margin: 0 }}>
          {titulo}
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: "3px 0 0", lineHeight: 1 }}>
          {valor}
          {total !== undefined && (
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}> / {total}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function Atalho({ to, icone: Icone, label }: { to: string; icone: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "13px 16px",
        textDecoration: "none",
        color: "var(--text-primary)",
        fontWeight: 500,
        fontSize: 13.5,
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Icone size={17} strokeWidth={2} color="var(--color-primary)" />
      {label}
    </Link>
  );
}