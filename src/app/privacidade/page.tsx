import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade — PsiApp Gestão',
  description: 'Política de privacidade, proteção de dados e conformidade com APIs do Google e LGPD.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-teal-700 text-lg">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black">Ψ</div>
            <span>PsiApp Gestão</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ← Voltar ao App
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Transparência e Segurança</span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">Política de Privacidade</h1>
            <p className="text-sm text-slate-500 mt-2">Última atualização: Setembro de 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Introdução</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              O <strong>PsiApp Gestão</strong> (disponível em <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-700">psiappgestao.vercel.app</code>) é uma plataforma desenhada para psicólogos, terapeutas e seus pacientes, com o objetivo de organizar agendamentos, prontuários, evoluções terapêuticas e gestão financeira.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e o <strong>Código de Ética Profissional do Psicólogo (CFP)</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Dados Coletados</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li><strong>Dados Cadastrais do Profissional:</strong> Nome, e-mail, telefone, CRP, especialidades e configurações de atendimento.</li>
              <li><strong>Dados de Pacientes:</strong> Nome, contato, histórico de consultas e anotações clínicas inseridas sob sigilo pelo psicólogo responsável.</li>
              <li><strong>Dados de Agendamento e Financeiro:</strong> Datas, horários, status de comparecimento, valores de sessões e recibos.</li>
              <li><strong>Dados Técnicos:</strong> Registros de log de segurança, endereço IP e identificadores de sessão com a finalidade exclusiva de auditoria e autenticação.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-teal-50/70 p-6 rounded-xl border border-teal-100">
            <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              3. Integração com APIs do Google (Google Calendar)
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              O PsiApp oferece a funcionalidade opcional de sincronização bidirecional com o <strong>Google Agenda (Google Calendar API)</strong> para que o psicólogo possa visualizar e sincronizar os horários de suas consultas diretamente em seu calendário pessoal ou profissional.
            </p>
            <div className="text-sm text-slate-700 space-y-2 mt-2">
              <p>
                <strong>Uso de dados da API do Google:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>O PsiApp solicita acesso ao escopo <code className="bg-teal-100/70 text-teal-900 px-1.5 py-0.5 rounded text-xs font-mono">https://www.googleapis.com/auth/calendar.events</code> estritamente para ler, criar ou atualizar eventos correspondentes às consultas agendadas pelo usuário na plataforma.</li>
                <li><strong>Não compartilhamento:</strong> Os dados obtidos por meio das APIs do Google não são vendidos, compartilhados com terceiros, nem utilizados para veiculação de anúncios de publicidade.</li>
                <li><strong>Não utilização para IA:</strong> Os dados de eventos do Google Calendar não são utilizados para treinamento de modelos de linguagem ou inteligência artificial.</li>
                <li>O uso e a transferência para qualquer outro aplicativo das informações recebidas das APIs do Google pelo PsiApp respeitam integralmente a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-medium">Google API Services User Data Policy</a>, incluindo os requisitos de uso limitado (<em>Limited Use requirements</em>).</li>
                <li>Você pode desconectar sua conta do Google e revogar o acesso a qualquer momento nas configurações do PsiApp ou diretamente na página de segurança da sua Conta Google.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Segurança e Sigilo dos Dados</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Todas as comunicações entre o seu navegador e nossos servidores são protegidas por criptografia <strong>TLS/HTTPS</strong> com certificados modernos. O banco de dados opera com isolamento de tenant através de políticas de <strong>Row Level Security (RLS)</strong>, garantindo que nenhum profissional ou paciente tenha acesso aos registros de outro usuário.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Seus Direitos (LGPD)</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conforme o Artigo 18 da LGPD, você tem direito a solicitar a qualquer momento a confirmação da existência de tratamento, acesso aos seus dados, correção de dados incompletos ou inexatos, anonimização, bloqueio ou eliminação de dados desnecessários, e a revogação de consentimentos concedidos.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-900">6. Contato do Desenvolvedor e Encarregado de Dados</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Para dúvidas sobre esta política, exercício de direitos LGPD ou revogação de acessos, entre em contato com nosso time:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
              <p className="font-semibold text-slate-800">PsiApp Gestão — Suporte & Privacidade</p>
              <p className="text-slate-600 mt-1">E-mail: <a href="mailto:octacm@gmail.com" className="text-teal-600 hover:underline">octacm@gmail.com</a></p>
              <p className="text-slate-600">Website: <a href="https://psiappgestao.vercel.app" className="text-teal-600 hover:underline">https://psiappgestao.vercel.app</a></p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        PsiApp Gestão © 2026. Todos os direitos reservados.
      </footer>
    </div>
  );
}
