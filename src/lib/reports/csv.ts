/**
 * CSV para o Excel brasileiro: separador ";", UTF-8 com BOM, decimais com vírgula.
 * Células de texto que começam com = + - @ são prefixadas com apóstrofo para que o Excel não as execute como
 * fórmula (nomes de pacientes e anotações são digitados por pessoas).
 */

export type CsvCell = string | number | boolean | null | undefined;

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return (Number.isInteger(value) ? String(value) : value.toFixed(2)).replace('.', ',');
  }
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';

  let text = value.replace(/\r?\n/g, ' ');
  // Um texto que é só um número negativo digitado por engano continua seguro: o apóstrofo não altera a leitura.
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[;"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(csvCell).join(';'), ...rows.map(row => row.map(csvCell).join(';'))];
  return '﻿' + lines.join('\r\n');
}

/** Dispara o download no navegador. */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
