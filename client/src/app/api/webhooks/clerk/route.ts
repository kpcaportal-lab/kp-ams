import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { query } from '@/lib/db';

// Verify webhook signature
const validateRequest = (req: NextRequest, rawBody: string, signature: string): boolean => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured');
      return false;
    }

    const wh = new Webhook(webhookSecret);
    wh.verify(rawBody, {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': signature,
    });
    return true;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return false;
  }
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get('svix-signature') || '';
  const rawBody = await req.text();

  if (!validateRequest(req, rawBody, signature)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Invalid JSON payload:', err);
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = event.data;
        const email = email_addresses?.[0]?.email_address;

        if (!email) {
          console.warn(`User ${id} has no email address`);
          return NextResponse.json(
            { error: 'No email found' },
            { status: 400 }
          );
        }

        const name = `${first_name || ''} ${last_name || ''}`.trim();

        // Upsert user
        await query(
          `INSERT INTO "user" ("clerkId", email, name, role, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT ("clerkId") DO UPDATE SET
           email = $2, name = $3, "updatedAt" = CURRENT_TIMESTAMP`,
          [id, email, name || email.split('@')[0], 'USER']
        );

        console.log(`User ${id} (${email}) synced successfully`);
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;

        try {
          await query(
            'DELETE FROM "user" WHERE "clerkId" = $1',
            [id]
          );
          console.log(`User ${id} deleted successfully`);
        } catch (err) {
          console.error(`Error deleting user ${id}:`, err);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
