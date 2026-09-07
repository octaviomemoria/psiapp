'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ClinicRoom } from '@/types/database';
import {
  DoorClosed,
  DoorOpen,
  Plus,
  Video,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export const ManagerRoomsView: React.FC = () => {
  const { clinicRooms, clinicPsychologists, updateRoomStatus } = usePsi();

  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<ClinicRoom | null>(null);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);

  const physicalRooms = clinicRooms.filter(r => r.type === 'physical');
  const virtualRooms = clinicRooms.filter(r => r.type === 'virtual');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DoorClosed className="w-6 h-6 text-sky-600" />
            Salas de Atendimento & Espaços Clínicos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitore a ocupação em tempo real das salas físicas de consulta e dos links corporativos de telepsicologia.
          </p>
        </div>
      </div>

      {/* Seção 1: Salas Físicas do Consultório */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-600" />
          Salas Físicas (Presenciais)
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {physicalRooms.map(room => (
            <Card
              key={room.id}
              className={`transition-all border ${
                room.status === 'occupied'
                  ? 'border-amber-200 bg-amber-50/20'
                  : room.status === 'available'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        room.status === 'occupied'
                          ? 'bg-amber-100 text-amber-800'
                          : room.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {room.status === 'available' ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{room.name}</h4>
                      <span className="text-[11px] text-slate-500">Capacidade: {room.capacity} pessoas</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      room.status === 'available'
                        ? 'success'
                        : room.status === 'occupied'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {room.status === 'available'
                      ? 'Livre'
                      : room.status === 'occupied'
                      ? 'Em Sessão'
                      : 'Manutenção'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{room.description}</p>

                {room.current_session_info && (
                  <div className="p-2.5 bg-amber-100/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>{room.current_session_info.psychologist_name}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Paciente: {room.current_session_info.patient_initials} (em consulta até {room.current_session_info.until})
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Sala #{room.room_number}</span>
                  <div className="flex items-center gap-1.5">
                    {room.status === 'occupied' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, 'available')}
                        className="text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        Liberar Sala
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, 'occupied', {
                          psychologist_name: clinicPsychologists[0]?.full_name || 'Psicólogo(a)',
                          patient_initials: 'P.C.',
                          until: '18:00'
                        })}
                        className="text-[11px] text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      >
                        Marcar Ocupada
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seção 2: Salas Virtuais de Teleconsulta */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Video className="w-4 h-4 text-sky-600" />
          Salas Virtuais (Telepsicologia Criptografada)
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {virtualRooms.map(room => (
            <Card key={room.id} className="border-sky-100 bg-gradient-to-br from-sky-50/30 to-white">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{room.description}</p>
                    <Badge variant="info" size="sm" className="mt-1.5">
                      Link Corporativo Ativo
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = `https://meet.google.com/${room.name.toLowerCase().replace(/\s+/g, '-')}`;
                    navigator.clipboard.writeText(link);
                    setCopiedRoomId(room.id);
                    setTimeout(() => setCopiedRoomId(null), 2000);
                  }}
                  className="text-xs text-sky-700 border-sky-200 hover:bg-sky-50 flex-shrink-0"
                >
                  {copiedRoomId === room.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copiar Link
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
