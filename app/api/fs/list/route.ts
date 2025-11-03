import { NextResponse } from 'next/server';
import { getTree } from '@/lib/runner/fsOps';

export async function GET() {
  try {
    const tree = getTree();
    return NextResponse.json({ tree });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
