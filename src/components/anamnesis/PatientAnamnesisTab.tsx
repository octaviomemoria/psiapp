'use client';

import React, { useMemo, useState } from 'react';
import { ClipboardList, Copy, Check, MessageSquare, RefreshCw, Send, Settings2, Trash2 } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { AnamnesisResponse, Patient } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FILL_LINK_VALID_DAYS,
  STATUS_LABELS,
  allTemplates,
  buildFillLink,
  findTemplate,
  generateFillToken,
  isLinkActive,
  progress,
  suggestTemplateId,
} from '@/lib/anamnesis/anamnesis-utils';
import { calculateAge, onlyDigits } from '@/lib/utils/masks';
import { formatDate, isUuid } from '@/lib/utils';
import { AnamnesisResponseModal } from './AnamnesisResponseModal';
import { AnamnesisTemplatesModal } from './AnamnesisTemplatesModal';

const selectClass = 'px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

/** Aba "Anamnese" do prontuário: importar o formulário do grupo, preencher, enviar link ao paciente e consultar. */
export const PatientAnamnesisTab: React.FC<{ patient: Patient }> = ({ patient }) => {
  const {
    anamnesisTemplates, anamnesisResponses, patientGroups, currentPsychologist,
    createAnamnesisResponse, updateAnamnesisResponse, deleteAnamnesisResponse,
  } = usePsi();

  const templates = useMemo(() => allTemplates(anamnesisTemplates), [anamnesisTemplates]);
  const group = patientGroups.find(g => g.id === patient.group_id);
  const groupTemplate = findTemplate(group?.anamnesis_template_id, anamnesisTemplates);
  const age = calculateAge(patient.birth_date);

  const [selectedId, setSelectedId] = useState(() => groupTemplate?.id || suggestTemplateId(age));
  const [openId, setOpenId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const responses = useMemo(
    () => anamnesisResponses.filter(r => r.patient_id === patient.id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [anamnesisResponses, patient.id]
  );

  const synced = isUuid(currentPsychologist.id);
  const selectedTemplate = findTemplate(selectedId, anamnesisTemplates) || templates[0];

  const create = async (template = selectedTemplate, mode: 'fill' | 'link') => {
    setBusy(true);
    setError('');
    const result = await createAnamnesisResponse(patient.id, template, mode);
    setBusy(false);
    if (!result.ok || !result.data) return setError(result.error || 'Não foi possível criar a anamnese.');
    if (mode === 'fill') setOpenId(result.data.id);
  };

  const linkFor = (r: AnamnesisResponse) => (r.fill_token && typeof window !== 'undefined' ? buildFillLink(window.location.origin, r.fill_token) : '');

  const copyLink = async (r: AnamnesisResponse) => {
    const link = linkFor(r);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt('Copie o link:', link);
    }
  };

  const whatsApp = (r: AnamnesisResponse) => {
    // Para criança e adolescente, o link vai ao responsável quando ele tem celular cadastrado.
    const useGuardian = age !== null && age < 18 && patient.guardian_mobile;
    let phone = onlyDigits(useGuardian ? patient.guardian_mobile : patient.mobile || patient.phone);
    if (phone && !phone.startsWith('55')) phone = `55${phone}`;
    const name = (useGuardian ? patient.guardian_name : patient.social_name || patient.full_name)?.split(' ')[0] || '';
    const text = `Olá${name ? `, ${name}` : ''}! Segue o link para preencher a anamnese antes do nosso atendimento (válido por ${FILL_LINK_VALID_DAYS} dias, uso único):\n${linkFor(r)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renewLink = async (r: AnamnesisResponse) => {
    setError('');
    const result = await updateAnamnesisResponse(r.id, {
      fill_token: generateFillToken(),
      token_expires_at: new Date(Date.now() + FILL_LINK_VALID_DAYS * 86_400_000).toISOString(),
      status: r.status === 'draft' ? 'draft' : 'sent',
    });
    if (!result.ok) setError(result.error || 'Não foi possível gerar um novo link.');
  };

  const remove = async (r: AnamnesisResponse) => {
    if (!window.confirm(`Excluir a anamnese "${r.template_name}"? Esta ação não pode ser desfeita.`)) return;
    const result = await deleteAnamnesisResponse(r.id);
    if (!result.ok) setError(result.error || 'Não foi possível excluir.');
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-teal-600" /> Nova anamnese</h3>
            {groupTemplate ? (
              <p className="text-xs text-slate-500 mt-0.5">O grupo <strong>{group?.name}</strong> usa o modelo <strong>{groupTemplate.name}</strong>.</p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">
                {group ? `O grupo ${group.name} ainda não tem modelo definido. ` : 'Este paciente não tem grupo. '}
                Sugerimos o modelo pela idade; você pode trocar abaixo.
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setTemplatesOpen(true)} className="text-xs"><Settings2 className="w-3.5 h-3.5 mr-1.5" /> Modelos</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedTemplate.id} onChange={e => setSelectedId(e.target.value)} className={selectClass} aria-label="Modelo">
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.id === groupTemplate?.id ? ' (do grupo)' : ''}</option>)}
          </select>
          <Button variant="primary" size="sm" onClick={() => create(selectedTemplate, 'fill')} disabled={busy} className="font-semibold">Preencher agora</Button>
          <Button variant="outline" size="sm" onClick={() => create(selectedTemplate, 'link')} disabled={busy} className="text-xs">
            <Send className="w-3.5 h-3.5 mr-1.5" /> Enviar link ao paciente
          </Button>
        </div>

        {!synced && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Você está em uma conta de demonstração: o link para o paciente só funciona depois de entrar com sua conta real.
          </p>
        )}
        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}
      </Card>

      {responses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <h4 className="text-base font-semibold text-slate-700">Nenhuma anamnese registrada</h4>
          <p className="text-xs text-slate-500 mt-1">Preencha durante a sessão ou envie um link para o paciente responder antes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map(r => {
            const stats = progress(r.template_snapshot, r.answers);
            const active = isLinkActive(r);
            const expired = Boolean(r.fill_token) && r.status !== 'completed' && !active;
            return (
              <Card key={r.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800 flex flex-wrap items-center gap-2">
                      {r.template_name}
                      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'sent' ? 'info' : 'warning'} size="sm">{STATUS_LABELS[r.status]}</Badge>
                    </p>
                    <p className="text-xs text-slate-500">
                      Criada em {formatDate(r.created_at)}
                      {r.completed_at && ` • concluída em ${formatDate(r.completed_at)}${r.filled_by === 'patient' ? ' pelo paciente' : ''}`}
                      {` • ${stats.answered} de ${stats.total} respondidas`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setOpenId(r.id)} className="text-xs">{r.status === 'completed' ? 'Ver' : 'Abrir e preencher'}</Button>
                    <button type="button" title="Excluir" onClick={() => remove(r)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {active && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-sky-900">Link para o paciente (uso único, vale até {formatDate(r.token_expires_at || '')}):</p>
                    <code className="block text-[11px] text-slate-600 break-all bg-white border border-slate-200 rounded-lg px-2 py-1">{linkFor(r)}</code>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(r)} className="text-xs">
                        {copiedId === r.id ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />} {copiedId === r.id ? 'Copiado' : 'Copiar link'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => whatsApp(r)} className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Enviar por WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
                {(expired || (r.status === 'sent' && !r.fill_token)) && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <span>O link deste formulário venceu.</span>
                    <Button variant="outline" size="sm" onClick={() => renewLink(r)} className="text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" /> Gerar novo link</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AnamnesisResponseModal isOpen={Boolean(openId)} onClose={() => setOpenId(null)} responseId={openId} patient={patient} />
      <AnamnesisTemplatesModal isOpen={templatesOpen} onClose={() => setTemplatesOpen(false)} />
    </div>
  );
};
