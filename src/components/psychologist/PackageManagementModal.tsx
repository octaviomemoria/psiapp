'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Layers, Calendar, DollarSign, User, Sparkles } from 'lucide-react';

interface PackageManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

export const PackageManagementModal: React.FC<PackageManagementModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
}) => {
  const {
    currentPsychologist,
    patients,
    addPatientPackage,
    addNotification
  } = usePsi();

  const [patientId, setPatientId] = useState<string>('');
  const [title, setTitle] = useState<string>('Pacote Mensal de Psicoterapia');
  const [totalSessions, setTotalSessions] = useState<number>(4);
  const [sessionUnitPrice, setSessionUnitPrice] = useState<number>(
    currentPsychologist.session_default_price || 180
  );
  const [totalPrice, setTotalPrice] = useState<number>(4 * (currentPsychologist.session_default_price || 180));
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'partially_paid'>('paid');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const initialPatId = preselectedPatientId || (patients.length > 0 ? patients[0].id : '');
      setPatientId(initialPatId);
      const pat = patients.find(p => p.id === initialPatId);
      setTitle(`Pacote de 4 Sessões - ${pat?.full_name || 'Paciente'}`);
      setTotalSessions(4);
      const defaultPrice = currentPsychologist.session_default_price || 180;
      setSessionUnitPrice(defaultPrice);
      setTotalPrice(4 * defaultPrice);
      setPaymentStatus('paid');
      setStartDate(new Date().toISOString().split('T')[0]);

      // Validade de 60 dias
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 60);
      setValidUntil(expiry.toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpen, preselectedPatientId, patients, currentPsychologist]);

  const handleSessionsChange = (num: number) => {
    setTotalSessions(num);
    setTotalPrice(num * sessionUnitPrice);
    const pat = patients.find(p => p.id === patientId);
    setTitle(`Pacote de ${num} Sessões - ${pat?.full_name || 'Paciente'}`);
  };

  const handleUnitPriceChange = (price: number) => {
    setSessionUnitPrice(price);
    setTotalPrice(totalSessions * price);
  };

  const handlePatientChange = (pId: string) => {
    setPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    setTitle(`Pacote de ${totalSessions} Sessões - ${pat?.full_name || 'Paciente'}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      alert('Por favor, selecione um paciente para vincular o pacote.');
      return;
    }

    const createdPkg = addPatientPackage({
      psychologist_id: currentPsychologist.id,
      patient_id: patientId,
      title: title.trim() || `Pacote de ${totalSessions} Sessões`,
      total_sessions: totalSessions,
      sessions_completed: 0,
      total_price: totalPrice,
      session_unit_price: sessionUnitPrice,
      payment_status: paymentStatus,
      start_date: startDate,
      valid_until: validUntil || undefined,
      notes: notes.trim() || undefined,
    });

    const patient = patients.find(p => p.id === patientId);

    addNotification({
      recipient_role: 'psychologist',
      title: 'Pacote Criado com Sucesso',
      message: `Pacote de ${totalSessions} sessões para ${patient?.full_name} cadastrado e integrado ao financeiro.`,
      type: 'feedback_received',
      read: false,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Pacote de Sessões"
      description="Contrate planos pré-pagos ou mensais com controle automático de sessões consumidas."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paciente */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" />
            Paciente Titular *
          </label>
          <select
            required
            value={patientId}
            onChange={e => handlePatientChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">Selecione o paciente</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.phone || p.email})
              </option>
            ))}
          </select>
        </div>

        {/* Título do Pacote */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Identificação / Título do Pacote
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Configuração de Sessões e Valores */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dimensionamento & Valores
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Qtd. Sessões
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={totalSessions}
                onChange={e => handleSessionsChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Valor Unit. (R$)
              </label>
              <input
                type="number"
                min={0}
                required
                value={sessionUnitPrice}
                onChange={e => handleUnitPriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Total Pacote (R$)
              </label>
              <input
                type="number"
                min={0}
                required
                value={totalPrice}
                onChange={e => setTotalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-teal-300 text-sm font-bold text-center text-teal-800 bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Atalhos rápidos:</span>
            <div className="flex gap-1.5">
              {[4, 8, 10, 12].map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => handleSessionsChange(n)}
                  className={`px-2 py-0.5 rounded-lg border text-xs font-semibold ${
                    totalSessions === n
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {n} sessões
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datas e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Válido Até
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Pagamento
            </label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="paid">🟢 Pago Integralmente</option>
              <option value="partially_paid">🟡 Parcialmente Pago</option>
              <option value="pending">⚪ Aguardando Pagamento</option>
            </select>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Observações / Acordo Contratual
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Sessões semanais às quartas. Tolerância de cancelamento até 24h antes."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-teal-700 hover:bg-teal-800">
            <DollarSign className="w-4 h-4 mr-1" />
            Cadastrar Pacote
          </Button>
        </div>
      </form>
    </Modal>
  );
};
