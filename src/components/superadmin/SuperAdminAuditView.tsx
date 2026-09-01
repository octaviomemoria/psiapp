'use client';

import React from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Activity,
  ShieldCheck,
  Zap,
  Server,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

export const SuperAdminAuditView: React.FC = () => {
  const { platformLogs } = usePsi();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Telemetria, Segurança & Trilha de Auditoria
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Registro temporal de auditoria em conformidade com a LGPD (Lei 13.709/2018) e resoluções do CFP.
        </p>
      </div>

      {/* Indicadores de Segurança e Auditoria */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Conformidade LGPD / CFP</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Segregação de sigilo ativa e RLS 100% verificado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Assistente de IA Ética</span>
              <p className="text-[11px] text-indigo-700 mt-0.5">Governança Humano-no-Loop (Sem automação de laudos)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-sky-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Criptografia em Trânsito & Repouso</span>
              <p className="text-[11px] text-sky-700 mt-0.5">TLS 1.3 + AES-256 no banco PostgreSQL</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs de Auditoria */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              Trilha de Auditoria em Tempo Real (Security Event Logs)
            </CardTitle>
            <CardDescription>Eventos administrativos e clínicos registrados na plataforma</CardDescription>
          </div>
          <Badge variant="success" size="sm">
            Live Stream Ativo
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Horário (UTC-3)</th>
                <th className="p-3.5">Usuário / Papel</th>
                <th className="p-3.5">Ação Executada</th>
                <th className="p-3.5">Alvo / Módulo</th>
                <th className="p-3.5">IP de Origem</th>
                <th className="p-3.5 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {platformLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 text-slate-500 font-sans">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block font-sans">{log.user_email}</span>
                    <Badge variant="purple" size="sm" className="mt-0.5 font-sans">
                      {log.user_role}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-sans font-medium text-slate-800">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-sans text-slate-600">
                    {log.target}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {log.ip_address}
                  </td>
                  <td className="p-3.5 text-right font-sans">
                    <Badge variant={log.status === 'success' ? 'success' : 'danger'} size="sm">
                      {log.status === 'success' ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
