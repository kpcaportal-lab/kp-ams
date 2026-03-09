import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { validateAndParse, CreateClientSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM "clientSpoc" WHERE "clientId" = c.id) as spoc_count
       FROM client c WHERE c."createdBy" = $1
       ORDER BY c."createdAt" DESC`,
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/clients] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate input data
    const validatedData = await validateAndParse(CreateClientSchema, body);

    const result = await query(
      `INSERT INTO client (name, email, phone, address, city, state, "zipCode", country, industry, status, "createdBy")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        validatedData.name,
        validatedData.email,
        validatedData.phone || null,
        validatedData.address || null,
        validatedData.city || null,
        validatedData.state || null,
        validatedData.zipCode || null,
        validatedData.country || null,
        validatedData.industry || null,
        'ACTIVE',
        user.id,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[POST /api/clients] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
