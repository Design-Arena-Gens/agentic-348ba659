import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organizationName } = await request.json();

    // Validation
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create tenant
    const tenant = db.createTenant({
      name: organizationName,
      subscriptionPlan: 'FREE',
      usageLimit: 10,
      usageCount: 0,
      fileSizeLimit: 5 * 1024 * 1024,
    });

    // Create user
    const user = db.createUser({
      email,
      name,
      role: 'USER',
      tenantId: tenant.id,
      subscriptionPlan: 'FREE',
      emailVerified: false,
    });

    // In production, send verification email here
    const verificationToken = db.createVerificationToken(email);

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
