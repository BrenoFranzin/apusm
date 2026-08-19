import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { turmasService } from "@/modules/turmas/services/turmas.service";
import { instrutoresService } from "@/modules/instrutores/services/instrutores.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import { plantaoService } from "@/modules/plantao/services/plantao.service";
import { associadosService } from "@/modules/associados/services/associados.service";


const NOME_DIA: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
};

const DIA_PARA_WEEKDAY: Record<string, number> = {
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
};


const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function gerarDatasDoMes(dia: string, mes: number, ano: number): string[] {
  const weekday = DIA_PARA_WEEKDAY[dia];
  const datas: string[] = [];
  const data = new Date(ano, mes, 1);
  while (data.getMonth() === mes) {
    if (data.getDay() === weekday) {
      const dd = String(data.getDate()).padStart(2, "0");
      const mm = String(mes + 1).padStart(2, "0");
      datas.push(`${dd}/${mm}`);
    }
    data.setDate(data.getDate() + 1);
  }
  return datas;
}


const ORDEM_DIAS = ["seg", "ter", "qua", "qui", "sex", "sab"];
const ORDEM_DIAS_PLANTAO = ["seg", "ter", "qua", "qui", "sex"];

const HISTORICO_KEY = "apusm:pdf:historico";
const HISTORICO_LIMITE = 10;

export interface RegistroExportacao {
  id: string;
  tipo: "servico" | "turmas" | "salas" | "presenca";
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

function visualizarEregistrar(doc: jsPDF, nomeArquivo: string, tipo: RegistroExportacao["tipo"]) {
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl as unknown as string, "_blank");

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
    // Se falhar ao gerar o data URI, a visualização já abriu, só não entra no histórico
  }
}

// ==========================
// Helpers de desenho da grade de serviço (fiéis ao sistema antigo)
// ==========================

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fitFontSize(doc: jsPDF, text: string, maxWidth: number, startSize: number, minSize: number): number {
  let size = startSize;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(text) > maxWidth) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

function fitServico(count: number, scale = 1) {
  let base;
  if (count <= 3) base = { tagHeight: 5, gap: 2, fontSize: 8 };
  else if (count <= 4) base = { tagHeight: 5.5, gap: 2, fontSize: 7.5 };
  else if (count <= 8) base = { tagHeight: 4.6, gap: 1.5, fontSize: 6.5 };
  else base = { tagHeight: 4, gap: 1.2, fontSize: 5.5 };
  return {
    tagHeight: base.tagHeight * scale,
    gap: base.gap * scale,
    fontSize: base.fontSize,
  };
}

function gerarHorariosServico(): string[] {
  const lista: string[] = [];
  for (let h = 6; h <= 21; h++) lista.push(String(h).padStart(2, "0") + ":00");
  return lista;
}

interface CelulaServico {
  nome: string;
  cor: string;
  emAula: boolean;
}

class PdfService {
  // ==========================
  // ESCALA DE SERVIÇO (grade visual por instrutor, fiel ao sistema antigo)
  // ==========================

