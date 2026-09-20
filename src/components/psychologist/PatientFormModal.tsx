'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { calculateAge, formatCEP, formatCPF, formatPhone, isValidCPF, isValidPhone, onlyDigits } from '@/lib/utils/masks';
import { lookupCep } from '@/lib/utils/viacep';
import {
  BR_STATES,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  HOW_FOUND_US_OPTIONS,
  RACE_OPTIONS,
  REFERRED_BY_OPTIONS,
} from '@/lib/constants/patient-options';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Quando informado, o formulário edita este paciente; sem ele, cadastra um novo. */
  patient?: Patient;
  onSaved?: (patient: Patient) => void;
}

interface FormState {
  full_name: string;
  group_id: string;
  email: string;
  mobile: string;
  landline: string;
  cpf: string;
  rg: string;
  birth_date: string;
  gender: string;
  has_social_name: boolean;
  social_name: string;
  clinical_notes_overview: string;
  country: string;
  zip_code: string;
  city: string;
  state: string;
  street: string;
  address_number: string;
  neighborhood: string;
  address_complement: string;
  birthplace: string;
  education_level: string;
  race: string;
  occupation: string;
  relative_name: string;
  relative_relationship: string;
  relative_phone: string;
  how_found_us: string;
  referred_by: string;
  tags: string[];
  guardian_name: string;
  guardian_email: string;
  guardian_mobile: string;
  guardian_cpf: string;
  guardian_rg: string;
  guardian_birth_date: string;
  guardian_allow_billing_contact: boolean;
  guardian_send_reminders: boolean;
}

const EMPTY_FORM: FormState = {
  full_name: '', group_id: '', email: '', mobile: '', landline: '', cpf: '', rg: '', birth_date: '', gender: '',
  has_social_name: false, social_name: '', clinical_notes_overview: '',
  country: 'Brasil', zip_code: '', city: '', state: '', street: '', address_number: '', neighborhood: '', address_complement: '',
  birthplace: '', education_level: '', race: '', occupation: '',
  relative_name: '', relative_relationship: '', relative_phone: '', how_found_us: '', referred_by: '', tags: [],
  guardian_name: '', guardian_email: '', guardian_mobile: '', guardian_cpf: '', guardian_rg: '', guardian_birth_date: '',
  guardian_allow_billing_contact: false, guardian_send_reminders: false,
};

function fromPatient(p?: Patient): FormState {
  if (!p) return { ...EMPTY_FORM };
  const text = (v: string | undefined | null) => v || '';
  return {
    full_name: text(p.full_name),
    group_id: text(p.group_id),
    email: text(p.email),
    // Pacientes antigos só têm `phone`: ele vira o celular.
    mobile: formatPhone(p.mobile || p.phone),
    landline: formatPhone(p.landline),
    cpf: formatCPF(p.cpf),
    rg: text(p.rg),
    birth_date: text(p.birth_date).slice(0, 10),
    gender: text(p.gender),
    has_social_name: p.has_social_name ?? Boolean(p.social_name),
    social_name: text(p.social_name),
    clinical_notes_overview: text(p.clinical_notes_overview),
    country: p.country || 'Brasil',
    zip_code: formatCEP(p.zip_code),
    city: text(p.city),
    state: text(p.state),
    street: text(p.street),
    address_number: text(p.address_number),
    neighborhood: text(p.neighborhood),
    address_complement: text(p.address_complement),
    birthplace: text(p.birthplace),
    education_level: text(p.education_level),
    race: text(p.race),
    occupation: text(p.occupation),
    // Pacientes antigos guardavam "Nome (Vínculo)" e o telefone no contato de emergência.
    relative_name: text(p.relative_name || p.emergency_contact_name),
    relative_relationship: text(p.relative_relationship),
    relative_phone: formatPhone(p.relative_phone || p.emergency_contact_phone),
    how_found_us: text(p.how_found_us),
    referred_by: text(p.referred_by),
    tags: p.tags || [],
    guardian_name: text(p.guardian_name),
    guardian_email: text(p.guardian_email),
    guardian_mobile: formatPhone(p.guardian_mobile),
    guardian_cpf: formatCPF(p.guardian_cpf),
    guardian_rg: text(p.guardian_rg),
    guardian_birth_date: text(p.guardian_birth_date).slice(0, 10),
    guardian_allow_billing_contact: p.guardian_allow_billing_contact ?? false,
    guardian_send_reminders: p.guardian_send_reminders ?? false,
  };
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

const Field: React.FC<{ label: string; error?: string; className?: string; children: React.ReactNode }> = ({
  label, error, className, children,
}) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
  </div>
);

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="space-y-3">
    <div className="border-b border-slate-100 pb-1.5">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
    <div className="grid sm:grid-cols-2 gap-3">{children}</div>
  </section>
);

