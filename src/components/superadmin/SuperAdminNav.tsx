'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Activity,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePsi } from '@/lib/store/psi-context';

interface SuperAdminNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const SuperAdminNav: React.FC<SuperAdminNavProps> = ({ activeTab, onSelectTab }) => {
  const { saasTenants } = usePsi();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral SaaS',
      icon: LayoutDashboard,
    },
    {
      id: 'clinicas',
      label: 'Clínicas & Assinantes',
      icon: Building2,
      badge: `${saasTenants.length}`,
    },
    {
      id: 'planos',
      label: 'Planos & Monetização (MRR)',
      icon: CreditCard,
    },
    {
      id: 'auditoria',
      label: 'Telemetria & Segurança',
      icon: Activity,
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-30 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
          {/* Identificação do SuperAdmin */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-sm sm:text-base leading-tight">
                  Painel do SuperAdmin — PsiApp SaaS
                </h2>
                <Badge variant="warning" size="sm" className="bg-amber-400/20 text-amber-300 border-amber-400/40">
                  Dono da Plataforma
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Gestão Global Multi-Tenant, Assinaturas e Infraestrutura
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
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
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