  async exportarEscalaServico(): Promise<void> {
    const [turmas, instrutores, entradasPlantao] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      plantaoService.listar(),
    ]);

    const doc = new jsPDF("portrait");
    const allSlots = gerarHorariosServico();
    const manhaSlots = allSlots.filter((s) => parseInt(s) <= 13);
    const tardeSlots = allSlots.filter((s) => parseInt(s) >= 14);

    const columnStyles = {
      0: { cellWidth: 24 },
      1: { cellWidth: 33 },
      2: { cellWidth: 33 },
      3: { cellWidth: 33 },
      4: { cellWidth: 33 },
      5: { cellWidth: 33 },
    };
    const marginLeft = (210 - (24 + 33 * 5)) / 2;

    function montarCelula(dia: string, horario: string): CelulaServico[] {
      return entradasPlantao
        .filter((e) => e.dia === dia && e.horario === horario)
        .map((e) => {
          const instrutor = instrutores.find((i) => i.id === e.instrutorId);
          const emAula = turmas.some(
            (t) => t.instrutorId === e.instrutorId && t.dia === dia && t.horario === horario
          );
          return {
            nome: instrutor?.nome.toUpperCase() ?? "-",
            cor: instrutor?.cor ?? "#888",
            emAula,
          };
        });
    }

    const gerarTabelaServico = (slotsFiltrados: string[], startY: number) => {
      const header = ["Horário", ...ORDEM_DIAS_PLANTAO.map((d) => NOME_DIA[d])];

      const body = slotsFiltrados.map((s) => {
        const row: (string | CelulaServico[])[] = [s];
        ORDEM_DIAS_PLANTAO.forEach((d) => {
          row.push(montarCelula(d, s));
        });
        return row;
      });

      const PAGE_H_SERV = 297;
      const BOTTOM_MARGIN_SERV = 12;
      const HEADER_H_SERV = 12;

      const estimarAlturaLinhaServico = (row: (string | CelulaServico[])[]) => {
        let maxH = 18;
        row.slice(1).forEach((cell) => {
          if (Array.isArray(cell) && cell.length) {
            const rows = cell.length > 4 ? Math.ceil(cell.length / 2) : cell.length;
            const fit = fitServico(rows, 1);
            const h = Math.max(rows * (fit.tagHeight + fit.gap) - fit.gap + 4, 18);
            if (h > maxH) maxH = h;
          }
        });
        return maxH;
      };

      const availableServ = PAGE_H_SERV - startY - BOTTOM_MARGIN_SERV;
      const rawTotalServ = HEADER_H_SERV + body.reduce((acc, row) => acc + estimarAlturaLinhaServico(row), 0);
      let scaleServ = rawTotalServ > 0 ? availableServ / (rawTotalServ * 1.15) : 1;
      scaleServ = Math.max(0.3, Math.min(scaleServ, 1.9));
      const headerScaleServ = Math.min(scaleServ, 1.4);

      autoTable(doc, {
        head: [header],
        body: body as any,
        startY,
        margin: { left: marginLeft, right: marginLeft },
        rowPageBreak: "avoid",
        theme: "grid",
        columnStyles,
        styles: { cellPadding: 2, fontSize: 8, halign: "center", valign: "middle", lineWidth: 0.3, lineColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [222, 225, 230] },
        headStyles: {
          fontSize: 10 * headerScaleServ,
          fontStyle: "bold",
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          minCellHeight: 12 * headerScaleServ,
          lineWidth: 0.3,
          lineColor: [0, 0, 0],
        },
        didParseCell: (data) => {
          if (data.section === "head" && data.column.index === 0) {
            data.cell.styles.fontSize = 11 * headerScaleServ;
          } else if (data.column.index === 0) {
            data.cell.styles.fontSize = 14 * headerScaleServ;
            data.cell.styles.fontStyle = "bold";
          } else if (Array.isArray(data.cell.raw)) {
            data.cell.text = [""];
            const rows = data.cell.raw.length > 4 ? Math.ceil(data.cell.raw.length / 2) : data.cell.raw.length;
            const fit = fitServico(rows, scaleServ);
            const h = Math.max(
              rows * (fit.tagHeight + fit.gap) - fit.gap + 4 * scaleServ,
              18 * Math.min(scaleServ, 1)
            );
            data.cell.styles.minCellHeight = h;
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index > 0 && Array.isArray(data.cell.raw)) {
            const items = data.cell.raw as unknown as CelulaServico[];
            const x = data.cell.x;
            const y = data.cell.y;
            const w = data.cell.width;
            const h = data.cell.height;
            const duasColunas = items.length > 4;
            const rows = duasColunas ? Math.ceil(items.length / 2) : items.length;
            const fit = fitServico(rows, scaleServ);
            const tagHeight = fit.tagHeight;
            const gap = fit.gap;
            const totalHeight = rows * tagHeight + (rows - 1) * gap;
            const startYCell = y + (h - totalHeight) / 2;
            const colW = duasColunas ? (w - 6) / 2 : w - 4;

            items.forEach((item, idx) => {
              const col = duasColunas ? idx % 2 : 0;
              const linha = duasColunas ? Math.floor(idx / 2) : idx;
              const tagY = startYCell + linha * (tagHeight + gap);
              const extraBolinha = item.emAula ? 3.5 : 0;
              const fontSize = fitFontSize(doc, item.nome, colW - 2 - extraBolinha, fit.fontSize, 4);
              const textW = doc.getTextWidth(item.nome);
              let tagW = Math.min(textW + 3 + extraBolinha, colW);
              tagW = Math.max(tagW, 10);
              const deslocamentoCol = duasColunas ? col * (colW + 2) : 0;
              const tagX = x + 2 + deslocamentoCol + (colW - tagW) / 2;

              doc.setFillColor(...hexToRgb(item.cor));
              if (doc.roundedRect) {
                doc.roundedRect(tagX, tagY, tagW, tagHeight, 2, 2, "F");
              } else {
                doc.rect(tagX, tagY, tagW, tagHeight, "F");
              }
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(fontSize);
              const textCenterX = tagX + (tagW - extraBolinha) / 2;
              doc.text(item.nome, textCenterX, tagY + tagHeight / 2, { align: "center", baseline: "middle" });

              if (item.emAula) {
                const raio = 1.1;
                const cx = tagX + tagW - raio - 1;
                const cy = tagY + raio + 1;
                doc.setDrawColor(0);
                doc.setFillColor(255, 255, 255);
                doc.setLineWidth(0.4);
                doc.circle(cx, cy, raio, "FD");
              }
            });
          }
        },
      });
    };

    doc.text("Academia APUSM - Escala de Servi�o (Manh�)", 105, 14, { align: "center" });
    gerarTabelaServico(manhaSlots, 20);

    doc.addPage();
    doc.text("Academia APUSM - Escala de Serviço (Tarde)", 105, 14, { align: "center" });
    gerarTabelaServico(tardeSlots, 20);

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
          instrutor?.nome.toUpperCase() ?? "-",
          turma.sala,
        ];
      });

    const linhaSeparadora = [{ content: "NOVOS ASSOCIADOS", colSpan: 5, styles: { fontStyle: "bold", fillColor: [230, 230, 230], halign: "center" } }];
    const linhasEmBranco = Array.from({ length: 10 }, () => ["", "", "", "", ""]);

    autoTable(doc, {
      startY: 27,
      head: [["Dia", "Horário", "Modalidade", "Instrutor", "Sala"]],
      body: [...linhas, linhaSeparadora as any, ...linhasEmBranco],
      styles: { fontSize: 9, fontStyle: "bold" },
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
          instrutor?.nome.toUpperCase() ?? "-",
        ];
      });
    });

    autoTable(doc, {
      startY: 27,
      head: [["Sala", "Dia", "Horário", "Modalidade", "Instrutor"]],
      body: linhas,
      styles: { fontSize: 9, fontStyle: "bold" },
      headStyles: { fillColor: [20, 83, 45] },
    });

    const nomeArquivo = `escala-salas-${new Date().toISOString().substring(0, 10)}.pdf`;
    baixarEregistrar(doc, nomeArquivo, "salas");
  }

  // ==========================
  // FOLHA DE PRESENÇA (por turma, para imprimir e marcar à mão)
  // ==========================

  private desenharFolhaPresenca(
    doc: jsPDF,
    turma: any,
    mes: number,
    ano: number,
    instrutores: any[],
    modalidades: any[],
    associados: any[]
  ): string {
    const modalidade = modalidades.find((m: any) => m.id === turma.modalidadeId);
    const instrutor = instrutores.find((i: any) => i.id === turma.instrutorId);

    const nomeModalidade = modalidade?.nome ?? "-";
    const infantil = /infantil|musicaliza/i.test(nomeModalidade);

    const matriculados = associados
      .filter((a: any) => a.matriculas.some((m: any) => m.turmaId === turma.id && m.status !== "CANCELADA"))
      .map((a: any) => a.nome.toUpperCase());

    const datas = gerarDatasDoMes(turma.dia, mes, ano);

    const limiteVagas = turma.limiteVagas ?? 10;
    const limiteNovos = infantil ? Math.min(turma.limiteNovosAlunos ?? 4, 4) : (turma.limiteNovosAlunos ?? 9);

    const linhasMatriculados: string[] = [...matriculados];
    while (linhasMatriculados.length < limiteVagas) linhasMatriculados.push("");

    const totalLinhas = linhasMatriculados.length + limiteNovos;

    // "Ajustar à página" (como no Excel): calcula a altura disponível e distribui
    // igualmente entre as linhas, esticando ou encolhendo conforme necessário.
    const alturaPagina = doc.internal.pageSize.getHeight();
    const alturaReservadaTopo = 26 + (modalidade?.descricao ? 4 : 0); // cabeçalho + OBS
    const alturaReservadaRodape = 6 + 8; // barra "NOVOS ALUNOS" + margem inferior
    const alturaDisponivel = alturaPagina - alturaReservadaTopo - alturaReservadaRodape;
    const alturaLinhaIdeal = alturaDisponivel / totalLinhas;

    // Converte a altura de linha ideal em fonte/padding proporcionais, com limites de legibilidade.
    // Sem teto artificial: se sobra espaço vertical (poucas linhas), a fonte e o padding
    // crescem pra ocupar a página inteira, igual ao "ajustar à página" do Excel.
    let fontSize = Math.min(16, Math.max(5.5, alturaLinhaIdeal * 2.3));
    let cellPadding = Math.min(5, Math.max(0.6, alturaLinhaIdeal * 0.45));
    const minCellHeight = alturaLinhaIdeal;

    const MARGEM = 12.7; // 1,27cm — margem estreita padrão
    const larguraPagina = doc.internal.pageSize.getWidth();
    const larguraUtil = larguraPagina - MARGEM * 2;
    const bordaDireita = larguraPagina - MARGEM;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`MODALIDADE: ${nomeModalidade.toUpperCase()}`, MARGEM, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`PROFESSOR(A): ${instrutor?.nome.toUpperCase() ?? "-"}`, MARGEM, 20);

    let linhaExtra = 0;
    if (modalidade?.descricao) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`OBS: ${modalidade.descricao}`, MARGEM, 25);
      doc.setFont("helvetica", "normal");
      linhaExtra = 4;
    }

    const nomeDiaCurto: Record<string, string> = {
      dom: "DOM", seg: "SEG", ter: "TER", qua: "QUA", qui: "QUI", sex: "SEX", sab: "SÁB",
    };
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`MÊS: ${MESES[mes].toUpperCase()}/${ano}`, bordaDireita, 14, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`DIA/HORÁRIO: ${nomeDiaCurto[turma.dia] ?? turma.dia} ${turma.horario}`, bordaDireita, 20, { align: "right" });

    const colunaAluno = infantil ? "Nome do Aluno (Criança)" : "Nome do Aluno";
    const cabecalhoPrincipal = infantil
      ? ["Nº", colunaAluno, ...datas, "Responsável"]
      : ["Nº", colunaAluno, ...datas];

    const columnStylesPrincipal: any = { 0: { cellWidth: 12 }, 1: { cellWidth: infantil ? 65 : 90, halign: "left" } };
    if (infantil) {
      columnStylesPrincipal[cabecalhoPrincipal.length - 1] = { cellWidth: 45, halign: "left" };
    }

    autoTable(doc, {
      head: [cabecalhoPrincipal],
      body: linhasMatriculados.map((nome, i) =>
        infantil
          ? [String(i + 1).padStart(2, "0"), nome, ...datas.map(() => ""), ""]
          : [String(i + 1).padStart(2, "0"), nome, ...datas.map(() => "")]
      ),
      startY: 26 + linhaExtra,
      theme: "grid",
      styles: { fontSize, cellPadding, minCellHeight, halign: "center", valign: "middle", lineWidth: 0.3, lineColor: [0, 0, 0], fontStyle: "bold" },
      headStyles: { fillColor: [20, 83, 45], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: columnStylesPrincipal,
      margin: { left: MARGEM, right: MARGEM },
    });

    const finalY1 = (doc as any).lastAutoTable.finalY as number;

    doc.setFillColor(230, 230, 230);
    doc.rect(MARGEM, finalY1, larguraUtil, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(0);
    doc.text("NOVOS ALUNOS", MARGEM + larguraUtil / 2, finalY1 + 4.2, { align: "center" });

    const columnStylesNovos: any = infantil
      ? { 0: { cellWidth: 65, halign: "left" }, [datas.length + 1]: { cellWidth: 45, halign: "left" } }
      : { 0: { cellWidth: 102, halign: "left" } };

    autoTable(doc, {
      body: Array.from({ length: limiteNovos }, () =>
        infantil ? ["", ...datas.map(() => ""), ""] : ["", ...datas.map(() => "")]
      ),
      startY: finalY1 + 6,
      theme: "grid",
      styles: { fontSize, cellPadding, minCellHeight, halign: "center", valign: "middle", lineWidth: 0.3, lineColor: [0, 0, 0] },
      columnStyles: columnStylesNovos,
      margin: { left: MARGEM, right: MARGEM },
      pageBreak: "avoid",
    });

    return nomeModalidade;
  }

  async exportarFolhaPresenca(turmaId: string, mes: number, ano: number): Promise<void> {
    const [turmas, instrutores, modalidades, associados] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      modalidadesService.listar(),
      associadosService.listar(),
    ]);

    const turma = turmas.find((t: any) => t.id === turmaId);
    if (!turma) throw new Error("Turma não encontrada");

    const nomeModTurma = modalidades.find((m: any) => m.id === turma.modalidadeId)?.nome ?? "";
    const orientacao = /infantil|musicaliza/i.test(nomeModTurma) ? "landscape" : "portrait";

    const doc = new jsPDF(orientacao);
    const nomeModalidade = this.desenharFolhaPresenca(doc, turma, mes, ano, instrutores, modalidades, associados);

    const nomeArquivo = `Lista de turmas - ${nomeModalidade} - ${MESES[mes]} ${ano}.pdf`;
    visualizarEregistrar(doc, nomeArquivo, "presenca");
  }

  async exportarFolhasPresencaEmMassa(turmaIds: string[], mes: number, ano: number): Promise<void> {
    const [turmas, instrutores, modalidades, associados] = await Promise.all([
      turmasService.listar(),
      instrutoresService.listar(),
      modalidadesService.listar(),
      associadosService.listar(),
    ]);

    const turmasOrdenadas = turmaIds
      .map((id) => turmas.find((t: any) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .sort((a: any, b: any) => {
        const nomeModA = modalidades.find((m: any) => m.id === a.modalidadeId)?.nome ?? "";
        const nomeModB = modalidades.find((m: any) => m.id === b.modalidadeId)?.nome ?? "";
        const cmpModalidade = nomeModA.localeCompare(nomeModB, "pt-BR");
        if (cmpModalidade !== 0) return cmpModalidade;

        const cmpDia = ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia);
        if (cmpDia !== 0) return cmpDia;

        return a.horario.localeCompare(b.horario);
      });

    const orientacaoDa = (t: any) => {
      const nome = modalidades.find((m: any) => m.id === t.modalidadeId)?.nome ?? "";
      return /infantil|musicaliza/i.test(nome) ? "landscape" : "portrait";
    };

    const doc = new jsPDF(turmasOrdenadas.length > 0 ? orientacaoDa(turmasOrdenadas[0]) : "portrait");
    let primeiraPagina = true;

    for (const turma of turmasOrdenadas) {
      if (!primeiraPagina) doc.addPage("a4", orientacaoDa(turma));
      primeiraPagina = false;

      this.desenharFolhaPresenca(doc, turma, mes, ano, instrutores, modalidades, associados);
    }

    const nomeArquivo = `Folhas de presença - ${MESES[mes]} ${ano}.pdf`;
    baixarEregistrar(doc, nomeArquivo, "presenca");
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
