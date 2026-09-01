'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  Brain,
  Award,
  Sparkles,
  DollarSign,
  User,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface PublicBookingPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ isOpen, onClose }) => {
  const { currentPsychologist, addPatient, addAppointment } = usePsi();

  const [selectedDate, setSelectedDate] = useState('2026-09-02');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [step, setStep] = useState<'schedule' | 'confirm' | 'success'>('schedule');

  const availableSlots = [
    '09:00', '10:30', '14:00', '15:30', '17:00', '18:30'
  ];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientEmail) return;

    // Criar paciente no estado
    const newPat = addPatient({
      full_name: patientName,
      email: patientEmail,
      phone: patientPhone || '(11) 99999-0000',
      birth_date: '1995-01-01',
      status: 'active',
      clinical_notes_overview: 'Agendamento online realizado via Bio Link público.'
    });

    // Criar agendamento
    addAppointment({
      psychologist_id: currentPsychologist?.id || 'psico-1',
      patient_id: newPat.id,
      patient_name: patientName,
      starts_at: `${selectedDate}T${selectedTime}:00`,
      ends_at: `${selectedDate}T${selectedTime}:50`,
      modality: 'online',
      status: 'scheduled',
      notes: 'Primeira consulta de acolhimento agendada pelo link público.',
      price: 250,
      payment_status: 'pending'
    });

    setStep('success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Página Pública de Agendamento (Bio Link)"
      description="Visualização pública indexável e link de agendamento online para novos pacientes."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {step === 'schedule' && (
          <div className="space-y-4">
            {/* Cartão de Apresentação da Psicóloga */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-800 to-indigo-900 text-white shadow-card flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-2xl border border-white/20 flex-shrink-0">
                👩‍⚕️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {currentPsychologist.profile?.full_name || 'Dra. Ana Martins'}
                  </h3>
                  <Badge variant="purple" size="sm" className="bg-white/20 text-teal-200 border-none">
                    CRP {currentPsychologist.crp_number}/{currentPsychologist.crp_state}
                  </Badge>
                </div>
                <p className="text-teal-200 text-xs font-medium">
                  {currentPsychologist.approach} • Terapia Baseada em Evidências
                </p>
                <p className="text-[11px] text-slate-200 leading-relaxed pt-1">
                  Atendimento humanizado para adultos e jovens. Foco no manejo de ansiedade, estresse profissional e desenvolvimento de autocompaixão.
                </p>
              </div>
            </div>

            {/* Duração & Investimento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Duração da Sessão</span>
                  <span className="text-[11px] text-slate-500">50 minutos (Online)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="font-bold text-slate-900 block">Investimento</span>
                  <span className="text-[11px] text-emerald-800 font-bold">R$ 250,00 por consulta</span>
                </div>
              </div>
            </div>

            {/* Seleção de Data e Horário */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">1. Selecione a data e horário da 1ª consulta:</span>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dia do Atendimento:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Horários Livres na Agenda:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                          selectedTime === time
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep('confirm')}
                className="bg-teal-600 hover:bg-teal-700 font-bold text-xs"
              >
                Avançar para Seus Dados
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900 font-medium">
              Consulta selecionada para <strong>{selectedDate}</strong> às <strong>{selectedTime}</strong> via Teleconsulta Segura.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seu Nome Completo:</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Ex: Beatriz Lima"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seu E-mail:</label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={e => setPatientEmail(e.target.value)}
                    placeholder="beatriz@exemplo.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp para Contato:</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    placeholder="(11) 98888-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setStep('schedule')}>
                Voltar
              </Button>
              <Button variant="primary" size="md" type="submit" className="bg-teal-600 hover:bg-teal-700 font-bold">
                Confirmar Agendamento
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Agendamento Realizado com Sucesso!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Enviamos os detalhes e o link seguro da videochamada para o seu WhatsApp e e-mail cadastrados.
              </p>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onClose} className="bg-teal-600 hover:bg-teal-700 font-bold">
                Concluir
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
