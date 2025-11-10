import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { getOnboardingInterviewPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/ai/interview
 * Process onboarding interview responses and guide the conversation
 *
 * Based on specification Section 6.2.1: Onboarding Interview
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      mode = 'quick',
      questionNumber,
      totalQuestions,
      previousAnswers = {},
      currentQuestion,
      userResponse,
    } = body;

    // Validate required fields
    if (!currentQuestion || questionNumber === undefined || totalQuestions === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: currentQuestion, questionNumber, totalQuestions' },
        { status: 400 }
      );
    }

    // Build the prompt for AI
    const prompt = getOnboardingInterviewPrompt({
      mode,
      questionNumber,
      totalQuestions,
      previousAnswers: {
        ...previousAnswers,
        ...(userResponse && { [`question_${questionNumber}`]: userResponse }),
      },
      currentQuestion,
    });

    // Generate AI response
    const { text } = await generateText({
      model: sonnet,
      prompt,
      temperature: 0.7,
    });

    // Parse AI response (should be JSON)
    let aiResponse;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        aiResponse = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'AI response was not in expected format' },
        { status: 500 }
      );
    }

    // Save interview progress to database
    if (userResponse) {
      const supabase = await createClient();

      // Update user's onboarding_data with the new response
      const { error: updateError } = await supabase
        .from('users')
        // @ts-expect-error - Update type inference issue
        .update({
          onboarding_data: {
            ...previousAnswers,
            [`question_${questionNumber}`]: userResponse,
          },
          onboarding_mode: mode,
        })
        .eq('clerk_user_id', userId);

      if (updateError) {
        console.error('Failed to save interview progress:', updateError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      ai_response: aiResponse,
      progress: {
        currentQuestion: questionNumber,
        totalQuestions,
        percentage: Math.round((questionNumber / totalQuestions) * 100),
      },
    });
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: 'Failed to process interview', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
