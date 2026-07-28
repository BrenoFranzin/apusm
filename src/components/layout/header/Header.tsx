import { useTema } from "@/hooks/useTema";

export function Header() {
  const { escuro, alternar } = useTema();

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        background: "var(--background-primary)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
        Painel Administrativo
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={alternar}
          title={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid var(--border-default)",
            background: "var(--background-secondary)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {escuro ? "☀️" : "🌙"}
        </button>

        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Administrador
        </div>
      </div>
    </header>
  );
}