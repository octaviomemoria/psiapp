import type { Metadata } from 'next';
import { PublicAnamnesisClient } from '@/components/anamnesis/PublicAnamnesisClient';

// Link pessoal e de uso único: não deve ser indexado nem repassado a terceiros.
export const metadata: Metadata = {
  title: 'Anamnese — PsiApp',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function AnamnesePage({ params }: { params: { token: string } }) {
  return <PublicAnamnesisClient token={decodeURIComponent(params.token)} />;
}
