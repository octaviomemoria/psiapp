'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  QrCode,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface ManagerSplitBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerSplitBillingModal: React.FC<ManagerSplitBillingModalProps> = ({ isOpen, onClose }) => {
  const { clinic, clinicPsychologists, addNotification } = usePsi();

  const [sessionPrice, setSessionPrice] = useState(250);
  const [selectedPsicoId, setSelectedPsicoId] = useState(clinicPsychologists[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedPsico = clinicPsychologists.find(p => p.id === selectedPsicoId) || clinicPsychologists[0];
  const commissionRate = selectedPsico?.commission_rate || 70;

  const therapistShare = (sessionPrice * commissionRate) / 100;
  const clinicShare = (sessionPrice * (100 - commissionRate)) / 100;

  const pixPayload = `00020126580014br.gov.bcb.pix0136psiapp-split-${clinic.id}-${Date.now()}520400005303986540${sessionPrice.toFixed(2)}5802BR5925CLINICA MENTE SAUDAVEL6009SAO PAULO62070503***6304ABCD`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Motor de Cobrança com Split Automático"
      description="Divisão automática de honorários entre a conta da clínica e a conta do psicólogo parceiro (Asaas / Pix)."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Banner de Benefício Fiscal & Operacional */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Proteção contra Bitributação (DMED / Carnê-Leão):</strong> Com o split automatizado, cada parte recebe sua fatia líquida diretamente na sua respectiva conta bancária, com emissão segregada de notas fiscais.
          </p>
        </div>

        {/* Seleção do Psicólogo e Valor da Consulta */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Psicólogo do Atendimento:</label>
            <select
              value={selectedPsicoId}
              onChange={e => setSelectedPsicoId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {clinicPsychologists.map(psico => (
                <option key={psico.id} value={psico.id}>
                  {psico.full_name} ({psico.commission_rate}% repasse)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Valor da Sessão (R$):</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={sessionPrice}
                onChange={e => setSessionPrice(Number(e.target.value))}
                min="50"
                step="10"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Visualização da Regra de Split em Tempo Real */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <span className="font-bold text-slate-800 block">Distribuição do Split (Liquidado no Pix):</span>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                <Users className="w-3.5 h-3.5" />
                <span>Psicólogo ({commissionRate}%):</span>
              </div>
              <p className="text-base font-extrabold text-indigo-900 mt-1">
                R$ {therapistShare.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Direto na conta do terapeuta</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <Building2 className="w-3.5 h-3.5" />
                <span>Clínica ({100 - commissionRate}%):</span>
              </div>
              <p className="text-base font-extrabold text-emerald-900 mt-1">
                R$ {clinicShare.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Retenção de infraestrutura</span>
            </div>
          </div>
        </div>

        {/* QR Code Pix e Chave Copia e Cola */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
            <QrCode className="w-14 h-14 text-slate-800" />
          </div>

          <div className="flex-1 space-y-2 w-full">
            <span className="font-bold text-slate-800 block">Pix Copia e Cola com Split Integrado:</span>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600 truncate">
              {pixPayload}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPix}
              className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 w-full sm:w-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix Copia e Cola'}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              addNotification({
                recipient_role: 'manager',
                title: 'Cobrança com Split Emitida',
                message: `Cobrança Pix de R$ ${sessionPrice.toFixed(2)} emitida com repasse de ${commissionRate}% para ${selectedPsico?.full_name || 'Psicólogo'}.`,
                type: 'session_scheduled',
                read: false
              });
              setIsSuccess(true);
              setTimeout(() => {
                setIsSuccess(false);
                onClose();
              }, 1000);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold flex items-center gap-1"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Emitido com Sucesso!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Emitir Cobrança com Split</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
