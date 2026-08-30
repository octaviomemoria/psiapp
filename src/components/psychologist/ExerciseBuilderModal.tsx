'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ExerciseSchemaField, ExerciseFieldType, ExerciseTemplate } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, CheckCircle, Sparkles, Layers, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ExerciseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPatientId?: string;
}

const CATEGORIES = [
  'Autoconhecimento',
  'Ansiedade',
  'Emoções',
  'Autoestima',
  'Relacionamentos',
  'Comunicação',
  'Hábitos',
  'Organização',
  'Reflexão',
  'Gratidão',
  'Pensamentos',
  'Tomada de decisão',
  'Metas',
  'Mindfulness',
];

const FIELD_TYPES: { type: ExerciseFieldType; label: string; description: string }[] = [
  { type: 'textarea', label: 'Texto Longo', description: 'Campo amplo para reflexões e relatos' },
  { type: 'text', label: 'Texto Curto', description: 'Respostas diretas de uma linha' },
  { type: 'scale_10', label: 'Escala 0 a 10', description: 'Medição de intensidade ou nota' },
  { type: 'radio', label: 'Seleção Única', description: 'Escolha de apenas 1 opção entre várias' },
  { type: 'checkbox', label: 'Múltipla Escolha', description: 'Seleção de várias opções simultâneas' },
  { type: 'mood_scale', label: 'Escala de Humor', description: 'Seletor visual de estados emocionais' },
  { type: 'checklist', label: 'Checklist de Tarefas', description: 'Itens com caixas de verificação' },
  { type: 'boolean', label: 'Verdadeiro ou Falso', description: 'Opção binária (Sim/Não)' },
];

export const ExerciseBuilderModal: React.FC<ExerciseBuilderModalProps> = ({
  isOpen,
  onClose,
  targetPatientId,
}) => {
  const { createExerciseTemplate, assignExercise, patients } = usePsi();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('Autoconhecimento');
  const [fields, setFields] = useState<ExerciseSchemaField[]>([
    {
      id: 'field-1',
      type: 'textarea',
      label: 'O que aconteceu nesta situação?',
      required: true,
      placeholder: 'Descreva detalhadamente...',
    },
    {
      id: 'field-2',
      type: 'scale_10',
      label: 'Qual a intensidade da emoção sentida (0 a 10)?',
      min: 0,
      max: 10,
      required: true,
    }
  ]);

  const [assignDirectly, setAssignDirectly] = useState(Boolean(targetPatientId));
  const [selectedPatientId, setSelectedPatientId] = useState(targetPatientId || patients[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const handleAddField = (type: ExerciseFieldType) => {
    const newField: ExerciseSchemaField = {
      id: `field-${Date.now()}`,
      type,
      label: type === 'scale_10' ? 'Classifique de 0 a 10:' : 'Pergunta ou instrução:',
      required: true,
      options: ['radio', 'checkbox', 'checklist'].includes(type) ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined,
      min: type === 'scale_10' ? 0 : undefined,
      max: type === 'scale_10' ? 10 : undefined,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUpdateField = (id: string, updates: Partial<ExerciseSchemaField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleUpdateOptions = (id: string, optionsText: string) => {
    const optionsArray = optionsText.split('\n').map(o => o.trim()).filter(Boolean);
    handleUpdateField(id, { options: optionsArray });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || fields.length === 0) return;

    const createdTemplate = createExerciseTemplate({
      title,
      description,
      instructions,
      category,
      schema_fields: fields,
      is_public_library: false,
    });

    if (assignDirectly && selectedPatientId) {
      assignExercise(selectedPatientId, createdTemplate.id, instructions, dueDate);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Construtor de Exercícios Terapêuticos"
      description="Crie atividades dinâmicas personalizadas ou novos modelos para sua biblioteca."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho do Exercício */}
        <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Exercício *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Registro de Crenças Nucleares, Diário de Autoestima..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria Terapêutica
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição / Objetivo Clínico
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Auxiliar o paciente a mapear gatilhos interpessoais e modular respostas..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Orientações para o Paciente
            </label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={2}
              placeholder="Explique ao paciente quando e como realizar este exercício de forma acolhedora..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Campos Dinâmicos do Formulário */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Perguntas e Campos do Exercício ({fields.length})
            </h4>
            <span className="text-xs text-slate-500">Adicione campos interativos abaixo</span>
          </div>

          {/* Lista de Campos já Adicionados */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {FIELD_TYPES.find(t => t.type === field.type)?.label || field.type}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remover pergunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Enunciado / Pergunta:
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => handleUpdateField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                {['radio', 'checkbox', 'checklist'].includes(field.type) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Opções (uma por linha):
                    </label>
                    <textarea
                      value={field.options?.join('\n') || ''}
                      onChange={e => handleUpdateOptions(field.id, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Seletor de Tipo de Campo para Adicionar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-2">Adicionar novo campo:</p>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map(ft => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => handleAddField(ft.type)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition-all flex items-center gap-1.5 font-medium shadow-xs"
                >
                  <Plus className="w-3 h-3 text-teal-600" />
                  {ft.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco de Atribuição Direta */}
        <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="assignDirectly"
              checked={assignDirectly}
              onChange={e => setAssignDirectly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <label htmlFor="assignDirectly" className="text-xs font-bold text-teal-900 cursor-pointer">
              Atribuir este exercício imediatamente para um paciente
            </label>
          </div>

          {assignDirectly && (
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1">
                  Selecione o Paciente:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-teal-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1">
                  Data Limite de Resposta (Prazo):
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-teal-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Salvar Exercício
          </Button>
        </div>
      </form>
    </Modal>
  );
};
