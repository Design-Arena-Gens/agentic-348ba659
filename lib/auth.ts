import { cookies } from 'next/headers';
import { db } from './mock-db';
import { User } from './types';

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const token = db.createSession(userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = db.getSession(token);
  if (!session) return null;

  const user = db.getUserById(session.userId);
  return user;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    db.deleteSession(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  // For demo, using simple hash
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
