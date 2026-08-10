import { associadosService } from "../modules/associados/services/associados.service";
import { instrutoresService } from "../modules/instrutores/services/instrutores.service";
import { modalidadesService } from "../modules/modalidades/services/modalidades.service";
import { turmasService } from "../modules/turmas/services/turmas.service";
import { processarFila, tamanhoFila } from "./filaOffline";

const servicos = {
  associados: associadosService,
  instrutores: instrutoresService,
  modalidades: modalidadesService,
  turmas: turmasService,
};

export function iniciarSincronizacaoAutomatica() {
  window.addEventListener("online", () => {
    if (tamanhoFila() > 0) {
      processarFila(servicos, () => window.location.reload());
    }
  });
}
