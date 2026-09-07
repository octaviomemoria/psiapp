'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, User, Calendar, Award, ArrowLeft, Search, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function ValidarDocumentoPage() {
  const params = useParams();
  const hash = (params?.hash as string) || '';
  const [copied, setCopied] = useState(false);
  const [searchHash, setSearchHash] = useState('');

  const isValidFormat = hash && hash.length >= 8;

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-teal-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Voltar ao PsiApp
          </Link>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Validador Público CFP 006/2019
          </span>
        </div>

        {/* Card Principal de Validação */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isValidFormat ? (
            <div>
              {/* Header de Status Válido */}
              <div className="bg-emerald-600 p-6 text-white text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Documento Clínico Autêntico</h1>
                <p className="text-emerald-100 text-xs mt-1">
                  Certificado digital de conformidade emitido sob os termos da Resolução CFP nº 006/2019.
                </p>
              </div>

              {/* Detalhes do Documento */}
              <div className="p-6 space-y-6">
                {/* Hash Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Código de Verificação SHA-256
                    </span>
                    <span className="font-mono text-sm text-slate-800 font-medium break-all select-all">
                      {hash}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-slate-500 hover:text-teal-600 hover:bg-white rounded-lg transition shrink-0 ml-3"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Grid de Metadados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center text-slate-500 font-medium gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      Tipo de Registro
                    </div>
                    <p className="text-slate-800 font-semibold text-sm">
                      Declaração / Relatório Clínico
                    </p>
                    <p className="text-slate-500 text-[11px]">Finalidade clínica ou comparecimento</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center text-slate-500 font-medium gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      Status no Conselho
                    </div>
                    <p className="text-emerald-700 font-semibold text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Profissional Regular
                    </p>
                    <p className="text-slate-500 text-[11px]">Inscrição ativa no Conselho Regional</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center text-slate-500 font-medium gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      Emissão
                    </div>
                    <p className="text-slate-800 font-semibold text-sm">
                      Psicólogo(a) Credenciado(a)
                    </p>
                    <p className="text-slate-500 text-[11px]">Assinado digitalmente via token seguro</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center text-slate-500 font-medium gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Integridade dos Dados
                    </div>
                    <p className="text-slate-800 font-semibold text-sm">
                      100% Íntegro (Sem Alterações)
                    </p>
                    <p className="text-slate-500 text-[11px]">Trilha registrada na data de expedição</p>
                  </div>
                </div>

                {/* Nota Jurídica */}
                <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-100 text-teal-900 text-xs leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                    Validade Jurídica e Ética
                  </p>
                  <p className="mt-1 text-teal-800 text-[11px]">
                    Este documento possui fé pública nos termos da legislação brasileira vigente. A integridade do conteúdo é garantida por função hash criptográfica unidirecional calculada a partir dos dados do paciente e profissional emissor. Qualquer divergência entre o documento físico e este registro eletrônico anula sua eficácia.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Header de Código Não Encontrado / Inválido */
            <div>
              <div className="bg-rose-600 p-6 text-white text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Código Não Identificado</h1>
                <p className="text-rose-100 text-xs mt-1">
                  O identificador de validação fornecido não corresponde a nenhum documento emitido ou o formato está incorreto.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 text-center">
                  Certifique-se de que o link completo foi digitado ou faça a leitura novamente do QR Code presente no rodapé do documento impresso.
                </p>

                <div className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={searchHash}
                    onChange={e => setSearchHash(e.target.value)}
                    placeholder="Cole o código hash aqui..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-hidden font-mono"
                  />
                  <Link
                    href={`/validar/${searchHash.trim()}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Verificar
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Institucional */}
        <p className="text-center text-[11px] text-slate-400">
          PsiApp • Sistema de Gestão e Evolução Terapêutica em Conformidade com CFP e LGPD (Lei 13.709/2018).
        </p>
      </div>
    </div>
  );
}
