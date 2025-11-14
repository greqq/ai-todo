import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import {
  getLifeResetPhase1Prompt,
  getLifeResetPhase2Prompt,
  getLifeResetPhase3Prompt,
  getLifeResetPhase4Prompt,
  getLifeResetPhase5Prompt,
} from '@/lib/ai/prompts';
import type { LifeResetChatRequest, LifeResetChatResponse, InterviewMessage } from '@/types/life-reset.types';

/**
 * POST /api/ai/life-reset-chat
 * Handle conversational Life Reset onboarding interview
 *
 * This API manages the 5-phase interview process, using Claude Sonnet
 * to ask contextual questions and guide users through comprehensive life assessment.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LifeResetChatRequest = await request.json();
    const { phase, userMessage, previousMessages, collectedData } = body;

    if (!phase || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: phase, userMessage' },
        { status: 400 }
      );
    }

    // Validate phase number
    if (phase < 1 || phase > 5) {
      return NextResponse.json(
        { error: 'Invalid phase number. Must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Select the appropriate prompt based on current phase
    let promptFunction;
    switch (phase) {
      case 1:
        promptFunction = getLifeResetPhase1Prompt;
        break;
      case 2:
        promptFunction = getLifeResetPhase2Prompt;
        break;
      case 3:
        promptFunction = getLifeResetPhase3Prompt;
        break;
      case 4:
        promptFunction = getLifeResetPhase4Prompt;
        break;
      case 5:
        promptFunction = getLifeResetPhase5Prompt;
        break;
      default:
        return NextResponse.json(
          { error: `Invalid phase: ${phase}` },
          { status: 400 }
        );
    }

    // Generate AI response using the phase-specific prompt
    const prompt = promptFunction({
      previousMessages: previousMessages || [],
      collectedData: collectedData || {},
    });

    // Add user's message to conversation context
    const conversationContext = [
      ...previousMessages,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const { text } = await generateText({
      model: sonnet,
      prompt: `${prompt}

User's latest message: "${userMessage}"

Respond in JSON format as specified in the prompt above.`,
      temperature: 0.7,
    });

    console.log('AI Response received for phase', phase, 'length:', text.length);

    // Parse AI response
    let aiResponse;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        aiResponse = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        {
          error: 'AI response was not in expected JSON format',
          details: 'Failed to parse JSON',
          rawResponse: text.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!aiResponse.ai_message || typeof aiResponse.phase !== 'number') {
      return NextResponse.json(
        {
          error: 'AI response missing required fields',
          details: 'Response must include ai_message and phase',
          aiResponse,
        },
        { status: 500 }
      );
    }

    // Construct response
    const response: LifeResetChatResponse = {
      aiMessage: aiResponse.ai_message,
      phase: aiResponse.phase,
      needsClarification: aiResponse.needs_clarification || false,
      proceedToNextPhase: aiResponse.proceed_to_next_phase || false,
      allPhasesComplete: aiResponse.all_phases_complete || false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Life Reset Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process Life Reset interview',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/life-reset-chat
 * Get initial welcome message for Life Reset interview
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return initial welcome message for Phase 1
    const welcomeResponse: LifeResetChatResponse = {
      aiMessage: "Hi! I'm your AI Productivity Coach. I'm going to guide you through a comprehensive life assessment to help you create a personalized roadmap for your goals. This will take about 10-20 minutes, but you can take your time - there's no rush. Your answers don't need to be perfect, and you can always say 'I don't know' if something isn't clear yet. Ready to begin?",
      phase: 1,
      needsClarification: false,
      proceedToNextPhase: false,
      allPhasesComplete: false,
    };

    return NextResponse.json(welcomeResponse);
  } catch (error) {
    console.error('Life Reset Chat GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get welcome message',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
