export interface Sala {
  id: string;
  nome: string;
}

export interface CriarSalaDTO {
  nome: string;
}

export type AtualizarSalaDTO = Partial<CriarSalaDTO>;