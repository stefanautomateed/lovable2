import { NextResponse } from 'next/server';
import { PlanRequestSchema } from '@/lib/util/z';
import { simpleCompletion } from '@/lib/agent/openai';
import { deriveSpecPrompt, sitePlanPrompt, SYSTEM_RULES } from '@/lib/agent/policies';
import { listFiles } from '@/lib/runner/fsOps';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 }
      );
    }

    const { prompt } = parsed.data;
    const existingFiles = listFiles();

    // Step 1: Derive specification
    const specResponse = await simpleCompletion(
      SYSTEM_RULES,
      deriveSpecPrompt(prompt, existingFiles),
      { jsonMode: true, temperature: 0.7 }
    );

    const spec = JSON.parse(specResponse);

    // Step 2: Create site plan
    const planResponse = await simpleCompletion(
      SYSTEM_RULES,
      sitePlanPrompt(spec),
      { jsonMode: true, temperature: 0.5 }
    );

    const plan = JSON.parse(planResponse);

    return NextResponse.json({
      success: true,
      spec,
      plan,
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to create plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
