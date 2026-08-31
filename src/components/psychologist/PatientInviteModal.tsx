'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  UserPlus,
  Send,
  Copy,
  CheckCircle2,
  Share2,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';

interface PatientInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientInviteModal: React.FC<PatientInviteModalProps> = ({ isOpen, onClose }) => {
  const { currentPsychologist, patientInvites, createPatientInvite } = usePsi();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    const newInvite = createPatientInvite(fullName, email, phone);
    const inviteUrl = `${window.location.origin}?invite=${newInvite.token}`;
    setGeneratedInviteUrl(inviteUrl);
  };

  const handleCopyLink = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!generatedInviteUrl || !phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá, ${fullName}! Aqui é ${currentPsychologist.profile?.display_name || 'sua psicóloga'}.\n\nEstou te enviando o link seguro de acesso ao nosso aplicativo de acompanhamento psicológico (PsiApp). Por lá você poderá acessar suas ferramentas, diário e registros de sessões com sigilo total:\n\n${generatedInviteUrl}\n\nSeja muito bem-vindo(a)!`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${message}`, '_blank');
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setGeneratedInviteUrl(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Convidar Novo Paciente
            </h3>
            <p className="text-xs text-slate-500">
              Gere um link seguro e criptografado para o paciente ativar seu prontuário no PsiApp.
            </p>
          </div>
        </div>

        {!generatedInviteUrl ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo do Paciente
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  E-mail do Paciente
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp (com DDD)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>O convite vincula o paciente automaticamente à sua carteira com regras de sigilo médico/psicológico e validade de 7 dias.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={onClose} size="sm">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Gerar Convite Seguro
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Convite Criado com Sucesso!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Compartilhe o link com <strong>{fullName}</strong> para que ele(a) ative a conta.
              </p>
            </div>

            {/* Input com Link e Cópia */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={generatedInviteUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 outline-none px-2 select-all"
              />
              <Button size="sm" variant="outline" onClick={handleCopyLink} className="text-xs shrink-0">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleSendWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-4 h-4" /> Enviar pelo WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                Convidar Outro Paciente
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Convites Recentes */}
        {patientInvites.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Convites Gerados Recentemente
            </h5>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {patientInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{inv.patient_name}</span>
                    <span className="text-slate-400 ml-2">{inv.patient_phone}</span>
                  </div>
                  <Badge variant={inv.status === 'accepted' ? 'success' : 'warning'}>
                    {inv.status === 'accepted' ? 'Aceito / Ativo' : 'Aguardando Ativação'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
