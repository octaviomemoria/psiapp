'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient } from '@/types/database';
import {
  Users,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  ChevronRight,
  UserPlus,
  Mail,
  Phone,
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PatientInviteModal } from './PatientInviteModal';
import { PatientFormModal } from './PatientFormModal';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { calculateAge } from '@/lib/utils/masks';
import { Share2, Link } from 'lucide-react';

interface PatientListViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({ onSelectPatient }) => {
  const { patients, patientGroups, deletePatient, sessions, assignedExercises, appointments } = usePsi();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending_exercises'>('all');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const openNewPatientForm = () => {
    setEditingPatient(undefined);
    setIsPatientFormOpen(true);
  };

  const openEditPatientForm = (patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientFormOpen(true);
  };

  const allTags = [...new Set(patients.flatMap(p => p.tags || []))].sort((a, b) => a.localeCompare(b));

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase();
    const searchDigits = searchTerm.replace(/\D/g, '');
    const matchesSearch =
      patient.full_name.toLowerCase().includes(term) ||
      (patient.social_name || '').toLowerCase().includes(term) ||
      (patient.email || '').toLowerCase().includes(term) ||
      (searchDigits.length >= 3 && (patient.cpf || '').includes(searchDigits)) ||
      (patient.clinical_notes_overview && patient.clinical_notes_overview.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (filterGroup && patient.group_id !== filterGroup) return false;
    if (filterTag && !(patient.tags || []).includes(filterTag)) return false;

    if (filterStatus === 'active') return patient.status === 'active';
    if (filterStatus === 'pending_exercises') {
      const hasPending = assignedExercises.some(e => e.patient_id === patient.id && e.status === 'pending');
      return hasPending;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Meus Pacientes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestão da carteira clínica, histórico de evolução e acompanhamento 360°.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsInviteModalOpen(true)}
            className="border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Convidar Paciente (Link / WhatsApp)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={openNewPatientForm}
            className="shadow-sm font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastrar Manualmente
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF, e-mail ou demanda..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {patientGroups.length > 0 && (
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              aria-label="Filtrar por grupo"
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Todos os grupos</option>
              {patientGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              aria-label="Filtrar por tag"
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Todas as tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="text-xs"
          >
            Todos ({patients.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
            className="text-xs"
          >
            Ativos ({patients.filter(p => p.status === 'active').length})
          </Button>
          <Button
            variant={filterStatus === 'pending_exercises' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending_exercises')}
            className="text-xs"
          >
            Com Exercícios Pendentes
          </Button>
        </div>
      </div>

      {/* Grid de Cards dos Pacientes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map(patient => {
          const patientSessions = sessions.filter(s => s.patient_id === patient.id);
          const lastSession = patientSessions.sort(
            (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
          )[0];

          const nextAppointment = appointments
            .filter(a => a.patient_id === patient.id && (a.status === 'scheduled' || a.status === 'confirmed'))
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

          const pendingCount = assignedExercises.filter(
            e => e.patient_id === patient.id && e.status === 'pending'
          ).length;

          const completedCount = assignedExercises.filter(
            e => e.patient_id === patient.id && e.status === 'completed'
          ).length;

          return (
            <Card
              key={patient.id}
              className="hover:shadow-card hover:border-teal-200 transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                {/* Topo: Avatar, Nome, Idade e Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden flex-shrink-0">
                      {patient.profile?.avatar_url ? (
                        <img src={patient.profile.avatar_url} alt={patient.full_name} className="w-full h-full object-cover" />
                      ) : (
                        patient.full_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight hover:text-teal-700 transition-colors">
                        {patient.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(() => {
                          const age = calculateAge(patient.birth_date);
                          return age === null ? 'Idade não inf.' : `${age} anos`;
                        })()} • {patient.gender || 'Gênero não inf.'}
                      </p>
                      {(patient.group_id || (patient.tags && patient.tags.length > 0)) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.group_id && patientGroups.find(g => g.id === patient.group_id) && (
                            <Badge variant="info" size="sm">{patientGroups.find(g => g.id === patient.group_id)!.name}</Badge>
                          )}
                          {(patient.tags || []).slice(0, 3).map(tag => (
                            <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={patient.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                {/* Demanda Clínica Resumida */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 line-clamp-2">
                  {patient.clinical_notes_overview || 'Acompanhamento psicológico em andamento.'}
                </div>

                {/* Linha do Tempo Resumida (Última e Próxima Sessão) */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Última sessão:
                    </span>
                    <span className="font-medium text-slate-700">
                      {lastSession ? formatRelativeDate(lastSession.session_date) : 'Nenhuma'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Próxima sessão:
                    </span>
                    <span className="font-medium text-teal-700">
                      {nextAppointment ? formatDate(nextAppointment.starts_at) : 'A agendar'}
                    </span>
                  </div>
                </div>

                {/* Badges de Atividades */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="neutral" size="sm">
                    {patientSessions.length} sessões
                  </Badge>
                  {pendingCount > 0 && (
                    <Badge variant="warning" size="sm">
                      {pendingCount} exercício(s) pendente(s)
                    </Badge>
                  )}
                  {completedCount > 0 && (
                    <Badge variant="info" size="sm">
                      {completedCount} aguardando feedback
                    </Badge>
                  )}
                </div>
              </CardContent>

              {/* Botão de Acesso ao Perfil 360 & Ações */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex-1 justify-between text-xs font-semibold hover:border-teal-500 hover:text-teal-700"
                >
                  <span>Acessar Prontuário & Evolução</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditPatientForm(patient);
                  }}
                  title="Editar cadastro"
                  className="p-2 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Tem certeza que deseja remover o paciente "${patient.full_name}"?`)) {
                      deletePatient(patient.id);
                    }
                  }}
                  title="Excluir paciente"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="p-8 text-center bg-white border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nenhum paciente encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Você pode convidar seu primeiro paciente enviando um link de ativação segura ou cadastrá-lo manualmente agora mesmo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsInviteModalOpen(true)}
              className="border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Convidar via WhatsApp / Link
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={openNewPatientForm}
              className="font-semibold shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Manualmente
            </Button>
          </div>
        </Card>
      )}

      <PatientFormModal
        isOpen={isPatientFormOpen}
        onClose={() => setIsPatientFormOpen(false)}
        patient={editingPatient}
        onSaved={saved => {
          if (!editingPatient) onSelectPatient(saved.id);
        }}
      />

      <PatientInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
