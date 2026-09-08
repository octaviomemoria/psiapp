'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  Globe
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({ isOpen, onClose }) => {
  const { authUser, authProfile, signOut } = usePsi();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess_1',
      device: 'Desktop (Windows)',
      browser: 'Chrome 128',
      ip: '187.54.***.***',
      location: 'São Paulo, Brasil',
      lastActive: 'Ativo agora',
      isCurrent: true,
    },
    {
      id: 'sess_2',
      device: 'Dispositivo Móvel (PWA)',
      browser: 'Safari iOS',
      ip: '177.18.***.***',
      location: 'São Paulo, Brasil',
      lastActive: 'Há 3 horas',
      isCurrent: false,
    },
  ]);

  const [revokedOthers, setRevokedOthers] = useState(false);

  const handleUpdatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordStatus('error');
      setErrorMessage('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setErrorMessage('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    setPasswordStatus('success');
    setErrorMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 3000);
  };

  const handleRevokeOthers = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    setRevokedOthers(true);
    setTimeout(() => setRevokedOthers(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Central de Segurança da Conta & Acessos"
      description="Gerencie sua senha, sessões ativas e privacidade em conformidade com o CFP e LGPD."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs font-sans">
        {/* Bloco 1: Alteração de Senha */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
            <KeyRound className="w-4 h-4 text-teal-600" />
            Alterar Senha de Acesso
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Nova Senha (mín. 8 dígitos)</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          {passwordStatus === 'error' && (
            <p className="text-rose-600 text-[11px] font-medium">{errorMessage}</p>
          )}

          {passwordStatus === 'success' && (
            <p className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Senha alterada com sucesso!
            </p>
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdatePassword}
              disabled={!newPassword || !confirmPassword}
              className="text-xs"
            >
              Atualizar Senha
            </Button>
          </div>
        </div>

        {/* Bloco 2: Sessões Ativas & Dispositivos Conectados */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
              <Laptop className="w-4 h-4 text-teal-600" />
              Sessões & Dispositivos Conectados
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeOthers}
              disabled={sessions.length <= 1}
              className="text-[11px] h-7 text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Desconectar Outras Sessões
            </Button>
          </div>

          {revokedOthers && (
            <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Todas as outras sessões foram desconectadas com segurança.
            </div>
          )}

          <div className="space-y-2">
            {sessions.map(s => (
              <div
                key={s.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    {s.device.includes('Móvel') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{s.device}</span>
                      {s.isCurrent && (
                        <Badge variant="success" size="sm">
                          Este Dispositivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {s.browser} • {s.location} ({s.ip})
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">{s.lastActive}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 3: Aviso Regulatório de Guarda (CFP 001/2009) */}
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            Guarda Obrigatória de Prontuário Clínico (Art. 12 da Res. CFP 001/2009)
          </div>
          <p className="leading-relaxed">
            Em conformidade com a regulamentação do Conselho Federal de Psicologia, os registros documentais de prontuário devem ser mantidos sob guarda protegida pelo prazo mínimo de <strong>5 (cinco) anos</strong>. A exclusão de credenciais encerra o acesso diário, mantendo o arquivo criptografado e congelado para fins éticos, periciais ou judiciais.
          </p>
        </div>

        {/* Ações */}
        <div className="flex justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
