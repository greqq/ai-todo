import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { getChatAssistantPrompt } from '@/lib/ai/prompts';
import { getUserChatContext } from '@/lib/ai/chat-helpers';
import { trackAIUsage } from '@/lib/ai/cost-tracking';

/**
 * POST /api/ai/chat
 * AI chat assistant for productivity coaching
 *
 * Based on specification Section 3.10 and 6.2.9
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Gather user context for AI
    const context = await getUserChatContext(userId);

    // Generate AI prompt
    const prompt = getChatAssistantPrompt({
      userMessage: message,
      context: {
        goals: context.goals,
        todaysTasks: context.todaysTasks,
        completionRate: context.completionRate,
        energyPatterns: context.energyPatterns,
        recentReflections: context.recentReflections,
      },
    });

    // Call Claude Sonnet for chat response with streaming
    const startTime = Date.now();
    const result = await streamText({
      model: sonnet,
      prompt,
      temperature: 0.7,
      onFinish: async (event) => {
        const duration = Date.now() - startTime;

        // Track AI usage after streaming completes
        await trackAIUsage({
          userId,
          model: 'claude-sonnet-4-20250514',
          useCase: 'chat_assistant',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: event.usage?.totalTokens || 0,
          duration,
          success: true,
        });
      },
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    // Track failed AI usage
    const { userId } = await auth();
    if (userId) {
      await trackAIUsage({
        userId,
        model: 'claude-sonnet-4-20250514',
        useCase: 'chat_assistant',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        duration: 0,
        success: false,
      });
    }

    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
