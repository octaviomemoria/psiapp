'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  TransactionType,
  TransactionPaymentMethod,
  TransactionStatus
} from '@/types/database';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileCheck2,
  Tag,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
}) => {
  const {
    currentPsychologist,
    patients,
    financialCategories,
    addFinancialTransaction,
    addNotification
  } = usePsi();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCompleted, setIsCompleted] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<TransactionPaymentMethod>('pix');
  const [patientId, setPatientId] = useState<string>('');
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [responsibleCpf, setResponsibleCpf] = useState<string>('');
  const [isTaxDeductible, setIsTaxDeductible] = useState<boolean>(false);

  // Sincronizar tipo padrão quando a modal abrir
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      const defaultCats = financialCategories.filter(c => c.type === defaultType);
      if (defaultCats.length > 0) {
        setCategoryId(defaultCats[0].id);
        setIsTaxDeductible(defaultCats[0].is_tax_deductible);
      }
      setDueDate(new Date().toISOString().split('T')[0]);
      setIsCompleted(true);
      setAmount('');
      setTitle('');
      setDescription('');
      setPatientId('');
      setResponsibleName('');
      setResponsibleCpf('');
    }
  }, [isOpen, defaultType, financialCategories]);

  // Atualizar dedutibilidade quando a categoria mudar
  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = financialCategories.find(c => c.id === catId);
    if (cat) {
      setIsTaxDeductible(cat.is_tax_deductible);
    }
  };

  // Preencher responsável ao selecionar paciente
  const handlePatientSelect = (pId: string) => {
    setPatientId(pId);
    const p = patients.find(item => item.id === pId);
    if (p) {
      setResponsibleName((p as any).financial_responsible_name || p.full_name);
      setResponsibleCpf((p as any).financial_responsible_cpf || (p as any).cpf || '');
      if (!title) {
        setTitle(`Atendimento Clínico - ${p.full_name}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor monetário válido.');
      return;
    }

    const selectedCategory = financialCategories.find(c => c.id === categoryId);
    const nowIso = new Date().toISOString();
    const finalStatus: TransactionStatus = isCompleted ? 'completed' : 'pending';

    const transaction = addFinancialTransaction({
      psychologist_id: currentPsychologist.id,
      patient_id: patientId || undefined,
      title: title.trim() || (type === 'income' ? 'Receita Clínica' : 'Despesa Operacional'),
      description: description.trim() || undefined,
      type,
      category_id: categoryId || undefined,
      category_name: selectedCategory?.name || (type === 'income' ? 'Receitas Gerais' : 'Despesas Gerais'),
      amount: parsedAmount,
      due_date: dueDate,
      paid_at: isCompleted ? nowIso : undefined,
      status: finalStatus,
      payment_method: isCompleted ? paymentMethod : undefined,
      financial_responsible_name: type === 'income' ? (responsibleName.trim() || undefined) : undefined,
      financial_responsible_cpf: type === 'income' ? (responsibleCpf.trim() || undefined) : undefined,
      is_tax_deductible: type === 'expense' ? isTaxDeductible : false,
      receipt_number: type === 'income' && isCompleted ? `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` : undefined,
    });

    addNotification({
      recipient_role: 'psychologist',
      title: type === 'income' ? 'Receita Registrada' : 'Despesa Registrada',
      message: `${transaction.title} de R$ ${parsedAmount.toFixed(2)} foi inserida com sucesso.`,
      type: 'feedback_received',
      read: false,
    });

    onClose();
  };

  const filteredCategories = financialCategories.filter(c => c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Lançamento Financeiro"
      description="Cadastre receitas clínicas, honorários ou despesas operacionais do consultório."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Alternador de Tipo: Receita vs Despesa */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('income');
              const firstInc = financialCategories.find(c => c.type === 'income');
              if (firstInc) {
                setCategoryId(firstInc.id);
                setIsTaxDeductible(false);
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Receita (Entrada)
          </button>

          <button
            type="button"
            onClick={() => {
              setType('expense');
              const firstExp = financialCategories.find(c => c.type === 'expense');
              if (firstExp) {
                setCategoryId(firstExp.id);
                setIsTaxDeductible(firstExp.is_tax_deductible);
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Despesa (Saída)
          </button>
        </div>

        {/* Título e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título / Descrição Curta *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'income' ? 'Ex: Sessão Clínica, Parecer, Supervisão' : 'Ex: Sublocação de Sala, Anuidade CRP'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">R$</span>
              <input
                type="text"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="200,00"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categoria e Vencimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              Categoria Contábil *
            </label>
            <select
              value={categoryId}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.is_tax_deductible ? '✓ (Livro Caixa)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Data de Vencimento / Competência *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Status de Liquidação e Método */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className={`w-5 h-5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {type === 'income' ? 'Valor já foi recebido?' : 'Valor já foi pago?'}
                </p>
                <p className="text-xs text-slate-500">
                  {isCompleted ? 'Marcado como liquidado' : 'Ficará listado como pendente'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={e => setIsCompleted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {isCompleted && (
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as TransactionPaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="pix">Pix</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="bank_transfer">Transferência Bancária (TED/DOC)</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="insurance_reimbursement">Reembolso / Convênio</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Detalhes de Receita: Vínculo ao Paciente & Responsável Financeiro (para IRPF e Recibos) */}
        {type === 'income' && (
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-700" />
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Vínculo Clínico & Responsável Financeiro (Carnê-Leão / IRPF)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Paciente Vinculado (Opcional)
                </label>
                <select
                  value={patientId}
                  onChange={e => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">Nenhum (Outra Receita)</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nome do Pagador / Responsável
                </label>
                <input
                  type="text"
                  value={responsibleName}
                  onChange={e => setResponsibleName(e.target.value)}
                  placeholder="Nome do paciente ou responsável"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CPF do Pagador (Obrigatório no Carnê-Leão)
                </label>
                <input
                  type="text"
                  value={responsibleCpf}
                  onChange={e => setResponsibleCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Detalhes de Despesa: Inteligência de Dedução no Carnê-Leão / Livro Caixa */}
        {type === 'expense' && (
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="taxDeductibleCheck"
                checked={isTaxDeductible}
                onChange={e => setIsTaxDeductible(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <div>
                <label htmlFor="taxDeductibleCheck" className="text-xs font-bold text-amber-950 cursor-pointer flex items-center gap-1.5">
                  Despesa Dedutível no Livro Caixa / Carnê-Leão da Receita Federal
                  {isTaxDeductible && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">Dedutível</span>}
                </label>
                <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
                  Conforme o Art. 6º da Lei nº 8.134/1990, despesas de custeio indispensáveis à prestação de serviços (aluguel de consultório, anuidade CRP, supervisão e congressos) abatem diretamente a base de cálculo do IRPF mensal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Observações Adicionais (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Sala 04 - período vespertino quinzenal."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className={type === 'expense' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-teal-700 hover:bg-teal-800'}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            {type === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
