import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fileStorage } from '@/lib/file-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileKey: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileKey = decodeURIComponent(params.fileKey);

    // Verify file belongs to user
    if (!fileKey.startsWith(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const file = await fileStorage.getFile(fileKey);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Determine content type
    const contentType = file.metadata?.type || 'application/octet-stream';

    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.metadata?.originalName || 'download'}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
