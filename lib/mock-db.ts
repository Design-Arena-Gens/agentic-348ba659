import { User, Tenant, ProcessingJob, SubscriptionPlan } from './types';

// Mock database for demo purposes
class MockDatabase {
  private users: Map<string, User> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private jobs: Map<string, ProcessingJob> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private verificationTokens: Map<string, { email: string; expiresAt: Date }> = new Map();
  private resetTokens: Map<string, { email: string; expiresAt: Date }> = new Map();

  constructor() {
    // Create demo tenant and user
    const demoTenantId = 'tenant-demo';
    const demoTenant: Tenant = {
      id: demoTenantId,
      name: 'Demo Organization',
      subscriptionPlan: 'PRO',
      usageLimit: 1000,
      usageCount: 15,
      fileSizeLimit: 100 * 1024 * 1024,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(demoTenantId, demoTenant);

    const demoUser: User = {
      id: 'user-demo',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER',
      tenantId: demoTenantId,
      subscriptionPlan: 'PRO',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
  }

  // Users
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Tenants
  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant {
    const id = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTenant: Tenant = {
      ...tenant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(id, newTenant);
    return newTenant;
  }

  getTenantById(id: string): Tenant | null {
    return this.tenants.get(id) || null;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const tenant = this.tenants.get(id);
    if (!tenant) return null;
    const updated = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updated);
    return updated;
  }

  incrementTenantUsage(tenantId: string): void {
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.usageCount += 1;
      this.tenants.set(tenantId, tenant);
    }
  }

  // Jobs
  createJob(job: Omit<ProcessingJob, 'id' | 'createdAt'>): ProcessingJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newJob: ProcessingJob = {
      ...job,
      id,
      createdAt: new Date(),
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  getJobById(id: string): ProcessingJob | null {
    return this.jobs.get(id) || null;
  }

  getJobsByUserId(userId: string): ProcessingJob[] {
    return Array.from(this.jobs.values()).filter(j => j.userId === userId);
  }

  getJobsByTenantId(tenantId: string): ProcessingJob[] {
    return Array.from(this.jobs.values()).filter(j => j.tenantId === tenantId);
  }

  updateJob(id: string, updates: Partial<ProcessingJob>): ProcessingJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  // Sessions
  createSession(userId: string, expiresAt: Date): string {
    const token = `session-${Date.now()}-${Math.random().toString(36).substr(2, 20)}`;
    this.sessions.set(token, { userId, expiresAt });
    return token;
  }

  getSession(token: string): { userId: string; expiresAt: Date } | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
  }

  // Verification tokens
  createVerificationToken(email: string): string {
    const token = `verify-${Date.now()}-${Math.random().toString(36).substr(2, 20)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.verificationTokens.set(token, { email, expiresAt });
    return token;
  }

  verifyEmail(token: string): string | null {
    const data = this.verificationTokens.get(token);
    if (!data || data.expiresAt < new Date()) {
      this.verificationTokens.delete(token);
      return null;
    }
    this.verificationTokens.delete(token);
    return data.email;
  }

  // Reset tokens
  createResetToken(email: string): string {
    const token = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 20)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    this.resetTokens.set(token, { email, expiresAt });
    return token;
  }

  verifyResetToken(token: string): string | null {
    const data = this.resetTokens.get(token);
    if (!data || data.expiresAt < new Date()) {
      this.resetTokens.delete(token);
      return null;
    }
    return data.email;
  }

  deleteResetToken(token: string): void {
    this.resetTokens.delete(token);
  }
}

export const db = new MockDatabase();
