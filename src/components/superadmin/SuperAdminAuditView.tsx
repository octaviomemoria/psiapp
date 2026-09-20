'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, Terminal, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { SupabaseService, AdminAuditRow } from '@/lib/supabase/service';
import {
  AUDIT_TABLE_LABELS,
  auditActionLabel,
  auditActionVariant,
  auditTableLabel,
  shortId,
} from '@/lib/audit/labels';

const PAGE_SIZE = 50;

export const SuperAdminAuditView: React.FC = () => {
  const [rows, setRows] = useState<AdminAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [tableFilter, setTableFilter] = useState('');

  const load = useCallback(async (reset: boolean, offset = 0) => {
    setLoading(true);
    setError(null);
    const result = await SupabaseService.getAdminAuditLog({
      from: reset ? 0 : offset,
      pageSize: PAGE_SIZE,
      table: tableFilter || undefined,
    });
    if (!result.ok) {
      setError(result.error || 'Não foi possível carregar a auditoria.');
      if (reset) setRows([]);
      setHasMore(false);
    } else {
      const page = result.data || [];
      setRows(prev => (reset ? page : [...prev, ...page]));
      setHasMore(page.length === PAGE_SIZE);
    }
    setLoading(false);
  }, [tableFilter]);

  useEffect(() => {
    load(true);
  }, [load]);

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.action] = (acc[r.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Trilha de Auditoria Clínica
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Eventos reais registrados pelo banco de dados (criação, alteração e exclusão de registros clínicos).
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Sigilo preservado</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Esta tela mostra apenas metadados. O conteúdo dos prontuários e das anotações nunca é exibido.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Eventos carregados</span>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                {rows.length} no total · {counts.INSERT || 0} criações · {counts.UPDATE || 0} alterações · {counts.DELETE || 0} exclusões
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-sky-50/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Origem dos dados</span>
              <p className="text-[11px] text-sky-700 mt-0.5">Gatilhos do PostgreSQL. Só o superadmin lê esta visão; ninguém altera ou apaga o log.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              Eventos de auditoria
            </CardTitle>
            <CardDescription>Mais recentes primeiro</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={tableFilter}
              onChange={e => setTableFilter(e.target.value)}
              aria-label="Filtrar por tipo de registro"
              className="text-xs border border-slate-200 rounded-xl px-2 py-1.5 bg-white"
            >
              <option value="">Todos os registros</option>
              {Object.entries(AUDIT_TABLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {error && (
            <div role="alert" className="m-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!error && !loading && rows.length === 0 && (
            <p className="p-6 text-xs text-slate-500">
              Nenhum evento encontrado. Se você esperava ver eventos, confirme que esta conta tem o papel de superadmin:
              a visão de auditoria fica vazia para qualquer outro perfil.
            </p>
          )}

          {rows.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Data e hora</th>
                  <th className="p-3.5">Ação</th>
                  <th className="p-3.5">Registro</th>
                  <th className="p-3.5">ID do registro</th>
                  <th className="p-3.5">Executado por</th>
                  <th className="p-3.5">Campos alterados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-slate-500">{formatDateTime(row.created_at)}</td>
                    <td className="p-3.5">
                      <Badge variant={auditActionVariant(row.action)} size="sm">{auditActionLabel(row.action)}</Badge>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{auditTableLabel(row.table_name)}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500" title={row.record_id}>{shortId(row.record_id)}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500" title={row.performed_by || 'sistema'}>
                      {row.performed_by ? shortId(row.performed_by) : 'sistema'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {row.changed_columns && row.changed_columns.length > 0 ? row.changed_columns.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {hasMore && (
            <div className="p-4 text-center">
              <Button variant="outline" size="sm" onClick={() => load(false, rows.length)} disabled={loading}>
                {loading ? 'Carregando...' : 'Carregar mais'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
