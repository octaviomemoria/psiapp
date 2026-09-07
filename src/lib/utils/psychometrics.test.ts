import { calculatePHQ9, calculateGAD7 } from './psychometrics';

// Executável como teste automatizado no Node
export function runPsychometricsTests(): { passed: boolean; log: string[] } {
  const log: string[] = [];
  let passed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      log.push(`✅ PASS: ${testName}`);
    } else {
      log.push(`❌ FAIL: ${testName}`);
      passed = false;
    }
  }

  // Testes PHQ-9
  const phqMinimal = calculatePHQ9({ q1: 1, q2: 1 });
  assert(phqMinimal.score === 2 && phqMinimal.severity === 'Mínima' && !phqMinimal.hasRisk, 'PHQ-9 Pontuação Mínima (2 pts)');

  const phqModerate = calculatePHQ9({ q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2 });
  assert(phqModerate.score === 12 && phqModerate.severity === 'Moderada', 'PHQ-9 Pontuação Moderada (12 pts)');

  const phqRiskTrigger = calculatePHQ9({ q1: 1, q9: 1 });
  assert(phqRiskTrigger.hasRisk === true && !!phqRiskTrigger.riskDetails, 'PHQ-9 Detecção de Risco no Item 9 (Ideação)');

  const phqSevere = calculatePHQ9({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3 });
  assert(phqSevere.score === 27 && phqSevere.severity === 'Grave', 'PHQ-9 Pontuação Máxima Grave (27 pts)');

  // Testes GAD-7
  const gadMinimal = calculateGAD7({ q1: 1, q2: 1 });
  assert(gadMinimal.score === 2 && gadMinimal.severity === 'Mínima', 'GAD-7 Pontuação Mínima (2 pts)');

  const gadModerate = calculateGAD7({ q1: 2, q2: 2, q3: 2, q4: 2, q5: 2 });
  assert(gadModerate.score === 10 && gadModerate.severity === 'Moderada', 'GAD-7 Pontuação Moderada (10 pts)');

  const gadSevere = calculateGAD7({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3 });
  assert(gadSevere.score === 18 && gadSevere.severity === 'Grave' && gadSevere.hasRisk, 'GAD-7 Pontuação Grave (18 pts)');

  return { passed, log };
}

// Auto-execução se rodado diretamente
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const result = runPsychometricsTests();
  result.log.forEach(l => console.log(l));
  if (!result.passed) process.exit(1);
}
