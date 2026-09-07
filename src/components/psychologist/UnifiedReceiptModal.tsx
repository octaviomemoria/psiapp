'use client';

import React, { useState, useMemo } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FileText, Printer, Calendar, User, CheckCircle2 } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

interface UnifiedReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

export const UnifiedReceiptModal: React.FC<UnifiedReceiptModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
}) => {
  const { currentPsychologist, clinic, patients, appointments } = usePsi();

  const [patientId, setPatientId] = useState<string>(preselectedPatientId || (patients[0]?.id || ''));
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  );
  const [receiptNumber, setReceiptNumber] = useState<string>(
    `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const selectedPatient = patients.find(p => p.id === patientId);

  // Filtrar sessões do paciente no mês selecionado
  const monthlyAppointments = useMemo(() => {
    if (!patientId || !selectedMonth) return [];
    return appointments.filter(a => {
      const matchPatient = a.patient_id === patientId;
      const matchMonth = a.starts_at && a.starts_at.startsWith(selectedMonth);
      const isPaid = a.payment_status ? a.payment_status.startsWith('paid') : true;
      return matchPatient && matchMonth;
    });
  }, [appointments, patientId, selectedMonth]);

  const totalAmount = useMemo(() => {
    return monthlyAppointments.reduce((acc, curr) => acc + (curr.price || 200), 0);
  }, [monthlyAppointments]);

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthLabel = monthNames[parseInt(monthStr, 10) - 1] || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emissão de Recibo Consolidado Mensal"
      description="Gere recibo formal unificado para reembolso de convênios médicos ou declaração de Imposto de Renda (IRPF)."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Controles do Recibo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 print:hidden">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Paciente
            </label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Mês de Referência
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nº do Recibo
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={e => setReceiptNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Informações de sessões encontradas */}
        <div className="flex items-center justify-between px-3 py-2 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900 print:hidden">
          <span>
            <strong>{monthlyAppointments.length}</strong> sessão(ões) localizada(s) em {monthLabel}/{yearStr}.
          </span>
          <span className="font-bold text-teal-950">
            Total a declarar: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
          </span>
        </div>

        {/* DOCUMENTO FORMAL DE RECIBO (Visível na tela e perfeitamente formatado para IMPRESSÃO) */}
        <div
          id="printable-receipt"
          className="p-8 bg-white rounded-2xl border-2 border-slate-300 shadow-xs space-y-6 text-slate-900 font-serif text-sm print:p-0 print:border-none print:shadow-none"
        >
          {/* Cabeçalho Profissional */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 font-sans">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentPsychologist.profile?.full_name || 'Psicólogo Clínico'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Psicólogo(a) Clínico(a) • CRP {currentPsychologist.crp_number || '00/000000'}/{currentPsychologist.crp_state || 'UF'}
              </p>
              <p className="text-[11px] text-slate-500">
                {clinic?.address || 'Consultório de Psicologia Clínica'}
              </p>
            </div>
            <div className="text-right sm:text-right font-mono">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 border border-slate-200">
                {receiptNumber}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">Via do Paciente / Reembolso</p>
            </div>
          </div>

          <div className="text-center py-2">
            <h3 className="text-base font-bold font-sans uppercase tracking-widest text-slate-800 underline underline-offset-4">
              Recibo de Honorários Profissionais
            </h3>
          </div>

          {/* Corpo do Recibo */}
          <div className="space-y-4 leading-relaxed text-justify">
            <p>
              Recebi de{' '}
              <strong>
                {(selectedPatient as any)?.financial_responsible_name || selectedPatient?.full_name || 'Paciente'}
              </strong>
              {((selectedPatient as any)?.financial_responsible_cpf || (selectedPatient as any)?.cpf) && (
                <>, inscrito(a) no CPF sob o nº <strong>{(selectedPatient as any)?.financial_responsible_cpf || (selectedPatient as any)?.cpf}</strong></>
              )}
              , a quantia de{' '}
              <strong className="text-base font-sans">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
              </strong>
              , referente à prestação de serviços profissionais de psicoterapia clínica prestados no mês de{' '}
              <strong>{monthLabel} de {yearStr}</strong>.
            </p>

            {/* Discriminação detalhada das datas (Exigência dos convênios) */}
            <div className="pt-2">
              <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Discriminação das Sessões Realizadas:
              </p>
              <div className="border border-slate-300 rounded-lg overflow-hidden font-sans text-xs">
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-left">Sessão</th>
                      <th className="py-2 px-3 text-left">Data & Horário</th>
                      <th className="py-2 px-3 text-left">Modalidade</th>
                      <th className="py-2 px-3 text-right">Valor Unitário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyAppointments.length > 0 ? (
                      monthlyAppointments.map((apt, idx) => (
                        <tr key={apt.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-medium">#{idx + 1}</td>
                          <td className="py-2 px-3">{formatDateTime(apt.starts_at)}</td>
                          <td className="py-2 px-3 capitalize">{apt.modality || 'Presencial'}</td>
                          <td className="py-2 px-3 text-right font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.price || 200)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 px-3 text-center text-slate-400 italic">
                          Nenhuma sessão registrada com data em {monthLabel}/{yearStr}. Você pode cadastrá-las na agenda ou nas transações.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right">Valor Total Quitado:</td>
                      <td className="py-2 px-3 text-right text-emerald-800 font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans italic pt-2">
              Declaro, para os devidos fins de comprovação e solicitação de reembolso perante convênio médico e/ou declaração de ajuste anual do Imposto sobre a Renda da Pessoa Física (IRPF), que os atendimentos acima foram efetivamente prestados em consonância com as normas éticas do Conselho Federal de Psicologia (CFP).
            </p>
          </div>

          {/* Assinatura */}
          <div className="pt-10 flex flex-col items-center justify-center font-sans space-y-1">
            <p className="text-xs text-slate-500 mb-6">
              {currentPsychologist.crp_state === 'RJ' ? 'Rio de Janeiro' : currentPsychologist.crp_state === 'MG' ? 'Belo Horizonte' : 'São Paulo'},{' '}
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
            <div className="w-64 h-px bg-slate-900 mb-2" />
            <p className="font-bold text-sm text-slate-900">
              {currentPsychologist.profile?.full_name || 'Psicólogo(a) Responsável'}
            </p>
            <p className="text-xs text-slate-600">
              CRP {currentPsychologist.crp_number || '00/000000'}/{currentPsychologist.crp_state || 'UF'}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 print:hidden">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="bg-teal-700 hover:bg-teal-800"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
