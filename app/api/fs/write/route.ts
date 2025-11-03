import { NextResponse } from 'next/server';
import { write } from '@/lib/runner/fsOps';
import { WriteFileSchema } from '@/lib/util/z';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = WriteFileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 }
      );
    }

    const { path, content } = parsed.data;
    write(path, content);

    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json(
      { error: 'Failed to write file' },
      { status: 500 }
    );
  }
}
