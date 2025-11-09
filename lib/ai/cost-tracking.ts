/**
 * AI Cost Tracking System
 *
 * Based on specification Section 6.3: AI Cost Optimization Strategy
 * Tracks and estimates costs for Claude API usage
 */

/**
 * Pricing for Claude models (as of Nov 2024)
 * Prices per million tokens
 */
const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3.0, // $3 per million input tokens
    output: 15.0, // $15 per million output tokens
  },
  'claude-haiku-3-5-20250101': {
    input: 0.8, // $0.80 per million input tokens
    output: 4.0, // $4 per million output tokens
  },
} as const;

/**
 * Estimated costs per operation (from spec)
 */
export const ESTIMATED_COSTS = {
  onboardingInterview: 0.15, // $0.10-0.20 per user (one-time)
  dailyTaskGeneration: 0.02, // $0.02 per day
  eveningReflection: 0.01, // $0.01 per day
  weeklySummary: 0.05, // $0.05 per week
  chatMessage: 0.02, // $0.01-0.03 per message
  taskBreakdown: 0.03,
  procrastinationAnalysis: 0.03,
  eisenhowerCategorization: 0.005, // Haiku - very cheap
} as const;

export type AIOperationType = keyof typeof ESTIMATED_COSTS;

/**
 * Interface for AI usage record
 */
export interface AIUsageRecord {
  id?: string;
  user_id: string;
  operation_type: AIOperationType;
  model_used: 'claude-sonnet-4-20250514' | 'claude-haiku-3-5-20250101';
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  timestamp: Date;
}

/**
 * Calculate cost for a specific API call
 */
export function calculateCost(
  modelName: keyof typeof PRICING,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[modelName];
  if (!pricing) {
    console.warn(`Unknown model: ${modelName}. Using Sonnet pricing as fallback.`);
    return calculateCost('claude-sonnet-4-20250514', inputTokens, outputTokens);
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Create a usage record for tracking
 */
export function createUsageRecord(params: {
  userId: string;
  operationType: AIOperationType;
  modelUsed: 'claude-sonnet-4-20250514' | 'claude-haiku-3-5-20250101';
  inputTokens: number;
  outputTokens: number;
}): AIUsageRecord {
  const estimatedCost = calculateCost(params.modelUsed, params.inputTokens, params.outputTokens);

  return {
    user_id: params.userId,
    operation_type: params.operationType,
    model_used: params.modelUsed,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    estimated_cost: estimatedCost,
    timestamp: new Date(),
  };
}

/**
 * Log AI usage to database (to be implemented with Supabase)
 */
export async function logAIUsage(record: AIUsageRecord): Promise<void> {
  try {
    // TODO: Implement Supabase logging when ai_usage table is created
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI Cost Tracking]', {
        operation: record.operation_type,
        model: record.model_used,
        cost: `$${record.estimated_cost.toFixed(4)}`,
        tokens: {
          input: record.input_tokens,
          output: record.output_tokens,
        },
      });
    }

    // In production, save to Supabase:
    // const { error } = await supabase
    //   .from('ai_usage')
    //   .insert(record);
    //
    // if (error) throw error;
  } catch (error) {
    console.error('Failed to log AI usage:', error);
    // Don't throw - cost tracking failure shouldn't break the app
  }
}

/**
 * Get estimated monthly cost per user (from spec Section 6.3)
 * Assumes typical usage pattern:
 * - Daily task generation: 30 days
 * - Evening reflection: 30 days
 * - Weekly summary: 4 weeks
 * - Chat messages: ~15-20 per month
 */
export function estimateMonthlyUserCost(): number {
  const daily = ESTIMATED_COSTS.dailyTaskGeneration * 30;
  const reflections = ESTIMATED_COSTS.eveningReflection * 30;
  const weeklySummaries = ESTIMATED_COSTS.weeklySummary * 4;
  const chatMessages = ESTIMATED_COSTS.chatMessage * 17.5; // Average 15-20

  return daily + reflections + weeklySummaries + chatMessages;
}

/**
 * Cost optimization recommendations
 */
export const COST_OPTIMIZATION_TIPS = {
  useHaikuForSimpleTasks: 'Use Haiku for categorizations and simple decisions',
  cachingStrategy: 'Cache user profile/goals context for 5-minute sessions',
  limitContext: "Don't send full task history, only relevant recent data",
  rateLimiting: 'Implement rate limiting on AI endpoints to prevent abuse',
} as const;

/**
 * Helper to determine which model to use based on operation
 */
export function getRecommendedModel(
  operationType: AIOperationType
): 'claude-sonnet-4-20250514' | 'claude-haiku-3-5-20250101' {
  // Operations that should use Haiku (simple, fast)
  const haikuOperations: AIOperationType[] = ['eisenhowerCategorization'];

  // All other operations use Sonnet for quality
  return haikuOperations.includes(operationType)
    ? 'claude-haiku-3-5-20250101'
    : 'claude-sonnet-4-20250514';
}
