import { NextResponse } from 'next/server';
import { memoryFS } from '@/lib/runner/fsMemory';
import { extractZip } from '@/lib/util/zip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const blob = new Blob([await file.arrayBuffer()]);
    const entries = await extractZip(blob);

    memoryFS.loadEntries(entries);

    return NextResponse.json({
      success: true,
      filesImported: entries.length,
    });
  } catch (error) {
    console.error('Error importing files:', error);
    return NextResponse.json(
      { error: 'Failed to import files' },
      { status: 500 }
    );
  }
}
