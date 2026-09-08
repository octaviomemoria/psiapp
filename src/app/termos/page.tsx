import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Termos de Serviço — PsiApp Gestão',
  description: 'Termos e condições de uso da plataforma PsiApp Gestão.',
};

export default function TermsPage() {
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
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Contrato de Uso</span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">Termos de Serviço</h1>
            <p className="text-sm text-slate-500 mt-2">Última atualização: Setembro de 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Aceitação dos Termos</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ao acessar ou utilizar a plataforma <strong>PsiApp Gestão</strong> (disponível em <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-700">psiappgestao.vercel.app</code>), você concorda expressamente com os presentes Termos de Serviço e com nossa Política de Privacidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Descrição dos Serviços</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              O PsiApp é uma plataforma tecnológica voltada para profissionais de psicologia e terapeutas, oferecendo ferramentas de agendamento de consultas, registro de sessões, acompanhamento terapêutico e controle financeiro de consultório.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Responsabilidade do Profissional</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              O psicólogo ou terapeuta cadastrado é o único responsável pela veracidade das informações clínicas e prontuários inseridos, devendo zelar pelo cumprimento do Código de Ética Profissional e resoluções do Conselho Federal de Psicologia (CFP).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Integrações de Terceiros (Google Calendar)</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A plataforma permite a integração com serviços de terceiros, como o Google Agenda (Google Calendar). O usuário é livre para conectar e desconectar sua conta a qualquer momento, sendo de sua exclusiva responsabilidade a autorização de acesso concedida à sua respectiva conta Google.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-900">5. Contato</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dúvidas ou solicitações relativas a estes Termos de Serviço podem ser encaminhadas para: <a href="mailto:octacm@gmail.com" className="text-teal-600 hover:underline">octacm@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        PsiApp Gestão © 2026. Todos os direitos reservados.
      </footer>
    </div>
  );
}
