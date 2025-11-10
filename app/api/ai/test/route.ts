/**
 * AI Test API Route
 *
 * Tests both Claude Sonnet and Haiku connections
 * Verifies cost tracking and error handling
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateWithTracking, handleAIError } from '@/lib/ai/helpers';
import { estimateMonthlyUserCost } from '@/lib/ai/cost-tracking';

export const runtime = 'edge';

/**
 * GET /api/ai/test
 * Tests AI integration with both models
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test Sonnet 4.5 (complex reasoning)
    const sonnetResult = await generateWithTracking({
      userId,
      operationType: 'chatMessage',
      prompt:
        'You are a productivity coach. In one sentence, explain why setting goals is important.',
      modelOverride: 'claude-sonnet-4-20250514',
    });

    // Test Haiku 3.5 (simple categorization)
    const haikuResult = await generateWithTracking({
      userId,
      operationType: 'eisenhowerCategorization',
      prompt:
        'Categorize this task: "Check email". Is it urgent and important? Answer in 5 words or less.',
      modelOverride: 'claude-3-5-haiku-20241022',
    });

    // Calculate estimated monthly cost
    const monthlyEstimate = estimateMonthlyUserCost();

    return NextResponse.json(
      {
        success: true,
        message: 'AI integration is working correctly',
        tests: {
          sonnet: {
            model: 'claude-sonnet-4-20250514',
            modelName: 'Claude Sonnet 4.5',
            response: sonnetResult.text,
            cost: sonnetResult.cost,
            tokens: sonnetResult.usage,
          },
          haiku: {
            model: 'claude-3-5-haiku-20241022',
            modelName: 'Claude Haiku 3.5 (4.5 not yet available)',
            response: haikuResult.text,
            cost: haikuResult.cost,
            tokens: haikuResult.usage,
          },
        },
        costEstimates: {
          thisRequest: sonnetResult.cost + haikuResult.cost,
          estimatedMonthlyPerUser: monthlyEstimate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI test error:', error);
    const { error: errorMessage, code } = handleAIError(error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/test
 * Tests AI with custom prompt
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateWithTracking({
      userId,
      operationType: 'chatMessage',
      prompt,
      modelOverride: model || 'claude-sonnet-4-20250514',
    });

    return NextResponse.json(
      {
        success: true,
        response: result.text,
        cost: result.cost,
        usage: result.usage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI test error:', error);
    const { error: errorMessage, code } = handleAIError(error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code,
      },
      { status: 500 }
    );
  }
}
