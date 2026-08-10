export type TipoOperacao = "criar" | "editar" | "excluir";

interface ItemFila {
  id: string;
  tabela: string;
  tipo: TipoOperacao;
  dados: any;
  timestamp: number;
  pcOrigem: string;
}

interface ServicoCRUD {
  criar: (dados: any) => Promise<any>;
  atualizar: (id: string, dados: any) => Promise<any>;
  excluir: (id: string) => Promise<any>;
}

const CHAVE_FILA = "apusm_fila_sincronizacao";
const CHAVE_PC = "apusm_pc_id";

function obterPcId(): string {
  let id = localStorage.getItem(CHAVE_PC);
  if (!id) {
    id = "pc_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(CHAVE_PC, id);
  }
  return id;
}

function obterFila(): ItemFila[] {
  const salvo = localStorage.getItem(CHAVE_FILA);
  return salvo ? JSON.parse(salvo) : [];
}

function salvarFila(fila: ItemFila[]): void {
  localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
}

export function tamanhoFila(): number {
  return obterFila().length;
}

export function enfileirar(tabela: string, tipo: TipoOperacao, id: string, dados: any): void {
  const fila = obterFila();
  fila.push({
    id,
    tabela,
    tipo,
    dados,
    timestamp: Date.now(),
    pcOrigem: obterPcId(),
  });
  salvarFila(fila);
}

export async function executarOuEnfileirar<T>(
  tabela: string,
  tipo: TipoOperacao,
  id: string,
  dados: any,
  executar: () => Promise<T>
): Promise<T | null> {
  try {
    return await executar();
  } catch {
    enfileirar(tabela, tipo, id, dados);
    return null;
  }
}

export async function processarFila(
  servicos: Record<string, ServicoCRUD>,
  aoConcluir?: () => void
): Promise<void> {
  const fila = obterFila();
  if (fila.length === 0) return;

  const restante: ItemFila[] = [];
  for (const item of fila) {
    try {
      const servico = servicos[item.tabela];
      if (item.tipo === "criar") await servico.criar(item.dados);
      if (item.tipo === "editar") await servico.atualizar(item.id, item.dados);
      if (item.tipo === "excluir") await servico.excluir(item.id);
    } catch {
      restante.push(item);
    }
  }
  salvarFila(restante);
  if (aoConcluir) aoConcluir();
}
