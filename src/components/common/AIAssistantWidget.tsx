'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { AIService, AIProvider, AIConfig } from '@/lib/ai/ai-service';
import {
  Sparkles,
  Bot,
  Brain,
  CheckCircle,
  ShieldCheck,
  Send,
  RefreshCw,
  Settings,
  Zap,
  KeyRound,
  FileText,
  Copy,
  Check,
  Lock
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const AIAssistantWidget: React.FC = () => {
  const { currentRole, currentPatient, currentPsychologist, exerciseTemplates, diaryEntries } = usePsi();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assistant' | 'settings'>('assistant');
  const [inputNotes, setInputNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [providerBadge, setProviderBadge] = useState<string>('Motor Local');
  const [copied, setCopied] = useState(false);

  // Settings states
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('local_heuristic');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const config = AIService.getConfig();
    setSelectedProvider(config.provider);
    setGeminiKey(config.geminiApiKey || '');
    setOpenaiKey(config.openaiApiKey || '');
  }, [isOpen]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AIService.saveConfig({
      provider: selectedProvider,
      geminiApiKey: geminiKey.trim() || undefined,
      openaiApiKey: openaiKey.trim() || undefined
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('assistant');
    }, 800);
  };

  const handleGenerateSOAP = async () => {
    setIsGenerating(true);
    setAiOutput(null);
    try {
      const notes = inputNotes.trim() || 'Paciente com queixa de ansiedade antecipatória, insônia e autoexigência no trabalho. Aplicado questionamento socrático sobre pensamentos catastróficos.';
      const res = await AIService.generateSOAPDraft(notes, currentPatient?.full_name || 'Paciente', currentPsychologist?.approach || 'TCC');
      setProviderBadge(res.providerUsed);
      setAiOutput(
        `📋 EVOLUÇÃO CLÍNICA ESTRUTURADA (SOAP):\n\n` +
        `[S] SUBJETIVO:\n${res.subjective}\n\n` +
        `[O] OBJETIVO:\n${res.objective}\n\n` +
        `[A] AVALIAÇÃO:\n${res.assessment}\n\n` +
        `[P] PLANO TERAPÊUTICO:\n${res.plan}`
      );
    } catch (e: any) {
      setAiOutput('Ocorreu um erro ao processar a solicitação com a IA. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLongitudinal = async () => {
    setIsGenerating(true);
    setAiOutput(null);
    try {
      const res = await AIService.generateLongitudinalSummary(
        currentPatient?.full_name || 'Paciente',
        diaryEntries.length || 0,
        3.8,
        ['Sintomas relatados', 'Evolução clínica']
      );
      setProviderBadge('Síntese Longitudinal');
      setAiOutput(
        `📊 BRIEFING LONGITUDINAL DOS ÚLTIMOS 30 DIAS:\n\n` +
        `${res.summary}\n\n` +
        `🔍 PRINCIPAIS INSIGHTS:\n` +
        res.insights.map(i => `• ${i}`).join('\n') +
        `\n\n🎯 SUGESTÕES PARA A PRÓXIMA SESSÃO:\n` +
        res.recommendedActions.map(a => `• ${a}`).join('\n')
      );
    } catch (e) {
      setAiOutput('Erro ao gerar resumo longitudinal.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Botão Flutuante do Assistente */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (!aiOutput) handleGenerateSOAP();
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-teal-700 via-indigo-700 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs font-semibold border border-white/20"
          title="Assistente de IA Ética (Gemini / OpenAI / Local)"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Copilot IA</span>
        </button>
      </div>

      {/* Modal Principal do Assistente */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          activeTab === 'assistant'
            ? 'Copilot IA Clínico (Supervisionado)'
            : 'Configuração dos Motores de IA'
        }
        description="Auxílio inteligente com suporte a Google Gemini, OpenAI e Motor Heurístico Local."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Navegação entre Assistente e Configurações de API */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'assistant'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Assistente de Consulta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Motores (Gemini / OpenAI)</span>
              </button>
            </div>

            <Badge variant="purple" size="sm">
              {providerBadge}
            </Badge>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: ASSISTENTE CLÍNICO */}
          {/* ========================================================================= */}
          {activeTab === 'assistant' && (
            <div className="space-y-3.5 text-xs">
              {/* Aviso Ético de Humano no Loop */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2 text-indigo-950">
                <ShieldCheck className="w-4 h-4 text-indigo-700 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed text-[11px]">
                  <strong className="font-bold">Supervisão Humana Obrigatória:</strong> A IA fornece rascunhos e sugestões para economizar tempo burocrático. O psicólogo é o único responsável técnico pela validação e assinatura dos documentos.
                </p>
              </div>

              {/* Botões Rápidos de Ação */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSOAP}
                  disabled={isGenerating}
                  className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Rascunhar Evolução SOAP
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLongitudinal}
                  disabled={isGenerating}
                  className="text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
                >
                  <Brain className="w-3.5 h-3.5 mr-1" />
                  Briefing 30 Dias do Paciente
                </Button>
              </div>

              {/* Entrada opcional de anotações brutas */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Anotações da Sessão ou Fala do Paciente (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={inputNotes}
                  onChange={e => setInputNotes(e.target.value)}
                  placeholder="Ex: Paciente relatou conflito no trabalho com o gestor, sentiu taquicardia e pensou que seria demitida. Discutimos evidências e treinamos respiração..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Saída da IA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Resultado Gerado pelo Copilot:</span>
                  {aiOutput && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiado!' : 'Copiar Texto'}
                    </button>
                  )}
                </div>

                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] min-h-[140px] whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-32 gap-2 text-indigo-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando síntese clínica estruturada...</span>
                    </div>
                  ) : (
                    aiOutput || 'Clique em uma das opções acima para gerar uma análise.'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: CONFIGURAÇÃO DE MOTORES (GEMINI / OPENAI) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  Escolha o Motor de Inteligência Artificial Ativo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('local_heuristic')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedProvider === 'local_heuristic'
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs">Motor Local</span>
                    <span className="text-[10px] text-slate-400 font-normal">Sem chave / Grátis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProvider('gemini')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedProvider === 'gemini'
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs">Google Gemini</span>
                    <span className="text-[10px] text-slate-400 font-normal">Gemini 1.5 Flash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProvider('openai')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedProvider === 'openai'
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs">OpenAI</span>
                    <span className="text-[10px] text-slate-400 font-normal">GPT-4o / Mini</span>
                  </button>
                </div>
              </div>

              {selectedProvider === 'gemini' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chave de API do Google Gemini (Google AI Studio):
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Gere gratuitamente no Google AI Studio (aiazas...).
                  </p>
                </div>
              )}

              {selectedProvider === 'openai' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chave de API da OpenAI:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={e => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Chave obtida na plataforma platform.openai.com.
                  </p>
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Configurações do provedor de IA salvas com sucesso!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('assistant')}>
                  Voltar
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                  Salvar Preferência
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};
