import { useEffect } from "react";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";

const DIA_INDEX: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const jaAvisadas = new Set<string>();

export function useNotificacaoAulas(turmas: Turma[], modalidades: Modalidade[]) {
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();

    const intervalo = setInterval(() => {
      if (Notification.permission !== "granted") return;
      const agora = new Date();
      const diaAtual = agora.getDay();

      turmas.forEach((turma) => {
        if (DIA_INDEX[turma.dia] !== diaAtual) return;
        const [h, m] = turma.horario.split(":").map(Number);
        const inicio = new Date(agora);
        inicio.setHours(h, m, 0, 0);
        const diffMin = (inicio.getTime() - agora.getTime()) / 60000;
        const chave = `${turma.id}-${agora.toDateString()}`;

        if (diffMin > 9 && diffMin <= 10 && !jaAvisadas.has(chave)) {
          jaAvisadas.add(chave);
          const modalidade = modalidades.find((mo) => mo.id === turma.modalidadeId);
          new Notification(`Em 10 min: ${modalidade?.nome ?? "Aula"}`, {
            body: `${turma.horario} — ${turma.sala}`,
          });
        }
      });
    }, 30000);

    return () => clearInterval(intervalo);
  }, [turmas, modalidades]);
}