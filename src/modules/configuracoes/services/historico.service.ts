const CHAVES = [
  "apusm:associados",
  "apusm:instrutores",
  "apusm:modalidades",
  "apusm:turmas",
] as const;

const CHAVE_UNDO = "apusm:historico:undo";
const CHAVE_REDO = "apusm:historico:redo";
const LIMITE = 20;
const PAUSA_MS = 800;

type Snapshot = Record<string, string | null>;

let patched = false;
let setItemOriginal: typeof localStorage.setItem;
let removeItemOriginal: typeof localStorage.removeItem;

let snapshotPendente: Snapshot | null = null;
let temporizador: ReturnType<typeof setTimeout> | null = null;

function capturarSnapshot(): Snapshot {
  const snap: Snapshot = {};
  for (const chave of CHAVES) {
    snap[chave] = localStorage.getItem(chave);
  }
  return snap;
}

function aplicarSnapshot(snap: Snapshot): void {
  for (const chave of CHAVES) {
    const valor = snap[chave];
    if (valor === null) {
      removeItemOriginal.call(localStorage, chave);
    } else {
      setItemOriginal.call(localStorage, chave, valor);
    }
  }
}

function carregarPilha(chave: string): Snapshot[] {
  const bruto = localStorage.getItem(chave);
  return bruto ? JSON.parse(bruto) : [];
}

function salvarPilha(chave: string, pilha: Snapshot[]): void {
  setItemOriginal.call(localStorage, chave, JSON.stringify(pilha));
}

class HistoricoService {
  iniciar(): void {
    if (patched) {
      return;
    }
    patched = true;

    setItemOriginal = localStorage.setItem.bind(localStorage);
    removeItemOriginal = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = (chave: string, valor: string) => {
      if ((CHAVES as readonly string[]).includes(chave)) {
        this.marcarAlteracao();
      }
      setItemOriginal(chave, valor);
    };

    localStorage.removeItem = (chave: string) => {
      if ((CHAVES as readonly string[]).includes(chave)) {
        this.marcarAlteracao();
      }
      removeItemOriginal(chave);
    };
  }

  private marcarAlteracao(): void {
    if (snapshotPendente === null) {
      snapshotPendente = capturarSnapshot();
    }
    if (temporizador) {
      clearTimeout(temporizador);
    }
    temporizador = setTimeout(() => {
      this.consolidar();
    }, PAUSA_MS);
  }

  private consolidar(): void {
    if (snapshotPendente === null) {
      return;
    }
    const undoPilha = carregarPilha(CHAVE_UNDO);
    undoPilha.push(snapshotPendente);
    if (undoPilha.length > LIMITE) {
      undoPilha.shift();
    }
    salvarPilha(CHAVE_UNDO, undoPilha);
    salvarPilha(CHAVE_REDO, []);
    snapshotPendente = null;
    temporizador = null;
    window.dispatchEvent(new Event("apusm:historico:mudou"));
  }

  podeDesfazer(): boolean {
    return carregarPilha(CHAVE_UNDO).length > 0;
  }

  podeRefazer(): boolean {
    return carregarPilha(CHAVE_REDO).length > 0;
  }

  desfazer(): boolean {
    const undoPilha = carregarPilha(CHAVE_UNDO);
    const snap = undoPilha.pop();
    if (!snap) {
      return false;
    }
    const redoPilha = carregarPilha(CHAVE_REDO);
    redoPilha.push(capturarSnapshot());
    if (redoPilha.length > LIMITE) {
      redoPilha.shift();
    }
    salvarPilha(CHAVE_UNDO, undoPilha);
    salvarPilha(CHAVE_REDO, redoPilha);
    aplicarSnapshot(snap);
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }

  refazer(): boolean {
    const redoPilha = carregarPilha(CHAVE_REDO);
    const snap = redoPilha.pop();
    if (!snap) {
      return false;
    }
    const undoPilha = carregarPilha(CHAVE_UNDO);
    undoPilha.push(capturarSnapshot());
    if (undoPilha.length > LIMITE) {
      undoPilha.shift();
    }
    salvarPilha(CHAVE_REDO, redoPilha);
    salvarPilha(CHAVE_UNDO, undoPilha);
    aplicarSnapshot(snap);
    window.dispatchEvent(new Event("apusm:historico:mudou"));
    return true;
  }
}

export const historicoService = new HistoricoService();
export default historicoService;