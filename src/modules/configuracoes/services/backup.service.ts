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
    const dados: Record<string, unknown> = {};

    for (const chave of CHAVES) {
      const valor = localStorage.getItem(chave);
      dados[chave] = valor ? JSON.parse(valor) : null;
    }

    const backup: BackupData = {
      versao: 1,
      dataExportacao: new Date().toISOString(),
      dados,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataArquivo = new Date().toISOString().substring(0, 10);

    link.href = url;
    link.download = `apusm-backup-${dataArquivo}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // ==========================
  // RESTAURAR DE UM BACKUP
  // ==========================

  async restaurar(arquivo: File): Promise<void> {
    const texto = await arquivo.text();
    const backup: BackupData = JSON.parse(texto);

    if (!backup.dados) {
      throw new Error("Arquivo de backup inválido.");
    }

    for (const chave of CHAVES) {
      const valor = backup.dados[chave];
      if (valor !== undefined && valor !== null) {
        localStorage.setItem(chave, JSON.stringify(valor));
      }
    }
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
}

export const backupService = new BackupService();

export default backupService;