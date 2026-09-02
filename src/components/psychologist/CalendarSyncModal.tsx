'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePsi } from '@/lib/store/psi-context';
import {
  Calendar as CalendarIcon,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ isOpen, onClose }) => {
  const { currentPsychologist } = usePsi();
  const [activeTab, setActiveTab] = useState<'iphone' | 'google' | 'oauth'>('iphone');
  const [copied, setCopied] = useState(false);

  // Determinar URL base
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://psiappgestao.vercel.app';
  const feedHttpsUrl = `${origin}/api/calendar/feed?psychologistId=${currentPsychologist?.id || 'default'}`;
  const feedWebcalUrl = feedHttpsUrl.replace(/^https?:\/\//, 'webcal://');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedHttpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenIphoneSubscribe = () => {
    window.location.href = feedWebcalUrl;
  };

  const handleOpenGoogleSubscribe = () => {
    // Abrir Google Calendar web na tela de adicionar por URL
    const googleAddUrl = `https://calendar.google.com/calendar/r/settings/addbyurl`;
    window.open(googleAddUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sincronização de Agenda com Celular & Google" size="lg">
      <div className="space-y-6">
        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="p-2 bg-teal-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-teal-900 text-sm">Sincronização Automática em Tempo Real</h4>
            <p className="text-teal-700 leading-relaxed">
              Assine o feed da sua agenda uma única vez no seu iPhone ou Google Agenda. Sempre que você marcar ou alterar uma sessão no PsiApp, seu celular atualizará automaticamente com lembretes na tela bloqueada!
            </p>
          </div>
        </div>

        {/* Seletor de Abas */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('iphone')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'iphone'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-slate-700" />
            <span>iPhone / Apple Calendar</span>
            <Badge variant="success" size="sm" className="ml-1 text-[10px]">1 Toque</Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'google'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Google Agenda (Web & App)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'oauth'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Conexão Direta (OAuth API)</span>
          </button>
        </div>

        {/* Aba 1: iPhone & Apple */}
        {activeTab === 'iphone' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Assinatura no Calendário do iPhone / Mac / iPad</p>
                  <p className="text-[11px] text-slate-500">Abre o aplicativo nativo de Calendário do iOS para assinar com 1 toque.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenIphoneSubscribe}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-xs shrink-0"
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                  Abrir no iPhone
                </Button>
              </div>

              <div className="border-t border-slate-200/80 pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-slate-700">Link Seguro de Assinatura iCal:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={feedHttpsUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-600 truncate focus:outline-hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800">Como adicionar manualmente no iPhone:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                <li>No seu iPhone, abra <strong>Ajustes</strong> ➔ <strong>Calendário</strong> ➔ <strong>Contas</strong>;</li>
                <li>Toque em <strong>Adicionar Conta</strong> ➔ selecione <strong>Outra</strong>;</li>
                <li>Toque em <strong>Adicionar Calendário Assinado</strong>;</li>
                <li>Cole o link acima e toque em <strong>Seguinte</strong> ➔ <strong>Salvar</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Aba 2: Google Agenda */}
        {activeTab === 'google' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Adicionar Feed no Google Calendar</p>
                  <p className="text-[11px] text-slate-500">As sessões do PsiApp aparecem no Google Agenda do computador e do celular.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenGoogleSubscribe}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xs shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Abrir Configurações do Google
                </Button>
              </div>

              <div className="border-t border-slate-200/80 pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-slate-700">Link do Feed para colar no Google Calendar:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={feedHttpsUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-600 truncate focus:outline-hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800">Passo a passo no Google Agenda (Computador):</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                <li>Acesse o <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">calendar.google.com</a>;</li>
                <li>No menu esquerdo, role até <strong>"Outras agendas"</strong> e clique no ícone <strong>+</strong>;</li>
                <li>Selecione a opção <strong>"Do URL"</strong>;</li>
                <li>Cole o link copiado e clique em <strong>Adicionar agenda</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Aba 3: OAuth API */}
        {activeTab === 'oauth' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Conexão Direta com Google Cloud (OAuth 2.0)</p>
                  <p className="text-[11px] text-slate-500">Permite criar eventos diretamente na conta Google e bloquear horários de conflito.</p>
                </div>
                <Badge variant="outline" size="sm" className="bg-white text-slate-700">API Pronta</Badge>
              </div>

              <div className="pt-2">
                <a
                  href={`/api/calendar/google/auth?psychologistId=${currentPsychologist?.id || 'default'}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-100 transition-all active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Conectar Conta Google Oficial</span>
                </a>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Credenciais do Google Cloud (Ambiente de Produção):</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                As rotas de API OAuth (`/api/calendar/google/auth` e `/callback`) já estão implementadas. Para ativar o login com o Google, basta cadastrar as variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` geradas no Google Cloud Console.
              </p>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
