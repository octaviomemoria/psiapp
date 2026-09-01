'use client';

import React, { useState } from 'react';
import { ExerciseTemplate } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye, ClipboardList, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface ExercisePreviewModalProps {
  template: ExerciseTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (template: ExerciseTemplate) => void;
}

export const ExercisePreviewModal: React.FC<ExercisePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onAssign
}) => {
  const [sampleResponses, setSampleResponses] = useState<Record<string, any>>({});

  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pré-visualização: ${template.title}`}
      description="Veja como este exercício será apresentado na tela e no celular do seu paciente."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Cabeçalho do Modelo */}
        <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="default" size="sm">
              {template.category}
            </Badge>
            <span className="text-[10px] text-teal-800 font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              Modo Demonstração Interativo
            </span>
          </div>

          <h3 className="font-bold text-teal-950 text-sm">{template.title}</h3>
          <p className="text-teal-900 leading-relaxed">{template.description}</p>

          {template.instructions && (
            <div className="pt-2 border-t border-teal-200/60 text-[11px] text-teal-800">
              <strong>Instruções padrão:</strong> {template.instructions}
            </div>
          )}
        </div>

        {/* Campos Interativos do Exercício */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Etapas / Campos que o Paciente irá Preencher:
          </h4>

          {template.schema_fields.map((field, idx) => (
            <div key={field.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="block font-bold text-slate-800 text-xs">
                {idx + 1}. {field.label} {field.required && <span className="text-teal-600">*</span>}
              </label>

              {field.type === 'textarea' && (
                <textarea
                  rows={2}
                  placeholder={field.placeholder || 'Campo de texto livre do paciente...'}
                  value={sampleResponses[field.id] || ''}
                  onChange={e => setSampleResponses({ ...sampleResponses, [field.id]: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              )}

              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder || 'Resposta curta...'}
                  value={sampleResponses[field.id] || ''}
                  onChange={e => setSampleResponses({ ...sampleResponses, [field.id]: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              )}

              {field.type === 'scale_10' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between font-bold text-teal-800 text-[11px]">
                    <span>Intensidade selecionada:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                      {sampleResponses[field.id] !== undefined ? sampleResponses[field.id] : 5} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={sampleResponses[field.id] !== undefined ? sampleResponses[field.id] : 5}
                    onChange={e => setSampleResponses({ ...sampleResponses, [field.id]: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 (Mínimo)</span>
                    <span>5 (Moderado)</span>
                    <span>10 (Máximo)</span>
                  </div>
                </div>
              )}

              {field.type === 'radio' && field.options && (
                <div className="space-y-1.5 pt-1">
                  {field.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`preview-${field.id}`}
                        checked={sampleResponses[field.id] === opt}
                        onChange={() => setSampleResponses({ ...sampleResponses, [field.id]: opt })}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'checkbox' && field.options && (
                <div className="space-y-1.5 pt-1">
                  {field.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Array.isArray(sampleResponses[field.id]) && sampleResponses[field.id].includes(opt)}
                        onChange={() => {
                          const current = Array.isArray(sampleResponses[field.id]) ? sampleResponses[field.id] : [];
                          const updated = current.includes(opt) ? current.filter((x: string) => x !== opt) : [...current, opt];
                          setSampleResponses({ ...sampleResponses, [field.id]: updated });
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fechar Pré-visualização
          </Button>

          {onAssign && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onAssign(template);
              }}
              className="bg-teal-600 hover:bg-teal-700 font-bold flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Atribuir a um Paciente</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
