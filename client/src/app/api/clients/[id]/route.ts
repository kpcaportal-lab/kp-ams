import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const clientId = params.id;

    const result = await query(
      `SELECT c.*, 
              json_agg(json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'phone', s.phone)) 
              FILTER (WHERE s.id IS NOT NULL) as spocs,
              json_agg(json_build_object('id', p.id, 'status', p.status, 'amount', p.amount)) 
              FILTER (WHERE p.id IS NOT NULL) as proposals,
              json_agg(json_build_object('id', i.id, 'status', i.status, 'amount', i.amount)) 
              FILTER (WHERE i.id IS NOT NULL) as invoices
       FROM client c
       LEFT JOIN "clientSpoc" s ON c.id = s."clientId"
       LEFT JOIN proposal p ON c.id = p."clientId"
       LEFT JOIN invoice i ON c.id = i."clientId"
       WHERE c.id = $1 AND c."createdBy" = $2
       GROUP BY c.id`,
      [clientId, user.id]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const clientId = params.id;
    const body = await request.json();

    // Verify ownership
    const verifyResult = await query(
      'SELECT id FROM client WHERE id = $1 AND "createdBy" = $2',
      [clientId, user.id]
    );

    if (!verifyResult.rows.length) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE client 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           state = COALESCE($6, state),
           "zipCode" = COALESCE($7, "zipCode"),
           country = COALESCE($8, country),
           industry = COALESCE($9, industry),
           status = COALESCE($10, status),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        body.name || null,
        body.email || null,
        body.phone || null,
        body.address || null,
        body.city || null,
        body.state || null,
        body.zipCode || null,
        body.country || null,
        body.industry || null,
        body.status || null,
        clientId,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const clientId = params.id;

    // Verify ownership
    const verifyResult = await query(
      'SELECT id FROM client WHERE id = $1 AND "createdBy" = $2',
      [clientId, user.id]
    );

    if (!verifyResult.rows.length) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete will cascade to clientSpoc, proposal, invoice due to ON DELETE CASCADE
    await query(
      'DELETE FROM client WHERE id = $1',
      [clientId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
