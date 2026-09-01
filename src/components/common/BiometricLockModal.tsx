'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Delete
} from 'lucide-react';

interface BiometricLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIN_STORAGE_KEY = 'psiapp_user_pin';

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfiguringNewPin, setIsConfiguringNewPin] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PIN_STORAGE_KEY);
      setHasExistingPin(Boolean(saved));
      if (!saved) {
        setIsConfiguringNewPin(true);
      }
    }
  }, [isOpen]);

  const handleDigitClick = (digit: string) => {
    setErrorMsg(null);
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      // Validação automática ao atingir 4 dígitos
      if (newPin.length === 4) {
        if (isConfiguringNewPin) {
          // Novo PIN configurado
          if (!confirmPin) {
            setConfirmPin(newPin);
            setPin('');
          } else if (confirmPin === newPin) {
            localStorage.setItem(PIN_STORAGE_KEY, newPin);
            setSuccessMsg('PIN de 4 dígitos ativado com sucesso!');
            setHasExistingPin(true);
            setIsConfiguringNewPin(false);
            setTimeout(() => {
              setSuccessMsg(null);
              setPin('');
              setConfirmPin('');
              onClose();
            }, 1000);
          } else {
            setErrorMsg('Os dígitos não coincidem. Tente novamente.');
            setPin('');
            setConfirmPin('');
          }
        } else {
          // Desbloqueio com PIN existente
          const saved = localStorage.getItem(PIN_STORAGE_KEY);
          if (saved === newPin) {
            setSuccessMsg('Desbloqueado com sucesso!');
            setTimeout(() => {
              setSuccessMsg(null);
              setPin('');
              onClose();
            }, 800);
          } else {
            setErrorMsg('PIN incorreto. Tente novamente.');
            setPin('');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg(null);
  };

  const handleRemovePin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setHasExistingPin(false);
    setIsConfiguringNewPin(true);
    setPin('');
    setConfirmPin('');
    setSuccessMsg('Proteção por PIN desativada.');
    setTimeout(() => setSuccessMsg(null), 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isConfiguringNewPin
          ? confirmPin
            ? 'Confirme seu PIN de 4 Dígitos'
            : 'Criar PIN de Bloqueio Seguro'
          : 'Bloqueio de Privacidade do PsiApp'
      }
      description="Proteja seus diários íntimos e prontuários contra acessos não autorizados no dispositivo."
      maxWidth="sm"
    >
      <div className="space-y-5 text-center">
        {/* Ícone de Cadeado */}
        <div className="w-14 h-14 rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-sm">
          <Fingerprint className="w-7 h-7" />
        </div>

        {/* Indicadores dos 4 Dígitos */}
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > i
                  ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-xs'
                  : 'bg-white border-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successMsg}
          </p>
        )}

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigitClick(d)}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 font-bold text-lg transition-all active:scale-95 flex items-center justify-center"
            >
              {d}
            </button>
          ))}

          <div className="w-16 h-14" />

          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 font-bold text-lg transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-all active:scale-95 flex items-center justify-center"
            title="Apagar"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Ações de Gestão do PIN */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {hasExistingPin && !isConfiguringNewPin ? (
            <button
              type="button"
              onClick={() => {
                setIsConfiguringNewPin(true);
                setPin('');
                setConfirmPin('');
              }}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Alterar PIN
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Proteção biométrica ativa</span>
          )}

          {hasExistingPin && (
            <button
              type="button"
              onClick={handleRemovePin}
              className="text-rose-600 hover:underline font-semibold"
            >
              Desativar PIN
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
