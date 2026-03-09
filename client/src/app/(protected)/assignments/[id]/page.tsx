'use client';

import { useParams } from 'next/navigation';
import AssignmentDetailPage from '@/pages/assignments/AssignmentDetailPage';

export default function AssignmentDetail() {
  const params = useParams();
  const id = params?.id as string;

  return <AssignmentDetailPage key={id} />;
}