const Check: React.FC<{ checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }> = ({
  checked, onChange, children,
}) => (
  <label className="sm:col-span-2 flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
    />
    <span>{children}</span>
  </label>
);

export const PatientFormModal: React.FC<PatientFormModalProps> = ({ isOpen, onClose, patient, onSaved }) => {
  const { patients, patientGroups, addPatient, updatePatient, addPatientGroup, renamePatientGroup, deletePatientGroup } = usePsi();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [showGuardian, setShowGuardian] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');
  const [tagDraft, setTagDraft] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const initial = fromPatient(patient);
    setForm(initial);
    setErrors({});
    setSubmitError('');
    setShowGroups(false);
    setGroupError('');
    setTagDraft('');
    const age = calculateAge(initial.birth_date);
    setShowGuardian(Boolean(initial.guardian_name || initial.guardian_cpf || (age !== null && age < 18)));
  }, [isOpen, patient]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const age = calculateAge(form.birth_date);
  const isMinor = age !== null && age < 18;

  const knownTags = useMemo(
    () => [...new Set(patients.flatMap(p => p.tags || []))].sort((a, b) => a.localeCompare(b)),
    [patients]
  );

  const handleCepChange = async (value: string) => {
    const masked = formatCEP(value);
    set('zip_code', masked);
    if (onlyDigits(masked).length !== 8 || form.country !== 'Brasil') return;
    setCepLoading(true);
    const address = await lookupCep(masked);
    setCepLoading(false);
    if (!address) return; // CEP não encontrado ou sem rede: o usuário preenche à mão.
    setForm(prev => ({
      ...prev,
      street: address.street || prev.street,
      neighborhood: address.neighborhood || prev.neighborhood,
      city: address.city || prev.city,
      state: address.state || prev.state,
    }));
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (!tag) return;
    if (!form.tags.some(t => t.toLowerCase() === tag.toLowerCase())) set('tags', [...form.tags, tag]);
    setTagDraft('');
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) next.full_name = 'Informe o nome completo.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'E-mail inválido.';
    if (form.cpf && !isValidCPF(form.cpf)) next.cpf = 'CPF inválido.';
    if (form.guardian_cpf && !isValidCPF(form.guardian_cpf)) next.guardian_cpf = 'CPF inválido.';
    if (form.mobile && !isValidPhone(form.mobile)) next.mobile = 'Celular inválido.';
    if (form.landline && !isValidPhone(form.landline)) next.landline = 'Telefone inválido.';
    if (form.relative_phone && !isValidPhone(form.relative_phone)) next.relative_phone = 'Telefone inválido.';
    if (form.guardian_mobile && !isValidPhone(form.guardian_mobile)) next.guardian_mobile = 'Celular inválido.';
    if (form.guardian_email && !/^\S+@\S+\.\S+$/.test(form.guardian_email.trim())) next.guardian_email = 'E-mail inválido.';
    if (form.birth_date && age === null) next.birth_date = 'Data de nascimento inválida.';
    if (form.zip_code && onlyDigits(form.zip_code).length !== 8) next.zip_code = 'CEP deve ter 8 dígitos.';
    if ((form.guardian_allow_billing_contact || form.guardian_send_reminders) && !form.guardian_name.trim()) {
      next.guardian_name = 'Informe o nome do responsável para autorizar cobranças e lembretes.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      setShowGuardian(true);
      return;
    }

    const data = {
      full_name: form.full_name.trim(),
      group_id: form.group_id || null,
      email: form.email.trim(),
      // `phone` continua sendo o contato principal usado por lembretes e WhatsApp.
      phone: form.mobile || form.landline,
      mobile: form.mobile,
      landline: form.landline,
      cpf: onlyDigits(form.cpf),
      rg: form.rg.trim(),
      birth_date: form.birth_date,
      gender: form.gender,
      has_social_name: form.has_social_name,
      social_name: form.has_social_name ? form.social_name.trim() : '',
      clinical_notes_overview: form.clinical_notes_overview.trim(),
      country: form.country.trim(),
      zip_code: onlyDigits(form.zip_code),
      city: form.city.trim(),
      state: form.state.trim(),
      street: form.street.trim(),
      address_number: form.address_number.trim(),
      neighborhood: form.neighborhood.trim(),
      address_complement: form.address_complement.trim(),
      birthplace: form.birthplace.trim(),
      education_level: form.education_level,
      race: form.race,
      occupation: form.occupation.trim(),
      relative_name: form.relative_name.trim(),
      relative_relationship: form.relative_relationship.trim(),
      relative_phone: onlyDigits(form.relative_phone) ? form.relative_phone : '',
      // Mantém o contato de emergência antigo em sincronia, pois outras telas ainda o leem.
      emergency_contact_name: form.relative_name.trim(),
      emergency_contact_phone: onlyDigits(form.relative_phone) ? form.relative_phone : '',
      how_found_us: form.how_found_us,
      referred_by: form.referred_by,
      tags: form.tags,
      guardian_name: form.guardian_name.trim(),
      guardian_email: form.guardian_email.trim(),
      guardian_mobile: form.guardian_mobile,
      guardian_cpf: onlyDigits(form.guardian_cpf),
      guardian_rg: form.guardian_rg.trim(),
      guardian_birth_date: form.guardian_birth_date,
      guardian_allow_billing_contact: form.guardian_allow_billing_contact,
      guardian_send_reminders: form.guardian_send_reminders,
    };

    setSaving(true);
    try {
      if (patient) {
        const result = await updatePatient(patient.id, data);
        if (!result.ok) {
          setSubmitError(result.error || 'Não foi possível salvar as alterações.');
          return;
        }
        onSaved?.({ ...patient, ...data });
      } else {
        const created = addPatient({ ...data, status: 'active' });
        onSaved?.(created);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAddGroup = async () => {
    setGroupError('');
    const result = await addPatientGroup(newGroupName);
    if (!result.ok) {
      setGroupError(result.error || 'Não foi possível criar o grupo.');
      return;
    }
    setNewGroupName('');
    if (result.data) set('group_id', result.data.id);
  };

  const handleRenameGroup = async (id: string, current: string) => {
    const name = window.prompt('Novo nome do grupo:', current);
    if (name === null || name.trim() === current) return;
    const result = await renamePatientGroup(id, name);
    setGroupError(result.ok ? '' : result.error || 'Não foi possível renomear.');
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`Excluir o grupo "${name}"? Os pacientes deste grupo ficarão sem grupo.`)) return;
    const result = await deletePatientGroup(id);
    if (!result.ok) {
      setGroupError(result.error || 'Não foi possível excluir.');
      return;
    }
    setGroupError('');
    if (form.group_id === id) set('group_id', '');
  };

  const isBrazil = form.country.trim().toLowerCase() === 'brasil';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patient ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
      description={patient ? 'Atualize os dados cadastrais do paciente.' : 'Preencha os dados do paciente. Somente o nome é obrigatório.'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Section title="1. Informações pessoais">
          <Field label="Nome completo *" error={errors.full_name} className="sm:col-span-2">
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Nome completo do paciente"
              className={inputClass}
              autoFocus
            />
          </Field>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Grupo</label>
              <button
                type="button"
                onClick={() => setShowGroups(v => !v)}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
              >
                {showGroups ? 'Fechar gerenciamento' : 'Gerenciar grupos'}
              </button>
            </div>
            <select value={form.group_id} onChange={e => set('group_id', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {patientGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Também define qual formulário de anamnese será importado.</p>

            {showGroups && (
              <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGroup();
                      }
                    }}
                    placeholder="Novo grupo (ex.: Adulto, Infantil, Casal)"
                    className={inputClass}
                  />
                  <Button type="button" variant="soft" size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                    <Plus className="w-3.5 h-3.5" /> Criar
                  </Button>
                </div>
                {groupError && <p className="text-[11px] text-rose-600">{groupError}</p>}
                {patientGroups.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhum grupo criado ainda.</p>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {patientGroups.map(g => (
                      <li key={g.id} className="flex items-center justify-between py-1.5 text-sm text-slate-700">
                        <span>{g.name}</span>
                        <span className="flex items-center gap-1">
                          <button type="button" title="Renomear" onClick={() => handleRenameGroup(g.id, g.name)} className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-white">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Excluir" onClick={() => handleDeleteGroup(g.id, g.name)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <Field label="E-mail" error={errors.email}>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="paciente@email.com" className={inputClass} />
          </Field>
          <Field label="Celular (WhatsApp)" error={errors.mobile}>
            <input type="tel" inputMode="tel" value={form.mobile} onChange={e => set('mobile', formatPhone(e.target.value))} placeholder="(11) 99999-9999" className={inputClass} />
          </Field>
          <Field label="Telefone" error={errors.landline}>
            <input type="tel" inputMode="tel" value={form.landline} onChange={e => set('landline', formatPhone(e.target.value))} placeholder="(11) 2345-6789" className={inputClass} />
          </Field>
          <Field label="CPF" error={errors.cpf}>
            <input type="text" inputMode="numeric" value={form.cpf} onChange={e => set('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
          </Field>
          <Field label="RG">
            <input type="text" value={form.rg} onChange={e => set('rg', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Data de nascimento" error={errors.birth_date}>
            <input type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Idade">
            <input
              type="text"
              value={age === null ? '' : `${age} ${age === 1 ? 'ano' : 'anos'}`}
              placeholder="Informe a data de nascimento"
              readOnly
              className={`${inputClass} bg-slate-50 text-slate-500`}
            />
          </Field>
          <Field label="Gênero">
            <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {form.gender && !(GENDER_OPTIONS as readonly string[]).includes(form.gender) && (
                <option value={form.gender}>{form.gender}</option>
              )}
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2 space-y-2">
            <Check checked={form.has_social_name} onChange={v => set('has_social_name', v)}>
              <strong>Cliente possui nome social?</strong> O nome social passa a ser usado nas telas e nos lembretes.
            </Check>
            {form.has_social_name && (
              <input
                type="text"
                value={form.social_name}
                onChange={e => set('social_name', e.target.value)}
                placeholder="Nome social"
                className={inputClass}
              />
            )}
          </div>

          <Field label="Observações" className="sm:col-span-2">
            <textarea
              value={form.clinical_notes_overview}
              onChange={e => set('clinical_notes_overview', e.target.value)}
              rows={3}
              placeholder="Demanda inicial, queixa principal, informações relevantes..."
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="2. Endereço">
          <Field label="País">
            <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className={inputClass} />
          </Field>
          <Field label="CEP" error={errors.zip_code}>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.zip_code}
                onChange={e => handleCepChange(e.target.value)}
                placeholder="00000-000"
                className={inputClass}
              />
              {cepLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />}
            </div>
          </Field>
          <Field label="Cidade">
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Estado">
            {isBrazil ? (
              <select value={form.state} onChange={e => set('state', e.target.value)} className={inputClass}>
                <option value="">-- Selecione --</option>
                {BR_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            ) : (
              <input type="text" value={form.state} onChange={e => set('state', e.target.value)} className={inputClass} />
            )}
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <input type="text" value={form.street} onChange={e => set('street', e.target.value)} placeholder="Rua, avenida..." className={inputClass} />
          </Field>
          <Field label="Número">
            <input type="text" value={form.address_number} onChange={e => set('address_number', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Bairro">
            <input type="text" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Complemento" className="sm:col-span-2">
            <input type="text" value={form.address_complement} onChange={e => set('address_complement', e.target.value)} placeholder="Apto, bloco..." className={inputClass} />
          </Field>
        </Section>

        <Section title="3. Dados adicionais">
          <Field label="Naturalidade">
            <input type="text" value={form.birthplace} onChange={e => set('birthplace', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Escolaridade">
            <select value={form.education_level} onChange={e => set('education_level', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Raça">
            <select value={form.race} onChange={e => set('race', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {RACE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Profissão">
            <input type="text" value={form.occupation} onChange={e => set('occupation', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Nome de um parente">
            <input type="text" value={form.relative_name} onChange={e => set('relative_name', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Parentesco">
            <input type="text" value={form.relative_relationship} onChange={e => set('relative_relationship', e.target.value)} placeholder="Mãe, irmão, cônjuge..." className={inputClass} />
          </Field>
          <Field label="Telefone do parente" error={errors.relative_phone}>
            <input type="tel" inputMode="tel" value={form.relative_phone} onChange={e => set('relative_phone', formatPhone(e.target.value))} placeholder="(11) 99999-9999" className={inputClass} />
          </Field>
          <Field label="Onde nos conheceu?">
            <select value={form.how_found_us} onChange={e => set('how_found_us', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {form.how_found_us && !(HOW_FOUND_US_OPTIONS as readonly string[]).includes(form.how_found_us) && (
                <option value={form.how_found_us}>{form.how_found_us}</option>
              )}
              {HOW_FOUND_US_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Encaminhado por">
            <select value={form.referred_by} onChange={e => set('referred_by', e.target.value)} className={inputClass}>
              <option value="">-- Selecione --</option>
              {form.referred_by && !(REFERRED_BY_OPTIONS as readonly string[]).includes(form.referred_by) && (
                <option value={form.referred_by}>{form.referred_by}</option>
              )}
              {REFERRED_BY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Tags" className="sm:col-span-2">
            <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-teal-500">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium">
                  {tag}
                  <button type="button" aria-label={`Remover ${tag}`} onClick={() => set('tags', form.tags.filter(t => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                list="patient-tag-suggestions"
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagDraft);
                  } else if (e.key === 'Backspace' && !tagDraft && form.tags.length > 0) {
                    set('tags', form.tags.slice(0, -1));
                  }
                }}
                onBlur={() => addTag(tagDraft)}
                placeholder={form.tags.length === 0 ? 'Digite e pressione Enter para adicionar' : ''}
                className="flex-1 min-w-[140px] px-1 py-1 text-sm bg-transparent focus:outline-none"
              />
              <datalist id="patient-tag-suggestions">
                {knownTags.filter(t => !form.tags.includes(t)).map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </Field>
        </Section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowGuardian(v => !v)}
            className="w-full flex items-center justify-between text-left border-b border-slate-100 pb-1.5"
          >
            <span>
              <span className="block text-sm font-bold text-slate-800">4. Responsável</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {isMinor
                  ? 'Paciente menor de idade: recomendamos informar o responsável.'
                  : 'Para menores de idade ou quando outra pessoa é responsável pelos pagamentos.'}
              </span>
            </span>
            <span className="text-xs font-semibold text-teal-700">{showGuardian ? 'Ocultar' : 'Preencher'}</span>
          </button>

          {showGuardian && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nome do responsável" error={errors.guardian_name}>
                <input type="text" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="E-mail do responsável" error={errors.guardian_email}>
                <input type="email" value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Celular" error={errors.guardian_mobile}>
                <input type="tel" inputMode="tel" value={form.guardian_mobile} onChange={e => set('guardian_mobile', formatPhone(e.target.value))} placeholder="(11) 99999-9999" className={inputClass} />
              </Field>
              <Field label="CPF" error={errors.guardian_cpf}>
                <input type="text" inputMode="numeric" value={form.guardian_cpf} onChange={e => set('guardian_cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
              </Field>
              <Field label="RG">
                <input type="text" value={form.guardian_rg} onChange={e => set('guardian_rg', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Data de nascimento">
                <input type="date" value={form.guardian_birth_date} onChange={e => set('guardian_birth_date', e.target.value)} className={inputClass} />
              </Field>
              <Check checked={form.guardian_allow_billing_contact} onChange={v => set('guardian_allow_billing_contact', v)}>
                Permitir o envio de cobranças e documentos por e-mail e WhatsApp do responsável, além da emissão de notas
                fiscais e cobranças utilizando o nome e CPF cadastrados?
              </Check>
              <Check checked={form.guardian_send_reminders} onChange={v => set('guardian_send_reminders', v)}>
                Enviar lembretes de sessão para o e-mail, SMS e WhatsApp do responsável?
              </Check>
            </div>
          )}
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{submitError}</div>
        )}
        {Object.keys(errors).length > 0 && !submitError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            Corrija os campos destacados para salvar.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" className="font-semibold" isLoading={saving}>
            {patient ? 'Salvar Alterações' : 'Salvar Paciente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
