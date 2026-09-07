'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { SupabaseService } from '@/lib/supabase/service';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Lock,
  Mail,
  User,
  Brain,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register_psychologist' | 'register_patient' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { switchRole, initializeNewPsychologistAccount, loadLiveDataFromSupabase } = usePsi();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [crpNumber, setCrpNumber] = useState('');
  const [crpState, setCrpState] = useState('SP');
  const [approach, setApproach] = useState('TCC (Terapia Cognitivo-Comportamental)');
  const [inviteCode, setInviteCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setCrpNumber('');
    setCrpState('SP');
    setInviteCode('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Serviço de autenticação Supabase não está configurado. Verifique as variáveis de ambiente.');
      }

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          await loadLiveDataFromSupabase();
        }
        setSuccessMsg('Login realizado com sucesso! Carregando seu consultório...');
        setTimeout(() => {
          onClose();
        }, 800);
      } else if (mode === 'register_psychologist') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'psychologist',
              crp_number: crpNumber.trim(),
              crp_state: crpState.trim(),
              approach,
            }
          }
        });
        if (error) throw error;

        initializeNewPsychologistAccount({
          fullName: fullName.trim() || 'Psicólogo(a)',
          email: email.trim(),
          crp: crpNumber.trim() || '06/000000',
          crpState,
          approach
        });

        if (data.user) {
          await SupabaseService.ensureProfileAndPsychologist(data.user, {
            full_name: fullName.trim(),
            role: 'psychologist',
            crp_number: crpNumber.trim(),
            crp_state: crpState.trim(),
            approach
          });
        }

        setSuccessMsg(`Bem-vindo(a), ${fullName}! Seu consultório foi criado com sucesso.`);
        setTimeout(() => {
          onClose();
        }, 900);
      } else if (mode === 'register_patient') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'patient',
              invite_code: inviteCode.trim(),
            }
          }
        });
        if (error) throw error;
        switchRole('patient');
        setSuccessMsg('Cadastro de paciente realizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 900);
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao processar sua autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? 'Acessar o PsiApp'
          : mode === 'register_psychologist'
          ? 'Cadastro de Psicólogo(a)'
          : mode === 'register_patient'
          ? 'Ativação de Conta do Paciente'
          : 'Recuperação de Senha'
      }
      description={
        isSupabaseConfigured
          ? 'Autenticação segura e criptografada via Supabase Auth.'
          : 'Configuração do Supabase necessária para autenticação.'
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status de Conexão com Supabase */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-medium text-slate-700">
              {isSupabaseConfigured ? 'Supabase Conectado (Produção)' : 'Supabase Desconectado'}
            </span>
          </div>
          <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} size="sm">
            {isSupabaseConfigured ? 'Nuvem Ativa' : 'Desconectado'}
          </Badge>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {mode !== 'forgot_password' && (
            <>
              {(mode === 'register_psychologist' || mode === 'register_patient') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ex: Seu Nome Completo"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'register_psychologist' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número do CRP</label>
                    <input
                      type="text"
                      value={crpNumber}
                      onChange={e => setCrpNumber(e.target.value)}
                      placeholder="Ex: 06/123456"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">UF (Estado)</label>
                    <input
                      type="text"
                      value={crpState}
                      onChange={e => setCrpState(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase text-center focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Abordagem Teórica</label>
                    <select
                      value={approach}
                      onChange={e => setApproach(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="TCC (Terapia Cognitivo-Comportamental)">TCC (Terapia Cognitivo-Comportamental)</option>
                      <option value="Terapia de Aceitação e Compromisso (ACT)">Terapia de Aceitação e Compromisso (ACT)</option>
                      <option value="Psicanálise">Psicanálise</option>
                      <option value="Terapia Comportamental Dialética (DBT)">Terapia Comportamental Dialética (DBT)</option>
                      <option value="Terapia Humanista / Centrada na Pessoa">Terapia Humanista / Centrada na Pessoa</option>
                      <option value="Fenomenologia Existencial">Fenomenologia Existencial</option>
                      <option value="Gestalt-Terapia">Gestalt-Terapia</option>
                      <option value="Neuropsicologia & Terapia Breve">Neuropsicologia & Terapia Breve</option>
                    </select>
                  </div>
                </div>
              )}

              {mode === 'register_patient' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Convite do Terapeuta</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Ex: PSI-ANA-2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-[11px] text-teal-700 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full font-bold shadow-sm mt-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-1" />
            ) : mode === 'login' ? (
              'Entrar no Sistema'
            ) : mode === 'register_psychologist' ? (
              'Cadastrar Consultório'
            ) : mode === 'register_patient' ? (
              'Ativar Conta de Paciente'
            ) : (
              'Enviar Link de Recuperação'
            )}
          </Button>
        </form>

        {/* Alternador de Modos */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-1.5 text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              <p>
                É psicólogo(a) e quer criar sua conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register_psychologist')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
              <p>
                É paciente e recebeu um convite?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register_patient')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Ativar meu acesso
                </button>
              </p>
            </>
          ) : (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
