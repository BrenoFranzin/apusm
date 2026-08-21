// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoSearch.tsx
// ======================================================
import { Search } from "lucide-react";

interface Props {
  valor: string;
  onChange: (valor: string) => void;
}

export default function AssociadoSearch({ valor, onChange }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <Search
        size={17}
        color="var(--text-muted)"
        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
      />
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome ou telefone"
        style={{
          width: "100%",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px 12px 40px",
          fontSize: 14,
          background: "var(--background-primary)",
          color: "var(--text-primary)",
          outline: "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-primary-light)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}