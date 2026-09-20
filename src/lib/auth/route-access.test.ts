import assert from 'node:assert';
import { decideAccess, protectedAreaFor, normalizePath, homeForRole } from './route-access';

const redirect = (to: string) => ({ type: 'redirect', to });
const allow = { type: 'allow' };

function run() {
  console.log('🧪 Iniciando testes de acesso a rotas por papel...');

  // rotas públicas nunca exigem sessão
  for (const p of ['/', '/termos', '/privacidade', '/validar/abc123', '/onboarding/tok', '/psicologos-lista', '/paciente-x']) {
    assert.deepStrictEqual(decideAccess({ pathname: p, hasSession: false, role: null }), allow, p);
  }
  console.log('✅ PASS: rotas públicas continuam abertas (inclui prefixos parecidos, como /paciente-x)');

  // áreas protegidas sem sessão
  for (const p of ['/psicologo', '/psicologo/dashboard', '/psicologo/pacientes/123', '/paciente/inicio', '/gerente/salas', '/superadmin/auditoria']) {
    assert.deepStrictEqual(decideAccess({ pathname: p, hasSession: false, role: null }), redirect('/?auth=required'), p);
  }
  console.log('✅ PASS: áreas protegidas sem sessão → login');

  // sessão sem perfil/papel confirmado nega (falha fechada)
  assert.deepStrictEqual(decideAccess({ pathname: '/psicologo/dashboard', hasSession: true, role: null }), redirect('/?auth=required'));
  console.log('✅ PASS: sessão sem papel confirmado é negada');

  // papel certo entra
  assert.deepStrictEqual(decideAccess({ pathname: '/psicologo/agenda', hasSession: true, role: 'psychologist' }), allow);
  assert.deepStrictEqual(decideAccess({ pathname: '/paciente/diario', hasSession: true, role: 'patient' }), allow);
  assert.deepStrictEqual(decideAccess({ pathname: '/gerente/equipe', hasSession: true, role: 'manager' }), allow);
  assert.deepStrictEqual(decideAccess({ pathname: '/gerente/equipe', hasSession: true, role: 'admin' }), allow);
  assert.deepStrictEqual(decideAccess({ pathname: '/superadmin/auditoria', hasSession: true, role: 'superadmin' }), allow);
  console.log('✅ PASS: cada papel entra na sua área');

  // papel errado vai para a própria área (sem laço)
  assert.deepStrictEqual(decideAccess({ pathname: '/superadmin/auditoria', hasSession: true, role: 'psychologist' }), redirect('/psicologo/dashboard'));
  assert.deepStrictEqual(decideAccess({ pathname: '/psicologo/pacientes', hasSession: true, role: 'patient' }), redirect('/paciente/inicio'));
  assert.deepStrictEqual(decideAccess({ pathname: '/gerente/financeiro', hasSession: true, role: 'psychologist' }), redirect('/psicologo/dashboard'));
  assert.deepStrictEqual(decideAccess({ pathname: '/psicologo/dashboard', hasSession: true, role: 'superadmin' }), redirect('/superadmin/dashboard'));
  // papel sem área própria (supervisor) volta ao início em vez de entrar em laço
  assert.deepStrictEqual(decideAccess({ pathname: '/psicologo/dashboard', hasSession: true, role: 'supervisor' }), redirect('/'));
  // o destino do redirecionamento sempre é acessível ao próprio papel
  for (const role of ['psychologist', 'patient', 'manager', 'admin', 'superadmin']) {
    const home = homeForRole(role);
    assert.deepStrictEqual(decideAccess({ pathname: home, hasSession: true, role }), allow, `home de ${role} deve ser permitida`);
  }
  console.log('✅ PASS: papel errado é redirecionado para a própria área, sem laço');

  // tentativas de contornar a comparação do caminho
  for (const p of ['/PSICOLOGO/dashboard', '//psicologo/dashboard', '/psicologo/', '/Superadmin/Auditoria']) {
    assert.ok(protectedAreaFor(p), `${p} deve ser tratado como protegido`);
  }
  assert.strictEqual(normalizePath('//A//b/'), '/a/b');
  assert.deepStrictEqual(decideAccess({ pathname: '/SUPERADMIN/dashboard', hasSession: true, role: 'patient' }), redirect('/paciente/inicio'));
  console.log('✅ PASS: variações de caixa e barras não burlam a proteção');

  console.log('🎉 Todos os testes de acesso a rotas passaram!');
}

run();
