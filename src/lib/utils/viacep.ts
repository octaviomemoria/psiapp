import { onlyDigits } from './masks';

export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Consulta o ViaCEP. Retorna null se o CEP não existe ou se a consulta falha:
 * quem chama mantém o preenchimento manual, sem mostrar erro técnico.
 */
export async function lookupCep(cep: string, fetcher: typeof fetch = fetch): Promise<CepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const res = await fetcher(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.erro) return null;
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch {
    return null;
  }
}
