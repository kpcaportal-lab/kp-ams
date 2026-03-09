'use client';

import { useParams } from 'next/navigation';
import ProposalDetailPage from '@/pages/proposals/ProposalDetailPage';

export default function ProposalDetail() {
  const params = useParams();
  const id = params.id as string;
  
  return <ProposalDetailPage key={id} />;
}
