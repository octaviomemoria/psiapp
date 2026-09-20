'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { BookingSettings, SessionModality, WeeklyHours } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { isUuid } from '@/lib/utils';
import {
  DEFAULT_WEEKLY_HOURS,
  WEEKDAY_LABELS,
  isValidSlug,
  slugify,
  validateWeeklyHours,
} from '@/lib/calendar/schedule-utils';

interface BookingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

const MODALITY_OPTIONS: { value: SessionModality; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'presencial', label: 'Presencial' },
];

// Ordem de exibição: segunda a domingo (as chaves seguem 0 = domingo).
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const BookingSettingsModal: React.FC<BookingSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentPsychologist, bookingSettings, saveBookingSettings } = usePsi();

  const [slug, setSlug] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [slotMinutes, setSlotMinutes] = useState(50);
  const [minNoticeHours, setMinNoticeHours] = useState(12);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [modalities, setModalities] = useState<SessionModality[]>(['online', 'presencial']);
  const [welcome, setWelcome] = useState('');
  const [weekly, setWeekly] = useState<WeeklyHours>(DEFAULT_WEEKLY_HOURS);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const synced = isUuid(currentPsychologist.id);

  useEffect(() => {
    if (!isOpen) return;
    const s = bookingSettings;
    const suggested = slugify(currentPsychologist.profile?.display_name || currentPsychologist.profile?.full_name || 'atendimento');
    setSlug(s?.slug || (isValidSlug(suggested) ? suggested : ''));
    setEnabled(s?.enabled ?? false);
    setSlotMinutes(s?.slot_minutes ?? currentPsychologist.session_default_duration_minutes ?? 50);
    setMinNoticeHours(s?.min_notice_hours ?? 12);
    setMaxDaysAhead(s?.max_days_ahead ?? 30);
    setModalities(s?.modalities?.length ? s.modalities : ['online', 'presencial']);
    setWelcome(s?.welcome_message || '');
    setWeekly(s?.weekly_hours && Object.keys(s.weekly_hours).length > 0 ? s.weekly_hours : DEFAULT_WEEKLY_HOURS);
    setError('');
    setCopied(false);
  }, [isOpen, bookingSettings, currentPsychologist]);

  const link = typeof window !== 'undefined' && slug ? `${window.location.origin}/agendar/${slug}` : '';

  const setWindow = (day: number, index: number, field: 'start' | 'end', value: string) =>
    setWeekly(prev => ({ ...prev, [day]: (prev[day] || []).map((w, i) => (i === index ? { ...w, [field]: value } : w)) }));

  const addWindow = (day: number) =>
    setWeekly(prev => ({ ...prev, [day]: [...(prev[day] || []), { start: '09:00', end: '12:00' }] }));

  const removeWindow = (day: number, index: number) =>
    setWeekly(prev => {
      const next = (prev[day] || []).filter((_, i) => i !== index);
      const copy = { ...prev };
      if (next.length === 0) delete copy[day];
      else copy[day] = next;
      return copy;
    });

  const toggleModality = (m: SessionModality) =>
    setModalities(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie o link:', link);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!isValidSlug(slug)) return setError('O endereço do link deve ter de 3 a 40 caracteres: letras minúsculas, números e hífen (sem hífen no início ou no fim).');
    if (modalities.length === 0) return setError('Escolha ao menos uma modalidade de atendimento.');
    const hoursError = validateWeeklyHours(weekly);
    if (hoursError) return setError(hoursError);
    if (enabled && Object.keys(weekly).length === 0) return setError('Defina ao menos um horário de atendimento para ativar o link.');
    if (!synced) return setError('Sua conta ainda não está sincronizada com o banco. Entre na sua conta e tente novamente.');

    const settings: BookingSettings = {
      psychologist_id: currentPsychologist.id,
      slug,
      enabled,
      slot_minutes: slotMinutes,
      min_notice_hours: minNoticeHours,
      max_days_ahead: maxDaysAhead,
      weekly_hours: weekly,
      modalities,
      welcome_message: welcome.trim() || null,
      timezone: 'America/Sao_Paulo',
    };
    setSaving(true);
    const result = await saveBookingSettings(settings);
    setSaving(false);
    if (!result.ok) return setError(result.error || 'Não foi possível salvar.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendamento Online"
      description="Seu link público para pacientes solicitarem horários. Você aprova cada pedido antes de ele entrar na agenda."
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {!synced && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Você está em uma conta de demonstração. O link público só funciona depois de entrar com sua conta real.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
          Receber solicitações pelo link público
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço do link</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">/agendar/</span>
            <input type="text" value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="dra-ana-lima" className={inputClass} />
          </div>
          {link && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <code className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 break-all">{link}</code>
              <Button type="button" variant="outline" size="sm" onClick={copyLink} className="text-xs">
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />} {copied ? 'Copiado' : 'Copiar'}
              </Button>
              <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Abrir
              </a>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duração da sessão (min)</label>
            <input type="number" min={15} max={180} step={5} value={slotMinutes} onChange={e => setSlotMinutes(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Antecedência mínima (horas)</label>
            <input type="number" min={0} max={720} value={minNoticeHours} onChange={e => setMinNoticeHours(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agendar até (dias à frente)</label>
            <input type="number" min={1} max={180} value={maxDaysAhead} onChange={e => setMaxDaysAhead(Number(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">Modalidades oferecidas</p>
          <div className="flex gap-4">
            {MODALITY_OPTIONS.map(m => (
              <label key={m.value} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={modalities.includes(m.value)} onChange={() => toggleModality(m.value)} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">Horários de atendimento (horário de Brasília)</p>
          <div className="space-y-2">
            {DISPLAY_ORDER.map(day => {
              const windows = weekly[day] || [];
              return (
                <div key={day} className="flex flex-wrap items-start gap-3 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="w-20 pt-2 text-xs font-semibold text-slate-700">{WEEKDAY_LABELS[day]}</span>
                  <div className="flex-1 space-y-1.5">
                    {windows.length === 0 && <span className="text-xs text-slate-400 pt-2 inline-block">Não atende</span>}
                    {windows.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="time" value={w.start} onChange={e => setWindow(day, i, 'start', e.target.value)} className={`${inputClass} !w-28`} aria-label={`${WEEKDAY_LABELS[day]} início`} />
                        <span className="text-xs text-slate-400">até</span>
                        <input type="time" value={w.end} onChange={e => setWindow(day, i, 'end', e.target.value)} className={`${inputClass} !w-28`} aria-label={`${WEEKDAY_LABELS[day]} fim`} />
                        <button type="button" onClick={() => removeWindow(day, i)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50" title="Remover janela">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addWindow(day)} className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1 pt-2">
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mensagem de boas-vindas (opcional)</label>
          <textarea value={welcome} onChange={e => setWelcome(e.target.value.slice(0, 500))} rows={2} placeholder="Ex.: Escolha o melhor horário. Respondo em até 24 horas." className={inputClass} />
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="button" variant="primary" size="sm" onClick={handleSave} isLoading={saving} className="font-semibold">Salvar configuração</Button>
        </div>
      </div>
    </Modal>
  );
};
