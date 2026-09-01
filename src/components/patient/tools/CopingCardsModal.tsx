'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bookmark,
  Plus,
  Trash2,
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CopingCard {
  id: string;
  trigger: string;
  reminder: string;
  action: string;
  color: string;
}

const DEFAULT_CARDS: CopingCard[] = [
  {
    id: 'cc-1',
    trigger: 'Quando sinto taquicardia antes de apresentar no trabalho',
    reminder: 'Ansiedade é apenas uma resposta física do corpo a um desafio, não um perigo mortal. Meus batimentos vão desacelerar.',
    action: 'Fazer 4 ciclos de respiração 4-7-8 e beber um gole d\'água.',
    color: 'border-teal-300 bg-teal-50/70 text-teal-950'
  },
  {
    id: 'cc-2',
    trigger: 'Quando o pensamento "Vou fracassar" surgir',
    reminder: 'Pensamento não é fato. Já entreguei projetos difíceis antes e tenho competência comprovada.',
    action: 'Lembrar de 2 conquistas reais recentes e focar na próxima etapa de 10 minutos.',
    color: 'border-sky-300 bg-sky-50/70 text-sky-950'
  },
  {
    id: 'cc-3',
    trigger: 'Quando sinto culpa por descansar no fim de semana',
    reminder: 'O descanso não é um prêmio que preciso merecer, é uma necessidade biológica para minha saúde mental.',
    action: 'Deixar o celular em outro cômodo e assistir um filme ou passear.',
    color: 'border-purple-300 bg-purple-50/70 text-purple-950'
  }
];

export const CopingCardsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [cards, setCards] = useState<CopingCard[]>(DEFAULT_CARDS);
  const [isCreating, setIsCreating] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [newAction, setNewAction] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('psiapp_coping_cards');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCards(parsed);
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar coping cards:', e);
      }
    }
  }, [isOpen]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newReminder) return;

    const colors = [
      'border-teal-300 bg-teal-50/70 text-teal-950',
      'border-sky-300 bg-sky-50/70 text-sky-950',
      'border-purple-300 bg-purple-50/70 text-purple-950',
      'border-amber-300 bg-amber-50/70 text-amber-950',
      'border-rose-300 bg-rose-50/70 text-rose-950'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCard: CopingCard = {
      id: `cc-${Date.now()}`,
      trigger: newTrigger,
      reminder: newReminder,
      action: newAction || 'Respirar fundo e pausar por 1 minuto.',
      color: randomColor
    };

    const updated = [newCard, ...cards];
    setCards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('psiapp_coping_cards', JSON.stringify(updated));
    }
    setNewTrigger('');
    setNewReminder('');
    setNewAction('');
    setIsCreating(false);
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('psiapp_coping_cards', JSON.stringify(updated));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meus Cartões de Enfrentamento (Coping Cards)"
      description="Lembretes terapêuticos e frases-âncora para você consultar em momentos de ansiedade ou dúvida."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            {cards.length} cartão(ões) salvos para consulta rápida.
          </p>
          {!isCreating && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Criar Novo Cartão
            </Button>
          )}
        </div>

        {/* Formulário de Novo Cartão */}
        {isCreating && (
          <form onSubmit={handleAddCard} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Novo Cartão de Enfrentamento</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gatilho ou Situação Difícil</label>
              <input
                type="text"
                value={newTrigger}
                onChange={e => setNewTrigger(e.target.value)}
                placeholder="Ex: Quando sinto medo antes de falar em público..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lembrete Racional / Frase-Âncora</label>
              <textarea
                value={newReminder}
                onChange={e => setNewReminder(e.target.value)}
                rows={2}
                placeholder="Ex: Pensamento não é realidade. Eu estudei e estou preparado(a)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ação Prática Imediata</label>
              <input
                type="text"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                placeholder="Ex: Beber água, respirar em 4 tempos e focar na 1ª frase."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Salvar Cartão
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Cartões de Enfrentamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {cards.map(card => (
            <div
              key={card.id}
              className={`p-4 rounded-2xl border ${card.color} shadow-xs flex flex-col justify-between space-y-3 relative group transition-all hover:shadow-md`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-teal-600" />
                    Situação / Gatilho
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Excluir cartão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{card.trigger}</p>
                <div className="pt-2 border-t border-slate-200/50">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                    "{card.reminder}"
                  </p>
                </div>
              </div>

              {card.action && (
                <div className="p-2 bg-white/70 rounded-xl text-[11px] text-teal-900 border border-teal-200/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span className="truncate"><strong>Ação:</strong> {card.action}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Concluído
          </Button>
        </div>
      </div>
    </Modal>
  );
};
