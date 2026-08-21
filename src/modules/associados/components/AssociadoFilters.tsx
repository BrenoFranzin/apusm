// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoFilters.tsx
// Botões de filtro com cor por status (usa variáveis de tema —
// funciona certo no modo escuro)
// ======================================================

interface Props {
  valor: string;
  onChange: (valor: string) => void;
}

const CORES: Record<string, { bg: string; color: string; borda: string }> = {
  TODOS:     { bg: "var(--text-primary)",        color: "var(--background-primary)", borda: "var(--text-primary)" },
  ATIVO:     { bg: "var(--color-success-light)", color: "var(--color-success)",       borda: "var(--color-success)" },
  PENDENTE:  { bg: "var(--color-warning-light)", color: "var(--color-warning)",       borda: "var(--color-warning)" },
  INATIVO:   { bg: "var(--background-tertiary)", color: "var(--text-secondary)",      borda: "var(--border-strong)" },
  BLOQUEADO: { bg: "var(--color-danger-light)",  color: "var(--color-danger)",        borda: "var(--color-danger)" },
};

export default function AssociadoFilters({ valor, onChange }: Props) {
  const filtros = ["TODOS", "ATIVO", "PENDENTE", "INATIVO", "BLOQUEADO"];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {filtros.map((filtro) => {
        const cor = CORES[filtro];
        const ativo = valor === filtro;

        return (
          <button
            key={filtro}
            onClick={() => onChange(filtro)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: 0.2,
              border: ativo ? `1.5px solid ${cor.borda}` : "1px solid var(--border-default)",
              background: ativo ? cor.bg : "var(--background-primary)",
              color: ativo ? cor.color : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {filtro}
          </button>
        );
      })}
    </div>
  );
}