'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  BookOpen,
  DollarSign,
  Settings,
  Sparkles
} from 'lucide-react';

interface PsychologistNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const PsychologistNav: React.FC<PsychologistNavProps> = ({ activeTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'biblioteca', label: 'Biblioteca & Exercícios', icon: BookOpen },
    { id: 'financeiro', label: 'Financeiro & Recibos', icon: DollarSign },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
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
