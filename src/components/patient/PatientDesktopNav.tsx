'use client';

import React from 'react';
import {
  Home,
  Sparkles,
  BookOpen,
  TrendingUp,
  User
} from 'lucide-react';

interface PatientDesktopNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const PatientDesktopNav: React.FC<PatientDesktopNavProps> = ({ activeTab, onSelectTab }) => {
  const items = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'entre_sessoes', label: 'Entre Sessões', icon: Sparkles },
    { id: 'diario', label: 'Meu Diário', icon: BookOpen },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs hidden sm:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
