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
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PatientInviteModal } from './PatientInviteModal';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { Share2, Link } from 'lucide-react';

interface PatientListViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({ onSelectPatient }) => {
  const { patients, addPatient, sessions, assignedExercises, appointments } = usePsi();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending_exercises'>('all');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form State Novo Paciente
  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [gender, setGender] = useState('Feminino');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [clinicalNotesOverview, setClinicalNotesOverview] = useState('');

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const created = addPatient({
      full_name: fullName,
      social_name: socialName || undefined,
      birth_date: birthDate,
      gender,
      email,
      phone,
      emergency_contact_name: emergencyContactName || undefined,
      emergency_contact_phone: emergencyContactPhone || undefined,
      status: 'active',
      clinical_notes_overview: clinicalNotesOverview,
    });

    setIsNewPatientModalOpen(false);
    // Limpar form
    setFullName('');
    setSocialName('');
    setEmail('');
    setPhone('');
    setClinicalNotesOverview('');
    onSelectPatient(created.id);
  };

  const calculateAge = (birthDateString: string): number => {
    try {
      const birth = new Date(birthDateString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age || 28;
    } catch {
      return 28;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.clinical_notes_overview && patient.clinical_notes_overview.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

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
            onClick={() => setIsNewPatientModalOpen(true)}
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
            placeholder="Buscar por nome, e-mail ou demanda..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
                        {calculateAge(patient.birth_date)} anos • {patient.gender || 'Gênero não inf.'}
                      </p>
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

              {/* Botão de Acesso ao Perfil 360 */}
              <div className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectPatient(patient.id)}
                  className="w-full justify-between text-xs font-semibold hover:border-teal-500 hover:text-teal-700"
                >
                  <span>Acessar Prontuário & Evolução</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
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
              onClick={() => setIsNewPatientModalOpen(true)}
              className="font-semibold shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Manualmente
            </Button>
          </div>
        </Card>
      )}

      {/* Modal Cadastro de Novo Paciente */}
      <Modal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        title="Cadastrar Novo Paciente"
        description="Adicione um novo paciente à sua carteira de acompanhamento clínico."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex: Mariana Costa"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Social / Como prefere ser chamado(a)
              </label>
              <input
                type="text"
                value={socialName}
                onChange={e => setSocialName(e.target.value)}
                placeholder="Ex: Mari"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Contato *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contato de Emergência (Nome e Vínculo)
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                placeholder="Ex: Lucas Costa (Irmão)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone de Emergência
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                placeholder="(11) 98888-8888"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Demanda Inicial / Observações Clínicas
              </label>
              <textarea
                value={clinicalNotesOverview}
                onChange={e => setClinicalNotesOverview(e.target.value)}
                rows={3}
                placeholder="Queixa principal, objetivos preliminares e histórico relevante..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewPatientModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-semibold">
              Salvar Paciente
            </Button>
          </div>
        </form>
      </Modal>

      <PatientInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
