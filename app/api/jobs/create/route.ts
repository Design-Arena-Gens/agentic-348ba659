import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/mock-db';
import { fileStorage } from '@/lib/file-storage';
import { jobQueue } from '@/lib/job-processor';
import { DocumentToolType, PLAN_FEATURES } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(
      `user:${user.id}`,
      PLAN_FEATURES[user.subscriptionPlan].maxJobsPerDay,
      24 * 60 * 60 * 1000
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const toolType = formData.get('toolType') as DocumentToolType;

    if (!files.length || !toolType) {
      return NextResponse.json(
        { error: 'Files and tool type are required' },
        { status: 400 }
      );
    }

    const planFeatures = PLAN_FEATURES[user.subscriptionPlan];

    // Validate file count
    if (files.length > planFeatures.maxFilesPerJob) {
      return NextResponse.json(
        { error: `Maximum ${planFeatures.maxFilesPerJob} files allowed` },
        { status: 400 }
      );
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > planFeatures.maxFileSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds size limit` },
          { status: 400 }
        );
      }
    }

    // Upload files to storage
    const inputFileKeys: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = fileStorage.generateKey(user.id, file.name);
      await fileStorage.uploadFile(key, buffer, {
        originalName: file.name,
        size: file.size,
        type: file.type,
      });
      inputFileKeys.push(key);
    }

    // Create job
    const job = db.createJob({
      userId: user.id,
      tenantId: user.tenantId,
      type: toolType,
      status: 'PENDING',
      inputFiles: inputFileKeys,
      outputFiles: [],
      progress: 0,
    });

    // Increment tenant usage
    db.incrementTenantUsage(user.tenantId);

    // Queue job for processing
    jobQueue.enqueue(job.id);

    return NextResponse.json({ jobId: job.id, remaining });
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
