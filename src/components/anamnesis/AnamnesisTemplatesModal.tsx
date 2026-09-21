'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { AnamnesisField, AnamnesisFieldType, AnamnesisTemplate } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FIELD_TYPE_LABELS, allTemplates, cloneTemplate, newFieldId, questionFields, validateTemplate } from '@/lib/anamnesis/anamnesis-utils';
import { newUuid } from '@/lib/utils';

interface AnamnesisTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

/** Lista de modelos (padrão e personalizados) e editor de modelo. */
export const AnamnesisTemplatesModal: React.FC<AnamnesisTemplatesModalProps> = ({ isOpen, onClose }) => {
  const { anamnesisTemplates, saveAnamnesisTemplate, deleteAnamnesisTemplate } = usePsi();
  const [draft, setDraft] = useState<AnamnesisTemplate | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    setDraft(null);
    setError('');
    onClose();
  };

  const startNew = () => {
    setError('');
    setDraft({
      id: newUuid(), name: '', category: 'Personalizado', description: '',
      schema: [{ id: 'q_1', type: 'section', label: 'Nova seção' }, { id: 'q_2', type: 'textarea', label: '' }],
    });
  };

  const duplicate = (template: AnamnesisTemplate) => {
    setError('');
    setDraft(cloneTemplate(template, `${template.name} (cópia)`, newUuid()));
  };

  const remove = async (template: AnamnesisTemplate) => {
    if (!window.confirm(`Excluir o modelo "${template.name}"? Anamneses já feitas com ele não mudam.`)) return;
    const result = await deleteAnamnesisTemplate(template.id);
    setError(result.ok ? '' : result.error || 'Não foi possível excluir.');
  };

  const setField = (index: number, patch: Partial<AnamnesisField>) =>
    setDraft(d => d && ({ ...d, schema: d.schema.map((f, i) => (i === index ? { ...f, ...patch } : f)) }));

  const addField = (type: AnamnesisFieldType) =>
    setDraft(d => d && ({
      ...d,
      schema: [...d.schema, {
        id: newFieldId(d.schema), type, label: type === 'section' ? 'Nova seção' : '',
        ...(type === 'radio' || type === 'checkbox' ? { options: ['Opção 1', 'Opção 2'] } : {}),
      }],
    }));

  const move = (index: number, delta: -1 | 1) =>
    setDraft(d => {
      if (!d) return d;
      const target = index + delta;
      if (target < 0 || target >= d.schema.length) return d;
      const schema = [...d.schema];
      [schema[index], schema[target]] = [schema[target], schema[index]];
      return { ...d, schema };
    });

  const removeField = (index: number) => setDraft(d => d && ({ ...d, schema: d.schema.filter((_, i) => i !== index) }));

  const save = async () => {
    if (!draft) return;
    const cleaned: AnamnesisTemplate = {
      ...draft,
      name: draft.name.trim(),
      schema: draft.schema.map(f => ({
        ...f,
        label: f.label.trim(),
        options: f.options ? f.options.map(o => o.trim()).filter(Boolean) : undefined,
      })),
    };
    const problem = validateTemplate(cleaned);
    if (problem) return setError(problem);
    setSaving(true);
    const result = await saveAnamnesisTemplate(cleaned);
    setSaving(false);
    if (!result.ok) return setError(result.error || 'Não foi possível salvar o modelo.');
    setDraft(null);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={draft ? (anamnesisTemplates.some(t => t.id === draft.id) ? 'Editar modelo' : 'Novo modelo') : 'Modelos de anamnese'}
      description={draft ? undefined : 'Os modelos padrão não podem ser alterados, mas você pode duplicá-los e adaptar.'}
      maxWidth="3xl"
    >
      {!draft ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={startNew} className="font-semibold"><Plus className="w-4 h-4 mr-1.5" /> Novo modelo</Button>
          </div>
          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {allTemplates(anamnesisTemplates).map(t => (
              <li key={t.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                    {t.name}
                    <Badge variant={t.is_system ? 'neutral' : 'info'} size="sm">{t.is_system ? 'Padrão' : 'Personalizado'}</Badge>
                  </p>
                  <p className="text-xs text-slate-500">{questionFields(t.schema).length} perguntas{t.description ? ` • ${t.description}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" title="Duplicar" onClick={() => duplicate(t)} className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50"><Copy className="w-4 h-4" /></button>
                  {!t.is_system && (
                    <>
                      <button type="button" title="Editar" onClick={() => { setError(''); setDraft(t); }} className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50"><Pencil className="w-4 h-4" /></button>
                      <button type="button" title="Excluir" onClick={() => remove(t)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do modelo *</label>
              <input type="text" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputClass} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
              <input type="text" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição (opcional)</label>
              <input type="text" value={draft.description || ''} onChange={e => setDraft({ ...draft, description: e.target.value })} className={inputClass} />
            </div>
          </div>

          <ol className="space-y-2">
            {draft.schema.map((field, index) => (
              <li key={field.id} className={`rounded-xl border p-3 space-y-2 ${field.type === 'section' ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={field.type} onChange={e => setField(index, { type: e.target.value as AnamnesisFieldType, ...(e.target.value === 'radio' || e.target.value === 'checkbox' ? { options: field.options?.length ? field.options : ['Opção 1', 'Opção 2'] } : {}) })} className={`${inputClass} !w-auto`} aria-label="Tipo">
                    {(Object.keys(FIELD_TYPE_LABELS) as AnamnesisFieldType[]).map(t => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                  </select>
                  <input type="text" value={field.label} onChange={e => setField(index, { label: e.target.value })} placeholder={field.type === 'section' ? 'Título da seção' : 'Texto da pergunta'} className={`${inputClass} flex-1 min-w-[200px]`} aria-label="Texto" />
                  <span className="flex items-center gap-0.5">
                    <button type="button" title="Subir" onClick={() => move(index, -1)} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" title="Descer" onClick={() => move(index, 1)} disabled={index === draft.schema.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    <button type="button" title="Remover" onClick={() => removeField(index)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </span>
                </div>
                {(field.type === 'radio' || field.type === 'checkbox') && (
                  <textarea
                    value={(field.options || []).join('\n')}
                    onChange={e => setField(index, { options: e.target.value.split('\n') })}
                    rows={3}
                    placeholder="Uma opção por linha"
                    className={inputClass}
                    aria-label="Opções"
                  />
                )}
                {field.type !== 'section' && (
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={Boolean(field.required)} onChange={e => setField(index, { required: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
                    Resposta obrigatória
                  </label>
                )}
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Adicionar:</span>
            {(['section', 'text', 'textarea', 'boolean', 'radio', 'checkbox', 'scale_10', 'date'] as AnamnesisFieldType[]).map(t => (
              <button key={t} type="button" onClick={() => addField(t)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 hover:border-teal-400 hover:text-teal-700">
                + {FIELD_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => { setDraft(null); setError(''); }} disabled={saving}>Voltar</Button>
            <Button variant="primary" size="sm" onClick={save} isLoading={saving} className="font-semibold">Salvar modelo</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
