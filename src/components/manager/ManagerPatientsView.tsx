'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient } from '@/types/database';
import {
  UserCheck,
  UserPlus,
  Search,
  ArrowRightLeft,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export const ManagerPatientsView: React.FC = () => {
  const {
    patients,
    clinicPsychologists,
    addPatient,
    reassignPatientPsychologist
  } = usePsi();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatientForTransfer, setSelectedPatientForTransfer] = useState<Patient | null>(null);
  const [newPsychologistId, setNewPsychologistId] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1996-04-15');
  const [gender, setGender] = useState('Feminino');
  const [assignedPsicoId, setAssignedPsicoId] = useState(clinicPsychologists[0]?.id || '');

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedPsico = clinicPsychologists.find(p => p.id === assignedPsicoId);

    addPatient({
      full_name: fullName,
      social_name: socialName || undefined,
      email,
      phone,
      birth_date: birthDate,
      gender,
      status: 'active',
      clinical_notes_overview: `Paciente institucional acolhido na clínica. Terapeuta de referência: ${assignedPsico?.full_name || 'Psicólogo(a) Titular'}.`
    });

    setIsAddPatientOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForTransfer || !newPsychologistId) return;

    const newPsico = clinicPsychologists.find(p => p.id === newPsychologistId);
    if (!newPsico) return;

    reassignPatientPsychologist(
      selectedPatientForTransfer.id,
      newPsico.id,
      newPsico.full_name
    );

    setSelectedPatientForTransfer(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Selo de Sigilo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-600" />
            Pacientes Institucionais da Clínica
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Cadastro institucional, distribuição de novos casos e reatribuição de pacientes entre os terapeutas.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddPatientOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 font-semibold text-xs shadow-sm flex-shrink-0"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Acolher Novo Paciente
        </Button>
      </div>

      {/* Aviso de Sigilo do Prontuário */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Lock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">Privacidade & Código de Ética Profissional (CFP):</span>
          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
            Como gestor da clínica, você visualiza dados cadastrais, agendamentos e terapeuta responsável. As anotações de evolução das sessões, diários e exercícios permanecem de acesso exclusivo do psicólogo responsável.
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar paciente por nome, e-mail ou telefone..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Tabela de Pacientes */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Nome do Paciente</th>
                <th className="p-3.5">Contatos</th>
                <th className="p-3.5">Terapeuta Responsável</th>
                <th className="p-3.5">Início do Acompanhamento</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ação Institucional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {patient.full_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{patient.full_name}</span>
                        {patient.social_name && (
                          <span className="text-[10px] text-slate-400">Nome social: {patient.social_name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{patient.email}</div>
                    <div className="text-[10px] text-slate-400">{patient.phone}</div>
                  </td>
                  <td className="p-3.5">
                    {(() => {
                      const assignedName = patient.clinical_notes_overview?.includes('Transferido para ')
                        ? patient.clinical_notes_overview.split('Transferido para ')[1]?.split(' em ')[0]
                        : (patient.clinical_notes_overview?.includes('Terapeuta de referência: ')
                            ? patient.clinical_notes_overview.split('Terapeuta de referência: ')[1]?.split('.')[0]
                            : 'Psicólogo(a) Titular');
                      return (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 text-[11px]">
                          {assignedName}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {formatDate(patient.started_at)}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="success" size="sm">
                      Ativo
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatientForTransfer(patient);
                        setNewPsychologistId(clinicPsychologists[1]?.id || clinicPsychologists[0]?.id || '');
                      }}
                      className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                      Reatribuir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal de Reatribuição / Transferência de Paciente */}
      <Modal
        isOpen={Boolean(selectedPatientForTransfer)}
        onClose={() => setSelectedPatientForTransfer(null)}
        title="Reatribuir Paciente na Clínica"
        description={`Transferir o paciente ${selectedPatientForTransfer?.full_name} para outro profissional do corpo clínico.`}
        maxWidth="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
            <span className="font-semibold block">Paciente Selecionado:</span>
            <p className="font-bold text-sm mt-0.5">{selectedPatientForTransfer?.full_name}</p>
            <p className="text-[11px] text-indigo-700">{selectedPatientForTransfer?.email} • {selectedPatientForTransfer?.phone}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Selecione o Novo Psicólogo Responsável:
            </label>
            <select
              value={newPsychologistId}
              onChange={e => setNewPsychologistId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              {clinicPsychologists.map(psico => (
                <option key={psico.id} value={psico.id}>
                  {psico.full_name} (CRP {psico.crp}/{psico.crp_state}) — {psico.approach}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-500">
            * O novo profissional receberá uma notificação institucional e o paciente passará a ser listado em sua agenda de atendimentos.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setSelectedPatientForTransfer(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              Confirmar Transferência
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cadastro Institucional de Paciente */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Cadastrar Novo Paciente na Clínica"
        description="Acolha um novo paciente e direcione-o para o terapeuta adequado."
        maxWidth="lg"
      >
        <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nome Social (Opcional)</label>
              <input
                type="text"
                value={socialName}
                onChange={e => setSocialName(e.target.value)}
                placeholder="Como prefere ser chamado"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="carlos@exemplo.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 97777-6666"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Direcionar para o Terapeuta</label>
              <select
                value={assignedPsicoId}
                onChange={e => setAssignedPsicoId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              >
                {clinicPsychologists.map(psico => (
                  <option key={psico.id} value={psico.id}>
                    {psico.full_name} ({psico.approach})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddPatientOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-teal-600 hover:bg-teal-700 font-bold">
              Cadastrar e Atribuir
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
