import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new NextResponse('Unsupported file type', { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return new NextResponse('File exceeds 2MB limit', { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const derivedExtension = ALLOWED_MIME_TYPES.get(file.type);
    const safeExtension =
      derivedExtension ||
      extname(file.name).toLowerCase() ||
      '.bin';
    const filename = `${randomUUID()}${safeExtension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, filename), fileBuffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
