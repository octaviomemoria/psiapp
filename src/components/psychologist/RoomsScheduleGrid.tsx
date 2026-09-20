'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePsi } from '@/lib/store/psi-context';
import { dayKey, occupiesSlot } from '@/lib/calendar/schedule-utils';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { shortTime, STATUS_LABEL } from './AppointmentCard';

const MIN_HOUR = 7;
const MAX_HOUR = 21;

/** Ocupação das salas em um dia: uma linha por sala, blocos posicionados pelo horário do atendimento. */
export const RoomsScheduleGrid: React.FC = () => {
  const { clinicRooms, appointments, patients } = usePsi();
  const [date, setDate] = useState(new Date());
  const key = dayKey(date);

  const dayItems = useMemo(
    () => appointments.filter(a => a.room_id && dayKey(a.starts_at) === key && occupiesSlot(a.status)),
    [appointments, key]
  );

  const startHour = Math.min(MIN_HOUR, ...dayItems.map(a => new Date(a.starts_at).getHours()));
  const endHour = Math.max(MAX_HOUR, ...dayItems.map(a => new Date(a.ends_at).getHours() + 1));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalMinutes = (endHour - startHour) * 60;

  const percent = (d: Date) => (((d.getHours() * 60 + d.getMinutes()) - startHour * 60) / totalMinutes) * 100;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Agenda das Salas</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, -1))} aria-label="Dia anterior"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-xs font-semibold text-slate-700 capitalize min-w-[150px] text-center">{format(date, "EEE, d 'de' MMM", { locale: ptBR })}</span>
          <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, 1))} aria-label="Próximo dia"><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setDate(new Date())} className="text-xs">Hoje</Button>
        </div>
      </div>

      {clinicRooms.length === 0 ? (
        <p className="text-xs text-slate-500 bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center">
          Cadastre uma sala para acompanhar a ocupação por horário.
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[160px_1fr] border-b border-slate-100 bg-slate-50/60">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sala</div>
              <div className="relative h-8">
                {hours.map((h, i) => (
                  <span key={h} style={{ left: `${(i / hours.length) * 100}%` }} className="absolute top-2 -translate-x-1/2 text-[10px] text-slate-400">
                    {String(h).padStart(2, '0')}h
                  </span>
                ))}
              </div>
            </div>

            {clinicRooms.map(room => {
              const items = dayItems.filter(a => a.room_id === room.id);
              return (
                <div key={room.id} className="grid grid-cols-[160px_1fr] border-b border-slate-100 last:border-0">
                  <div className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{room.name}</p>
                    <p className="text-[11px] text-slate-400">{room.type === 'virtual' ? 'Virtual' : 'Física'}{room.status === 'maintenance' ? ' • manutenção' : ''}</p>
                  </div>
                  <div className={cn('relative h-14', room.status === 'maintenance' && 'bg-rose-50/40')}>
                    {hours.map((h, i) => (
                      <div key={h} style={{ left: `${(i / hours.length) * 100}%` }} className="absolute top-0 bottom-0 border-l border-slate-100" />
                    ))}
                    {items.map(a => {
                      const s = new Date(a.starts_at);
                      const e = new Date(a.ends_at);
                      const left = Math.max(0, percent(s));
                      const width = Math.max(2, percent(e) - percent(s));
                      const name = patients.find(p => p.id === a.patient_id)?.full_name || a.patient_name || 'Paciente';
                      return (
                        <div
                          key={a.id}
                          title={`${name} • ${shortTime(a.starts_at)}–${shortTime(a.ends_at)} • ${STATUS_LABEL[a.status]}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          className="absolute top-1.5 bottom-1.5 rounded-lg bg-teal-100 border border-teal-300 text-teal-900 text-[11px] leading-tight px-1.5 py-1 overflow-hidden"
                        >
                          <span className="font-semibold">{shortTime(a.starts_at)}</span> {name.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
