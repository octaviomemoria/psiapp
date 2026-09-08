'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Building2, Palette, Save, CheckCircle2, Shield, MapPin, Phone, FileText } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface ClinicBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ClinicBrandingSettings {
  clinicName: string;
  tagline: string;
  primaryColor: 'teal' | 'indigo' | 'emerald' | 'violet' | 'rose' | 'slate';
  cnpj: string;
  address: string;
  phone: string;
}

const DEFAULT_BRANDING: ClinicBrandingSettings = {
  clinicName: 'Clínica de Psicologia Integrada',
  tagline: 'Psicoterapia Baseada em Evidências & Cuidado Longitudinal',
  primaryColor: 'teal',
  cnpj: '12.345.678/0001-90',
  address: 'Av. Paulista, 1000, Conjunto 501 — Bela Vista, São Paulo/SP',
  phone: '(11) 3456-7890',
};

const COLOR_OPTIONS: { id: ClinicBrandingSettings['primaryColor']; name: string; bg: string; border: string }[] = [
  { id: 'teal', name: 'Verde Petróleo (Clássico)', bg: 'bg-teal-600', border: 'border-teal-600' },
  { id: 'indigo', name: 'Índigo Moderno', bg: 'bg-indigo-600', border: 'border-indigo-600' },
  { id: 'emerald', name: 'Esmeralda Saúde', bg: 'bg-emerald-600', border: 'border-emerald-600' },
  { id: 'violet', name: 'Violeta Sereno', bg: 'bg-violet-600', border: 'border-violet-600' },
  { id: 'rose', name: 'Rosa Acolhimento', bg: 'bg-rose-600', border: 'border-rose-600' },
  { id: 'slate', name: 'Grafite Sobriedade', bg: 'bg-slate-700', border: 'border-slate-700' },
];

export const ClinicBrandingModal: React.FC<ClinicBrandingModalProps> = ({ isOpen, onClose }) => {
  const [branding, setBranding] = useState<ClinicBrandingSettings>(DEFAULT_BRANDING);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('psi_clinic_branding');
      if (saved) {
        try {
          setBranding(JSON.parse(saved));
        } catch (e) {
          console.error('Erro ao ler branding salvo:', e);
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('psi_clinic_branding', JSON.stringify(branding));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalização de Marca & Identidade Visual (White-Label)"
      description="Configure o nome, cores e dados cadastrais da clínica para recibos, laudos e cockpit."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Nome Comercial e Slogan */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome Fantasia da Clínica ou Consultório
            </label>
            <input
              type="text"
              value={branding.clinicName}
              onChange={e => setBranding({ ...branding, clinicName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-hidden bg-white"
              placeholder="Ex: Espaço Terapêutico Florescer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Slogan / Subtítulo Institucional
            </label>
            <input
              type="text"
              value={branding.tagline}
              onChange={e => setBranding({ ...branding, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-hidden bg-white"
              placeholder="Ex: TCC, Mindfulness e Desenvolvimento Pessoal"
            />
          </div>
        </div>

        {/* Seletor de Paleta de Cores */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-teal-600" />
            Paleta de Cores Principal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {COLOR_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBranding({ ...branding, primaryColor: opt.id })}
                className={`p-2 rounded-xl border flex items-center gap-2 text-left transition ${
                  branding.primaryColor === opt.id
                    ? `${opt.border} ring-2 ring-teal-500/20 bg-white font-semibold text-slate-900`
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${opt.bg} shrink-0`} />
                <span className="text-[11px] truncate">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dados Legais para Laudos e Recibos */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Dados Cadastrais para Documentos Oficiais
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">CNPJ / CPF Jurídico</label>
              <input
                type="text"
                value={branding.cnpj}
                onChange={e => setBranding({ ...branding, cnpj: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Telefone de Contato</label>
              <input
                type="text"
                value={branding.phone}
                onChange={e => setBranding({ ...branding, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Endereço Completo do Consultório</label>
            <input
              type="text"
              value={branding.address}
              onChange={e => setBranding({ ...branding, address: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1.5 font-semibold shadow-xs"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Salvar Identidade Visual
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
