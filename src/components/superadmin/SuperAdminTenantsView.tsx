'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { SaaSTenant } from '@/types/database';
import {
  Building2,
  Search,
  Plus,
  Edit,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export const SuperAdminTenantsView: React.FC = () => {
  const { saasTenants, saasPlans, updateTenantStatus, updateTenantPlan, addTenant } = usePsi();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedTenantForPlan, setSelectedTenantForPlan] = useState<SaaSTenant | null>(null);
  const [newPlanCode, setNewPlanCode] = useState<'single' | 'clinic_pro' | 'clinic_enterprise'>('clinic_pro');

  // Form states
  const [clinicName, setClinicName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [planCode, setPlanCode] = useState<'single' | 'clinic_pro' | 'clinic_enterprise'>('clinic_pro');

  const filteredTenants = saasTenants.filter(t =>
    t.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = saasPlans.find(p => p.code === planCode);

    addTenant({
      clinic_name: clinicName,
      owner_name: ownerName,
      owner_email: ownerEmail,
      plan_code: planCode,
      status: 'active',
      psychologists_count: 1,
      max_psychologists: plan?.max_psychologists || 5,
      monthly_mrr: plan?.price_monthly || 249.90,
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    setIsAddTenantOpen(false);
    setClinicName('');
    setOwnerName('');
    setOwnerEmail('');
  };

  const handlePlanChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForPlan) return;
    updateTenantPlan(selectedTenantForPlan.id, newPlanCode);
    setSelectedTenantForPlan(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Clínicas & Consultórios Assinantes (Tenants)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Gerencie o ciclo de vida, planos contratados, limites de profissionais e status de faturamento de cada clínica parceira.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddTenantOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Cadastrar Nova Clínica
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome da clínica, proprietário ou e-mail..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Tabela de Tenants */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Nome da Clínica / Consultório</th>
                <th className="p-3.5">Proprietário / Gestor</th>
                <th className="p-3.5">Plano Contratado</th>
                <th className="p-3.5 text-center">Terapeutas / Limite</th>
                <th className="p-3.5">Mensalidade (MRR)</th>
                <th className="p-3.5">Próx. Cobrança</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                        {tenant.clinic_name[0]}
                      </div>
                      <span>{tenant.clinic_name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="font-semibold block">{tenant.owner_name}</span>
                    <span className="text-[11px] text-slate-400">{tenant.owner_email}</span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={tenant.plan_code === 'clinic_enterprise' ? 'warning' : 'purple'} size="sm">
                      {tenant.plan_code === 'single'
                        ? 'Psicólogo Autônomo'
                        : tenant.plan_code === 'clinic_pro'
                        ? 'Clínica Pro'
                        : 'Enterprise'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-700">
                    {tenant.psychologists_count} de {tenant.max_psychologists}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700">
                    R$ {tenant.monthly_mrr.toFixed(2)}/mês
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {formatDate(tenant.next_billing_date)}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        tenant.status === 'active'
                          ? 'success'
                          : tenant.status === 'trial'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {tenant.status === 'active'
                        ? 'Ativo'
                        : tenant.status === 'trial'
                        ? 'Em Teste (Trial)'
                        : tenant.status === 'past_due'
                        ? 'Inadimplente'
                        : 'Suspenso'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTenantForPlan(tenant);
                        setNewPlanCode(tenant.plan_code);
                      }}
                      className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                      Alterar Plano
                    </Button>

                    {tenant.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTenantStatus(tenant.id, 'suspended')}
                        className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        Suspender
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTenantStatus(tenant.id, 'active')}
                        className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        Ativar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal de Alteração de Plano do Tenant */}
      <Modal
        isOpen={Boolean(selectedTenantForPlan)}
        onClose={() => setSelectedTenantForPlan(null)}
        title="Alterar Plano da Clínica"
        description={`Atualize o plano e os limites contratados para ${selectedTenantForPlan?.clinic_name}.`}
        maxWidth="md"
      >
        <form onSubmit={handlePlanChangeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Escolha o Novo Plano SaaS:</label>
            <select
              value={newPlanCode}
              onChange={e => setNewPlanCode(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="single">Psicólogo Autônomo — R$ 89,90/mês (Até 1 profissional)</option>
              <option value="clinic_pro">Clínica Pro — R$ 249,90/mês (Até 5 profissionais + Salas)</option>
              <option value="clinic_enterprise">Clínica Enterprise — R$ 590,00/mês (Até 30 profissionais + Whitelabel)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setSelectedTenantForPlan(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              Confirmar Alteração
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cadastro de Nova Clínica */}
      <Modal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        title="Cadastrar Nova Clínica Assinante"
        description="Provisione um novo ambiente multi-tenant na plataforma."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome da Clínica / Consultório</label>
            <input
              type="text"
              value={clinicName}
              onChange={e => setClinicName(e.target.value)}
              placeholder="Ex: Clínica Integração Psicológica"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome do Dono / Gestor Responsável</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="Ex: Dr. Marcelo Rocha"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-mail Corporativo de Acesso</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              placeholder="marcelo@clinicaintegracao.com.br"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plano Inicial</label>
            <select
              value={planCode}
              onChange={e => setPlanCode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="single">Psicólogo Autônomo (R$ 89,90/mês)</option>
              <option value="clinic_pro">Clínica Pro (R$ 249,90/mês)</option>
              <option value="clinic_enterprise">Clínica Enterprise (R$ 590,00/mês)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddTenantOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              Criar Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
