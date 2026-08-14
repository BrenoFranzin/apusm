// ======================================================
// APUSM SaaS — Módulo Configurações
// Arquivo: historico.service.ts
// Sistema de Desfazer/Refazer baseado em ações registradas
// pelos services (não mais espiona localStorage)
// ======================================================
import { syncQueueService } from "@/lib/syncQueue.service";

type Operacao = "insert" | "update" | "delete";

interface AcaoHistorico {
  tabela: string;
  operacao: Operacao;
  payload: Record<string, unknown>;
}

export interface RegistroHistorico {
  desfazer: AcaoHistorico;
  refazer: AcaoHistorico;
}

const CHAVE_UNDO = "apusm:historico:undo";
const CHAVE_REDO = "apusm:historico:redo";
const LIMITE = 20;

function carregarPilha(chave: string): RegistroHistorico[] {
  const bruto = localStorage.getItem(chave);
  return bruto ? JSON.parse(bruto) : [];
}

function salvarPilha(chave: string, pilha: RegistroHistorico[]): void {
  localStorage.setItem(chave, JSON.stringify(pilha));
}

class HistoricoService {
  // Mantido por compatibilidade com main.tsx — não faz mais nada,
  // pois o histórico agora é alimentado pelos services diretamente.
  iniciar(): void {}

  registrar(registro: RegistroHistorico): void {
    const undoPilha = carregarPilha(CHAVE_UNDO);
    undoPilha.push(registro);
    if (undoPilha.length > LIMITE) {
      undoPilha.shift();
    }
    salvarPilha(CHAVE_UNDO, undoPilha);
    salvarPilha(CHAVE_REDO, []);
    window.dispatchEvent(new Event("apusm:historico:mudou"));
  }

  podeDesfazer(): boolean {
    return carregarPilha(CHAVE_UNDO).length > 0;
  }

  podeRefazer(): boolean {
    return carregarPilha(CHAVE_REDO).length > 0;
  }

  async desfazer(): Promise<boolean> {
    const undoPilha = carregarPilha(CHAVE_UNDO);
    const registro = undoPilha.pop();
    if (!registro) {
      return false;
    }

    await syncQueueService.gravar(
      registro.desfazer.tabela,
      registro.desfazer.operacao,
      registro.desfazer.payload
    );

    const redoPilha = carregarPilha(CHAVE_REDO);
    redoPilha.push(registro);
    if (redoPilha.length > LIMITE) {
      redoPilha.shift();
    }

    salvarPilha(CHAVE_UNDO, undoPilha);
    salvarPilha(CHAVE_REDO, redoPilha);
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }

  async refazer(): Promise<boolean> {
    const redoPilha = carregarPilha(CHAVE_REDO);
    const registro = redoPilha.pop();
    if (!registro) {
      return false;
    }

    await syncQueueService.gravar(
      registro.refazer.tabela,
      registro.refazer.operacao,
      registro.refazer.payload
    );

    const undoPilha = carregarPilha(CHAVE_UNDO);
    undoPilha.push(registro);
    if (undoPilha.length > LIMITE) {
      undoPilha.shift();
    }

    salvarPilha(CHAVE_REDO, redoPilha);
    salvarPilha(CHAVE_UNDO, undoPilha);
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }
}

export const historicoService = new HistoricoService();
export default historicoService;
