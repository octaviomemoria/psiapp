import type { Metadata } from 'next';
import { PublicBookingClient } from '@/components/public/PublicBookingClient';

// Link privado do profissional: não deve aparecer em buscadores.
export const metadata: Metadata = {
  title: 'Agendar consulta — PsiApp',
  robots: { index: false, follow: false },
};

export default function AgendarPage({ params }: { params: { slug: string } }) {
  return <PublicBookingClient slug={decodeURIComponent(params.slug).toLowerCase()} />;
}
