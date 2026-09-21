'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Printer } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { AnamnesisAnswerValue, AnamnesisAnswers, Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { answersToRows, missingRequired, progress, questionFields, sanitizeAnswers, STATUS_LABELS } from '@/lib/anamnesis/anamnesis-utils';
import { buildEvolutionHtml } from '@/lib/evolution/evolution-utils';
import { printHtml } from '@/lib/print';
import { AnamnesisFormRenderer } from './AnamnesisFormRenderer';

interface AnamnesisResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  responseId: string | null;
  patient: Patient;
}

/** Preenchimento, leitura, edição e impressão de uma anamnese. */
export const AnamnesisResponseModal: React.FC<AnamnesisResponseModalProps> = ({ isOpen, onClose, responseId, patient }) => {
  const { anamnesisResponses, updateAnamnesisResponse, currentPsychologist } = usePsi();
  const response = anamnesisResponses.find(r => r.id === responseId) || null;

  const [answers, setAnswers] = useState<AnamnesisAnswers>({});
  const [editing, setEditing] = useState(false);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reinicia só ao abrir ou trocar de anamnese (não a cada atualização do contexto, para não apagar o que está sendo digitado).
  useEffect(() => {
    if (!isOpen || !response) return;
    setAnswers(response.answers || {});
    setEditing(response.status !== 'completed');
    setInvalidIds([]);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, responseId]);

  if (!response) return null;

  const stats = progress(response.template_snapshot, answers);
  const completed = response.status === 'completed';

  const handleChange = (fieldId: string, value: AnamnesisAnswerValue) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    setInvalidIds(prev => prev.filter(id => id !== fieldId));
  };

  const save = async (status: 'draft' | 'completed') => {
    setError('');
    const clean = sanitizeAnswers(response.template_snapshot, answers);
    if (status === 'completed') {
      const missing = questionFields(response.template_snapshot).filter(f => f.required && missingRequired([f], clean).length > 0);
      if (missing.length > 0) {
        setInvalidIds(missing.map(f => f.id));
        return setError(`Há ${missing.length} pergunta(s) obrigatória(s) sem resposta, marcadas em vermelho.`);
      }
    }
    setSaving(true);
    const result = await updateAnamnesisResponse(response.id, { answers: clean, status });
    setSaving(false);
    if (!result.ok) return setError(result.error || 'Não foi possível salvar.');
    if (status === 'completed') onClose();
    else setEditing(true);
  };

  const print = () => {
    printHtml(buildEvolutionHtml({
      mode: 'anamnesis',
      patientName: patient.full_name,
      birthDate: patient.birth_date || undefined,
      psychologistName: currentPsychologist.profile?.full_name || 'Psicólogo(a)',
      crp: currentPsychologist.crp_number ? `${currentPsychologist.crp_number}/${currentPsychologist.crp_state}` : undefined,
      generatedAt: new Date(),
      entries: [],
      anamnesis: { title: response.template_name, completedAt: response.completed_at, rows: answersToRows(response.template_snapshot, answers) },
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${response.template_name} — ${patient.full_name}`}
      description={response.filled_by === 'patient' && completed ? 'Respondida pelo próprio paciente pelo link.' : undefined}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={completed ? 'success' : response.status === 'sent' ? 'info' : 'warning'} size="sm">{STATUS_LABELS[response.status]}</Badge>
            <span className="text-xs text-slate-500">{stats.answered} de {stats.total} respondidas</span>
          </div>
          <div className="flex gap-2">
            {completed && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-xs"><Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar respostas</Button>
            )}
            <Button variant="outline" size="sm" onClick={print} className="text-xs"><Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir</Button>
          </div>
        </div>

        {response.status === 'sent' && (
          <p className="text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-xl p-3">
            Aguardando o paciente pelo link. Se preencher aqui e concluir, o link deixa de valer.
          </p>
        )}

        {editing ? (
          <AnamnesisFormRenderer schema={response.template_snapshot} answers={answers} onChange={handleChange} invalidIds={invalidIds} />
        ) : (
          <dl className="space-y-3">
            {answersToRows(response.template_snapshot, answers).map((row, i) => row.kind === 'section' ? (
              <h3 key={i} className="text-sm font-bold text-teal-800 border-b border-slate-200 pb-1 pt-3 first:pt-0">{row.label}</h3>
            ) : (
              <div key={i}>
                <dt className="text-xs font-semibold text-slate-500">{row.label}</dt>
                <dd className={row.answered ? 'text-sm text-slate-800 whitespace-pre-wrap' : 'text-sm text-slate-300'}>{row.text}</dd>
              </div>
            ))}
          </dl>
        )}

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>Fechar</Button>
          {editing && !completed && (
            <Button type="button" variant="outline" size="sm" onClick={() => save('draft')} isLoading={saving}>Salvar rascunho</Button>
          )}
          {editing && (
            <Button type="button" variant="primary" size="sm" onClick={() => save('completed')} isLoading={saving} className="font-semibold">
              {completed ? 'Salvar alterações' : 'Concluir anamnese'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
