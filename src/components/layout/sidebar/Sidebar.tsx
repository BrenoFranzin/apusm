import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  Tag,
  ClipboardList,
  Clock,
  GraduationCap,
  CalendarDays,
  BarChart3,
  CalendarCheck2,
  Settings,
  ShieldCheck,
  Dumbbell,
} from "lucide-react";

const menu = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Associados", path: "/associados", icon: Users },
  { label: "Modalidades", path: "/modalidades", icon: Tag },
  { label: "Turmas", path: "/turmas", icon: ClipboardList },
  { label: "Listas/Espera", path: "/lista-espera", icon: Clock },
  { label: "Instrutores", path: "/instrutores", icon: GraduationCap },
  { label: "Agenda", path: "/agenda", icon: CalendarDays },
  { label: "Relatórios", path: "/relatorios", icon: BarChart3 },
  { label: "Presença Semanal", path: "/relatorios/presenca-semanal", icon: CalendarCheck2 },
  { label: "Configurações", path: "/configuracoes", icon: Settings },
  { label: "Plantão de Serviço", path: "/plantao", icon: ShieldCheck },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const itemAtivo = menu.reduce<string | null>((melhor, item) => {
    const bate = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
    if (!bate) return melhor;
    if (melhor === null || item.path.length > melhor.length) return item.path;
    return melhor;
  }, null);

  return (
    <aside
      style={{
        width: 264,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0F766E 0%, #0B4F49 100%)",
        color: "#fff",
        boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        zIndex: 200,
      }}
    >
      {/* Cabeçalho / logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "22px 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Dumbbell size={19} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.3, lineHeight: 1.1 }}>
            APUSM
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
            Modalidades
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          padding: "16px 12px",
          overflowY: "auto",
        }}
      >
        {menu.map((item) => {
          const ativo = itemAtivo === item.path;
          const Icone = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              onClick={(e) => {
                e.preventDefault();
                startTransition(() => navigate(item.path));
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: ativo ? 600 : 500,
                color: ativo ? "#fff" : "rgba(255,255,255,0.82)",
                background: ativo ? "rgba(255,255,255,0.16)" : "transparent",
                borderLeft: ativo ? "3px solid #fff" : "3px solid transparent",
                textDecoration: "none",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!ativo) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!ativo) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icone size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
        }}
      >
        APUSM Modalidades · v1.0
      </div>
    </aside>
  );
}