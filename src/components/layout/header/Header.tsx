import { useTema } from "@/hooks/useTema";

export function Header() {
  const { escuro, alternar } = useTema();

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "var(--background-secondary)",
        borderBottom: "1px solid var(--border-default)",
        boxShadow: "0 1px 6px rgba(15,23,42,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
        Painel Administrativo
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button
          onClick={alternar}
          title={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid var(--border-default)",
            background: "var(--background-secondary)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s ease, transform 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--background-tertiary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--background-secondary)")}
        >
          {escuro ? "☀️" : "🌙"}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            A
          </span>
          Administrador
        </div>
      </div>
    </header>
  );
}