'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Crown,
  Check,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface SaaSSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaaSSubscriptionModal: React.FC<SaaSSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addNotification } = usePsi();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState<'individual' | 'clinic_pro' | 'enterprise'>('clinic_pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = [
    {
      id: 'individual',
      name: 'Autônomo',
      tagline: 'Ideal para psicólogos individuais com consultório próprio.',
      monthlyPrice: 119,
      yearlyPrice: 99,
      badge: null,
      features: [
        'Até 40 pacientes ativos',
        'Prontuário SOAP com autosave',
        'Telepsicologia WebRTC integrada',
        '16 ferramentas clínicas (TCC, ACT, DBT)',
        'Cobrança Pix integrada com recibos',
      ],
    },
    {
      id: 'clinic_pro',
      name: 'Clínica Pro',
      tagline: 'Para clínicas com múltiplos terapeutas e consultórios.',
      monthlyPrice: 289,
      yearlyPrice: 239,
      badge: 'Mais Popular',
      features: [
        'Até 10 psicólogos na equipe',
        'Pacientes ilimitados',
        'Gestão de salas físicas e virtuais',
        'Split de pagamentos e repasses',
        'Controle financeiro consolidado',
        'Trilha de auditoria CFP imutável',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise & Redes',
      tagline: 'Para redes de saúde mental e grandes organizações.',
      monthlyPrice: 590,
      yearlyPrice: 490,
      badge: 'White-Label',
      features: [
        'Psicólogos e unidades ilimitadas',
        'Subdomínio próprio e logo da clínica',
        'Acordo BAA / LGPD corporativo',
        'SLA 99.9% com suporte dedicado 24/7',
        'Exportação customizada de dados',
      ],
    },
  ];

  const currentPlan = plans.find(p => p.id === selectedPlanId)!;
  const currentPrice = billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;

  const handleSubscribe = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      addNotification({
        recipient_role: 'psychologist',
        title: `Assinatura do Plano ${currentPlan.name} Ativada!`,
        message: `Sua assinatura ${billingCycle === 'yearly' ? 'anual' : 'mensal'} de R$ ${currentPrice}/mês foi confirmada com sucesso.`,
        type: 'feedback_received',
        read: false
      });
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planos & Assinatura SaaS — PsiApp"
      description="Potencialize seu consultório ou clínica com a melhor tecnologia em saúde mental."
      maxWidth="3xl"
    >
      {!isSuccess ? (
        <div className="space-y-6">
          {/* Alternador de Ciclo: Mensal vs Anual */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cobrança Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Cobrança Anual</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
                  2 meses grátis
                </span>
              </button>
            </div>
          </div>

          {/* Grid de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => {
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
              const isSelected = selectedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id as any)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/20 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed min-h-[36px]">{plan.tagline}</p>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-700">R$</span>
                        <span className="text-3xl font-extrabold text-slate-900">{price}</span>
                        <span className="text-xs text-slate-700">/mês</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-[10px] text-teal-800 font-semibold mt-0.5">
                          Faturado anualmente (R$ {price * 12})
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Plano Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do Checkout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-700">Plano Escolhido:</p>
                <p className="font-bold text-sm text-slate-900">
                  {currentPlan.name} • {billingCycle === 'yearly' ? 'Ciclo Anual' : 'Ciclo Mensal'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handleSubscribe}
                className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800 text-white font-bold"
              >
                Confirmar Assinatura (R$ {currentPrice}/mês)
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Tela de Sucesso */
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assinatura Ativada com Sucesso!</h3>
            <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto">
              Você agora tem acesso a todos os recursos do plano <strong>{currentPlan.name}</strong>. A nota fiscal e confirmação foram enviadas para seu e-mail.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={onClose}>
              Começar a Usar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
