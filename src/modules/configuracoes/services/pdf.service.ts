import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { turmasService } from "@/modules/turmas/services/turmas.service";
import { instrutoresService } from "@/modules/instrutores/services/instrutores.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";

const NOME_DIA: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
};

const ORDEM_DIAS = ["seg", "ter", "qua", "qui", "sex", "sab"];

const HISTORICO_KEY = "apusm:pdf:historico";
const HISTORICO_LIMITE = 10;

export interface RegistroExportacao {
  id: string;
  tipo: "servico" | "turmas" | "salas";
  data: string;
  dataUri: string;
  nomeArquivo: string;
}

function cabecalho(doc: jsPDF, titulo: string) {
  doc.setFontSize(16);
  doc.text(titulo, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 21);
  doc.setTextColor(0);
}

function registrarHistorico(registro: RegistroExportacao) {
  const bruto = localStorage.getItem(HISTORICO_KEY);
  const lista: RegistroExportacao[] = bruto ? JSON.parse(bruto) : [];

  lista.unshift(registro);

  const limitada = lista.slice(0, HISTORICO_LIMITE);

  localStorage.setItem(HISTORICO_KEY, JSON.stringify(limitada));
}

function baixarEregistrar(doc: jsPDF, nomeArquivo: string, tipo: RegistroExportacao["tipo"]) {
  doc.save(nomeArquivo);

  try {
    const dataUri = doc.output("datauristring");
    registrarHistorico({
      id: crypto.randomUUID(),
      tipo,
      data: new Date().toISOString(),
      dataUri,
      nomeArquivo,
    });
  } catch {
    // Se falhar ao gerar o data URI (ex: PDF muito grande), o download já aconteceu, só não entra no histórico
  }
}

class PdfService {
  // ==========================
  // ESCALA DE SERVIÇO (por instrutor)
  // ==========================

  async exportarEscalaServico(): Promise<void> {
    const [turmas, instrutores, modalidades] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      modalidadesService.listar(),
    ]);

    const doc = new jsPDF();
    cabecalho(doc, "Escala de Serviço - Instrutores");

    const linhas = instrutores
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .flatMap((instrutor) => {
        const turmasDoInstrutor = turmas
          .filter((t) => t.instrutorId === instrutor.id)
          .sort(
            (a, b) =>
              ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia) ||
              a.horario.localeCompare(b.horario)
          );

        if (turmasDoInstrutor.length === 0) {
          return [[instrutor.nome, "-", "-", "-", "-"]];
        }

        return turmasDoInstrutor.map((turma) => {
          const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
          return [
            instrutor.nome,
            NOME_DIA[turma.dia] ?? turma.dia,
            turma.horario,
            modalidade?.nome ?? "-",
            turma.sala,
          ];
        });
      });

    autoTable(doc, {
      startY: 27,
      head: [["Instrutor", "Dia", "Horário", "Modalidade", "Sala"]],
      body: linhas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [20, 83, 45] },
    });

    const nomeArquivo = `escala-servico-${new Date().toISOString().substring(0, 10)}.pdf`;
    baixarEregistrar(doc, nomeArquivo, "servico");
  }

  // ==========================
  // ESCALA DE TURMAS (grade geral)
  // ==========================

  async exportarEscalaTurmas(): Promise<void> {
    const [turmas, instrutores, modalidades] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      modalidadesService.listar(),
    ]);

    const doc = new jsPDF();
    cabecalho(doc, "Escala de Turmas");

    const linhas = turmas
      .slice()
      .sort(
        (a, b) =>
          ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia) ||
          a.horario.localeCompare(b.horario)
      )
      .map((turma) => {
        const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
        const instrutor = instrutores.find((i) => i.id === turma.instrutorId);
        return [
          NOME_DIA[turma.dia] ?? turma.dia,
          turma.horario,
          modalidade?.nome ?? "-",
          instrutor?.nome ?? "-",
          turma.sala,
        ];
      });

    autoTable(doc, {
      startY: 27,
      head: [["Dia", "Horário", "Modalidade", "Instrutor", "Sala"]],
      body: linhas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [20, 83, 45] },
    });

    const nomeArquivo = `escala-turmas-${new Date().toISOString().substring(0, 10)}.pdf`;
    baixarEregistrar(doc, nomeArquivo, "turmas");
  }

  // ==========================
  // ESCALA DE SALAS (por sala)
  // ==========================

  async exportarEscalaSalas(): Promise<void> {
    const [turmas, instrutores, modalidades] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      modalidadesService.listar(),
    ]);

    const doc = new jsPDF();
    cabecalho(doc, "Escala de Salas");

    const salas = Array.from(new Set(turmas.map((t) => t.sala))).sort();

    const linhas = salas.flatMap((sala) => {
      const turmasDaSala = turmas
        .filter((t) => t.sala === sala)
        .sort(
          (a, b) =>
            ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia) ||
            a.horario.localeCompare(b.horario)
        );

      return turmasDaSala.map((turma) => {
        const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
        const instrutor = instrutores.find((i) => i.id === turma.instrutorId);
        return [
          sala,
          NOME_DIA[turma.dia] ?? turma.dia,
          turma.horario,
          modalidade?.nome ?? "-",
          instrutor?.nome ?? "-",
        ];
      });
    });

    autoTable(doc, {
      startY: 27,
      head: [["Sala", "Dia", "Horário", "Modalidade", "Instrutor"]],
      body: linhas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [20, 83, 45] },
    });

    const nomeArquivo = `escala-salas-${new Date().toISOString().substring(0, 10)}.pdf`;
    baixarEregistrar(doc, nomeArquivo, "salas");
  }

  // ==========================
  // HISTÓRICO DE EXPORTAÇÕES
  // ==========================

  listarHistorico(): RegistroExportacao[] {
    const bruto = localStorage.getItem(HISTORICO_KEY);
    return bruto ? JSON.parse(bruto) : [];
  }

  apagarDoHistorico(id: string): void {
    const lista = this.listarHistorico().filter((r) => r.id !== id);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(lista));
  }
}

export const pdfService = new PdfService();
export default pdfService;

