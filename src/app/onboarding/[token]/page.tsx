'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Brain,
  ShieldCheck,
  User,
  Heart,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  AlertCircle,
  Lock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PatientOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || '';

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('Mariana Costa');
  const [birthDate, setBirthDate] = useState('1994-06-15');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [primaryReason, setPrimaryReason] = useState('');
  const [previousTherapy, setPreviousTherapy] = useState<'sim' | 'nao'>('nao');
  const [medications, setMedications] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsFinished(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-slate-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Cabeçalho da Clínica */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">PsiApp • Acolhimento Inicial</h1>
          <p className="text-xs text-slate-500">
            Boas-vindas ao seu espaço terapêutico seguro com Dra. Beatriz Santos (CRP 06/123456)
          </p>
        </div>

        {/* Barra de Progresso */}
        {!isFinished && (
          <div className="bg-white p-3 rounded-2xl shadow-2xs border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 px-1">
              <span>Etapa {step} de 4</span>
              <span>
                {step === 1
                  ? 'Apresentação'
                  : step === 2
                  ? 'Dados & Emergência'
                  : step === 3
                  ? 'Breve Anamnese'
                  : 'Termos & Consentimento'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card de Conteúdo */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {/* Passo 1: Boas-vindas */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-start gap-3">
                <Heart className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900 leading-relaxed">
                  <p className="font-semibold text-teal-950 text-sm mb-1">
                    Um espaço confidencial preparado para você
                  </p>
                  <p>
                    Iniciar a psicoterapia é um passo importante de autocuidado. Este formulário de primeiro acesso leva menos de 3 minutos e permite que sua psicóloga compreenda seu contexto e garanta seu suporte seguro desde o primeiro encontro.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Sigilo Ético & LGPD Garantidos
                </div>
                <p className="text-[11px] leading-relaxed">
                  Todas as informações fornecidas aqui são confidenciais e protegidas pelo Código de Ética Profissional do Psicólogo e pela Lei Geral de Proteção de Dados (Lei 13.709/2018).
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                className="w-full justify-center font-semibold text-xs h-11 shadow-sm mt-2"
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* Passo 2: Dados Cadastrais e Contato de Emergência */}
          {step === 2 && (
            <div className="space-y-4 text-xs font-sans">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                Seus Dados Cadastrais & Contato de Apoio
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Celular</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Contato de Emergência Obrigatório pelo CFP */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    Contato de Emergência (Familiar ou Amigo Próximo)
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Exigência do Conselho Federal de Psicologia para acionamento apenas em situações críticas de saúde.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nome do contato (ex: Mãe, Cônjuge)"
                        value={emergencyContactName}
                        onChange={e => setEmergencyContactName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Telefone do contato"
                        value={emergencyContactPhone}
                        onChange={e => setEmergencyContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="md" onClick={() => setStep(1)} className="flex-1 justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!fullName || !emergencyContactName || !emergencyContactPhone}
                  onClick={() => setStep(3)}
                  className="flex-1 justify-center font-semibold"
                >
                  Avançar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Passo 3: Breve Anamnese */}
          {step === 3 && (
            <div className="space-y-4 text-xs font-sans">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Breve Anamnese Inicial
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qual o motivo principal que o(a) trouxe à psicoterapia neste momento?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Manejo de ansiedade profissional, crises de pânico, término de relacionamento, autoconhecimento..."
                    value={primaryReason}
                    onChange={e => setPrimaryReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Já fez terapia antes?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="previousTherapy"
                        checked={previousTherapy === 'sim'}
                        onChange={() => setPreviousTherapy('sim')}
                        className="text-teal-600"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="previousTherapy"
                        checked={previousTherapy === 'nao'}
                        onChange={() => setPreviousTherapy('nao')}
                        className="text-teal-600"
                      />
                      <span>Não, é minha primeira vez</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Faz uso de algum medicamento contínuo? (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Escitalopram 10mg, Ritalina, ou 'Nenhum'"
                    value={medications}
                    onChange={e => setMedications(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="md" onClick={() => setStep(2)} className="flex-1 justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!primaryReason.trim()}
                  onClick={() => setStep(4)}
                  className="flex-1 justify-center font-semibold"
                >
                  Avançar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Passo 4: Termo de Consentimento Livre e Esclarecido (TCLE) */}
          {step === 4 && !isFinished && (
            <div className="space-y-4 text-xs font-sans">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Termo de Consentimento Livre e Esclarecido (TCLE)
              </h2>

              <div className="h-44 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-800">1. Natureza do Atendimento e Sigilo Profissional</p>
                <p>
                  O atendimento psicológico rege-se estritamente pelo Código de Ética Profissional do Psicólogo e pelas Resoluções CFP nº 001/2009 e 009/2024. As informações compartilhadas em sessão são confidenciais.
                </p>

                <p className="font-semibold text-slate-800">2. Política de Faltas e Cancelamentos</p>
                <p>
                  Solicita-se aviso prévio mínimo de 24 horas para desmarcações ou reagendamentos, respeitando o horário reservado da profissional.
                </p>

                <p className="font-semibold text-slate-800">3. Suporte Entre Sessões e Emergências</p>
                <p>
                  O aplicativo disponibiliza ferramentas de autoajuda e diário. Mensagens são respondidas em horário útil. Em situações de emergência emocional com risco à vida, utilize os serviços de emergência (CVV 188 ou SAMU 192).
                </p>
              </div>

              <label className="flex items-start gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 text-teal-600 rounded-sm focus:ring-teal-500"
                />
                <span className="text-[11px] text-teal-950 leading-snug">
                  Declaro que li, compreendi e concordo integralmente com os termos do atendimento psicológico e autorizo o registro do meu prontuário.
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="md" onClick={() => setStep(3)} className="flex-1 justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!acceptedTerms || isSubmitting}
                  onClick={handleFinish}
                  className="flex-1 justify-center font-semibold bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Registrando...' : 'Concluir & Assinar'}
                  <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Tela de Sucesso Final */}
          {isFinished && (
            <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tudo Pronto, {fullName.split(' ')[0]}! 🌿</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Sua ficha inicial e o termo de consentimento foram registrados com segurança criptográfica em seu prontuário.
                </p>
              </div>

              <div className="pt-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/paciente/inicio')}
                  className="w-full justify-center font-semibold text-xs h-11"
                >
                  Acessar Meu Espaço Terapêutico
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Seguro */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Ambiente Criptografado de Saúde • Conformidade CFP & LGPD</span>
        </div>
      </div>
    </div>
  );
}
