'use client';

import React from 'react';
import {
  Home,
  Sparkles,
  BookOpen,
  TrendingUp,
  User
} from 'lucide-react';

interface PatientBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const PatientBottomNav: React.FC<PatientBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const items = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'entre_sessoes', label: 'Entre sessões', icon: Sparkles },
    { id: 'diario', label: 'Diário', icon: BookOpen },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
