'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { ExerciseTemplate } from '@/types/database';
import {
  BookOpen,
  ClipboardList,
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  Headphones,
  File,
  CheckCircle2,
  ExternalLink,
  Layers,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ExerciseBuilderModal } from './ExerciseBuilderModal';
import { ExercisePreviewModal } from './ExercisePreviewModal';

export const LibraryView: React.FC = () => {
  const {
    exerciseTemplates,
    contentItems,
    patients,
    assignExercise,
    assignContentToPatient,
  } = usePsi();

  const [activeTab, setActiveTab] = useState<'exercises' | 'contents'>('exercises');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExerciseBuilderOpen, setIsExerciseBuilderOpen] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<ExerciseTemplate | null>(null);

  // Modal Atribuir para Paciente
  const [assigningTemplateId, setAssigningTemplateId] = useState<string | null>(null);
  const [assigningContentId, setAssigningContentId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [customInstructions, setCustomInstructions] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const categories = [
    'all',
    'TCC',
    'ACT',
    'DBT',
    'CFT / Esquema',
    'Neuropsicologia & Sensorial',
    'Psicologia Positiva',
    'Mindfulness',
    'Ansiedade',
    'Relacionamentos'
  ];

  const filteredExercises = exerciseTemplates.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredContents = contentItems.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleConfirmAssignExercise = () => {
    if (!assigningTemplateId || !selectedPatientId) return;
    assignExercise(selectedPatientId, assigningTemplateId, customInstructions, dueDate);
    setAssigningTemplateId(null);
    setCustomInstructions('');
  };

  const handleConfirmAssignContent = () => {
    if (!assigningContentId || !selectedPatientId) return;
    assignContentToPatient(selectedPatientId, assigningContentId, customInstructions);
    setAssigningContentId(null);
    setCustomInstructions('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Biblioteca Terapêutica & Conteúdos
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Modelos de exercícios clínicos, protocolos psicoeducativos, textos e áudios guiados.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsExerciseBuilderOpen(true)}
          className="shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Exercício
        </Button>
      </div>

      {/* Tabs da Biblioteca: Exercícios x Conteúdos */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'exercises'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Exercícios Terapêuticos ({exerciseTemplates.length})
        </button>

        <button
          onClick={() => setActiveTab('contents')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'contents'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Materiais & Psicoeducação ({contentItems.length})
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar na biblioteca..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.slice(0, 6).map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs capitalize"
            >
              {cat === 'all' ? 'Todas Categorias' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Exercícios */}
      {activeTab === 'exercises' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map(tpl => (
            <Card key={tpl.id} className="p-5 flex flex-col justify-between hover:shadow-card transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="default" size="sm">
                    {tpl.category}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {tpl.schema_fields.length} campos
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base">{tpl.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong>Campos do formulário:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-500">
                    {tpl.schema_fields.slice(0, 3).map(f => (
                      <li key={f.id} className="truncate">{f.label}</li>
                    ))}
                    {tpl.schema_fields.length > 3 && (
                      <li className="text-teal-600 font-medium">+ {tpl.schema_fields.length - 3} campos...</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewingTemplate(tpl)}
                  className="w-1/2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 font-medium"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  Pré-visualizar
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAssigningTemplateId(tpl.id)}
                  className="w-1/2 text-xs font-bold bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Atribuir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de Conteúdos */}
      {activeTab === 'contents' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContents.map(cnt => {
            const Icon =
              cnt.content_type === 'video'
                ? Video
                : cnt.content_type === 'audio'
                ? Headphones
                : cnt.content_type === 'pdf'
                ? File
                : FileText;

            return (
              <Card key={cnt.id} className="p-5 flex flex-col justify-between hover:shadow-card transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="purple" size="sm" className="gap-1">
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{cnt.content_type}</span>
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {cnt.estimated_read_time_minutes ? `${cnt.estimated_read_time_minutes} min` : ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{cnt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cnt.description}</p>
                  </div>

                  {cnt.tags && cnt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cnt.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAssigningContentId(cnt.id)}
                    className="w-full text-xs font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Enviar p/ Paciente
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Construtor de Exercício */}
      <ExerciseBuilderModal
        isOpen={isExerciseBuilderOpen}
        onClose={() => setIsExerciseBuilderOpen(false)}
      />

      {/* Modal Atribuir Exercício Selecionado */}
      <Modal
        isOpen={Boolean(assigningTemplateId)}
        onClose={() => setAssigningTemplateId(null)}
        title="Atribuir Exercício ao Paciente"
        description="Defina o paciente de destino, prazo e orientações personalizadas."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Paciente *</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.status === 'active' ? 'Ativo' : 'Inativo'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Data Limite (Prazo)</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Orientações Personalizadas (Opcional)
            </label>
            <textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              rows={2}
              placeholder="Instruções específicas para o momento clínico deste paciente..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAssigningTemplateId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAssignExercise}>
              Confirmar Atribuição
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Atribuir Conteúdo Selecionado */}
      <Modal
        isOpen={Boolean(assigningContentId)}
        onClose={() => setAssigningContentId(null)}
        title="Enviar Material Psicoeducativo"
        description="Disponibilize este conteúdo na área do paciente com uma nota explicativa."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Paciente *</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota ou Recomendação Personalizada
            </label>
            <textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              rows={2}
              placeholder="Ex: Leia com atenção a seção sobre respiração e aplique no seu dia a dia..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAssigningContentId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAssignContent}>
              Enviar Material
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Pré-visualização de Exercício */}
      <ExercisePreviewModal
        template={previewingTemplate}
        isOpen={Boolean(previewingTemplate)}
        onClose={() => setPreviewingTemplate(null)}
        onAssign={tpl => {
          setAssigningTemplateId(tpl.id);
        }}
      />
    </div>
  );
};
