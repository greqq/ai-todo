/**
 * AI Helper Functions
 * Common utilities for AI operations
 */

import { generateText, streamText } from 'ai';
import { sonnet, haiku } from './config';
import {
  createUsageRecord,
  logAIUsage,
  getRecommendedModel,
  type AIOperationType,
} from './cost-tracking';

/**
 * Generate text with automatic cost tracking
 */
export async function generateWithTracking(params: {
  userId: string;
  operationType: AIOperationType;
  prompt: string;
  modelOverride?: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022';
  temperature?: number;
}) {
  const modelName = params.modelOverride || getRecommendedModel(params.operationType);
  const model = modelName === 'claude-3-5-haiku-20241022' ? haiku : sonnet;

  try {
    const result = await generateText({
      model,
      prompt: params.prompt,
      temperature: params.temperature || 0.7,
    });

    // Track usage
    const usageRecord = createUsageRecord({
      userId: params.userId,
      operationType: params.operationType,
      modelUsed: modelName,
      inputTokens: result.usage?.totalTokens || 0,
      outputTokens: result.usage?.totalTokens || 0,
    });

    await logAIUsage(usageRecord);

    return {
      text: result.text,
      usage: result.usage,
      cost: usageRecord.estimated_cost,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Stream text with automatic cost tracking
 */
export async function streamWithTracking(params: {
  userId: string;
  operationType: AIOperationType;
  prompt: string;
  modelOverride?: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022';
  temperature?: number;
}) {
  const modelName = params.modelOverride || getRecommendedModel(params.operationType);
  const model = modelName === 'claude-3-5-haiku-20241022' ? haiku : sonnet;

  try {
    const result = await streamText({
      model,
      prompt: params.prompt,
      temperature: params.temperature || 0.7,
      onFinish: async (event) => {
        // Track usage after streaming completes
        const usageRecord = createUsageRecord({
          userId: params.userId,
          operationType: params.operationType,
          modelUsed: modelName,
          inputTokens: event.usage?.totalTokens || 0,
          outputTokens: event.usage?.totalTokens || 0,
        });

        await logAIUsage(usageRecord);
      },
    });

    return result;
  } catch (error) {
    console.error('AI streaming error:', error);
    throw new Error('Failed to stream AI response');
  }
}

/**
 * Parse JSON response from AI with error handling
 */
export function parseAIJsonResponse<T>(text: string): T {
  try {
    // Remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON response:', error);
    console.error('Raw response:', text);
    throw new Error('Invalid JSON response from AI');
  }
}

/**
 * Validate AI response structure
 */
export function validateAIResponse<T>(
  response: unknown,
  requiredFields: (keyof T)[]
): response is T {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every((field) => field in response);
}

/**
 * Common error handler for AI operations
 */
export function handleAIError(error: unknown): { error: string; code: string } {
  if (error instanceof Error) {
    // Check for specific API errors
    if (error.message.includes('API key')) {
      return {
        error: 'AI service configuration error. Please contact support.',
        code: 'CONFIG_ERROR',
      };
    }

    if (error.message.includes('rate limit')) {
      return {
        error: 'Too many requests. Please try again in a moment.',
        code: 'RATE_LIMIT',
      };
    }

    if (error.message.includes('timeout')) {
      return {
        error: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
      };
    }

    return {
      error: error.message,
      code: 'AI_ERROR',
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}
