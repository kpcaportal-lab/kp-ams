import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';
import { query } from '@/lib/db';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(); // Ensure user is authenticated

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const proposalId = formData.get('proposalId') as string;
    const assignmentId = formData.get('assignmentId') as string;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate proposalId and assignmentId ownership if provided
    if (proposalId) {
      const proposalCheck = await query(
        'SELECT id FROM proposal WHERE id = $1 AND "createdBy" = $2',
        [proposalId, user.id]
      );
      if (proposalCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Proposal not found or access denied' }, { status: 403 });
      }
    }

    if (assignmentId) {
      const assignmentCheck = await query(
        'SELECT id FROM assignment WHERE id = $1',
        [assignmentId]
      );
      if (assignmentCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 403 });
      }
    }

    // Upload to R2
    const buffer = await file.arrayBuffer();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const uploadResult = await uploadToR2(
      Buffer.from(buffer),
      sanitizedFileName,
      file.type
    );

    // Save to database with user association
    const result = await query(
      `INSERT INTO document (filename, "s3Key", url, "fileSize", "fileType", "proposalId", "assignmentId", "uploadedBy", "uploadedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        sanitizedFileName,
        uploadResult.key,
        uploadResult.url,
        uploadResult.size,
        file.type,
        proposalId || null,
        assignmentId || null,
        user.id,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
