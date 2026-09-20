'use client';

import React, { useState } from 'react';
import { DoorClosed, DoorOpen, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { ClinicRoom } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RoomFormModal } from './RoomFormModal';
import { RoomsScheduleGrid } from './RoomsScheduleGrid';

/** Aba "Salas" da agenda: cadastro das salas do psicólogo e a ocupação delas por horário. */
export const RoomsAgendaView: React.FC = () => {
  const { clinicRooms, deleteRoom } = usePsi();
  const [editing, setEditing] = useState<ClinicRoom | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');

  const remove = async (room: ClinicRoom) => {
    if (!window.confirm(`Excluir a sala "${room.name}"? Os atendimentos que a usam ficarão sem sala.`)) return;
    const result = await deleteRoom(room.id);
    setError(result.ok ? '' : result.error || 'Não foi possível excluir a sala.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Cadastre as salas do seu consultório para evitar dois atendimentos no mesmo espaço.</p>
        <Button variant="primary" size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }} className="font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> Nova sala
        </Button>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

      {clinicRooms.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clinicRooms.map(room => (
            <Card key={room.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  {room.type === 'virtual' ? <Video className="w-5 h-5" /> : room.status === 'maintenance' ? <DoorClosed className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 truncate">{room.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {room.type === 'virtual' ? 'Virtual' : 'Física'}{room.room_number ? ` • nº ${room.room_number}` : ''} • {room.capacity} pessoa(s)
                  </p>
                  {room.status === 'maintenance' && <Badge variant="danger" size="sm" className="mt-1">Em manutenção</Badge>}
                  {room.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" title="Editar sala" onClick={() => { setEditing(room); setFormOpen(true); }} className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" title="Excluir sala" onClick={() => remove(room)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoomsScheduleGrid />

      <RoomFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} room={editing} />
    </div>
  );
};
