'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Inbox, Mail, MessageSquare, Phone, X } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { Appointment, BookingRequest } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { findConflicts } from '@/lib/calendar/schedule-utils';

interface BookingRequestsPanelProps {
  /** Chamado depois de aprovar, para o pai oferecer o aviso ao paciente. */
  onApproved: (appointment: Appointment) => void;
  onOpenSettings: () => void;
}

const STATUS = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  approved: { label: 'Aprovada', variant: 'success' as const },
  declined: { label: 'Recusada', variant: 'danger' as const },
  canceled: { label: 'Cancelada', variant: 'neutral' as const },
};

export const BookingRequestsPanel: React.FC<BookingRequestsPanelProps> = ({ onApproved, onOpenSettings }) => {
  const { bookingRequests, bookingSettings, appointments, clinicRooms, currentPsychologist, approveBookingRequest, declineBookingRequest } = usePsi();
  const [rooms, setRooms] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { pending, history } = useMemo(() => {
    const sorted = [...bookingRequests].sort((a, b) => new Date(a.requested_start).getTime() - new Date(b.requested_start).getTime());
    return {
      pending: sorted.filter(r => r.status === 'pending'),
      history: sorted.filter(r => r.status !== 'pending').reverse().slice(0, 10),
    };
  }, [bookingRequests]);

  const hasConflict = (r: BookingRequest) =>
    findConflicts(appointments, {
      starts_at: r.requested_start,
      ends_at: r.requested_end,
      psychologist_id: currentPsychologist.id,
      room_id: rooms[r.id] || null,
    }).length > 0;

  const approve = async (request: BookingRequest) => {
    setBusyId(request.id);
    setErrors(prev => ({ ...prev, [request.id]: '' }));
    const result = await approveBookingRequest(request.id, { room_id: rooms[request.id] || null });
    setBusyId(null);
    if (!result.ok || !result.data) {
      setErrors(prev => ({ ...prev, [request.id]: result.error || 'Não foi possível aprovar.' }));
      return;
    }
    onApproved(result.data);
  };

  const decline = async (request: BookingRequest) => {
    const reason = window.prompt(`Recusar a solicitação de ${request.patient_name}? Se quiser, informe o motivo (opcional):`, '');
    if (reason === null) return;
    setBusyId(request.id);
    const result = await declineBookingRequest(request.id, reason);
    setBusyId(null);
    if (!result.ok) setErrors(prev => ({ ...prev, [request.id]: result.error || 'Não foi possível recusar.' }));
  };

  return (
    <div className="space-y-4">
      {!bookingSettings?.enabled && (
        <Card className="p-4 bg-amber-50 border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
          <span>O link de agendamento online está desativado, então você não receberá novas solicitações.</span>
          <Button variant="outline" size="sm" onClick={onOpenSettings} className="text-xs">Configurar agendamento online</Button>
        </Card>
      )}

      {pending.length === 0 ? (
        <Card className="p-8 text-center bg-white">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-slate-700">Nenhuma solicitação pendente</h4>
          <p className="text-xs text-slate-500 mt-1">Quando alguém pedir um horário pelo seu link, o pedido aparece aqui.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map(request => (
            <Card key={request.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{request.patient_name}</h4>
                    <Badge variant={STATUS.pending.variant} size="sm">{STATUS.pending.label}</Badge>
                  </div>
                  <p className="text-sm font-medium text-teal-700">{formatDateTime(request.requested_start)} • <span className="capitalize">{request.modality}</span></p>
                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{request.email}</span>
                    {request.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{request.phone}</span>}
                  </p>
                  {request.message && (
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" /> {request.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {clinicRooms.length > 0 && (
                    <select
                      value={rooms[request.id] || ''}
                      onChange={e => setRooms(prev => ({ ...prev, [request.id]: e.target.value }))}
                      aria-label="Sala"
                      className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Sem sala</option>
                      {clinicRooms.filter(r => r.status !== 'maintenance').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  )}
                  <Button variant="primary" size="sm" onClick={() => approve(request)} isLoading={busyId === request.id} disabled={busyId !== null || hasConflict(request)} className="text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 mr-1" /> Aprovar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => decline(request)} disabled={busyId !== null} className="text-xs">
                    <X className="w-3.5 h-3.5 mr-1" /> Recusar
                  </Button>
                </div>
              </div>

              {hasConflict(request) && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Este horário já está ocupado na sua agenda (ou a sala escolhida está em uso). Não é possível aprovar.
                </p>
              )}
              {errors[request.id] && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">{errors[request.id]}</p>}
            </Card>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Respondidas recentemente</h3>
          <Card className="divide-y divide-slate-100">
            {history.map(r => (
              <div key={r.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-700">{r.patient_name} <span className="text-slate-400">• {formatDateTime(r.requested_start)}</span></span>
                <span className="flex items-center gap-2">
                  {r.decline_reason && <span className="text-slate-400 italic">{r.decline_reason}</span>}
                  <Badge variant={STATUS[r.status].variant} size="sm">{STATUS[r.status].label}</Badge>
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};
