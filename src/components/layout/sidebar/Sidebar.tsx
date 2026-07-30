import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", path: "/" },
  { label: "Associados", path: "/associados" },
  { label: "Modalidades", path: "/modalidades" },
  { label: "Turmas", path: "/turmas" },
  { label: "Listas/Espera", path: "/lista-espera" },
  { label: "Instrutores", path: "/instrutores" },
  { label: "Agenda", path: "/agenda" },
  { label: "Relatórios", path: "/relatorios" },
  { label: "Configurações", path: "/configuracoes" },
  { label: "Plantão de Serviço", path: "/plantao" },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-green-900 text-white p-5">
      <h2 className="text-2xl font-bold mb-8">
        APUSM
      </h2>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `
              block
              px-4
              py-3
              rounded-lg
              transition

              ${
                isActive
                  ? "bg-green-700"
                  : "hover:bg-green-800"
              }
              `
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}