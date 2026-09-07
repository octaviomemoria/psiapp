'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  PenTool,
  RotateCcw,
  Lock,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { usePsi } from '@/lib/store/psi-context';
import { SupabaseService } from '@/lib/supabase/service';

interface TherapeuticContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  psychologistName?: string;
}

export const TherapeuticContractModal: React.FC<TherapeuticContractModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Paciente',
  psychologistName = 'Psicólogo(a) Responsável'
}) => {
  const { authUser, isLiveProduction, addNotification } = usePsi();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedDate, setSignedDate] = useState<string | null>(null);
  const [signedHash, setSignedHash] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f766e';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const sessionPrice = 200;

  const handleSignContract = async () => {
    if (!hasSignature) return;

    const now = new Date().toISOString();
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL('image/png') : '';
    const payloadToHash = `${patientName}|${psychologistName}|${sessionPrice}|${now}|${signatureData.slice(0, 100)}`;
    
    try {
      const msgUint8 = new TextEncoder().encode(payloadToHash);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const realSha256 = 'SHA256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      setSignedDate(now);
      setSignedHash(realSha256);
      setSuccess(true);

      // Persistir contrato e consentimento no Supabase
      if (isLiveProduction && authUser?.id) {
        SupabaseService.saveTherapeuticConsent({
          userId: authUser.id,
          termsVersion: 'CFP-LGPD-2026.1',
          details: {
            patientName,
            psychologistName,
            sessionPrice,
            hash: realSha256,
            signedAt: now
          }
        });
      }

      // Fallback de persistência offline
      if (typeof window !== 'undefined') {
        localStorage.setItem(`psiapp_contract_${patientName.replace(/\s+/g, '_')}`, JSON.stringify({
          signedDate: now,
          hash: realSha256,
          psychologist: psychologistName,
          patient: patientName,
          price: sessionPrice
        }));
      }

      addNotification({
        recipient_role: 'psychologist',
        title: 'Contrato Terapêutico Assinado',
        message: `O termo de consentimento e contrato com ${patientName} foi autenticado com sucesso via hash criptográfico.`,
        type: 'feedback_received',
        read: false
      });

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao computar SHA-256:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contrato Terapêutico & Termo de Consentimento"
      description="Instrumento jurídico e ético de prestação de serviços psicológicos (Resolução CFP nº 010/2005 e LGPD)."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Texto do Contrato com Rolagem */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-h-64 overflow-y-auto space-y-3 text-slate-700 leading-relaxed font-sans">
          <div className="text-center pb-2 border-b border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">
              TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO & CONTRATO TERAPÊUTICO
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Profissional: {psychologistName} • Paciente: {patientName}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">1. DO SIGILO PROFISSIONAL E PRIVACIDADE</h5>
            <p className="text-[11px]">
              O atendimento psicoterapêutico é protegido pelo mais estrito sigilo profissional, conforme estabelece o Artigo 9º do Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005). As anotações de evolução clínica, diários e registros íntimos são de acesso exclusivo entre o psicólogo e o paciente.
            </p>

            <h5 className="font-bold text-slate-900">2. DO CANCELAMENTO, REMARCAÇÕES E FALTAS</h5>
            <p className="text-[11px]">
              Sessões agendadas que necessitem de reagendamento ou cancelamento devem ser comunicadas com antecedência mínima de <strong>24 (vinte e quatro) horas</strong>. Faltas sem aviso prévio dentro do prazo acordado serão cobradas integralmente.
            </p>

            <h5 className="font-bold text-slate-900">3. DA TELEPSICOLOGIA & PROTEÇÃO DE DADOS (LGPD)</h5>
            <p className="text-[11px]">
              Para atendimentos online, são utilizadas conexões criptografadas de ponta a ponta. O paciente concorda com o tratamento de dados de saúde exclusivamente para fins de evolução clínica e acompanhamento terapêutico, em conformidade com a Lei Federal 13.709/2018 (LGPD).
            </p>

            <h5 className="font-bold text-slate-900">4. HONORÁRIOS E PAGAMENTOS</h5>
            <p className="text-[11px]">
              Os honorários acordados por consulta serão quitados via Pix, Cartão ou Boleto Bancário antes ou logo após a realização de cada sessão, sendo emitido o respectivo recibo para fins de dedução no Imposto de Renda (IRPF).
            </p>
          </div>
        </div>

        {/* Área de Assinatura Eletrônica */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-indigo-600" />
              Assinatura Eletrônica do Paciente (Desenhe abaixo):
            </span>
            <button
              type="button"
              onClick={handleClearSignature}
              className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-1 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={540}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[120px] cursor-crosshair touch-none bg-white rounded-lg"
            />
          </div>

          {signedHash && (
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] font-mono text-emerald-800 space-y-0.5">
              <span className="font-bold block">Assinatura Digital Registrada:</span>
              <p>Carimbo de Tempo: {signedDate}</p>
              <p>Hash de Autenticidade: {signedHash}</p>
            </div>
          )}
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Contrato terapêutico assinado e registrado com sucesso!</span>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs text-slate-600"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Imprimir Termo
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSignContract}
            disabled={!hasSignature}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Assinar e Confirmar Consentimento
          </Button>
        </div>
      </div>
    </Modal>
  );
};
