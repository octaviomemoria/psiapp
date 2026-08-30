'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { DiaryEntry } from '@/types/database';
import {
  BookOpen,
  Plus,
  Lock,
  Share2,
  Trash2,
  Edit,
  Smile,
  Heart,
  Sparkles,
  Calendar,
  CheckCircle,
  EyeOff,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

const EMOTIONS = [
  'Confiante',
  'Tranquilo',
  'Feliz',
  'Motivado',
  'Grato',
  'Ansioso',
  'Preocupado',
  'Cansado',
  'Triste',
  'Irritado',
  'Frustrado',
  'Reflexivo',
];

export const DiaryView: React.FC = () => {
  const {
    getPatientDiaryEntries,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    currentPsychologist,
  } = usePsi();

  const entries = getPatientDiaryEntries().sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DiaryEntry | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('Tranquilo');
  const [intensity, setIntensity] = useState<number>(6);
  const [isShared, setIsShared] = useState(false); // DEFAULT É PRIVADO
  const [filterShared, setFilterShared] = useState<'all' | 'shared' | 'private'>('all');

  const openNewModal = () => {
    setEntryToEdit(null);
    setTitle('');
    setContent('');
    setEmotion('Tranquilo');
    setIntensity(6);
    setIsShared(false);
    setIsEntryModalOpen(true);
  };

  const openEditModal = (entry: DiaryEntry) => {
    setEntryToEdit(entry);
    setTitle(entry.title || '');
    setContent(entry.content);
    setEmotion(entry.predominant_emotion);
    setIntensity(entry.intensity);
    setIsShared(entry.is_shared_with_psychologist);
    setIsEntryModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (entryToEdit) {
      updateDiaryEntry(entryToEdit.id, {
        title: title.trim() || undefined,
        content: content.trim(),
        predominant_emotion: emotion,
        intensity,
        is_shared_with_psychologist: isShared,
      });
    } else {
      addDiaryEntry({
        title: title.trim() || undefined,
        content: content.trim(),
        predominant_emotion: emotion,
        intensity,
        is_shared_with_psychologist: isShared,
        entry_date: new Date().toISOString(),
      });
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      } catch {}
    }

    setIsEntryModalOpen(false);
  };

  const filteredEntries = entries.filter(entry => {
    if (filterShared === 'shared') return entry.is_shared_with_psychologist;
    if (filterShared === 'private') return !entry.is_shared_with_psychologist;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header do Diário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Meu Diário Emocional
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Seu espaço seguro para registrar pensamentos, acontecimentos e sentimentos do dia a dia.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openNewModal}
          className="shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Entrada no Diário
        </Button>
      </div>

      {/* Banner de Privacidade do Diário */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Privacidade Total e Controle em Suas Mãos</p>
          <p className="text-slate-500 leading-relaxed">
            Seus registros no diário são estritamente <strong>privados por padrão</strong>. Você escolhe livremente quais entradas deseja compartilhar com{' '}
            <span className="font-medium text-slate-700">{currentPsychologist.profile?.display_name || 'sua psicóloga'}</span> para enriquecer o diálogo nas consultas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <Button
          variant={filterShared === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterShared('all')}
          className="text-xs"
        >
          Todas as Entradas ({entries.length})
        </Button>
        <Button
          variant={filterShared === 'private' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterShared('private')}
          className="text-xs"
        >
          <EyeOff className="w-3.5 h-3.5 mr-1" />
          Apenas Privadas ({entries.filter(e => !e.is_shared_with_psychologist).length})
        </Button>
        <Button
          variant={filterShared === 'shared' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterShared('shared')}
          className="text-xs"
        >
          <Share2 className="w-3.5 h-3.5 mr-1" />
          Compartilhadas com Terapeuta ({entries.filter(e => e.is_shared_with_psychologist).length})
        </Button>
      </div>

      {/* Lista de Entradas do Diário */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma entrada no diário ainda"
          description="Escrever sobre o que você sente ajuda a organizar as ideias e traz mais clareza mental."
          actionLabel="Escrever 1ª Entrada"
          onAction={openNewModal}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredEntries.map(entry => (
            <Card
              key={entry.id}
              className="p-5 space-y-4 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDateTime(entry.entry_date)}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-0.5">
                      {entry.title || 'Reflexão Pessoal'}
                    </h3>
                  </div>

                  <Badge variant="purple" size="sm">
                    {entry.predominant_emotion} ({entry.intensity}/10)
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100/80 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {entry.is_shared_with_psychologist ? (
                    <PrivacyBadge type="shared" size="sm" />
                  ) : (
                    <PrivacyBadge type="patient_private" size="sm" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                    title="Editar entrada"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDiaryEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Excluir entrada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Entrada */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title={entryToEdit ? 'Editar Entrada do Diário' : 'Novo Registro no Diário'}
        description="Expresse seus sentimentos, pensamentos e acontecimentos com liberdade."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Entrada (Opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Como me senti hoje, Uma conversa marcante..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              O que você gostaria de registrar? *
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              placeholder="Escreva livremente sobre acontecimentos, pensamentos, sentimentos, conquistas ou dificuldades..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emoção Predominante
              </label>
              <select
                value={emotion}
                onChange={e => setEmotion(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {EMOTIONS.map(em => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intensidade Emocional ({intensity}/10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
              />
            </div>
          </div>

          {/* Toggle de Compartilhamento com a Psicóloga */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-700" />
                <label htmlFor="shareToggle" className="text-xs font-bold text-teal-950 cursor-pointer">
                  Compartilhar com minha psicóloga ({currentPsychologist.profile?.display_name || 'Dra. Ana'})
                </label>
              </div>
              <input
                type="checkbox"
                id="shareToggle"
                checked={isShared}
                onChange={e => setIsShared(e.target.checked)}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              {isShared
                ? 'Esta reflexão ficará visível na aba de diário compartilhado da sua psicóloga.'
                : 'Esta entrada permanecerá estritamente privada apenas no seu aplicativo.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEntryModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" className="font-semibold">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {entryToEdit ? 'Atualizar Entrada' : 'Salvar no Diário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
