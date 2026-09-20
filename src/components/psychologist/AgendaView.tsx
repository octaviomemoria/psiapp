'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Link2,
  MessageSquare,
  Plus,
  Smartphone,
} from 'lucide-react';
import { addMonths, addWeeks, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentFormModal } from './AppointmentFormModal';
import { AgendaCalendar } from './AgendaCalendar';
import { DaySessionsView } from './DaySessionsView';
import { BookingRequestsPanel } from './BookingRequestsPanel';
import { BookingSettingsModal } from './BookingSettingsModal';
import { RoomsAgendaView } from './RoomsAgendaView';
import { capitalizeFirst, getWeekDays } from '@/lib/calendar/schedule-utils';
import { cn, toLocalDateTimeInput } from '@/lib/utils';

interface AgendaViewProps {
  onSelectPatient: (patientId: string) => void;
}

type Mode = 'list' | 'month' | 'week' | 'day' | 'rooms' | 'requests';
type ListFilter = 'all' | 'upcoming' | 'completed' | 'canceled';

const MODE_LABELS: { mode: Mode; label: string }[] = [
  { mode: 'list', label: 'Lista' },
  { mode: 'month', label: 'Mês' },
  { mode: 'week', label: 'Semana' },
  { mode: 'day', label: 'Dia' },
  { mode: 'rooms', label: 'Salas' },
  { mode: 'requests', label: 'Solicitações' },
];

