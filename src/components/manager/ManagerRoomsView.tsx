'use client';

import React, { useMemo, useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ClinicRoom } from '@/types/database';
import {
  DoorClosed,
  DoorOpen,
  Plus,
  Video,
  Building,
  Clock,
  User,
  Copy,
  Check,
  Pencil,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RoomFormModal } from '@/components/psychologist/RoomFormModal';
import { RoomsScheduleGrid } from '@/components/psychologist/RoomsScheduleGrid';
import { occupiesSlot } from '@/lib/calendar/schedule-utils';

const isUrl = (text: string) => /^https?:\/\//i.test(text.trim());

export const ManagerRoomsView: React.FC = () => {
  const { clinicRooms, appointments, patients, currentPsychologist, updateRoomStatus, deleteRoom } = usePsi();

  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRoom | undefined>(undefined);
  const [error, setError] = useState('');

  // Atendimento acontecendo agora em cada sala, a partir dos agendamentos reais.
  const inProgressByRoom = useMemo(() => {
    const now = Date.now();
    const map: Record<string, { patient: string; until: string; psychologist: string }> = {};
    for (const a of appointments) {
      if (!a.room_id || !occupiesSlot(a.status)) continue;
      if (new Date(a.starts_at).getTime() <= now && now < new Date(a.ends_at).getTime()) {
        const name = patients.find(p => p.id === a.patient_id)?.full_name || a.patient_name || 'Paciente';
        map[a.room_id] = {
          patient: name.split(' ').map(part => part[0]).slice(0, 2).join('.').toUpperCase() + '.',
          until: new Date(a.ends_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          psychologist: currentPsychologist.profile?.full_name || 'Psicólogo(a)',
        };
      }
    }
    return map;
  }, [appointments, patients, currentPsychologist]);

  const physicalRooms = clinicRooms.filter(r => r.type === 'physical');
  const virtualRooms = clinicRooms.filter(r => r.type === 'virtual');

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (room: ClinicRoom) => {
    setEditing(room);
    setFormOpen(true);
  };
  const remove = async (room: ClinicRoom) => {
    if (!window.confirm(`Excluir a sala "${room.name}"? Os atendimentos que a usam ficarão sem sala.`)) return;
    const result = await deleteRoom(room.id);
    setError(result.ok ? '' : result.error || 'Não foi possível excluir a sala.');
  };

  const RoomActions = ({ room }: { room: ClinicRoom }) => (
    <div className="flex items-center gap-0.5">
      <button type="button" title="Editar sala" onClick={() => openEdit(room)} className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button type="button" title="Excluir sala" onClick={() => remove(room)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DoorClosed className="w-6 h-6 text-sky-600" />
            Salas de Atendimento & Espaços Clínicos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Cadastre as salas, acompanhe a ocupação em tempo real e veja a agenda de cada espaço por horário.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openNew} className="font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova sala
        </Button>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

      {clinicRooms.length === 0 && (
        <Card className="p-8 text-center bg-white border border-dashed border-slate-200">
          <DoorClosed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">Nenhuma sala cadastrada</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Cadastre suas salas físicas e virtuais para escolher a sala ao agendar e evitar conflitos.</p>
          <Button variant="primary" size="sm" onClick={openNew} className="font-semibold">Cadastrar primeira sala</Button>
        </Card>
      )}

      {physicalRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            Salas Físicas (Presenciais)
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {physicalRooms.map(room => {
              const live = inProgressByRoom[room.id];
              const status: ClinicRoom['status'] = room.status === 'maintenance' ? 'maintenance' : live || room.status === 'occupied' ? 'occupied' : 'available';
              return (
                <Card
                  key={room.id}
                  className={`transition-all border ${
                    status === 'occupied' ? 'border-amber-200 bg-amber-50/20' : status === 'available' ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                            status === 'occupied' ? 'bg-amber-100 text-amber-800' : status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {status === 'available' ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{room.name}</h4>
                          <span className="text-[11px] text-slate-500">Capacidade: {room.capacity} pessoa(s)</span>
                        </div>
                      </div>
                      <Badge variant={status === 'available' ? 'success' : status === 'occupied' ? 'warning' : 'danger'} size="sm">
                        {status === 'available' ? 'Livre' : status === 'occupied' ? 'Em Sessão' : 'Manutenção'}
                      </Badge>
                    </div>

                    {room.description && <p className="text-xs text-slate-600 leading-relaxed">{room.description}</p>}

                    {live && (
                      <div className="p-2.5 bg-amber-100/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1 font-bold">
                          <User className="w-3.5 h-3.5" />
                          <span>{live.psychologist}</span>
                        </div>
                        <p className="text-[11px] text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Paciente: {live.patient} (em consulta até {live.until})
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{room.room_number ? `Sala #${room.room_number}` : ' '}</span>
                      <div className="flex items-center gap-1.5">
                        {room.status === 'occupied' ? (
                          <Button variant="outline" size="sm" onClick={() => updateRoomStatus(room.id, 'available')} className="text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                            Liberar Sala
                          </Button>
                        ) : room.status === 'maintenance' ? (
                          <Button variant="outline" size="sm" onClick={() => updateRoomStatus(room.id, 'available')} className="text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                            Reativar
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => updateRoomStatus(room.id, 'maintenance')} className="text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50">
                            Em manutenção
                          </Button>
                        )}
                        <RoomActions room={room} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {virtualRooms.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-sky-600" />
            Salas Virtuais (Telepsicologia)
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {virtualRooms.map(room => (
              <Card key={room.id} className="border-sky-100 bg-gradient-to-br from-sky-50/30 to-white">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{room.name}</h4>
                      {room.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{room.description}</p>}
                      {room.status === 'maintenance' && <Badge variant="danger" size="sm" className="mt-1.5">Em manutenção</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isUrl(room.description) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(room.description.trim());
                          setCopiedRoomId(room.id);
                          setTimeout(() => setCopiedRoomId(null), 2000);
                        }}
                        className="text-xs text-sky-700 border-sky-200 hover:bg-sky-50"
                      >
                        {copiedRoomId === room.id ? (
                          <><Check className="w-3.5 h-3.5 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5 mr-1" /> Copiar Link</>
                        )}
                      </Button>
                    )}
                    <RoomActions room={room} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <RoomsScheduleGrid />

      <RoomFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} room={editing} />
    </div>
  );
};
