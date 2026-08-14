import { syncQueueService } from "@/lib/syncQueue.service";

const LIMITE = 20;
type Operacao = "insert" | "update" | "delete";

interface EntradaHistorico {
  tabela: string;
  operacaoOriginal: Operacao;
  antes: Record<string, unknown> | null;
  depois: Record<string, unknown> | null;
}

const pilhasUndo: Record<string, EntradaHistorico[]> = {};
const pilhasRedo: Record<string, EntradaHistorico[]> = {};

class HistoricoService {
  registrar(tabela: string, operacaoOriginal: Operacao, antes: Record<string, unknown> | null, depois: Record<string, unknown> | null): void {
    if (!pilhasUndo[tabela]) pilhasUndo[tabela] = [];
    pilhasUndo[tabela].push({ tabela, operacaoOriginal, antes, depois });
    if (pilhasUndo[tabela].length > LIMITE) pilhasUndo[tabela].shift();
    pilhasRedo[tabela] = [];
    window.dispatchEvent(new Event("apusm:historico:mudou"));
  }

  podeDesfazer(tabela: string): boolean {
    return (pilhasUndo[tabela]?.length ?? 0) > 0;
  }

  podeRefazer(tabela: string): boolean {
    return (pilhasRedo[tabela]?.length ?? 0) > 0;
  }

  async desfazer(tabela: string): Promise<boolean> {
    const pilha = pilhasUndo[tabela];
    const entrada = pilha?.pop();
    if (!entrada) return false;

    if (entrada.operacaoOriginal === "insert") {
      await syncQueueService.gravar(tabela, "delete", { id: (entrada.depois as any).id });
    } else if (entrada.operacaoOriginal === "delete") {
      await syncQueueService.gravar(tabela, "insert", entrada.antes!);
    } else {
      await syncQueueService.gravar(tabela, "update", entrada.antes!);
    }

    if (!pilhasRedo[tabela]) pilhasRedo[tabela] = [];
    pilhasRedo[tabela].push(entrada);
    if (pilhasRedo[tabela].length > LIMITE) pilhasRedo[tabela].shift();
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }

  async refazer(tabela: string): Promise<boolean> {
    const pilha = pilhasRedo[tabela];
    const entrada = pilha?.pop();
    if (!entrada) return false;

    if (entrada.operacaoOriginal === "insert") {
      await syncQueueService.gravar(tabela, "insert", entrada.depois!);
    } else if (entrada.operacaoOriginal === "delete") {
      await syncQueueService.gravar(tabela, "delete", { id: (entrada.antes as any).id });
    } else {
      await syncQueueService.gravar(tabela, "update", entrada.depois!);
    }

    if (!pilhasUndo[tabela]) pilhasUndo[tabela] = [];
    pilhasUndo[tabela].push(entrada);
    if (pilhasUndo[tabela].length > LIMITE) pilhasUndo[tabela].shift();
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }
}

export const historicoService = new HistoricoService();
export default historicoService;
