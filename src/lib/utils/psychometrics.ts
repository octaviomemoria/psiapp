/**
 * PsiApp - Motor de Cálculo e Interpretação Psicométrica Clínica
 * Módulo puramente funcional para inventários validados pelo CFP (PHQ-9, GAD-7 e DASS-21).
 */

export type ClinicalSeverity = 'Mínima' | 'Leve' | 'Moderada' | 'Moderadamente Grave' | 'Grave';

export interface PsychometricCalculation {
  score: number;
  maxScore: number;
  severity: ClinicalSeverity;
  interpretation: string;
  hasRisk: boolean;
  riskDetails?: string;
}

/**
 * Calcula a pontuação e gravidade do PHQ-9 (Patient Health Questionnaire-9).
 * Faixas padronizadas:
 * 0-4: Mínima
 * 5-9: Leve
 * 10-14: Moderada
 * 15-19: Moderadamente Grave
 * 20-27: Grave
 * Gatilho de Risco: Item 9 (ideação de morte/autoagressão) com valor > 0.
 */
export function calculatePHQ9(answers: Record<string, number>): PsychometricCalculation {
  let score = 0;
  for (let i = 1; i <= 9; i++) {
    const val = answers[`q${i}`] ?? 0;
    score += Math.min(Math.max(val, 0), 3);
  }

  const q9Value = answers['q9'] ?? 0;
  const hasRisk = q9Value > 0;

  let severity: ClinicalSeverity = 'Mínima';
  let interpretation = '';

  if (score <= 4) {
    severity = 'Mínima';
    interpretation = 'Sintomas depressivos mínimos ou ausentes. Sugere estabilidade do humor.';
  } else if (score <= 9) {
    severity = 'Leve';
    interpretation = 'Depressão leve. Monitorar sintomas e reforçar rotinas de autocuidado e higiene do sono.';
  } else if (score <= 14) {
    severity = 'Moderada';
    interpretation = 'Depressão moderada. Recomenda-se plano estruturado de ativação comportamental e reestruturação cognitiva.';
  } else if (score <= 19) {
    severity = 'Moderadamente Grave';
    interpretation = 'Depressão moderadamente grave. Indicação clara de psicoterapia intensiva e avaliação para suporte psiquiátrico.';
  } else {
    severity = 'Grave';
    interpretation = 'Depressão grave. Requer intervenção multidisciplinar imediata, suporte de rede de apoio e vigilância clínica.';
  }

  return {
    score,
    maxScore: 27,
    severity,
    interpretation,
    hasRisk,
    riskDetails: hasRisk
      ? 'Atenção clínica prioritária: Resposta positiva ao item 9 (ideação de autodano ou morte). Acionar protocolo de prevenção de crises.'
      : undefined
  };
}

/**
 * Calcula a pontuação e gravidade do GAD-7 (Generalized Anxiety Disorder 7-item).
 * Faixas padronizadas:
 * 0-4: Mínima
 * 5-9: Leve
 * 10-14: Moderada
 * 15-21: Grave
 */
export function calculateGAD7(answers: Record<string, number>): PsychometricCalculation {
  let score = 0;
  for (let i = 1; i <= 7; i++) {
    const val = answers[`q${i}`] ?? 0;
    score += Math.min(Math.max(val, 0), 3);
  }

  let severity: ClinicalSeverity = 'Mínima';
  let interpretation = '';

  if (score <= 4) {
    severity = 'Mínima';
    interpretation = 'Ansiedade mínima ou ausente. Níveis dentro da faixa de funcionalidade adaptativa.';
  } else if (score <= 9) {
    severity = 'Leve';
    interpretation = 'Ansiedade leve. Recomenda-se psicoeducação sobre ansiedade e treino de respiração diafragmática.';
  } else if (score <= 14) {
    severity = 'Moderada';
    interpretation = 'Ansiedade clinicamente significativa. Intervenção focada em descatastrofização e manejo de preocupações.';
  } else {
    severity = 'Grave';
    interpretation = 'Ansiedade grave. Comprometimento relevante do funcionamento cotidiano. Avaliar encaminhamento para psiquiatria.';
  }

  return {
    score,
    maxScore: 21,
    severity,
    interpretation,
    hasRisk: score >= 15
  };
}
