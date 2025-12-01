import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For demo, accept any password for demo@example.com
    if (email === 'demo@example.com') {
      const user = db.getUserByEmail(email);
      if (user) {
        await createSession(user.id);
        return NextResponse.json({ success: true, user });
      }
    }

    // Regular authentication would happen here
    // For now, return error for non-demo accounts
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
