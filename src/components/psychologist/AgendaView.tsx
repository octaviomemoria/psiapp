'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, SessionModality, AppointmentStatus } from '@/types/database';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  ChevronRight,
  Sparkles,
  Search,
  MessageSquare,
  Smartphone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar/calendar-utils';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';

interface AgendaViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onSelectPatient }) => {
  const { appointments, patients, addAppointment, updateAppointmentStatus, currentPsychologist } = usePsi();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'canceled'>('upcoming');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [selectedAppointmentForWhatsApp, setSelectedAppointmentForWhatsApp] = useState<Appointment | null>(null);

  // Form State Novo Agendamento
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [startsAt, setStartsAt] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<SessionModality>('online');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/psi-ana-consulta');
  const [notes, setNotes] = useState('');

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !startsAt) return;

    const startDate = new Date(startsAt);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const targetPatient = patients.find(p => p.id === patientId);

    addAppointment({
      psychologist_id: currentPsychologist.id,
      patient_id: patientId,
      patient_name: targetPatient?.full_name,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      modality,
      location_or_link: locationOrLink,
      status: 'scheduled',
      notes,
    });

    setIsNewAppointmentOpen(false);
    setNotes('');
  };

  const filteredAppointments = appointments
    .filter(a => {
      if (filter === 'upcoming') return a.status === 'scheduled' || a.status === 'confirmed';
      if (filter === 'completed') return a.status === 'completed';
      if (filter === 'canceled') return a.status === 'canceled';
      return true;
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Agenda de Atendimentos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle de horários, sessões presenciais e teleatendimentos (TDICs).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCalendarSyncOpen(true)}
            className="border-teal-200 text-teal-800 bg-white hover:bg-teal-50 shadow-xs font-semibold flex items-center gap-1.5"
            title="Sincronizar com iPhone, Google Agenda ou Outlook"
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Sincronizar Celular / Google</span>
            <span className="sm:hidden">Sincronizar</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewAppointmentOpen(true)}
            className="shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Filtros da Agenda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
            className="text-xs"
          >
            Próximos Atendimentos ({appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className="text-xs"
          >
            Realizadas ({appointments.filter(a => a.status === 'completed').length})
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            Todos os Registros ({appointments.length})
          </Button>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 text-center bg-white">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-semibold text-slate-700">Nenhum atendimento nesta visualização</h4>
            <p className="text-xs text-slate-500 mt-1">Utilize o botão acima para criar novos agendamentos.</p>
          </Card>
        ) : (
          filteredAppointments.map(appointment => {
            const patient = patients.find(p => p.id === appointment.patient_id);
            const isConfirmed = appointment.status === 'confirmed';
            const isCompleted = appointment.status === 'completed';
            const isCanceled = appointment.status === 'canceled';

            return (
              <Card
                key={appointment.id}
                className="p-5 hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 border border-teal-100">
                    <span>{new Date(appointment.starts_at).getDate()}</span>
                    <span className="text-[10px] uppercase font-normal text-teal-600">
                      {new Date(appointment.starts_at).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base">
                        {patient?.full_name || appointment.patient_name}
                      </h4>
                      <Badge
                        variant={
                          isCompleted
                            ? 'success'
                            : isConfirmed
                            ? 'info'
                            : isCanceled
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {isCompleted
                          ? 'Realizada'
                          : isConfirmed
                          ? 'Confirmada'
                          : isCanceled
                          ? 'Cancelada'
                          : 'Agendada'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {formatDateTime(appointment.starts_at)}
                      </span>
                      <span className="capitalize flex items-center gap-1">
                        {appointment.modality === 'online' ? (
                          <Video className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {appointment.modality}
                      </span>
                    </div>

                    {appointment.location_or_link && (
                      <p className="text-xs text-teal-700 font-medium truncate max-w-md mt-0.5">
                        {appointment.location_or_link}
                      </p>
                    )}

                    {appointment.notes && (
                      <p className="text-xs text-slate-500 italic mt-1">Obs: {appointment.notes}</p>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas de Status e Calendário */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Dropdown 1-Clique Salvar na Agenda */}
                  <div className="relative group/cal">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                      title="Salvar no Google Agenda ou iPhone"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span className="hidden md:inline">Salvar na Agenda</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1 hidden group-hover/cal:block z-30">
                      <button
                        type="button"
                        onClick={() => window.open(generateGoogleCalendarUrl(appointment, currentPsychologist.profile?.display_name || currentPsychologist.profile?.full_name), '_blank')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Abrir no Google Agenda</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(appointment, currentPsychologist.profile?.display_name || currentPsychologist.profile?.full_name)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                        <span>iPhone / Apple (.ics)</span>
                      </button>
                    </div>
                  </div>

                  {appointment.status === 'scheduled' && (
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      className="text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Confirmar
                    </Button>
                  )}

                  {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="text-xs"
                    >
                      Concluir
                    </Button>
                  )}

                  {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'canceled')}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointmentForWhatsApp(appointment)}
                    className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                    title="Disparar Lembrete / Confirmação no WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPatient(appointment.patient_id)}
                    className="text-xs"
                  >
                    Prontuário
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Sincronização de Calendários */}
      <CalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
      />

      {/* Modal de Lembretes WhatsApp */}
      {selectedAppointmentForWhatsApp && (() => {
        const appointmentPatient = patients.find(p => p.id === selectedAppointmentForWhatsApp.patient_id);
        return (
          <WhatsAppReminderModal
            isOpen={Boolean(selectedAppointmentForWhatsApp)}
            onClose={() => setSelectedAppointmentForWhatsApp(null)}
            patientName={selectedAppointmentForWhatsApp.patient_name || appointmentPatient?.full_name || 'Paciente'}
            patientPhone={appointmentPatient?.phone || '(11) 98765-4321'}
            sessionDate={selectedAppointmentForWhatsApp.starts_at.slice(0, 10)}
            sessionTime={selectedAppointmentForWhatsApp.starts_at.slice(11, 16)}
            psychologistName={currentPsychologist.profile?.full_name || 'Dra. Ana Martins'}
            sessionLink={selectedAppointmentForWhatsApp.location_or_link}
            appointmentId={selectedAppointmentForWhatsApp.id}
          />
        );
      })()}

      {/* Modal Novo Agendamento */}
      <Modal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        title="Agendar Novo Atendimento"
        description="Defina o paciente, horário e canal da consulta."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente *</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data e Horário de Início *</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duração (minutos)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                min="15"
                max="180"
                step="5"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modalidade</label>
              <select
                value={modality}
                onChange={e => setModality(e.target.value as SessionModality)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="online">Online (Telepsicologia TDIC)</option>
                <option value="presencial">Presencial no Consultório</option>
                <option value="domiciliar">Domiciliar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link ou Endereço</label>
              <input
                type="text"
                value={locationOrLink}
                onChange={e => setLocationOrLink(e.target.value)}
                placeholder="https://meet... ou Sala 402"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Administrativas</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Sessão 15 - Trazer exercícios preenchidos"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewAppointmentOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-semibold">
              Salvar Agendamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
