// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmaForm.tsx
// ======================================================

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
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  margin: "4px 0 12px",
  padding: 8,
  background: "var(--background-secondary)",
  color: "var(--text-primary)",
  border: "2px solid var(--border-strong)",
  borderRadius: 6,
};

export default function TurmaForm({ modalidades, instrutores, salas, onSubmit }: Props) {
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
    },
  });

  const modalidadeSelecionada = modalidades.find((m) => m.id === watch("modalidadeId"));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: "var(--background-secondary)",
        border: "2px solid var(--color-primary)",
        borderRadius: 12,
        padding: "1.5rem",
        maxWidth: 420,
        color: "var(--text-primary)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}
    >
      <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px", color: "var(--text-primary)" }}>Nova turma</p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Modalidade</label>
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

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Instrutor</label>
      <select {...register("instrutorId")} style={selectStyle}>
        {instrutores.map((i) => (
          <option key={i.id} value={i.id}>{i.nome}</option>
        ))}
      </select>
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "-8px 0 8px" }}>{errors.instrutorId?.message}</p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Dia</label>
      <select {...register("dia")} style={selectStyle}>
        {DIAS.map((d) => (
          <option key={d.valor} value={d.valor}>{d.label}</option>
        ))}
      </select>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Horário</label>
      <input type="time" {...register("horario")} style={selectStyle} />

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sala</label>
      <select {...register("sala")} style={selectStyle}>
        <option value="" disabled>Selecione a sala</option>
        {salas.map((s) => (
          <option key={s.id} value={s.nome}>{s.nome}</option>
        ))}
      </select>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Limite de vagas na turma</label>
      <input type="number" min={1} {...register("limiteVagas")} style={selectStyle} />

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Linhas extras para novos alunos na folha de presenca</label>
      <input type="number" min={0} {...register("limiteNovosAlunos")} style={{ ...selectStyle, margin: "4px 0 14px" }} />

      <button
        type="submit"
        style={{ width: "100%", background: "var(--color-primary)", color: "#fff", padding: 10, borderRadius: 8, border: "none" }}
      >
        Salvar turma
      </button>
    </form>
  );
}