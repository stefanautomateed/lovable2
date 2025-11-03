import { NextResponse } from 'next/server';
import { memoryFS } from '@/lib/runner/fsMemory';
import { createZip } from '@/lib/util/zip';

export async function GET() {
  try {
    const entries = memoryFS.getAllEntries();

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No files to export' },
        { status: 400 }
      );
    }

    const zipBlob = await createZip(entries);
    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="project-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting files:', error);
    return NextResponse.json(
      { error: 'Failed to export files' },
      { status: 500 }
    );
  }
}
