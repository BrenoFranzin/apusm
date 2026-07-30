import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Associados", path: "/associados", icon: "👥" },
  { label: "Modalidades", path: "/modalidades", icon: "🏷️" },
  { label: "Turmas", path: "/turmas", icon: "📋" },
  { label: "Listas/Espera", path: "/lista-espera", icon: "⏳" },
  { label: "Instrutores", path: "/instrutores", icon: "🧑‍🏫" },
  { label: "Agenda", path: "/agenda", icon: "🗓️" },
  { label: "Relatórios", path: "/relatorios", icon: "📈" },
  { label: "Configurações", path: "/configuracoes", icon: "⚙️" },
  { label: "Plantão de Serviço", path: "/plantao", icon: "🕒" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0F766E 0%, #0B4F49 100%)",
        color: "#fff",
        padding: "24px 16px",
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        position: "relative",
        zIndex: 200,
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 32,
          paddingLeft: 12,
          letterSpacing: 0.5,
        }}
      >
        APUSM
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: "#fff",
              background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
              borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
              transition: "background 0.15s ease, border-color 0.15s ease, padding-left 0.15s ease",
              textDecoration: "none",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.background.includes("0.16")) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.style.background.includes("0.16")) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}