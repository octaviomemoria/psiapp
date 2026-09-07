'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  Download,
  Check,
  AlertCircle
} from 'lucide-react';
import { PaymentService, PixChargeResponse, PaymentReceipt } from '@/lib/billing/payment-service';
import { usePsi } from '@/lib/store/psi-context';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  patientId: string;
  amount: number;
  sessionDate?: string;
  onPaymentSuccess?: (receipt: PaymentReceipt) => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  patientId,
  amount,
  sessionDate,
  onPaymentSuccess
}) => {
  const { currentPsychologist, updateAppointmentPayment, addNotification } = usePsi();
  const [charge, setCharge] = useState<PixChargeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min

  useEffect(() => {
    if (isOpen && amount > 0) {
      const newCharge = PaymentService.generatePixCharge({
        appointmentId,
        patientId,
        patientName,
        psychologistId: currentPsychologist?.id || 'psico-1',
        psychologistName: currentPsychologist?.profile?.display_name || currentPsychologist?.profile?.full_name || 'Psicóloga Responsável',
        amount,
        description: `Consulta Psicológica - ${patientName}`
      });
      setCharge(newCharge);
      setIsPaid(false);
      setReceipt(null);
      setTimeLeft(1800);
    }
  }, [isOpen, appointmentId, patientId, patientName, amount, currentPsychologist]);

  useEffect(() => {
    if (!isOpen || isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid, timeLeft]);

  const handleCopyCode = () => {
    if (!charge) return;
    navigator.clipboard.writeText(charge.copiaECola);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateInstantConfirmation = () => {
    if (!charge) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      const newReceipt = PaymentService.generateReceipt(
        appointmentId,
        patientName,
        currentPsychologist?.profile?.display_name || currentPsychologist?.profile?.full_name || 'Psicólogo(a)',
        `${currentPsychologist?.crp_number || '06/123456'} - ${currentPsychologist?.crp_state || 'SP'}`,
        amount
      );

      setReceipt(newReceipt);

      // Atualiza no PsiContext
      updateAppointmentPayment(appointmentId, 'paid_pix', amount, newReceipt.receiptNumber);

      addNotification({
        recipient_role: 'psychologist',
        title: 'Pagamento Pix Confirmado',
        message: `Recebimento de R$ ${amount.toFixed(2)} confirmado para ${patientName}. Recibo nº ${newReceipt.receiptNumber} emitido.`,
        type: 'session_scheduled',
        read: false,
        target_tab: 'financeiro'
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(newReceipt);
      }
    }, 1200);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagamento da Sessão via Pix Dinâmico" size="md">
      {!isPaid ? (
        <div className="space-y-5">
          {/* Cabeçalho do Valor */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-700 uppercase tracking-wider font-semibold">Valor da Consulta</p>
            <div className="text-3xl font-extrabold text-teal-700 mt-1">
              R$ {amount.toFixed(2)}
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Paciente: <span className="font-semibold text-slate-800">{patientName}</span>
              {sessionDate && ` • Sessão: ${new Date(sessionDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {charge ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={charge.qrCodeUrl}
                  alt="QR Code Pix"
                  className="w-52 h-52 object-contain rounded-lg border border-slate-100"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 p-1.5 rounded-full shadow-md border border-teal-200">
                    <QrCode className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-700">
                Gerando QR Code...
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Expira em: <strong className="text-slate-800">{formatMinutes(timeLeft)}</strong></span>
            </div>
          </div>

          {/* Chave Pix Copia e Cola */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Código Pix Copia e Cola
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={charge?.copiaECola || ''}
                className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 truncate select-all focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={handleCopyCode}
                className="shrink-0 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Selo de Segurança e Ação de Homologação */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conciliação instantânea via Banco Central do Brasil</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={handleSimulateInstantConfirmation}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Simular Baixa Automática (Webhook)
            </Button>
          </div>
        </div>
      ) : (
        /* Recibo Emitido com Sucesso */
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Pagamento Confirmado!</h3>
            <p className="text-xs text-slate-700 mt-0.5">O valor já foi liquidado e o recibo CFP foi emitido.</p>
          </div>

          {receipt && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Recibo Nº:</span>
                <span className="font-mono font-bold text-teal-700">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Profissional:</span>
                <span className="font-medium text-slate-800">{receipt.psychologistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">CRP:</span>
                <span className="font-medium text-slate-800">{receipt.psychologistCrp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Paciente:</span>
                <span className="font-medium text-slate-800">{receipt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Data e Hora:</span>
                <span className="font-medium text-slate-800">{new Date(receipt.issuedAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Total Pago:</span>
                <span className="font-extrabold text-emerald-600">R$ {receipt.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Receipt className="w-4 h-4 mr-1.5" />
              Imprimir Recibo
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Concluir
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
