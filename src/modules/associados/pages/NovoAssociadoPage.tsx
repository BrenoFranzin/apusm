import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AssociadoForm from "../components/AssociadoForm";
import ModalSelecionarTurmas from "../components/ModalSelecionarTurmas";
import { useAssociados } from "../hooks/useAssociados";
import { associadosService } from "../services/associados.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";

export default function NovoAssociadoPage() {
  const navigate = useNavigate();
  const { criar } = useAssociados();
  const [modalAberto, setModalAberto] = useState(false);
  const [associadoId, setAssociadoId] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);

  async function matricularNasTurmas(id: string, turmaIds: string[]) {
    const mensagens: string[] = [];

    for (const turmaId of turmaIds) {
      const turma = await turmasService.buscarPorId(turmaId);
      if (!turma) continue;

      const modalidades = await modalidadesService.listar();
      const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);

      try {
        const resultado = await associadosService.matricular(id, {
          turmaId: turma.id,
          turmaNome: `${turma.dia} ${turma.horario}`,
          modalidadeId: turma.modalidadeId,
          modalidadeNome: modalidade?.nome ?? "",
        });

        if (resultado.status === "LISTA_ESPERA") {
          mensagens.push(
            `${modalidade?.nome ?? "Turma"}: turma cheia, entrou na lista de espera (posição ${resultado.posicaoFila}).`
          );
        }
      } catch (erro) {
        const texto = erro instanceof Error ? erro.message : "Erro ao matricular";
        mensagens.push(`${modalidade?.nome ?? "Turma"}: ${texto}`);
      }
    }

    return mensagens;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">Novo Associado</h1>

      {avisos.length > 0 && (
        <div className="mb-4 space-y-2">
          {avisos.map((aviso, i) => (
            <div key={i} className="bg-amber-50 border border-amber-300 text-amber-700 px-4 py-3 rounded-lg text-sm">
              {aviso}
            </div>
          ))}
        </div>
      )}

      <AssociadoForm
       onSubmit={async (dados) => {
          try {
            const novoAssociado = await criar(dados);
            if (!novoAssociado) return;

            setAssociadoId(novoAssociado.id);
            setModalAberto(true);
          } catch (erro) {
            const texto = erro instanceof Error ? erro.message : "Erro ao criar associado";
            setAvisos([texto]);
          }
        }}
      />

      <ModalSelecionarTurmas
        aberto={modalAberto}
        onFechar={() => navigate("/associados")}
        onConfirmar={async (turmaIds) => {
          if (!associadoId) return;

          if (turmaIds.length === 0) {
            navigate("/associados");
            return;
          }

          const mensagens = await matricularNasTurmas(associadoId, turmaIds);
          setModalAberto(false);

          if (mensagens.length > 0) {
            setAvisos(mensagens);
            setTimeout(() => navigate("/associados"), 3000);
          } else {
            navigate("/associados");
          }
        }}
      />
    </div>
  );
}