export const AgendaView: React.FC<AgendaViewProps> = ({ onSelectPatient }) => {
  const { appointments, patients, currentPsychologist, bookingRequests } = usePsi();

  const [mode, setMode] = useState<Mode>('list');
  const [date, setDate] = useState(new Date());
  const [listFilter, setListFilter] = useState<ListFilter>('upcoming');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | undefined>(undefined);
  const [initialStart, setInitialStart] = useState<Date | undefined>(undefined);

  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [whatsAppTarget, setWhatsAppTarget] = useState<Appointment | null>(null);
  const [approvedNotice, setApprovedNotice] = useState<Appointment | null>(null);

  const pendingRequests = bookingRequests.filter(r => r.status === 'pending').length;

  const openNew = (start?: Date) => {
    setEditing(undefined);
    setInitialStart(start);
    setFormOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditing(appointment);
    setInitialStart(undefined);
    setFormOpen(true);
  };

  const goToDay = (day: Date) => {
    setDate(day);
    setMode('day');
  };

  const listItems = useMemo(
    () =>
      appointments
        .filter(a => {
          if (listFilter === 'upcoming') return a.status === 'scheduled' || a.status === 'confirmed';
          if (listFilter === 'completed') return a.status === 'completed';
          if (listFilter === 'canceled') return a.status === 'canceled' || a.status === 'no_show';
          return true;
        })
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [appointments, listFilter]
  );

  const step = (direction: 1 | -1) => setDate(prev => (mode === 'month' ? addMonths(prev, direction) : addWeeks(prev, direction)));

  const rangeLabel = (() => {
    if (mode === 'month') return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    const days = getWeekDays(date);
    return `${format(days[0], "d 'de' MMM", { locale: ptBR })} – ${format(days[6], "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
  })();

  const whatsAppPatient = whatsAppTarget ? patients.find(p => p.id === whatsAppTarget.patient_id) : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Agenda de Atendimentos</h2>
          <p className="text-sm text-slate-500 mt-0.5">Controle de horários, sessões presenciais e teleatendimentos (TDICs).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsSettingsOpen(true)}
            className="border-teal-200 text-teal-800 bg-white hover:bg-teal-50 font-semibold flex items-center gap-1.5"
            title="Link público para pacientes solicitarem horários"
          >
            <Link2 className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Agendamento online</span>
            <span className="sm:hidden">Link</span>
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCalendarSyncOpen(true)}
            className="border-teal-200 text-teal-800 bg-white hover:bg-teal-50 font-semibold flex items-center gap-1.5"
            title="Sincronizar com iPhone, Google Agenda ou Outlook"
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Sincronizar Celular / Google</span>
            <span className="sm:hidden">Sincronizar</span>
          </Button>
          <Button variant="primary" size="md" onClick={() => openNew()} className="shadow-sm font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto" role="tablist" aria-label="Visualização da agenda">
          {MODE_LABELS.map(({ mode: m, label }) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
                mode === m ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {label}
              {m === 'requests' && pendingRequests > 0 && (
                <span className={cn('ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]', mode === m ? 'bg-white text-teal-700' : 'bg-amber-100 text-amber-800')}>
                  {pendingRequests}
                </span>
              )}
            </button>
          ))}
        </div>

        {(mode === 'month' || mode === 'week') && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => step(-1)} aria-label="Anterior"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-bold text-slate-800 min-w-[190px] text-center">{capitalizeFirst(rangeLabel)}</span>
            <Button variant="outline" size="sm" onClick={() => step(1)} aria-label="Próximo"><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setDate(new Date())} className="text-xs">Hoje</Button>
          </div>
        )}

        {mode === 'list' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {([
              ['upcoming', `Próximos (${appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length})`],
              ['completed', `Realizadas (${appointments.filter(a => a.status === 'completed').length})`],
              ['canceled', `Canceladas e faltas (${appointments.filter(a => a.status === 'canceled' || a.status === 'no_show').length})`],
              ['all', `Todos (${appointments.length})`],
            ] as [ListFilter, string][]).map(([value, label]) => (
              <Button key={value} variant={listFilter === value ? 'primary' : 'outline'} size="sm" onClick={() => setListFilter(value)} className="text-xs">
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {approvedNotice && (
        <Card className="p-4 bg-emerald-50 border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-900">
          <span>Solicitação aprovada e adicionada à agenda. Avise o paciente:</span>
          <span className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setWhatsAppTarget(approvedNotice); setApprovedNotice(null); }} className="text-xs text-emerald-700 border-emerald-300 flex items-center gap-1 font-semibold">
              <MessageSquare className="w-3.5 h-3.5" /> Avisar no WhatsApp
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setApprovedNotice(null)} className="text-xs">Fechar</Button>
          </span>
        </Card>
      )}

      {mode === 'list' && (
        <div className="space-y-3">
          {listItems.length === 0 ? (
            <Card className="p-8 text-center bg-white">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-semibold text-slate-700">Nenhum atendimento nesta visualização</h4>
              <p className="text-xs text-slate-500 mt-1">Utilize o botão acima para criar novos agendamentos.</p>
            </Card>
          ) : (
            listItems.map(a => (
              <AppointmentCard key={a.id} appointment={a} onSelectPatient={onSelectPatient} onEdit={openEdit} onWhatsApp={setWhatsAppTarget} />
            ))
          )}
        </div>
      )}

      {(mode === 'month' || mode === 'week') && (
        <AgendaCalendar
          mode={mode}
          date={date}
          appointments={appointments}
          onSelectDay={goToDay}
          onSelectAppointment={openEdit}
          onCreateAt={openNew}
        />
      )}

      {mode === 'day' && (
        <DaySessionsView
          date={date}
          onDateChange={setDate}
          appointments={appointments}
          onSelectPatient={onSelectPatient}
          onEdit={openEdit}
          onWhatsApp={setWhatsAppTarget}
          onCreateAt={openNew}
        />
      )}

      {mode === 'rooms' && <RoomsAgendaView />}

      {mode === 'requests' && (
        <BookingRequestsPanel onApproved={setApprovedNotice} onOpenSettings={() => setIsSettingsOpen(true)} />
      )}

      <AppointmentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        appointment={editing}
        initialStart={initialStart}
      />
      <CalendarSyncModal isOpen={isCalendarSyncOpen} onClose={() => setIsCalendarSyncOpen(false)} />
      <BookingSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {whatsAppTarget && (
        <WhatsAppReminderModal
          isOpen={Boolean(whatsAppTarget)}
          onClose={() => setWhatsAppTarget(null)}
          patientName={whatsAppTarget.patient_name || whatsAppPatient?.full_name || 'Paciente'}
          patientPhone={whatsAppPatient?.mobile || whatsAppPatient?.phone || ''}
          sessionDate={toLocalDateTimeInput(whatsAppTarget.starts_at).slice(0, 10)}
          sessionTime={toLocalDateTimeInput(whatsAppTarget.starts_at).slice(11, 16)}
          psychologistName={currentPsychologist.profile?.full_name || 'Psicólogo(a)'}
          sessionLink={whatsAppTarget.location_or_link}
          appointmentId={whatsAppTarget.id}
        />
      )}
    </div>
  );
};
