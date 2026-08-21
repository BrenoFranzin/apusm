// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmaForm.tsx
// ======================================================
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { turmaSchema, type TurmaFormData } from "../schemas/turma.schema";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import type { Instrutor } from "@/modules/instrutores/types/instrutor.types";

const DIAS = [
  { valor: "seg", label: "Segunda" },
  { valor: "ter", label: "Terça" },
  { valor: "qua", label: "Quarta" },
  { valor: "qui", label: "Quinta" },
  { valor: "sex", label: "Sexta" },
  { valor: "sab", label: "Sábado" },
];

interface Props {
  modalidades: Modalidade[];
  instrutores: Instrutor[];
  salas: { id: string; nome: string }[];
  onSubmit: (dados: TurmaFormData) => void;
  mostrarLimites?: boolean;
}

const selectStyle: CSSProperties = {
  width: "100%",
  margin: "4px 0 12px",
  padding: 9,
  background: "var(--background-secondary)",
  color: "var(--text-primary)",
  border: "1.5px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  fontSize: 14,
};

const labelStyle: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-secondary)",
};

export default function TurmaForm({ modalidades, instrutores, salas, onSubmit, mostrarLimites = true }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema) as any,
    defaultValues: {
      modalidadeId: modalidades[0]?.id ?? "",
      instrutorId: instrutores[0]?.id ?? "",
      dia: "seg",
      horario: "08:00",
      sala: "",
      limiteVagas: 10,
      limiteNovosAlunos: 9,
      observacao: "",
    },
  });

  const modalidadeSelecionada = modalidades.find((m) => m.id === watch("modalidadeId"));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        maxWidth: 420,
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px", color: "var(--page-heading)" }}>
        Nova turma
      </p>

      <label style={labelStyle}>Modalidade</label>
      <select {...register("modalidadeId")} style={selectStyle}>
        {modalidades.map((m) => (
          <option key={m.id} value={m.id}>{m.icone} {m.nome}</option>
        ))}
      </select>
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "-8px 0 8px" }}>{errors.modalidadeId?.message}</p>
      {modalidadeSelecionada?.descricao && (
        <p style={{ fontSize: 12, color: "var(--color-primary)", margin: "-6px 0 12px", fontStyle: "italic" }}>
          ℹ️ {modalidadeSelecionada.descricao}
        </p>
      )}

      <label style={labelStyle}>Instrutor</label>
      <select {...register("instrutorId")} style={selectStyle}>
        {instrutores.map((i) => (
          <option key={i.id} value={i.id}>{i.nome}</option>
        ))}
      </select>
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "-8px 0 8px" }}>{errors.instrutorId?.message}</p>

      <label style={labelStyle}>Dia</label>
      <select {...register("dia")} style={selectStyle}>
        {DIAS.map((d) => (
          <option key={d.valor} value={d.valor}>{d.label}</option>
        ))}
      </select>

      <label style={labelStyle}>Horário</label>
      <input type="time" {...register("horario")} style={selectStyle} />

      <label style={labelStyle}>Sala</label>
      <select {...register("sala")} style={selectStyle}>
        <option value="" disabled>Selecione a sala</option>
        {salas.map((s) => (
          <option key={s.id} value={s.nome}>{s.nome}</option>
        ))}
      </select>

      <label style={labelStyle}>
        Observação (opcional, aparece entre parênteses ao lado da modalidade na folha de presença)
      </label>
      <input type="text" placeholder="Ex: Até 3 anos" {...register("observacao")} style={selectStyle} />

      {mostrarLimites && (
        <>
          <label style={labelStyle}>Limite de vagas na turma</label>
          <input type="number" min={1} {...register("limiteVagas")} style={selectStyle} />

          <label style={labelStyle}>Linhas extras para novos alunos na folha de presença</label>
          <input type="number" min={0} {...register("limiteNovosAlunos")} style={{ ...selectStyle, margin: "4px 0 16px" }} />
        </>
      )}

      <button
        type="submit"
        style={{
          width: "100%",
          background: "var(--color-primary)",
          color: "#fff",
          padding: 11,
          borderRadius: "var(--radius-md)",
          border: "none",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
      >
        Salvar turma
      </button>
    </form>
  );
}