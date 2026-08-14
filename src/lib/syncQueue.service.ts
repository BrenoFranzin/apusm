import { supabase } from "./supabaseClient";

const CHAVE_FILA = "apusm:syncQueue";

type Operacao = "insert" | "update" | "delete";

interface ItemFila {
  id: string;
  tabela: string;
  operacao: Operacao;
  payload: Record<string, unknown>;
  criadoEm: number;
}

let processando = false;

function carregarFila(): ItemFila[] {
  const bruto = localStorage.getItem(CHAVE_FILA);
  return bruto ? JSON.parse(bruto) : [];
}

function salvarFila(fila: ItemFila[]): void {
  localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
}

function enfileirar(item: Omit<ItemFila, "id" | "criadoEm">): void {
  const fila = carregarFila();
  fila.push({ ...item, id: crypto.randomUUID(), criadoEm: Date.now() });
  salvarFila(fila);
}

function isErroDeRede(erro: unknown): boolean {
  if (erro instanceof TypeError) return true;
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return false;
}

async function executar(item: Pick<ItemFila, "tabela" | "operacao" | "payload">): Promise<void> {
  const { tabela, operacao, payload } = item;
  if (operacao === "insert") {
    const { error } = await supabase.from(tabela).insert(payload);
    if (error) throw error;
  } else if (operacao === "update") {
    const { id, ...resto } = payload as { id: string; [k: string]: unknown };
    const { error } = await supabase.from(tabela).update(resto).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(tabela).delete().eq("id", (payload as { id: string }).id);
    if (error) throw error;
  }
}

class SyncQueueService {
  iniciar(): void {
    window.addEventListener("online", () => this.processarFila());
    this.processarFila();
  }

  async gravar(tabela: string, operacao: Operacao, payload: Record<string, unknown>): Promise<void> {
    try {
      await executar({ tabela, operacao, payload });
    } catch (erro) {
      if (isErroDeRede(erro)) {
        enfileirar({ tabela, operacao, payload });
      } else {
        throw erro;
      }
    }
  }

  temPendencias(): boolean {
    return carregarFila().length > 0;
  }

  qtdPendencias(): number {
    return carregarFila().length;
  }

  async processarFila(): Promise<void> {
    if (processando) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    processando = true;
    try {
      let fila = carregarFila();
      while (fila.length > 0) {
        const item = fila[0];
        try {
          await executar(item);
          fila = fila.slice(1);
          salvarFila(fila);
        } catch (erro) {
          if (isErroDeRede(erro)) break;
          console.error("Falha ao sincronizar item da fila, descartado:", item, erro);
          fila = fila.slice(1);
          salvarFila(fila);
        }
      }
      window.dispatchEvent(new Event("apusm:sync:mudou"));
    } finally {
      processando = false;
    }
  }
}

export const syncQueueService = new SyncQueueService();
export default syncQueueService;
