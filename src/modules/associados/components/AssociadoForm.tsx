// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoForm.tsx
// ======================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { associadoSchema, type AssociadoFormData } from "../schemas/associado.schema";
import { StatusAssociado } from "../types/associado.types";
import { formatarTelefone } from "../utils/telefone";

interface Props {
  valoresIniciais?: Partial<AssociadoFormData>;
  onSubmit: (dados: AssociadoFormData) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "2px solid var(--border-strong)",
  background: "var(--background-primary)",
  color: "var(--text-primary)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: 4,
};

export default function AssociadoForm({ valoresIniciais, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssociadoFormData>({
    resolver: zodResolver(associadoSchema) as any,
    defaultValues: {
      nome: "",
      telefone: "",
      status: StatusAssociado.ATIVO,
      ...valoresIniciais,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="apusm-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>Nome completo</label>
        <input {...register("nome")} style={inputStyle} />
        <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 4 }}>{errors.nome?.message}</p>
      </div>

      <div>
        <label style={labelStyle}>Telefone</label>
        <input
          placeholder="(00) 00000-0000"
          value={watch("telefone")}
          onChange={(e) => setValue("telefone", formatarTelefone(e.target.value))}
          style={inputStyle}
        />
        <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 4 }}>{errors.telefone?.message}</p>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <select {...register("status")} style={inputStyle}>
          <option value="ATIVO">Ativo</option>
          <option value="PENDENTE">Pendente</option>
          <option value="INATIVO">Inativo</option>
          <option value="BLOQUEADO">Bloqueado</option>
        </select>
      </div>

      <button
        type="submit"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: 600,
          border: "none",
          alignSelf: "flex-start",
        }}
      >
        Salvar associado
      </button>
    </form>
  );
}