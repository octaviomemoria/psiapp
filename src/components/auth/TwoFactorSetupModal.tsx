'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  Key,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  generateTwoFactorSecret,
  generateOtpAuthUri,
  generateQrCodeUrl,
  generateBackupCodes,
  verifyTotpToken
} from '@/lib/auth/two-factor';
import { usePsi } from '@/lib/store/psi-context';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'psicologo@clinica.com.br'
}) => {
  const { addNotification } = usePsi();

  const [step, setStep] = useState<'scan' | 'verify' | 'backup' | 'completed'>('scan');
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const newSecret = generateTwoFactorSecret();
      const otpUri = generateOtpAuthUri(userEmail, newSecret);
      const url = generateQrCodeUrl(otpUri);
      const codes = generateBackupCodes(8);

      setSecret(newSecret);
      setQrUrl(url);
      setBackupCodes(codes);
      setStep('scan');
      setVerificationCode('');
      setError('');
    }
  }, [isOpen, userEmail]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleVerifyCode = () => {
    if (!verifyTotpToken(verificationCode, secret)) {
      setError('Código inválido ou expirado. Tente novamente ou use 123456 em modo teste.');
      return;
    }

    setError('');
    setStep('backup');
  };

  const handleFinish = () => {
    setStep('completed');
    addNotification({
      recipient_role: 'psychologist',
      title: 'Autenticação em Dois Fatores (2FA) Ativada',
      message: 'Sua conta agora conta com proteção criptográfica TOTP em conformidade com o CFP.',
      type: 'feedback_received',
      read: false
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuração de Autenticação em Dois Fatores (2FA)"
      description="Proteção obrigatória para segurança de dados de prontuário e conformidade LGPD."
      maxWidth="md"
    >
      <div className="space-y-5">
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed">
              <Smartphone className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Passo 1: Escanear o QR Code</p>
                <p className="mt-0.5 text-teal-800">
                  Abra o Google Authenticator, Microsoft Authenticator ou 1Password no seu celular e escaneie o código abaixo.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="QR Code 2FA"
                  className="w-48 h-48 rounded-lg border border-slate-100"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-700">Carregando...</div>
              )}

              <div className="mt-3 text-center">
                <p className="text-[11px] text-slate-700">Se não conseguir escanear, digite a chave manualmente:</p>
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-800">
                  <span>{secret}</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="text-slate-700 hover:text-slate-900"
                    title="Copiar Chave"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep('verify')}>
                Avançar para Verificação
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Passo 2: Digite o Código de 6 Dígitos</p>
                <p className="mt-0.5">
                  Digite o token temporário de 6 dígitos gerado pelo seu aplicativo autenticador.
                </p>
              </div>
            </div>

            <div className="text-center py-2">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-48 text-center font-mono text-3xl tracking-widest px-4 py-2 border-2 border-teal-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-teal-50/20 text-slate-900 font-bold"
                autoFocus
              />
              {error && (
                <p className="text-xs text-rose-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('scan')}>
                Voltar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
              >
                Confirmar Código
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <Key className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Passo 3: Guarde seus Códigos de Recuperação</p>
                <p className="mt-0.5 text-amber-800">
                  Se perder seu celular, esses códigos permitirão recuperar o acesso aos prontuários. Cada código só funciona uma única vez.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 text-white">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs text-teal-300">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700 text-center">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBackup ? 'Códigos Copiados' : 'Copiar Todos os Códigos'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={handleFinish}>
                Concluir Ativação do 2FA
              </Button>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">2FA Ativado com Sucesso!</h3>
              <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
                Sua conta agora possui o mais alto padrão de segurança para proteção de prontuários eletrônicos em saúde.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
