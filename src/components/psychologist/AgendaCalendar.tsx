'use client';

import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { isSameDay, isSameMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, AppointmentStatus } from '@/types/database';
import { dayKey, getMonthGrid, getWeekDays, groupAppointmentsByDay } from '@/lib/calendar/schedule-utils';
import { shortTime, STATUS_LABEL } from './AppointmentCard';
import { cn } from '@/lib/utils';

const CHIP_STYLE: Record<AppointmentStatus, string> = {
  scheduled: 'bg-teal-50 border-teal-200 text-teal-800',
  confirmed: 'bg-sky-50 border-sky-200 text-sky-800',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  no_show: 'bg-amber-50 border-amber-200 text-amber-800',
  canceled: 'bg-slate-100 border-slate-200 text-slate-400 line-through',
  rescheduled: 'bg-slate-100 border-slate-200 text-slate-400 line-through',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOUR_PX = 52;

interface AgendaCalendarProps {
  mode: 'month' | 'week';
  date: Date;
  appointments: Appointment[];
  onSelectDay: (day: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onCreateAt: (start: Date) => void;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ mode, date, appointments, onSelectDay, onSelectAppointment, onCreateAt }) => {
  const { patients } = usePsi();
  const byDay = useMemo(() => groupAppointmentsByDay(appointments), [appointments]);
  const today = new Date();

  const label = (a: Appointment) => {
    const name = patients.find(p => p.id === a.patient_id)?.full_name || a.patient_name || 'Paciente';
    return `${shortTime(a.starts_at)} ${name.split(' ')[0]}`;
  };

  if (mode === 'month') {
    const days = getMonthGrid(date);
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
            {WEEKDAYS.map(d => <div key={d} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map(day => {
              const items = byDay[dayKey(day)] || [];
              const outside = !isSameMonth(day, date);
              return (
                <div
                  key={day.toISOString()}
                  className={cn('min-h-[104px] border-b border-r border-slate-100 p-1.5 flex flex-col gap-1', outside && 'bg-slate-50/50')}
                >
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className={cn(
                      'self-start w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center hover:bg-teal-50',
                      outside ? 'text-slate-300' : 'text-slate-700',
                      isSameDay(day, today) && '!bg-teal-600 !text-white'
                    )}
                    aria-label={`Ver sessões de ${format(day, "d 'de' MMMM", { locale: ptBR })}`}
                  >
                    {day.getDate()}
                  </button>
                  {items.slice(0, 3).map(a => (
                    <button
                      key={a.id}
                      type="button"
                      title={`${label(a)} • ${STATUS_LABEL[a.status]}`}
                      onClick={() => onSelectAppointment(a)}
                      className={cn('w-full text-left truncate text-[11px] leading-tight px-1.5 py-1 rounded-md border', CHIP_STYLE[a.status])}
                    >
                      {label(a)}
                    </button>
                  ))}
                  {items.length > 3 && (
                    <button type="button" onClick={() => onSelectDay(day)} className="text-[11px] text-teal-700 font-semibold text-left px-1">
                      +{items.length - 3} mais
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Semana: grade por horário
  const days = getWeekDays(date);
  const weekItems = days.flatMap(d => byDay[dayKey(d)] || []);
  const startHour = Math.min(7, ...weekItems.map(a => new Date(a.starts_at).getHours()));
  const endHour = Math.max(20, ...weekItems.map(a => new Date(a.ends_at).getHours() + 1));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/60">
          <div />
          {days.map(day => (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className="px-2 py-2 text-center hover:bg-teal-50/60"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{WEEKDAYS[day.getDay()]}</span>
              <span className={cn('inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-bold text-slate-700', isSameDay(day, today) && 'bg-teal-600 text-white')}>
                {day.getDate()}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[52px_repeat(7,1fr)]">
          <div>
            {hours.map(h => (
              <div key={h} style={{ height: HOUR_PX }} className="text-[10px] text-slate-400 text-right pr-2 -mt-1.5 pt-0">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map(day => {
            const items = byDay[dayKey(day)] || [];
            return (
              <div key={day.toISOString()} className="relative border-l border-slate-100" style={{ height: hours.length * HOUR_PX }}>
                {hours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      const start = new Date(day);
                      start.setHours(h, 0, 0, 0);
                      onCreateAt(start);
                    }}
                    style={{ height: HOUR_PX }}
                    className="group block w-full border-t border-slate-100 hover:bg-teal-50/40 text-transparent hover:text-teal-600 flex items-start justify-end p-0.5"
                    aria-label={`Agendar em ${format(day, 'dd/MM')} às ${h}:00`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                ))}
                {items.map(a => {
                  const s = new Date(a.starts_at);
                  const e = new Date(a.ends_at);
                  const top = ((s.getHours() * 60 + s.getMinutes()) / 60 - startHour) * HOUR_PX;
                  const height = Math.max(22, ((e.getTime() - s.getTime()) / 3_600_000) * HOUR_PX - 2);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelectAppointment(a)}
                      title={`${label(a)} • ${STATUS_LABEL[a.status]}`}
                      style={{ top, height }}
                      className={cn('absolute left-0.5 right-0.5 text-left overflow-hidden text-[11px] leading-tight px-1.5 py-1 rounded-md border', CHIP_STYLE[a.status])}
                    >
                      {label(a)}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
