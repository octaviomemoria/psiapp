'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Repeat } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, RecurrenceRule, SessionModality } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toLocalDateTimeInput, formatDateTime } from '@/lib/utils';
import {
  Conflict,
  MAX_RECURRENCE_COUNT,
  RECURRENCE_LABELS,
  expandRecurrence,
  findConflicts,
} from '@/lib/calendar/schedule-utils';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Quando informado, edita/remarca este agendamento. */
  appointment?: Appointment;
  /** Horário sugerido ao criar (ex.: clique num dia do calendário). */
  initialStart?: Date;
  /** Paciente pré-selecionado ao criar. */
  initialPatientId?: string;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

const CONFLICT_LABEL = { psychologist: 'Você já tem atendimento neste horário', patient: 'O paciente já tem atendimento neste horário', room: 'A sala já está ocupada neste horário' };

function defaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, appointment, initialStart, initialPatientId }) => {
  const { patients, appointments, clinicRooms, currentPsychologist, addAppointment, addAppointmentSeries, updateAppointment } = usePsi();

  const [patientId, setPatientId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<SessionModality>('online');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [roomId, setRoomId] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceRule | ''>('');
  const [occurrences, setOccurrences] = useState(8);
  const [acceptConflicts, setAcceptConflicts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setAcceptConflicts(false);
    setRecurrence('');
    setOccurrences(8);
    if (appointment) {
      setPatientId(appointment.patient_id);
      setStartsAt(toLocalDateTimeInput(appointment.starts_at));
      setDurationMinutes(Math.round((new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()) / 60000));
      setModality(appointment.modality);
      setLocationOrLink(appointment.location_or_link || '');
      setRoomId(appointment.room_id || '');
      setNotes(appointment.notes || '');
    } else {
      setPatientId(initialPatientId || patients[0]?.id || '');
      setStartsAt(toLocalDateTimeInput(initialStart || defaultStart()));
      setDurationMinutes(currentPsychologist.session_default_duration_minutes || 50);
      setModality('online');
      setLocationOrLink('');
      setRoomId('');
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointment, initialStart, initialPatientId]);

  // memoizado: um `new Date()` a cada render invalidava o useMemo de conflitos abaixo em todo render
  const startDate = useMemo(() => (startsAt ? new Date(startsAt) : null), [startsAt]);
  const validStart = startDate !== null && !isNaN(startDate.getTime());
  const endIso = validStart ? new Date(startDate!.getTime() + durationMinutes * 60000).toISOString() : '';

  const conflicts = useMemo(() => {
    if (!validStart || !patientId || !(durationMinutes > 0)) return [] as { starts_at: string; list: Conflict[] }[];
    const series = !appointment && recurrence
      ? expandRecurrence(startDate!.toISOString(), endIso, recurrence, occurrences)
      : [{ starts_at: startDate!.toISOString(), ends_at: endIso }];
    return series
      .map(o => ({
        starts_at: o.starts_at,
        list: findConflicts(appointments, {
          ...o,
          psychologist_id: currentPsychologist.id,
          patient_id: patientId,
          room_id: roomId || null,
          ignoreId: appointment?.id,
        }),
      }))
      .filter(o => o.list.length > 0);
  }, [validStart, durationMinutes, patientId, roomId, recurrence, occurrences, appointment, appointments, currentPsychologist.id, endIso, startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!patientId) return setError('Selecione o paciente.');
    if (!validStart) return setError('Informe a data e o horário.');
    if (!(durationMinutes >= 5)) return setError('A duração deve ser de pelo menos 5 minutos.');
    if (conflicts.length > 0 && !acceptConflicts) return setError('Há conflito de horário. Ajuste o horário ou confirme que deseja agendar mesmo assim.');

    const patient = patients.find(p => p.id === patientId);
    setSaving(true);
    try {
      const fields = {
        patient_id: patientId,
        patient_name: patient?.full_name,
        starts_at: startDate!.toISOString(),
        ends_at: endIso,
        modality,
        location_or_link: locationOrLink.trim() || undefined,
        room_id: roomId || null,
        notes: notes.trim() || undefined,
      };

      if (appointment) {
        const result = await updateAppointment(appointment.id, fields);
        if (!result.ok) return setError(result.error || 'Não foi possível salvar.');
      } else {
        const base = { ...fields, psychologist_id: currentPsychologist.id, status: 'scheduled' as const };
        const result = recurrence ? await addAppointmentSeries(base, recurrence, occurrences) : await addAppointment(base);
        if (!result.ok) return setError(result.error || 'Não foi possível salvar.');
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const availableRooms = clinicRooms.filter(r => r.status !== 'maintenance' || r.id === roomId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Editar / Remarcar Atendimento' : 'Agendar Novo Atendimento'}
      description="Defina o paciente, horário, sala e canal da consulta."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente *</label>
          {patients.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">Cadastre um paciente antes de agendar.</p>
          ) : (
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className={inputClass} disabled={Boolean(appointment)}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Data e horário de início *</label>
            <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duração (minutos)</label>
            <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={5} max={480} step={5} className={inputClass} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Modalidade</label>
            <select value={modality} onChange={e => setModality(e.target.value as SessionModality)} className={inputClass}>
              <option value="online">Online (Telepsicologia TDIC)</option>
              <option value="presencial">Presencial no consultório</option>
              <option value="domiciliar">Domiciliar</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sala</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)} className={inputClass}>
              <option value="">Sem sala</option>
              {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}{r.status === 'maintenance' ? ' (em manutenção)' : ''}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Link da chamada ou endereço</label>
          <input type="text" value={locationOrLink} onChange={e => setLocationOrLink(e.target.value)} placeholder="https://meet.google.com/... ou endereço" className={inputClass} />
        </div>

        {!appointment && (
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-teal-600" />
              <label className="text-xs font-semibold text-slate-700">Repetir</label>
              <select value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceRule | '')} className={`${inputClass} !w-auto`}>
                <option value="">Não repetir</option>
                {(Object.keys(RECURRENCE_LABELS) as RecurrenceRule[]).map(rule => <option key={rule} value={rule}>{RECURRENCE_LABELS[rule]}</option>)}
              </select>
              {recurrence && (
                <>
                  <input type="number" value={occurrences} min={2} max={MAX_RECURRENCE_COUNT} onChange={e => setOccurrences(Math.max(2, Math.min(MAX_RECURRENCE_COUNT, Number(e.target.value) || 2)))} className={`${inputClass} !w-20`} />
                  <span className="text-xs text-slate-500">sessões no total</span>
                </>
              )}
            </div>
            {recurrence && <p className="text-[11px] text-slate-500">Cada sessão é criada como um atendimento separado; cancelar uma não afeta as outras.</p>}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Observações administrativas</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: trazer exercícios preenchidos" className={inputClass} />
        </div>

        {conflicts.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 space-y-2 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="w-4 h-4" /> Conflito de horário</p>
            <ul className="space-y-1 list-disc pl-5">
              {conflicts.slice(0, 5).map(item => (
                <li key={item.starts_at}>
                  {formatDateTime(item.starts_at)}: {[...new Set(item.list.map(c => CONFLICT_LABEL[c.kind]))].join('; ')}
                </li>
              ))}
              {conflicts.length > 5 && <li>e mais {conflicts.length - 5} data(s)</li>}
            </ul>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={acceptConflicts} onChange={e => setAcceptConflicts(e.target.checked)} className="w-4 h-4 rounded border-amber-400 text-teal-600" />
              Agendar mesmo assim
            </label>
          </div>
        )}

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="primary" size="sm" className="font-semibold" isLoading={saving} disabled={patients.length === 0}>
            {appointment ? 'Salvar alterações' : recurrence ? `Agendar ${occurrences} sessões` : 'Salvar agendamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
