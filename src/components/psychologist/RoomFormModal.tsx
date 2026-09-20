'use client';

import React, { useEffect, useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ClinicRoom } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Quando informado, edita esta sala. */
  room?: ClinicRoom;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ isOpen, onClose, room }) => {
  const { clinic, addRoom, updateRoom } = usePsi();

  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState<ClinicRoom['type']>('physical');
  const [capacity, setCapacity] = useState(1);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ClinicRoom['status']>('available');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(room?.name || '');
    setRoomNumber(room?.room_number || '');
    setType(room?.type || 'physical');
    setCapacity(room?.capacity || 1);
    setDescription(room?.description || '');
    setStatus(room?.status || 'available');
    setError('');
  }, [isOpen, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Informe o nome da sala.');
    if (!(capacity >= 1)) return setError('A capacidade deve ser de pelo menos 1 pessoa.');

    setSaving(true);
    const fields = {
      name: name.trim(),
      room_number: roomNumber.trim() || undefined,
      type,
      capacity,
      description: description.trim(),
      status,
    };
    const result = room
      ? await updateRoom(room.id, fields)
      : await addRoom({ ...fields, clinic_id: clinic?.id || '' });
    setSaving(false);
    if (!result.ok) return setError(result.error || 'Não foi possível salvar a sala.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Editar Sala' : 'Nova Sala'} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Sala 1 - Adultos" className={inputClass} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as ClinicRoom['type'])} className={inputClass}>
              <option value="physical">Física (presencial)</option>
              <option value="virtual">Virtual (teleconsulta)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
            <input type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="Ex.: 402" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Capacidade (pessoas)</label>
            <input type="number" min={1} max={100} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Situação</label>
            <select value={status} onChange={e => setStatus(e.target.value as ClinicRoom['status'])} className={inputClass}>
              <option value="available">Disponível</option>
              <option value="maintenance">Em manutenção</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / recursos</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder={type === 'virtual' ? 'Cole aqui o link da sala virtual (https://...)' : 'Ex.: divã, ar-condicionado, ludoteca'}
              className={inputClass}
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="primary" size="sm" className="font-semibold" isLoading={saving}>
            {room ? 'Salvar alterações' : 'Criar sala'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
