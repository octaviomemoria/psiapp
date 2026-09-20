'use client';

import React, { useMemo } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { capitalizeFirst, dayKey } from '@/lib/calendar/schedule-utils';
import { AppointmentCard, STATUS_LABEL } from './AppointmentCard';

interface DaySessionsViewProps {
  date: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onEdit: (appointment: Appointment) => void;
  onWhatsApp: (appointment: Appointment) => void;
  onCreateAt: (start: Date) => void;
}

/** Lista das sessões de um único dia, com resumo por situação. */
export const DaySessionsView: React.FC<DaySessionsViewProps> = ({ date, onDateChange, appointments, onSelectPatient, onEdit, onWhatsApp, onCreateAt }) => {
  const key = dayKey(date);
  const dayAppointments = useMemo(
    () => appointments.filter(a => dayKey(a.starts_at) === key).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [appointments, key]
  );

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of dayAppointments) counts[a.status] = (counts[a.status] || 0) + 1;
    return counts;
  }, [dayAppointments]);

  const createHere = () => {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    onCreateAt(start);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onDateChange(addDays(date, -1))} aria-label="Dia anterior"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())} className="text-xs">Hoje</Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(addDays(date, 1))} aria-label="Próximo dia"><ChevronRight className="w-4 h-4" /></Button>
          <input
            type="date"
            value={key}
            onChange={e => e.target.value && onDateChange(new Date(`${e.target.value}T12:00:00`))}
            className="ml-2 px-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            aria-label="Escolher dia"
          />
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800">{capitalizeFirst(format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }))}</p>
          <p className="text-xs text-slate-500">
            {dayAppointments.length === 0
              ? 'Nenhuma sessão'
              : `${dayAppointments.length} sessão(ões)` + Object.entries(summary).map(([status, n]) => ` • ${n} ${STATUS_LABEL[status as keyof typeof STATUS_LABEL].toLowerCase()}`).join('')}
          </p>
        </div>
      </div>

      {dayAppointments.length === 0 ? (
        <Card className="p-8 text-center bg-white">
          <CalendarPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-slate-700">Nenhuma sessão neste dia</h4>
          <Button variant="primary" size="sm" onClick={createHere} className="mt-3 font-semibold">Agendar neste dia</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map(a => (
            <AppointmentCard key={a.id} appointment={a} compact onSelectPatient={onSelectPatient} onEdit={onEdit} onWhatsApp={onWhatsApp} />
          ))}
        </div>
      )}
    </div>
  );
};
