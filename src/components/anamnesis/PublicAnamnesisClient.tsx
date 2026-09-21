'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { AnamnesisAnswers, AnamnesisAnswerValue } from '@/types/database';
import { PublicAnamnesisForm, getAnamnesisByToken, submitAnamnesisByToken } from '@/lib/supabase/public-anamnesis';
import { missingRequired, progress, questionFields, sanitizeAnswers } from '@/lib/anamnesis/anamnesis-utils';
import { AnamnesisFormRenderer } from './AnamnesisFormRenderer';

export const PublicAnamnesisClient: React.FC<{ token: string }> = ({ token }) => {
  const [form, setForm] = useState<PublicAnamnesisForm | null | 'error' | 'loading'>('loading');
  const [answers, setAnswers] = useState<AnamnesisAnswers>({});
  const [consent, setConsent] = useState(false);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    getAnamnesisByToken(token).then(result => { if (active) setForm(result); });
    return () => { active = false; };
  }, [token]);

  const data = form !== 'loading' && form !== 'error' && form ? form : null;
  const stats = useMemo(() => (data ? progress(data.template_snapshot, answers) : { answered: 0, total: 0 }), [data, answers]);

  const shell = (content: React.ReactNode) => (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">{content}</div>
    </main>
  );

  const message = (title: string, text: string) => shell(
    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-center space-y-2">
      <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );

  if (form === 'loading') {
    return shell(<p className="flex items-center justify-center gap-2 text-sm text-slate-500 py-20"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</p>);
  }
  if (form === 'error') return message('Não foi possível carregar o formulário', 'Verifique sua conexão e tente novamente em instantes.');
  if (!data) return message('Link indisponível', 'Este link não existe, já foi usado ou venceu. Peça um novo link ao seu psicólogo(a).');

  if (done) {
    return shell(
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-soft p-8 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Anamnese enviada!</h1>
        <p className="text-sm text-slate-600">Obrigado, {data.patient_first_name}. Suas respostas foram enviadas para {data.psychologist_name}. Você já pode fechar esta página.</p>
        <p className="text-xs text-slate-500">Por segurança, este link não pode ser usado novamente.</p>
      </div>
    );
  }

  const handleChange = (fieldId: string, value: AnamnesisAnswerValue) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    setInvalidIds(prev => prev.filter(id => id !== fieldId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = sanitizeAnswers(data.template_snapshot, answers);
    const missing = questionFields(data.template_snapshot).filter(f => f.required && missingRequired([f], clean).length > 0);
    if (missing.length > 0) {
      setInvalidIds(missing.map(f => f.id));
      return setError(`Responda as perguntas obrigatórias (${missing.length}) marcadas em vermelho.`);
    }
    if (!consent) return setError('É necessário concordar com o envio das informações para continuar.');

    setSubmitting(true);
    const result = await submitAnamnesisByToken(token, clean);
    setSubmitting(false);
    if (result === 'ok') return setDone(true);
    setError(result === 'invalid_link'
      ? 'Este link não é mais válido (já foi usado ou venceu). Peça um novo link ao seu psicólogo(a).'
      : 'Não foi possível enviar agora. Verifique sua conexão e tente novamente; suas respostas continuam nesta página.');
  };

  return shell(
    <>
      <header className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{data.template_name}</p>
        <h1 className="text-2xl font-bold text-slate-800">Olá, {data.patient_first_name}</h1>
        <p className="text-sm text-slate-600">
          {data.psychologist_name} pediu que você preencha este formulário antes de começar. Responda no seu ritmo; quanto mais completo, melhor o atendimento.
        </p>
        <p className="text-xs text-slate-400 pt-1">{stats.answered} de {stats.total} perguntas respondidas</p>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-teal-500 transition-all" style={{ width: `${stats.total ? (stats.answered / stats.total) * 100 : 0}%` }} />
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-6">
        <AnamnesisFormRenderer schema={data.template_snapshot} answers={answers} onChange={handleChange} invalidIds={invalidIds} />

        <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer border-t border-slate-100 pt-4">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600" />
          <span>
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
            Concordo em compartilhar estas informações de saúde com {data.psychologist_name}, que as manterá em sigilo, conforme a{' '}
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
          Enviar anamnese
        </button>
        <p className="text-[11px] text-slate-400 text-center">Depois do envio, o link deixa de funcionar.</p>
      </form>
    </>
  );
};
