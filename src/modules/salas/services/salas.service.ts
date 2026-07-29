import type { Sala, CriarSalaDTO, AtualizarSalaDTO } from "../types/sala.types";

const STORAGE_KEY = "apusm:salas";

const salasMock: Sala[] = [
  { id: "sala-1", nome: "Sala 1" },
  { id: "sala-2", nome: "Sala 2" },
  { id: "sala-3", nome: "Sala 3" },
  { id: "sala-4", nome: "Sala 4" },
  { id: "sala-5", nome: "Sala 5" },
];

class SalasService {
  private carregarStorage(): Sala[] {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasMock));
      return salasMock;
    }
    return JSON.parse(dados);
  }

  private salvarStorage(lista: Sala[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  async listar(): Promise<Sala[]> {
    return this.carregarStorage();
  }

  async criar(dados: CriarSalaDTO): Promise<Sala> {
    const lista = this.carregarStorage();
    const nova: Sala = { ...dados, id: crypto.randomUUID() };
    lista.push(nova);
    this.salvarStorage(lista);
    return nova;
  }

  async atualizar(id: string, dados: AtualizarSalaDTO): Promise<Sala | undefined> {
    const lista = this.carregarStorage();
    const index = lista.findIndex((s) => s.id === id);
    if (index < 0) return undefined;
    lista[index] = { ...lista[index], ...dados };
    this.salvarStorage(lista);
    return lista[index];
  }

  async excluir(id: string): Promise<void> {
    const lista = this.carregarStorage().filter((s) => s.id !== id);
    this.salvarStorage(lista);
  }
}

export const salasService = new SalasService();