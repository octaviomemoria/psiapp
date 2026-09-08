'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const PwaRegistration: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Registro do Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('PsiApp ServiceWorker registrado com escopo:', registration.scope);
          })
          .catch(error => {
            console.warn('Erro ao registrar ServiceWorker:', error);
          });
      });
    }

    // 2. Monitoramento de Conexão de Rede
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {isOffline ? (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">Modo Offline Ativo</p>
            <p className="text-slate-400 text-[11px] leading-tight">
              Diário e exercícios continuam funcionando localmente. Sincronizaremos ao reconectar.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-teal-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-teal-700 text-xs max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-emerald-200 flex items-center gap-1.5">
              Conexão Restabelecida
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            </p>
            <p className="text-teal-300 text-[11px] leading-tight">
              Dados locais sincronizados com o prontuário em nuvem.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
