'use client';

import React from 'react';
import type { AnamnesisAnswers, AnamnesisAnswerValue, AnamnesisField } from '@/types/database';
import { cn } from '@/lib/utils';

interface AnamnesisFormRendererProps {
  schema: AnamnesisField[];
  answers: AnamnesisAnswers;
  onChange: (fieldId: string, value: AnamnesisAnswerValue) => void;
  /** Ids de perguntas obrigatórias sem resposta, destacadas depois de uma tentativa de envio. */
  invalidIds?: string[];
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

/** Desenha as perguntas de um formulário de anamnese. Usado pelo psicólogo e pela página pública do paciente. */
export const AnamnesisFormRenderer: React.FC<AnamnesisFormRendererProps> = ({ schema, answers, onChange, invalidIds = [] }) => (
  <div className="space-y-5">
    {schema.map(field => {
      if (field.type === 'section') {
        return (
          <div key={field.id} className="pt-3 first:pt-0 border-b border-slate-200 pb-1.5">
            <h3 className="text-sm font-bold text-teal-800">{field.label}</h3>
            {field.description && <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>}
          </div>
        );
      }

      const value = answers[field.id];
      const invalid = invalidIds.includes(field.id);
      const inputId = `anm-${field.id}`;

      return (
        <div key={field.id} className={cn('space-y-1.5 rounded-xl', invalid && 'ring-2 ring-rose-300 p-2 -m-2')}>
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
            {field.label}
            {field.required && <span className="text-rose-600"> *</span>}
          </label>
          {field.description && <p className="text-xs text-slate-500">{field.description}</p>}

          {field.type === 'text' && (
            <input id={inputId} type="text" value={(value as string) || ''} placeholder={field.placeholder} maxLength={500} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'textarea' && (
            <textarea id={inputId} rows={3} value={(value as string) || ''} placeholder={field.placeholder} maxLength={5000} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'date' && (
            <input id={inputId} type="date" value={(value as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={`${inputClass} !w-auto`} />
          )}

          {field.type === 'boolean' && (
            <div className="flex gap-2" role="radiogroup" aria-labelledby={inputId}>
              {[{ label: 'Sim', v: true }, { label: 'Não', v: false }].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  role="radio"
                  aria-checked={value === opt.v}
                  onClick={() => onChange(field.id, value === opt.v ? null : opt.v)}
                  className={cn('px-5 py-1.5 rounded-xl border text-sm font-medium transition-colors', value === opt.v ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {field.type === 'radio' && (
            <div className="space-y-1">
              {(field.options || []).map(option => (
                <label key={option} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" name={inputId} checked={value === option} onChange={() => onChange(field.id, option)} className="w-4 h-4 border-slate-300 text-teal-600" />
                  {option}
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-1">
              {(field.options || []).map(option => {
                const selected = Array.isArray(value) ? value : [];
                return (
                  <label key={option} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={e => onChange(field.id, e.target.checked ? [...selected, option] : selected.filter(o => o !== option))}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          )}

          {field.type === 'scale_10' && (
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={inputId}>
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={value === n}
                  onClick={() => onChange(field.id, value === n ? null : n)}
                  className={cn('w-9 h-9 rounded-xl border text-sm font-semibold transition-colors', value === n ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400')}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {invalid && <p className="text-[11px] text-rose-600">Resposta obrigatória.</p>}
        </div>
      );
    })}
  </div>
);
