import { NextResponse } from 'next/server';
import { RunRequestSchema, RefinePayloadSchema } from '@/lib/util/z';
import { simpleCompletion } from '@/lib/agent/openai';
import { implementPrompt, refinePrompt, SYSTEM_RULES } from '@/lib/agent/policies';
import { write, edit, listFiles, read, glob, grep } from '@/lib/runner/fsOps';
import { verifyFile } from '@/lib/runner/verify';
import { memoryFS } from '@/lib/runner/fsMemory';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RunRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 }
      );
    }

    const { type, payload } = parsed.data;

    switch (type) {
      case 'BUILD':
        return await handleBuild(payload);
      case 'VERIFY':
        return await handleVerify();
      case 'PREVIEW':
        return await handlePreview();
      case 'REFINE':
        return await handleRefine(payload);
      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json(
      {
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function handleBuild(payload: any) {
  const { spec, plan, currentStep, totalSteps } = payload;

  if (!spec || !plan || currentStep === undefined) {
    return NextResponse.json(
      { error: 'Missing required build parameters' },
      { status: 400 }
    );
  }

  const step = plan.steps[currentStep];
  if (!step) {
    return NextResponse.json(
      { error: 'Invalid step index' },
      { status: 400 }
    );
  }

  const existingFiles = listFiles();

  // Get implementation from LLM
  const response = await simpleCompletion(
    SYSTEM_RULES,
    implementPrompt(step, { spec, existingFiles, currentStep: currentStep + 1, totalSteps }),
    { jsonMode: true, temperature: 0.6, maxTokens: 6000 }
  );

  const implementation = JSON.parse(response);
  const appliedOps: any[] = [];

  // Apply operations
  for (const op of implementation.operations) {
    if (op.type === 'write') {
      write(op.path, op.content);
      appliedOps.push({ type: 'write', path: op.path });
    } else if (op.type === 'edit') {
      const result = edit(op.path, op.changes);
      appliedOps.push({ type: 'edit', path: op.path, success: result.success });
    }
  }

  return NextResponse.json({
    success: true,
    step: currentStep,
    summary: implementation.summary,
    appliedOps,
  });
}

async function handleVerify() {
  const entries = memoryFS.getAllEntries();
  const results = entries
    .filter(e => e.path.match(/\.(ts|tsx|js|jsx)$/))
    .map(e => verifyFile(e.path, e.content));

  const issues = results.filter(r => r.issues.length > 0);

  return NextResponse.json({
    success: true,
    results,
    hasIssues: issues.length > 0,
    issueCount: issues.reduce((sum, r) => sum + r.issues.length, 0),
  });
}

async function handlePreview() {
  // Preview is handled client-side with esbuild-wasm
  // This endpoint just confirms files are ready
  const entries = memoryFS.getAllEntries();
  const hasAppPage = entries.some(e => e.path === '/app/page.tsx');

  return NextResponse.json({
    success: true,
    ready: hasAppPage,
    fileCount: entries.length,
  });
}

async function handleRefine(payload: any) {
  const parsed = RefinePayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid refine payload' },
      { status: 400 }
    );
  }

  const { userChange } = parsed.data;

  // Extract keywords from user change
  const keywords = extractKeywords(userChange);

  // Search for relevant files
  const grepResults = keywords.flatMap(kw => grep(kw, { caseSensitive: false })).slice(0, 10);
  const relevantPaths = [...new Set(grepResults.map(r => r.path))].slice(0, 3);

  const relevantFiles = relevantPaths
    .map(path => {
      const content = read(path);
      return content ? { path, content } : null;
    })
    .filter((f): f is { path: string; content: string } => f !== null);

  // Get refinement from LLM
  const response = await simpleCompletion(
    SYSTEM_RULES,
    refinePrompt(userChange, relevantFiles, grepResults),
    { jsonMode: true, temperature: 0.5 }
  );

  const refinement = JSON.parse(response);
  const appliedOps: any[] = [];

  // Apply operations
  for (const op of refinement.operations) {
    if (op.type === 'edit') {
      const result = edit(op.path, op.changes);
      appliedOps.push({ type: 'edit', path: op.path, success: result.success });
    } else if (op.type === 'write') {
      write(op.path, op.content);
      appliedOps.push({ type: 'write', path: op.path });
    }
  }

  return NextResponse.json({
    success: true,
    summary: refinement.summary,
    appliedOps,
  });
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  const words = text.toLowerCase().match(/\w+/g) || [];
  return words.filter(w => w.length > 3 && !commonWords.has(w)).slice(0, 5);
}
