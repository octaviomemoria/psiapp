'use client';

import React, { useState } from 'react';
import { HeartPulse, PhoneCall, AlertCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CrisisBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-sky-500/10 border-b border-amber-200/50 px-4 py-2 text-xs sm:text-sm text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <HeartPulse className="w-4 h-4 text-rose-500 flex-shrink-0 animate-pulse" />
          <p className="font-medium text-slate-800">
            <span className="font-semibold text-rose-700">Apoio Emocional & Situações de Crise:</span> Este aplicativo é uma extensão do acompanhamento psicológico e não substitui serviços de emergência médica.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-teal-700 hover:text-teal-900 font-medium underline flex items-center gap-0.5 text-xs flex-shrink-0"
        >
          {isOpen ? 'Ocultar canais' : 'Precisa de ajuda agora?'}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-200/40 grid sm:grid-cols-3 gap-3 animate-fade-in text-slate-700">
          <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-amber-100 flex items-start gap-2.5">
            <PhoneCall className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">CVV (Centro de Valorização da Vida)</p>
              <p className="text-xs text-slate-600 mt-0.5">Apoio emocional gratuito e 24h por telefone ou chat.</p>
              <a
                href="tel:188"
                className="inline-block mt-1 font-bold text-teal-700 hover:underline text-sm"
              >
                Ligue 188 (Gratuito)
              </a>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-amber-100 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">SAMU / Emergência Médica</p>
              <p className="text-xs text-slate-600 mt-0.5">Em casos de risco iminente à integridade física.</p>
              <a
                href="tel:192"
                className="inline-block mt-1 font-bold text-rose-700 hover:underline text-sm"
              >
                Ligue 192 (SAMU) / 193 (Bombeiros)
              </a>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-amber-100 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">CAPS (Rede Pública de Saúde)</p>
              <p className="text-xs text-slate-600 mt-0.5">Centros de Atenção Psicossocial do SUS em seu município.</p>
              <span className="inline-block mt-1 font-medium text-purple-700 text-xs">
                Procure a UBS/CAPS mais próxima
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
