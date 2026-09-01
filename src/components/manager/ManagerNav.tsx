'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  DoorClosed,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePsi } from '@/lib/store/psi-context';

interface ManagerNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const ManagerNav: React.FC<ManagerNavProps> = ({ activeTab, onSelectTab }) => {
  const { clinic, clinicPsychologists, clinicRooms } = usePsi();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral da Clínica',
      icon: LayoutDashboard,
    },
    {
      id: 'equipe',
      label: 'Equipe de Psicólogos',
      icon: Users,
      badge: `${clinicPsychologists.length}`,
    },
    {
      id: 'pacientes',
      label: 'Pacientes Institucionais',
      icon: UserCheck,
    },
    {
      id: 'financeiro',
      label: 'Financeiro & Repasses',
      icon: DollarSign,
    },
    {
      id: 'salas',
      label: 'Salas & Espaços',
      icon: DoorClosed,
      badge: `${clinicRooms.length}`,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
          {/* Identificação da Clínica */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {clinic.name}
                </h2>
                <Badge variant="purple" size="sm">
                  Gestor da Clínica
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Painel Administrativo com Segregação Ética CFP (Art. 9º)
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
