'use client';

import { useParams } from 'next/navigation';
import ClientDetailPage from '@/pages/clients/ClientDetailPage';

export default function ClientDetail() {
  const params = useParams();
  const id = params?.id as string;

  return <ClientDetailPage key={id} />;
}
