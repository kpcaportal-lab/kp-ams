'use client';

import { useParams } from 'next/navigation';
import EditProposalPage from '@/pages/proposals/EditProposalPage';

export default function EditProposal() {
  const params = useParams();
  const id = params.id as string;
  
  return <EditProposalPage key={id} />;
}
