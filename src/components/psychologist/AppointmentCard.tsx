'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronDown,
  Clock,
  DoorOpen,
  ExternalLink,
  MapPin,
  MessageSquare,
  Pencil,
  Repeat,
  Smartphone,
  UserX,
  Video,
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, AppointmentStatus } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar/calendar-utils';
import { formatDateTime } from '@/lib/utils';
import { RECURRENCE_LABELS } from '@/lib/calendar/schedule-utils';

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  canceled: 'Cancelada',
  no_show: 'Faltou',
  rescheduled: 'Remarcada',
};

export const STATUS_BADGE: Record<AppointmentStatus, 'default' | 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
  scheduled: 'default',
  confirmed: 'info',
  completed: 'success',
  canceled: 'danger',
  no_show: 'warning',
  rescheduled: 'neutral',
};

/** Status que ainda permitem ações (confirmar, concluir, cancelar). */
export const isOpenStatus = (status: AppointmentStatus) => status === 'scheduled' || status === 'confirmed';

interface AppointmentCardProps {
  appointment: Appointment;
  onSelectPatient: (patientId: string) => void;
  onEdit: (appointment: Appointment) => void;
  onWhatsApp: (appointment: Appointment) => void;
  /** Mostra só o horário (visão de um dia) em vez de data e hora. */
  compact?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onSelectPatient, onEdit, onWhatsApp, compact }) => {
  const { patients, clinicRooms, currentPsychologist, updateAppointmentStatus } = usePsi();
  const patient = patients.find(p => p.id === appointment.patient_id);
  const room = clinicRooms.find(r => r.id === appointment.room_id);
  const psychologistName = currentPsychologist.profile?.display_name || currentPsychologist.profile?.full_name;
  const open = isOpenStatus(appointment.status);
  const start = new Date(appointment.starts_at);

  const cancel = () => {
    if (!window.confirm(`Cancelar o atendimento de ${patient?.full_name || appointment.patient_name || 'paciente'}?`)) return;
    updateAppointmentStatus(appointment.id, 'canceled');
  };

  return (
    <Card className="p-4 sm:p-5 hover:shadow-card transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 border border-teal-100">
          {compact ? (
            <span>{start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          ) : (
            <>
              <span>{start.getDate()}</span>
              <span className="text-[10px] uppercase font-normal text-teal-600">
                {start.toLocaleDateString('pt-BR', { month: 'short' })}
              </span>
            </>
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-800 text-base">{patient?.full_name || appointment.patient_name || 'Paciente'}</h4>
            <Badge variant={STATUS_BADGE[appointment.status]} size="sm">{STATUS_LABEL[appointment.status]}</Badge>
            {appointment.series_id && appointment.recurrence_rule && (
              <span title={RECURRENCE_LABELS[appointment.recurrence_rule]} className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Repeat className="w-3 h-3" /> {RECURRENCE_LABELS[appointment.recurrence_rule]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              {compact
                ? `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${new Date(appointment.ends_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : formatDateTime(appointment.starts_at)}
            </span>
            <span className="capitalize flex items-center gap-1">
              {appointment.modality === 'online' ? <Video className="w-3.5 h-3.5 text-sky-600" /> : <MapPin className="w-3.5 h-3.5 text-amber-600" />}
              {appointment.modality}
            </span>
            {room && (
              <span className="flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5 text-indigo-500" /> {room.name}
              </span>
            )}
          </div>

          {appointment.location_or_link && (
            <p className="text-xs text-teal-700 font-medium truncate max-w-md">{appointment.location_or_link}</p>
          )}
          {appointment.notes && <p className="text-xs text-slate-500 italic">Obs: {appointment.notes}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        <div className="relative group/cal">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            title="Salvar no Google Agenda ou iPhone"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Salvar na Agenda</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1 hidden group-hover/cal:block z-30">
            <button
              type="button"
              onClick={() => window.open(generateGoogleCalendarUrl(appointment, psychologistName), '_blank')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Abrir no Google Agenda
            </button>
            <button
              type="button"
              onClick={() => downloadIcsFile(appointment, psychologistName)}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-700" /> iPhone / Apple (.ics)
            </button>
          </div>
        </div>

        {appointment.status === 'scheduled' && (
          <Button variant="soft" size="sm" onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')} className="text-xs">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmar
          </Button>
        )}
        {open && (
          <Button variant="primary" size="sm" onClick={() => updateAppointmentStatus(appointment.id, 'completed')} className="text-xs">
            Concluir
          </Button>
        )}
        {open && (
          <Button variant="outline" size="sm" onClick={() => updateAppointmentStatus(appointment.id, 'no_show')} className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50" title="Paciente faltou">
            <UserX className="w-3.5 h-3.5 mr-1" /> Faltou
          </Button>
        )}
        {open && (
          <Button variant="danger" size="sm" onClick={cancel} className="text-xs">
            Cancelar
          </Button>
        )}
        {(open || appointment.status === 'no_show' || appointment.status === 'canceled') && (
          <Button variant="outline" size="sm" onClick={() => onEdit(appointment)} className="text-xs" title="Editar ou remarcar">
            <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWhatsApp(appointment)}
          className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1 font-semibold"
          title="Disparar lembrete ou confirmação no WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
        </Button>
        <Button variant="outline" size="sm" onClick={() => onSelectPatient(appointment.patient_id)} className="text-xs">
          Prontuário
        </Button>
      </div>
    </Card>
  );
};

/** Texto curto "09:00" para blocos do calendário. */
export const shortTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
