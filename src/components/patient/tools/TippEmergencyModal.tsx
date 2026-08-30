'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ThermometerSnowflake,
  Activity,
  Wind,
  Zap,
  HandMetal,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Clock
} from 'lucide-react';

interface TippEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TippEmergencyModal: React.FC<TippEmergencyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'temperature' | 'exercise' | 'breathing' | 'relaxation' | 'stop'>('temperature');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Protocolo de Crise & Regulação Emocional (TIPP & STOP)"
      description="Habilidades baseadas em evidências da DBT para reduzir rapidamente a sobrecarga física e mental."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navegação das 5 Técnicas de Choque Positivo */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('temperature')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'temperature' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
            <span>T - Temperatura</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exercise')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'exercise' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-600" />
            <span>I - Exercício</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('breathing')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'breathing' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-4 h-4 text-teal-600" />
            <span>P - Respiração</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relaxation')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'relaxation' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-600" />
            <span>P - Relaxamento</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stop')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all col-span-2 sm:col-span-1 ${
              activeTab === 'stop' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HandMetal className="w-4 h-4 text-rose-600" />
            <span>STOP (Freio)</span>
          </button>
        </div>

        {/* Conteúdo da Técnica Selecionada */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {activeTab === 'temperature' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <ThermometerSnowflake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">T — Temperatura da Água Fria (Reflexo de Mergulho)</h4>
                  <p className="text-xs text-slate-500">Ativa imediatamente o nervo vago e reduz a frequência cardíaca.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-cyan-50/40 p-4 rounded-xl border border-cyan-100">
                <p><strong>Como fazer agora:</strong></p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Vá até a pia e lave o rosto com <strong>água bem gelada</strong> ou segure uma compressa fria/bolsa de gelo sobre os olhos e bochechas.</li>
                  <li>Incline-se levemente para frente e prenda a respiração por <strong>15 a 30 segundos</strong> enquanto a água gelada toca seu rosto.</li>
                  <li>O reflexo de mergulho dos mamíferos força seu coração a desacelerar em segundos.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'exercise' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">I — Intense Exercise (Exercício Intenso Breve)</h4>
                  <p className="text-xs text-slate-500">Drena a adrenalina acumulada no corpo de forma rápida e segura.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                <p><strong>Como fazer agora (2 a 5 minutos):</strong></p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Faça 20 a 30 polichinelos rápidos, suba e desça um lance de escadas ou faça agachamentos no mesmo lugar.</li>
                  <li>O objetivo é fazer o corpo gastar a energia da resposta de "luta ou fuga" acumulada pela ansiedade/raiva.</li>
                  <li>Ao terminar, sente-se e sinta a sensação de alívio e cansaço físico relaxante.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'breathing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">P — Paced Breathing (Respiração Ritmada com Expiração Longa)</h4>
                  <p className="text-xs text-slate-500">A expiração mais longa que a inspiração aciona o freio parassimpático.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-teal-50/40 p-4 rounded-xl border border-teal-100">
                <p><strong>Ciclo 4-7-8 ou 4-6:</strong></p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li><strong>Inspire pelo nariz</strong> contando até 4 mentalmente.</li>
                  <li><strong>Segure o ar</strong> suavemente nos pulmões por 4 a 7 segundos.</li>
                  <li><strong>Solte o ar pela boca bem devagar</strong> fazendo um som suave de sopro, contando até 6 ou 8.</li>
                  <li>Repita 5 ciclos seguidos com os olhos fechados.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'relaxation' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">P — Paired Muscle Relaxation (Relaxamento Muscular Pareado)</h4>
                  <p className="text-xs text-slate-500">Tencionar intencionalmente e depois soltar para quebrar a contração involuntária.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                <p><strong>Passo a passo:</strong></p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Feche os punhos com força e aperte os ombros em direção às orelhas por <strong>5 segundos</strong> enquanto inspira.</li>
                  <li>Ao expirar, solte tudo de uma vez e repita mentalmente a palavra <strong>"Solta"</strong> ou <strong>"Paz"</strong>.</li>
                  <li>Sinta a diferença nítida entre o músculo duro e o músculo relaxado.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'stop' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <HandMetal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Habilidade STOP — Freio de Emergência contra Impulsos</h4>
                  <p className="text-xs text-slate-500">Para quando você sente vontade urgente de explodir, mandar mensagem ou tomar decisões drásticas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <span className="font-bold text-rose-800 text-sm">S — Stop (PARE!)</span>
                  <p className="mt-1">Não se mexa, não fale, não digite nada. Fique imóvel por 10 segundos.</p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-800 text-sm">T — Take a step back</span>
                  <p className="mt-1">Dê um passo físico para trás, beba um copo de água e respire.</p>
                </div>
                <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                  <span className="font-bold text-sky-800 text-sm">O — Observe</span>
                  <p className="mt-1">O que está acontecendo de verdade? O que é fato e o que é emoção inflamada?</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800 text-sm">P — Proceed mindfully</span>
                  <p className="mt-1">Qual ação agora vai melhorar a situação em vez de piorá-la?</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Banner de Emergência CVV */}
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Precisa de acolhimento humano imediato gratuito?</span>
          </div>
          <a
            href="tel:188"
            className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap shadow-xs"
          >
            Ligar CVV 188
          </a>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Entendido / Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
