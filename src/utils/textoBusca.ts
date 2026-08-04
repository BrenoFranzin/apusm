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

  if (alvoNorm.includes(termoNorm)) return true;

  const palavrasAlvo = alvoNorm.split(" ");

  return palavrasAlvo.some((palavra) => {
    const tolerancia = palavra.length <= 4 ? 1 : 2;
    return distanciaEdicao(termoNorm, palavra) <= tolerancia;
  });
}