import { cookies } from 'next/headers';
import * as jose from 'jose';
import { User } from '@/types';

/**
 * Ensures the user is authenticated by verifying the 'kp_token' cookie.
 * In Next.js 15, cookies() is async.
 */
export async function requireAuth(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get('kp_token')?.value;

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Payload matches the structure from server/src/routes/auth.ts
    return payload as unknown as User;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

/**
 * Returns the current user or null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
