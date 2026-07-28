// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoFilters.tsx
// Botões de filtro com cor por status
// ======================================================

interface Props {
  valor: string;
  onChange: (valor: string) => void;
}

const CORES: Record<string, { bg: string; color: string; borderAtivo: string }> = {
  TODOS:     { bg: "#111827", color: "#fff",    borderAtivo: "#111827" },
  ATIVO:     { bg: "#dcfce7", color: "#166534", borderAtivo: "#16a34a" },
  PENDENTE:  { bg: "#fef9c3", color: "#854d0e", borderAtivo: "#ca8a04" },
  INATIVO:   { bg: "#f3f4f6", color: "#4b5563", borderAtivo: "#9ca3af" },
  BLOQUEADO: { bg: "#fee2e2", color: "#991b1b", borderAtivo: "#dc2626" },
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
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: ativo ? `1.5px solid ${cor.borderAtivo}` : "1px solid #e5e7eb",
              background: ativo ? cor.bg : "#fff",
              color: ativo ? cor.color : "#4b5563",
            }}
          >
            {filtro}
          </button>
        );
      })}
    </div>
  );
}