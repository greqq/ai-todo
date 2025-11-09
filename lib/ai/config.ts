/**
 * AI Configuration for Claude Models
 *
 * Based on specification Section 6.1: AI Provider Setup
 * - Claude Sonnet: Complex reasoning, goal analysis, coaching, weekly summaries
 * - Claude Haiku: Quick tasks, simple classifications, routine generations
 */

import { anthropic } from '@ai-sdk/anthropic';

// Validate API key is present
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set. AI features will not work.');
}

/**
 * Claude Sonnet Model Configuration
 * Use for: Complex reasoning, goal analysis, coaching conversations,
 * weekly summaries, task breakdown, procrastination analysis
 */
export const sonnet = anthropic('claude-3-5-sonnet-20241022');

/**
 * Claude Haiku Model Configuration
 * Use for: Quick categorizations, simple yes/no decisions,
 * task duration estimates, context tag suggestions, simple formatting
 */
export const haiku = anthropic('claude-3-5-haiku-20241022');

/**
 * Model selection helper
 * Automatically selects appropriate model based on task complexity
 */
export function selectModel(taskComplexity: 'simple' | 'complex') {
  return taskComplexity === 'complex' ? sonnet : haiku;
}

/**
 * Common AI generation options
 */
export const defaultGenerationOptions = {
  temperature: 0.7,
  maxTokens: 2000,
};

/**
 * Streaming options for real-time responses
 */
export const streamingOptions = {
  temperature: 0.7,
  maxTokens: 2000,
};
