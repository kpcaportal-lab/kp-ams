import { auth } from '@clerk/nextjs/server';
import { query } from './db';

/**
 * Get current user from Clerk and sync with database
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const result = await query(
      'SELECT * FROM "user" WHERE "clerkId" = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.warn(`User ${userId} not found in database`);
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: string) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const roleHierarchy = {
    ADMIN: 3,
    USER: 2,
    CLIENT: 1,
  };

  return (roleHierarchy[user.role as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
}
