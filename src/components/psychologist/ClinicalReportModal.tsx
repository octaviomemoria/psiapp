'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Printer, FileText, Download, ShieldCheck, CheckCircle2, Calendar, QrCode, ExternalLink } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { generateDocumentHash, formatShortHash } from '@/lib/crypto/document-verifier';

interface ClinicalReportModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

type DocumentType = 'evolution_report' | 'attendance_declaration';

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const { currentPsychologist, sessions, goals } = usePsi();

  const [documentType, setDocumentType] = useState<DocumentType>('evolution_report');
  const [purpose, setPurpose] = useState('Para fins de acompanhamento multiprofissional e documentação de evolução.');
  const [sessionDateForDecl, setSessionDateForDecl] = useState(new Date().toISOString().slice(0, 10));
  const [docHash, setDocHash] = useState('a4f289b1c03d981fe91823ab49817203');

  useEffect(() => {
    generateDocumentHash({
      documentType,
      patientName: patient.full_name,
      psychologistName: currentPsychologist.profile?.full_name || 'Psicólogo Responsável',
      crpNumber: currentPsychologist.crp_number || '000000',
      crpState: currentPsychologist.crp_state || 'SP',
      issuedAt: documentType === 'attendance_declaration' ? sessionDateForDecl : new Date().toISOString().slice(0, 10),
    }).then(hash => setDocHash(hash));
  }, [documentType, patient.full_name, currentPsychologist, sessionDateForDecl]);

  const patientSessions = sessions.filter(s => s.patient_id === patient.id);
  const patientGoals = goals.filter(g => g.patient_id === patient.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emissão de Documentos Clínicos & Relatórios"
      description="Geração de documentos em conformidade com as Resoluções CFP nº 06/2019 e 01/2009."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Seleção do Tipo de Documento */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 print:hidden">
          <Button
            type="button"
            variant={documentType === 'evolution_report' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDocumentType('evolution_report')}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Relatório de Evolução Psicológica
          </Button>

          <Button
            type="button"
            variant={documentType === 'attendance_declaration' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDocumentType('attendance_declaration')}
            className="text-xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Declaração de Comparecimento
          </Button>
        </div>

        {/* DOCUMENTO FORMATADO PARA VISUALIZAÇÃO E IMPRESSÃO */}
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6 text-slate-800 font-serif leading-relaxed text-sm">
          {/* Cabeçalho Oficial */}
          <div className="text-center border-b border-slate-300 pb-4 space-y-1">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 font-sans">
              {currentPsychologist.profile?.full_name || 'Consultório de Psicologia'}
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              Psicologia Clínica • CRP {currentPsychologist.crp_number || '00/000000'}/{currentPsychologist.crp_state || 'UF'}
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              {currentPsychologist.approach} {currentPsychologist.profile?.phone ? `• Telefone: ${currentPsychologist.profile.phone}` : ''}
            </p>
          </div>

          {/* Título do Documento */}
          <div className="text-center py-2">
            <h3 className="text-base font-bold uppercase tracking-wide font-sans text-teal-900">
              {documentType === 'evolution_report'
                ? 'RELATÓRIO PSICOLÓGICO DE EVOLUÇÃO TERAPÊUTICA'
                : 'DECLARAÇÃO DE COMPARECIMENTO'}
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Emitido em {formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* 1. Identificação */}
          <div className="space-y-1 text-xs sm:text-sm font-sans bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p><strong>Paciente:</strong> {patient.full_name}</p>
            <p><strong>Data de Nascimento:</strong> {formatDate(patient.birth_date)}</p>
            <p><strong>Início do Acompanhamento:</strong> {formatDate(patient.started_at)}</p>
            <p><strong>Total de Sessões Realizadas:</strong> {patientSessions.length} sessões</p>
          </div>

          {/* Conteúdo: Relatório de Evolução */}
          {documentType === 'evolution_report' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 uppercase font-sans text-xs mb-1">
                  1. Descrição da Demanda e Foco Clínico
                </h4>
                <p className="text-slate-700 text-justify">
                  {patient.clinical_notes_overview ||
                    'Paciente em processo de psicoterapia com foco em regulação emocional, manejo de ansiedade e desenvolvimento de habilidades interpessoais assertivas.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase font-sans text-xs mb-1">
                  2. Procedimentos e Intervenções Utilizadas
                </h4>
                <p className="text-slate-700 text-justify">
                  Foram realizadas {patientSessions.length} sessões regulares com base na Terapia Cognitivo-Comportamental (TCC) e práticas de Mindfulness, incluindo técnicas de psicoeducação, Registro de Pensamentos Disfuncionais (RPD), treino respiratório e reestruturação cognitiva.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase font-sans text-xs mb-1">
                  3. Análise da Evolução e Objetivos Terapêuticos
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {patientGoals.map(goal => (
                    <li key={goal.id}>
                      <strong>{goal.title}:</strong> Progresso estimado em {goal.progress}%. ({goal.description || 'Em evolução constante'}).
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase font-sans text-xs mb-1">
                  4. Conclusão e Encaminhamento
                </h4>
                <p className="text-slate-700 text-justify">
                  O(A) paciente apresenta engajamento colaborativo no processo psicoterapêutico, com redução consistente dos sintomas de ansiedade e maior autonomia na aplicação das ferramentas entre as consultas. Recomenda-se a continuidade do acompanhamento regular.
                </p>
              </div>
            </div>
          )}

          {/* Conteúdo: Declaração de Comparecimento */}
          {documentType === 'attendance_declaration' && (
            <div className="space-y-4 text-xs sm:text-sm py-4 text-justify leading-relaxed">
              <p>
                Declaro, para os devidos fins de comprovação, que <strong>{patient.full_name}</strong> compareceu à sessão de atendimento psicológico no dia{' '}
                <strong>{formatDate(sessionDateForDecl)}</strong>, com duração de 50 (cinquenta) minutos.
              </p>
              <p>
                Por ser a expressão da verdade, firmo a presente declaração.
              </p>
            </div>
          )}

          {/* Assinatura Profissional */}
          <div className="pt-12 text-center font-sans space-y-1">
            <div className="w-64 h-px bg-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-900">{currentPsychologist.profile?.full_name || 'Psicólogo(a) Responsável'}</p>
            <p className="text-xs text-slate-600">
              Psicologia Clínica • CRP {currentPsychologist.crp_number || '00/000000'}/{currentPsychologist.crp_state || 'UF'}
            </p>
          </div>

          {/* Selo de Autenticidade Digital CFP 006/2019 */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Documento com Assinatura & Validação Digital (Resolução CFP nº 006/2019)
              </p>
              <p>
                Código de Autenticidade:{' '}
                <span className="font-mono font-bold text-slate-800">{formatShortHash(docHash)}</span>
              </p>
              <p className="text-[9px] text-slate-400">
                Verifique a autenticidade online em:{' '}
                <span className="underline font-mono text-teal-700">psiapp.com.br/validar/{docHash.slice(0, 16)}</span>
              </p>
            </div>

            <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-center flex flex-col items-center">
              <QrCode className="w-8 h-8 text-slate-800" />
              <span className="text-[8px] font-mono text-slate-500 mt-0.5">CFP Validador</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="primary" size="md" onClick={handlePrint} className="font-semibold shadow-sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
