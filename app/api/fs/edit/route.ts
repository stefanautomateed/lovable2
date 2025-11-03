import { NextResponse } from 'next/server';
import { edit } from '@/lib/runner/fsOps';
import { EditFileSchema } from '@/lib/util/z';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = EditFileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 }
      );
    }

    const { path, changes } = parsed.data;
    const result = edit(path, changes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      path,
      appliedChanges: result.appliedChanges,
    });
  } catch (error) {
    console.error('Error editing file:', error);
    return NextResponse.json(
      { error: 'Failed to edit file' },
      { status: 500 }
    );
  }
}
