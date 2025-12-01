export type UserRole = 'USER' | 'ADMIN';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  subscriptionPlan: SubscriptionPlan;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  subscriptionPlan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usageLimit: number;
  usageCount: number;
  fileSizeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  tenantId: string;
  type: DocumentToolType;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  inputFiles: string[];
  outputFiles: string[];
  error?: string;
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

export type DocumentToolType =
  // PDF Tools
  | 'pdf-merge' | 'pdf-split' | 'pdf-compress' | 'pdf-edit' | 'pdf-sign' | 'pdf-protect' | 'pdf-unlock'
  // Excel Tools
  | 'excel-merge' | 'excel-split' | 'excel-format' | 'excel-clean' | 'excel-to-csv' | 'csv-to-excel'
  // Word Tools
  | 'word-merge' | 'word-split' | 'word-find-replace' | 'word-format'
  // Converters
  | 'pdf-to-word' | 'pdf-to-excel' | 'pdf-to-ppt' | 'pdf-to-jpg' | 'pdf-to-txt'
  | 'word-to-pdf' | 'word-to-txt' | 'word-to-jpg'
  | 'excel-to-pdf' | 'excel-to-txt'
  | 'ppt-to-pdf' | 'ppt-to-jpg'
  | 'jpg-to-pdf' | 'txt-to-pdf';

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  tools: DocumentTool[];
}

export interface DocumentTool {
  id: DocumentToolType;
  name: string;
  description: string;
  icon: string;
  freePlan: boolean;
  proPlan: boolean;
  enterprisePlan: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
}

export interface PlanFeatures {
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxFileSize: number;
  maxFilesPerJob: number;
  maxJobsPerDay: number;
  priority: boolean;
  apiAccess: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic PDF tools',
      'Up to 5MB file size',
      '10 files per day',
      'Standard processing speed',
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFilesPerJob: 3,
    maxJobsPerDay: 10,
    priority: false,
    apiAccess: false,
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'All document tools',
      'Up to 100MB file size',
      'Unlimited files',
      'Priority processing',
      'Batch processing',
      'No watermarks',
    ],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFilesPerJob: 50,
    maxJobsPerDay: 1000,
    priority: true,
    apiAccess: false,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'All Pro features',
      'Up to 500MB file size',
      'Unlimited files',
      'Highest priority',
      'API access',
      'Custom branding',
      'SLA support',
      'Team collaboration',
    ],
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxFilesPerJob: 200,
    maxJobsPerDay: 10000,
    priority: true,
    apiAccess: true,
  },
};
