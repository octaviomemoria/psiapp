'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Heart,
  Phone,
  UserCheck,
  Home,
  Sparkles,
  Download,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  LifeBuoy
} from 'lucide-react';

interface SafetyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyPlanModal: React.FC<SafetyPlanModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Estados dos 6 passos de Stanley-Brown
  const [warningSigns, setWarningSigns] = useState('');
  const [internalCoping, setInternalCoping] = useState('');
  const [socialDistraction, setSocialDistraction] = useState('');
  const [supportContacts, setSupportContacts] = useState('');
  const [professionals, setProfessionals] = useState('CVV: 188 (Ligação gratuita 24h) | SAMU: 192 | UPA mais próxima');
  const [safeEnvironment, setSafeEnvironment] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('psiapp_safety_plan');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.warningSigns) setWarningSigns(parsed.warningSigns);
          if (parsed.internalCoping) setInternalCoping(parsed.internalCoping);
          if (parsed.socialDistraction) setSocialDistraction(parsed.socialDistraction);
          if (parsed.supportContacts) setSupportContacts(parsed.supportContacts);
          if (parsed.professionals) setProfessionals(parsed.professionals);
          if (parsed.safeEnvironment) setSafeEnvironment(parsed.safeEnvironment);
        }
      } catch (e) {
        console.warn('Erro ao carregar plano de segurança salvo:', e);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('psiapp_safety_plan', JSON.stringify({
        warningSigns,
        internalCoping,
        socialDistraction,
        supportContacts,
        professionals,
        safeEnvironment,
        updatedAt: new Date().toISOString()
      }));
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const steps = [
    {
      step: 1,
      title: '1. Sinais de Alerta Pessoais',
      desc: 'Quais pensamentos, sensações físicas, humores ou comportamentos indicam que uma crise pode estar começando?',
      icon: AlertOctagon,
      value: warningSigns,
      setter: setWarningSigns,
      placeholder: 'Ex: Ficar sem dormir, pensamentos de desesperança, aperto no peito...'
    },
    {
      step: 2,
      title: '2. Estratégias Internas de Enfrentamento',
      desc: 'O que posso fazer sozinho(a) para me acalmar e desviar o foco sem precisar de outra pessoa no primeiro momento?',
      icon: Sparkles,
      value: internalCoping,
      setter: setInternalCoping,
      placeholder: 'Ex: Exercício de respiração 4-7-8, banho morno, ouvir música calma...'
    },
    {
      step: 3,
      title: '3. Pessoas e Lugares para Distração',
      desc: 'Quais ambientes seguros ou contatos sociais posso procurar para mudar de ambiente e distrair a mente?',
      icon: Home,
      value: socialDistraction,
      setter: setSocialDistraction,
      placeholder: 'Ex: Caminhar na praça, ir à casa de um amigo, visitar uma livraria...'
    },
    {
      step: 4,
      title: '4. Pessoas Próximas para Pedir Apoio',
      desc: 'Familiares ou amigos de confiança a quem posso falar abertamente que estou passando por um momento difícil:',
      icon: UserCheck,
      value: supportContacts,
      setter: setSupportContacts,
      placeholder: 'Ex: Nome e telefone de 2 pessoas de máxima confiança...'
    },
    {
      step: 5,
      title: '5. Profissionais e Serviços de Emergência',
      desc: 'Contatos de saúde mental de referência e canais de ajuda 24 horas:',
      icon: Phone,
      value: professionals,
      setter: setProfessionals,
      placeholder: 'Ex: Contato do psicólogo/psiquiatra, CVV 188, CAPS...'
    },
    {
      step: 6,
      title: '6. Tornando o Ambiente Seguro',
      desc: 'Que medidas práticas reduzem o acesso a itens de risco durante uma crise de desregulação emocional?',
      icon: ShieldAlert,
      value: safeEnvironment,
      setter: setSafeEnvironment,
      placeholder: 'Ex: Entregar medicamentos para um familiar administrar, afastar objetos perigosos...'
    }
  ];

  const activeStepData = steps.find(s => s.step === currentStep) || steps[0];
  const StepIcon = activeStepData.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plano de Segurança de Crise (Stanley-Brown)"
      description="Protocolo clínico estruturado de prevenção e proteção para momentos de sofrimento agudo."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Banner de Ajuda Imediata CVV 188 */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-950 text-xs">
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Precisa de ajuda humana agora?</span>
              <p className="text-[11px] text-rose-800">Ligue gratuitamente para o CVV (Centro de Valorização da Vida)</p>
            </div>
          </div>
          <a
            href="tel:188"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 text-xs shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            Ligar 188
          </a>
        </div>

        {/* Indicador de Passos */}
        <div className="flex items-center justify-between gap-1 px-1">
          {steps.map(s => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                currentStep === s.step
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Etapa {s.step}
            </button>
          ))}
        </div>

        {/* Card do Passo Ativo */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{activeStepData.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeStepData.desc}</p>
            </div>
          </div>

          <textarea
            rows={4}
            value={activeStepData.value}
            onChange={e => activeStepData.setter(e.target.value)}
            placeholder={activeStepData.placeholder}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Feedback de salvamento */}
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Plano de segurança atualizado e salvo com sucesso no seu perfil!</span>
          </div>
        )}

        {/* Ações e Navegação */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs text-slate-600"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Imprimir / Salvar PDF
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Anterior
              </Button>
            )}

            {currentStep < 6 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
              >
                Próximo Passo
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
              >
                Salvar Plano Completo
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
