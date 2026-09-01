'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ClinicPsychologist } from '@/types/database';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  Edit,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export const ManagerPsychologistsView: React.FC = () => {
  const { clinicPsychologists, addClinicPsychologist, updateClinicPsychologist } = usePsi();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPsico, setSelectedPsico] = useState<ClinicPsychologist | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [crp, setCrp] = useState('');
  const [crpState, setCrpState] = useState('SP');
  const [approach, setApproach] = useState('TCC (Terapia Cognitivo-Comportamental)');
  const [specialties, setSpecialties] = useState('Ansiedade, Adultos, Burnout');
  const [commissionRate, setCommissionRate] = useState(70);
  const [scheduleDays, setScheduleDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui']);

  const filteredPsychologists = clinicPsychologists.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.crp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.approach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClinicPsychologist({
      full_name: fullName,
      email,
      phone,
      crp,
      crp_state: crpState,
      approach,
      specialties: specialties.split(',').map(s => s.trim()),
      commission_rate: commissionRate,
      active_patients_count: 0,
      status: 'active',
      schedule_days: scheduleDays
    });

    setIsAddModalOpen(false);
    // Reset
    setFullName('');
    setEmail('');
    setPhone('');
    setCrp('');
  };

  const toggleDay = (day: string) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header da Tela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Equipe de Psicólogos da Clínica
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Gerencie o corpo clínico, especialidades, registros CRP e acordos de repasse de honorários.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm flex-shrink-0"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Cadastrar Novo Psicólogo
        </Button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar profissional por nome, CRP ou abordagem terapêutica..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Grid de Cards dos Psicólogos */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredPsychologists.map(psico => (
          <Card key={psico.id} className="hover:border-indigo-200 transition-all">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                    {psico.full_name.split(' ')[0][0]}{psico.full_name.split(' ')[1]?.[0] || ''}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {psico.full_name}
                      </h3>
                      <Badge
                        variant={psico.status === 'active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {psico.status === 'active' ? 'Em Atendimento' : 'Em Licença'}
                      </Badge>
                    </div>
                    <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                      CRP {psico.crp}/{psico.crp_state} • {psico.approach}
                    </p>
                  </div>
                </div>
              </div>

              {/* Especialidades */}
              <div className="flex flex-wrap gap-1.5">
                {psico.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px]"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Informações Administrativas & Repasse */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Pacientes Ativos</span>
                  <span className="font-bold text-slate-800">{psico.active_patients_count} pacientes</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Repasse Contratual</span>
                  <span className="font-bold text-indigo-700">{psico.commission_rate}% terapeuta</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Escala Semanal</span>
                  <span className="font-medium text-slate-700">{psico.schedule_days.join(', ')}</span>
                </div>
              </div>

              {/* Contatos do Profissional */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {psico.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {psico.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Cadastro de Psicólogo na Clínica */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Profissional na Equipe"
        description="Adicione um novo psicólogo ao corpo clínico e configure o percentual de repasse."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Terapeuta</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ex: Dra. Juliana Siqueira"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="juliana@mentesaudavel.com.br"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Número de Registro CRP</label>
              <input
                type="text"
                value={crp}
                onChange={e => setCrp(e.target.value)}
                placeholder="Ex: 06/789123"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">UF Conselho</label>
              <input
                type="text"
                value={crpState}
                onChange={e => setCrpState(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Abordagem Teórica Principal</label>
            <input
              type="text"
              value={approach}
              onChange={e => setApproach(e.target.value)}
              placeholder="Ex: TCC (Terapia Cognitivo-Comportamental) & ACT"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Especialidades & Demandas (separadas por vírgula)</label>
            <input
              type="text"
              value={specialties}
              onChange={e => setSpecialties(e.target.value)}
              placeholder="Ex: Ansiedade, Luto, Trauma, Casais"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Repasse do Psicólogo (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={e => setCommissionRate(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-center font-bold text-indigo-700"
                />
                <span className="text-slate-500">
                  (Clínica retém {100 - commissionRate}%)
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dias de Escala</label>
              <div className="flex flex-wrap gap-1">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      scheduleDays.includes(day)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              Salvar Profissional
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
