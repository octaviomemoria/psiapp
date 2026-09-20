'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import {
  BookingSlot,
  addDaysToDateKey,
  brazilLocalToIso,
  formatBrazilTime,
  generateSlots,
  todayInBrazil,
} from '@/lib/calendar/schedule-utils';
import {
  PublicBookingInfo,
  createBookingRequest,
  describeBookingError,
  getPublicBookingInfo,
  getPublicBusySlots,
} from '@/lib/supabase/public-booking';
import { formatPhone, isValidPhone } from '@/lib/utils/masks';
import { SessionModality } from '@/types/database';
import { cn } from '@/lib/utils';

const DAYS_PER_PAGE = 14;

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

const MODALITY_LABEL: Record<string, string> = { online: 'Online (videochamada)', presencial: 'Presencial', domiciliar: 'Domiciliar' };

/** "2026-09-21" -> "seg., 21 de set." (dia de calendário, sem depender do fuso do visitante). */
function formatDayLabel(key: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...options }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const PublicBookingClient: React.FC<{ slug: string }> = ({ slug }) => {
  const [info, setInfo] = useState<PublicBookingInfo | null | 'error' | 'loading'>('loading');
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [busy, setBusy] = useState<{ start: string; end: string }[] | null>([]);
  const [busyLoading, setBusyLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [modality, setModality] = useState<SessionModality>('online');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // isca para robôs: pessoas não veem nem preenchem
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<BookingSlot | null>(null);

  useEffect(() => {
    let active = true;
    getPublicBookingInfo(slug).then(result => {
      if (!active) return;
      setInfo(result);
      if (result && result !== 'error' && result.modalities.length > 0) setModality(result.modalities[0]);
    });
    return () => { active = false; };
  }, [slug]);

  const data = info !== 'loading' && info !== 'error' && info ? info : null;

  const days = useMemo(() => {
    if (!data) return [];
    const today = todayInBrazil();
    return Array.from({ length: data.max_days_ahead + 1 }, (_, i) => addDaysToDateKey(today, i)).filter(day => {
      const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
      return (data.weekly_hours[String(weekday)] || []).length > 0;
    });
  }, [data]);

  const pageDays = days.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE);

  // Busca os horários ocupados do dia escolhido (só intervalos, sem dados de ninguém).
  useEffect(() => {
    if (!selectedDate || !data) return;
    let active = true;
    setBusyLoading(true);
    setSelectedSlot(null);
    getPublicBusySlots(slug, brazilLocalToIso(selectedDate, 0), brazilLocalToIso(addDaysToDateKey(selectedDate, 1), 0)).then(result => {
      if (!active) return;
      setBusy(result);
      setBusyLoading(false);
    });
    return () => { active = false; };
  }, [selectedDate, slug, data]);

  const slots = useMemo(() => {
    if (!data || !selectedDate || busy === null) return [];
    return generateSlots({
      date: selectedDate,
      weeklyHours: data.weekly_hours,
      slotMinutes: data.slot_minutes,
      busy,
      minNoticeHours: data.min_notice_hours,
      maxDaysAhead: data.max_days_ahead,
    });
  }, [data, selectedDate, busy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedSlot) return setError('Escolha um horário.');
    if (name.trim().length < 2) return setError('Informe seu nome completo.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Informe um e-mail válido.');
    if (phone && !isValidPhone(phone)) return setError('Telefone inválido. Use DDD + número.');
    if (!consent) return setError('É necessário concordar com o uso dos dados para enviar a solicitação.');

    // Robô preencheu o campo escondido: finge sucesso sem enviar nada.
    if (website) return setDone(selectedSlot);

    setSubmitting(true);
    const result = await createBookingRequest({
      slug,
      name: name.trim(),
      email: email.trim(),
      phone,
      startsAt: selectedSlot.starts_at,
      modality,
      message: message.trim(),
    });
    setSubmitting(false);

    if (result.ok) return setDone(selectedSlot);
    setError(describeBookingError(result.code));
    if (result.code === 'slot_taken' || result.code === 'outside_hours') {
      // Recarrega os horários do dia para a pessoa escolher outro.
      const day = selectedDate;
      setSelectedDate('');
      setTimeout(() => setSelectedDate(day), 0);
    }
  };

  const shell = (content: React.ReactNode) => (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">{content}</div>
    </main>
  );

  if (info === 'loading') {
    return shell(<p className="flex items-center justify-center gap-2 text-sm text-slate-500 py-20"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</p>);
  }

  if (info === 'error') {
    return shell(
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-center space-y-2">
        <h1 className="text-lg font-bold text-slate-800">Não foi possível carregar a agenda</h1>
        <p className="text-sm text-slate-500">Verifique sua conexão e tente novamente em instantes.</p>
      </div>
    );
  }

  if (!data) {
    return shell(
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-center space-y-2">
        <h1 className="text-lg font-bold text-slate-800">Link de agendamento indisponível</h1>
        <p className="text-sm text-slate-500">Este endereço não existe ou o profissional desativou o agendamento online.</p>
      </div>
    );
  }

  if (done) {
    return shell(
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-soft p-8 text-center space-y-3">
        <CalendarCheck className="w-10 h-10 text-emerald-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Solicitação enviada!</h1>
        <p className="text-sm text-slate-600">
          Você pediu o horário de <strong>{formatDayLabel(selectedDate, { weekday: 'long', day: '2-digit', month: 'long' })}</strong> às{' '}
          <strong>{formatBrazilTime(done.starts_at)}</strong> com {data.psychologist_name}.
        </p>
        <p className="text-xs text-slate-500">
          O horário ainda <strong>não está confirmado</strong>. O profissional vai analisar o pedido e entrar em contato pelo e-mail ou telefone informado.
        </p>
      </div>
    );
  }

  return shell(
    <>
      <header className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Agendamento online</p>
        <h1 className="text-2xl font-bold text-slate-800">{data.psychologist_name}</h1>
        <p className="text-xs text-slate-500">CRP {data.crp} • sessões de {data.slot_minutes} minutos</p>
        {data.welcome_message && <p className="text-sm text-slate-600 pt-2">{data.welcome_message}</p>}
      </header>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">1. Escolha o dia</h2>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Dias anteriores"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * DAYS_PER_PAGE >= days.length} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Próximos dias"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {pageDays.length === 0 ? (
          <p className="text-sm text-slate-500">Não há dias disponíveis no momento.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {pageDays.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'px-2 py-2.5 rounded-xl border text-center transition-colors',
                  selectedDate === day ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400'
                )}
              >
                <span className="block text-[11px] uppercase opacity-80">{formatDayLabel(day, { weekday: 'short' })}</span>
                <span className="block text-sm font-bold">{formatDayLabel(day, { day: '2-digit', month: 'short' })}</span>
              </button>
            ))}
          </div>
        )}

        {selectedDate && (
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-800">2. Escolha o horário <span className="font-normal text-slate-400">(horário de Brasília)</span></h2>
            {busyLoading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Buscando horários…</p>
            ) : busy === null ? (
              <p className="text-sm text-rose-600">Não foi possível consultar os horários. Tente novamente.</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum horário livre neste dia. Escolha outra data.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.starts_at}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-semibold transition-colors',
                      selectedSlot?.starts_at === slot.starts_at ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400'
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {selectedSlot && (
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">3. Seus dados</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Celular / WhatsApp</label>
              <input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" className={inputClass} />
            </div>
          </div>
          {data.modalities.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modalidade</label>
              <select value={modality} onChange={e => setModality(e.target.value as SessionModality)} className={inputClass}>
                {data.modalities.map(m => <option key={m} value={m}>{MODALITY_LABEL[m] || m}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mensagem (opcional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 1000))} rows={3} placeholder="Se quiser, conte brevemente o motivo do contato." className={inputClass} />
            <p className="text-[11px] text-slate-400 mt-1">Evite informar dados de saúde detalhados aqui. Eles podem ser tratados na primeira sessão.</p>
          </div>

          {/* Campo isca: escondido de pessoas, robôs costumam preenchê-lo. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Site <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600" />
            <span>
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
              Concordo em enviar meus dados ao profissional para fins de agendamento, conforme a{' '}
              <Link href="/privacidade" target="_blank" className="text-teal-700 underline">Política de Privacidade</Link>.
            </span>
          </label>

          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Solicitar {formatDayLabel(selectedDate, { day: '2-digit', month: '2-digit' })} às {selectedSlot.label}
          </button>
          <p className="text-[11px] text-slate-400 text-center">A solicitação só vira consulta depois que o profissional confirmar.</p>
        </form>
      )}
    </>
  );
};
