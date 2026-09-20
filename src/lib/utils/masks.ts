/** Máscaras e validações de cadastro (CPF, telefone, CEP) e idade. Funções puras, sem dependências. */

export function onlyDigits(value: string | null | undefined): string {
  return (value || '').replace(/\D/g, '');
}

export function formatCPF(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Valida CPF pelos dígitos verificadores. Rejeita sequências repetidas (111.111.111-11 etc.). */
export function isValidCPF(value: string | null | undefined): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number): number => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

/** Formata telefone brasileiro: (11) 2345-6789 (fixo) ou (11) 98765-4321 (celular). Ignora o prefixo +55. */
export function formatPhone(value: string | null | undefined): string {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Telefone válido = DDD + 8 dígitos (fixo) ou 9 dígitos começando em 9 (celular). */
export function isValidPhone(value: string | null | undefined): boolean {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  if (d.length === 10) return true;
  return d.length === 11 && d[2] === '9';
}

export function formatCEP(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

/**
 * Idade em anos completos. Retorna null quando não há data válida (a tela mostra "—" em vez de inventar uma idade).
 * Aceita "YYYY-MM-DD" ou ISO completo; a data é lida sem fuso para não trocar o dia.
 */
export function calculateAge(birthDate: string | null | undefined, today: Date = new Date()): number | null {
  if (!birthDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  let age = today.getFullYear() - year;
  const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age--;
  return age >= 0 && age < 130 ? age : null;
}
