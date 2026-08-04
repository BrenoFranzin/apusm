// ======================================================
// APUSM SaaS
// Módulo: Configurações
// Arquivo: backup.service.ts
// ======================================================

const CHAVES = [
  "apusm:associados",
  "apusm:instrutores",
  "apusm:modalidades",
  "apusm:turmas",
  "apusm:listaEspera",
  "apusm:presencaSemanal",
] as const;

export interface BackupData {
  versao: number;
  dataExportacao: string;
  dados: Record<string, unknown>;
}

class BackupService {
  // ==========================
  // GERAR BACKUP (baixar .json)
  // ==========================

  exportar(): void {
    const backup = this.montarBackup();
    const dataArquivo = new Date().toISOString().substring(0, 10);
    this.baixarArquivo(backup, `apusm-backup-${dataArquivo}.json`);
  }

  // ==========================
  // SALVAR DADOS DE TESTE (baixa com nome fixo, pra sincronizar via Git)
  // ==========================

  exportarSeedTeste(): void {
    const backup = this.montarBackup();
    this.baixarArquivo(backup, "seed-teste.json");
  }

// ==========================
  // CARREGAR DADOS DE TESTE DIRETO DO ARQUIVO DO PROJETO (public/seed-teste.json)
  // ==========================
  async carregarSeedTesteDoProjeto(): Promise<void> {
    const resposta = await fetch("/seed-teste.json");
    if (!resposta.ok) {
      throw new Error("Arquivo seed-teste.json não encontrado em public/. Faça o export primeiro e mova o arquivo pra lá.");
    }
    const seed: BackupData = await resposta.json();
    this.carregarSeedTeste(seed);
  }



  // ==========================
  // CARREGAR DADOS DE TESTE (já embutido no projeto, sem escolher arquivo)
  // ==========================

  carregarSeedTeste(seed: BackupData): void {
    if (!seed.dados) {
      throw new Error("Arquivo de dados de teste inválido.");
    }

    const totalRegistros = CHAVES.reduce((soma, chave) => {
      const valor = seed.dados[chave];
      return soma + (Array.isArray(valor) ? valor.length : 0);
    }, 0);

    if (totalRegistros === 0) {
      throw new Error("O arquivo de dados de teste está vazio. Nada foi carregado, pra não apagar seus dados atuais.");
    }

    for (const chave of CHAVES) {
      const valor = seed.dados[chave];
      if (valor !== undefined && valor !== null) {
        localStorage.setItem(chave, JSON.stringify(valor));
      }
    }
  }

  // ==========================
  // RESTAURAR DE UM BACKUP (arquivo escolhido manualmente)
  // ==========================

  async restaurar(arquivo: File): Promise<void> {
    const texto = await arquivo.text();
    const backup: BackupData = JSON.parse(texto);
    this.carregarSeedTeste(backup);
  }

  // ==========================
  // RESTAURAR PADRÃO DE FÁBRICA
  // ==========================

  resetarFabrica(): void {
    for (const chave of CHAVES) {
      localStorage.removeItem(chave);
    }
  }

  // ==========================
  // APAGAR TUDO (zona de risco)
  // ==========================

  apagarTudo(): void {
    for (const chave of CHAVES) {
      localStorage.setItem(chave, JSON.stringify([]));
    }
  }

  // ==========================
  // HELPERS INTERNOS
  // ==========================

  private montarBackup(): BackupData {
    const dados: Record<string, unknown> = {};

    for (const chave of CHAVES) {
      const valor = localStorage.getItem(chave);
      dados[chave] = valor ? JSON.parse(valor) : null;
    }

    return {
      versao: 1,
      dataExportacao: new Date().toISOString(),
      dados,
    };
  }

  private baixarArquivo(backup: BackupData, nomeArquivo: string): void {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const backupService = new BackupService();

export default backupService;