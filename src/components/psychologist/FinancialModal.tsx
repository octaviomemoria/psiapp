'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, PaymentStatus } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, CheckCircle2, QrCode, FileText, Printer, CreditCard } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export const FinancialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { appointments, patients, updateAppointmentPayment, currentPsychologist } = usePsi();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showReceiptFor, setShowReceiptFor] = useState<Appointment | null>(null);

  const appointmentsWithPayment = appointments.map(a => {
    const patient = patients.find(p => p.id === a.patient_id);
    return {
      ...a,
      patient_name: patient?.full_name || a.patient_name || 'Paciente',
      price: a.price || 220,
      payment_status: a.payment_status || 'pending',
    };
  });

  const totalReceived = appointmentsWithPayment
    .filter(a => a.payment_status === 'paid_pix' || a.payment_status === 'paid_card')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const totalPending = appointmentsWithPayment
    .filter(a => a.payment_status === 'pending')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão Financeira & Recibos de Honorários"
      description="Controle de pagamentos de sessões e emissão de recibos para reembolso."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-800 font-medium">Total Recebido</p>
              <h4 className="text-xl font-bold text-emerald-950">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceived)}
              </h4>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-medium">A Receber (Pendentes)</p>
              <h4 className="text-xl font-bold text-amber-950">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
              </h4>
            </div>
          </div>
        </div>

        {/* Tabela de Consultas e Status de Pagamento */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Histórico de Cobranças por Sessão</h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {appointmentsWithPayment.map(apt => (
              <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-800">{apt.patient_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(apt.starts_at)} • {apt.modality} • R$ {apt.price},00
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={apt.payment_status}
                    onChange={e => updateAppointmentPayment(apt.id, e.target.value as PaymentStatus)}
                    className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="pending">🟡 Pendente</option>
                    <option value="paid_pix">🟢 Pago via Pix</option>
                    <option value="paid_card">🟢 Pago via Cartão</option>
                    <option value="insurance">🔵 Convênio / Reembolso</option>
                    <option value="free">⚪ Isento / Social</option>
                  </select>

                  {apt.payment_status.startsWith('paid') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReceiptFor(apt)}
                      className="text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Recibo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL / VISUALIZADOR DE RECIBO FORMAL */}
        {showReceiptFor && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs font-serif print:p-0 print:border-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-sm text-slate-800 font-sans">
                RECIBO DE HONORÁRIOS PROFISSIONAIS — {showReceiptFor.receipt_number || 'REC-2026-081'}
              </span>
              <Button type="button" variant="primary" size="sm" onClick={handlePrintReceipt} className="text-xs print:hidden">
                <Printer className="w-3 h-3 mr-1" />
                Imprimir Recibo
              </Button>
            </div>

            <p className="text-justify leading-relaxed text-slate-700">
              Recebi de <strong>{showReceiptFor.patient_name}</strong> a quantia de{' '}
              <strong>R$ {showReceiptFor.price},00 (duzentos e vinte reais)</strong> referente aos serviços de atendimento psicoterapêutico clínico prestados em <strong>{formatDate(showReceiptFor.starts_at)}</strong>.
            </p>

            <div className="pt-4 text-center font-sans space-y-0.5">
              <div className="w-48 h-px bg-slate-300 mx-auto mb-1" />
              <p className="font-bold text-slate-900">{currentPsychologist.profile?.full_name || 'Dra. Ana Martins'}</p>
              <p className="text-[11px] text-slate-600">CRP {currentPsychologist.crp_number}/{currentPsychologist.crp_state}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
