import { onlyDigits, formatCPF, isValidCPF, formatPhone, isValidPhone, formatCEP, calculateAge } from './masks';
import { lookupCep } from './viacep';
import { getBillingResponsible } from './patient';
import { formatDate } from '../utils';

async function run() {
  const failures: string[] = [];
  const check = (condition: boolean, name: string) => {
    console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${name}`);
    if (!condition) failures.push(name);
  };

  check(onlyDigits('(11) 98765-4321') === '11987654321', 'onlyDigits remove máscara');
  check(onlyDigits(undefined) === '', 'onlyDigits aceita undefined');

  check(formatCPF('52998224725') === '529.982.247-25', 'formatCPF completo');
  check(formatCPF('5299822') === '529.982.2', 'formatCPF parcial');
  check(formatCPF('529.982.247-25999') === '529.982.247-25', 'formatCPF limita a 11 dígitos');
  check(isValidCPF('529.982.247-25'), 'CPF válido');
  check(!isValidCPF('529.982.247-24'), 'CPF com dígito verificador errado');
  check(!isValidCPF('111.111.111-11'), 'CPF de dígitos repetidos');
  check(!isValidCPF('123'), 'CPF curto');

  check(formatPhone('11987654321') === '(11) 98765-4321', 'formatPhone celular');
  check(formatPhone('1123456789') === '(11) 2345-6789', 'formatPhone fixo');
  check(formatPhone('+5511987654321') === '(11) 98765-4321', 'formatPhone ignora +55');
  check(formatPhone('') === '', 'formatPhone vazio');
  check(isValidPhone('(11) 98765-4321'), 'telefone celular válido');
  check(isValidPhone('(11) 2345-6789'), 'telefone fixo válido');
  check(!isValidPhone('(11) 88765-4321'), 'celular sem 9 inicial é inválido');
  check(!isValidPhone('1234'), 'telefone curto é inválido');

  check(formatCEP('01310100') === '01310-100', 'formatCEP completo');
  check(formatCEP('0131') === '0131', 'formatCEP parcial');

  const today = new Date(2026, 8, 20); // 20/09/2026
  check(calculateAge('1990-09-20', today) === 36, 'idade no dia do aniversário');
  check(calculateAge('1990-09-21', today) === 35, 'idade um dia antes do aniversário');
  check(calculateAge('2026-01-01', today) === 0, 'bebê com menos de 1 ano');
  check(calculateAge('', today) === null, 'idade sem data retorna null');
  check(calculateAge('lixo', today) === null, 'idade com data inválida retorna null');
  check(calculateAge('2030-01-01', today) === null, 'data de nascimento no futuro retorna null');
  check(calculateAge('1990-09-20T00:00:00.000Z', today) === 36, 'idade aceita ISO completo sem trocar o dia');

  const fake = (async () => ({
    ok: true,
    json: async () => ({ logradouro: 'Avenida Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP' }),
  })) as unknown as typeof fetch;
  const addr = await lookupCep('01310-100', fake);
  check(addr?.street === 'Avenida Paulista' && addr?.state === 'SP', 'lookupCep mapeia a resposta do ViaCEP');

  const notFound = (async () => ({ ok: true, json: async () => ({ erro: true }) })) as unknown as typeof fetch;
  check((await lookupCep('00000000', notFound)) === null, 'lookupCep retorna null para CEP inexistente');

  const broken = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
  check((await lookupCep('01310100', broken)) === null, 'lookupCep retorna null sem rede');
  check((await lookupCep('123', fake)) === null, 'lookupCep rejeita CEP incompleto sem consultar');

  // formatDate: dia de calendário não pode recuar um dia em fuso negativo (America/Sao_Paulo é UTC-3)
  const previousTz = process.env.TZ;
  process.env.TZ = 'America/Sao_Paulo';
  check(formatDate('2015-05-15') === '15/05/2015', 'formatDate não recua o dia de uma data sem horário');
  check(formatDate('') === '-', 'formatDate vazio');
  check(formatDate('não é data') === 'não é data', 'formatDate devolve o texto quando inválida');
  process.env.TZ = previousTz;

  // Responsável financeiro: responsável autorizado > paciente
  const adult = { full_name: 'Lara Souza', cpf: '52998224725' };
  check(getBillingResponsible(adult).name === 'Lara Souza' && getBillingResponsible(adult).cpf === '52998224725', 'cobrança usa nome e CPF do paciente por padrão');
  const minor = { full_name: 'Bia', cpf: '', guardian_name: ' Ana Souza ', guardian_cpf: '11144477735', guardian_allow_billing_contact: true };
  check(getBillingResponsible(minor).name === 'Ana Souza' && getBillingResponsible(minor).cpf === '11144477735', 'cobrança usa o responsável quando autorizado');
  const notAllowed = { ...minor, guardian_allow_billing_contact: false };
  check(getBillingResponsible(notAllowed).name === 'Bia', 'responsável sem autorização não entra na cobrança');
  check(getBillingResponsible({ ...minor, guardian_name: '  ' }).name === 'Bia', 'autorização sem nome do responsável cai para o paciente');
  check(getBillingResponsible(undefined, 'Sem paciente').name === 'Sem paciente', 'paciente ausente usa o nome de reserva');

  if (failures.length > 0) {
    console.error(`\n${failures.length} teste(s) falharam.`);
    process.exit(1);
  }
  console.log('\nTodos os testes de masks passaram.');
}

run();
