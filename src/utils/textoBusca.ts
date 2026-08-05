// ======================================================
// APUSM SaaS — Utilitário de busca aproximada de texto
// Arquivo: textoBusca.ts
// Ignora acentos e tolera pequenos erros de digitação
// ======================================================

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function distanciaEdicao(a: string, b: string): number {
  const matriz: number[][] = Array.from({ length: a.length + 1 }, () => []);

  for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
  for (let j = 0; j <= b.length; j++) matriz[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = 1 + Math.min(matriz[i - 1][j], matriz[i][j - 1], matriz[i - 1][j - 1]);
      }
    }
  }

  return matriz[a.length][b.length];
}

export function buscaAproximada(termo: string, alvo: string): boolean {
  const termoNorm = normalizar(termo);
  const alvoNorm = normalizar(alvo);
  if (termoNorm.length === 0) return false;
  if (alvoNorm.includes(termoNorm)) return true;

  // Nomes muito curtos (3 letras ou menos) exigem correspondência exata de substring,
  // pra evitar que a tolerância a erro de digitação combine com nomes completamente diferentes.
  if (termoNorm.length <= 3) return false;

  const palavrasAlvo = alvoNorm.split(" ");
  return palavrasAlvo.some((palavra) => {
    if (Math.abs(palavra.length - termoNorm.length) > 2) return false;
    const tolerancia = palavra.length <= 5 ? 1 : 2;
    return distanciaEdicao(termoNorm, palavra) <= tolerancia;
  });
}