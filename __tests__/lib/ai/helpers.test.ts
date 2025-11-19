// Mock the 'ai' package before importing helpers
jest.mock('ai', () => ({
  generateText: jest.fn(),
  streamText: jest.fn(),
}));

jest.mock('@/lib/ai/config', () => ({
  sonnet: { name: 'claude-sonnet-4-20250514' },
  haiku: { name: 'claude-3-5-haiku-20241022' },
}));

jest.mock('@/lib/ai/cost-tracking', () => ({
  createUsageRecord: jest.fn(() => ({ estimated_cost: 0.01 })),
  logAIUsage: jest.fn(),
  getRecommendedModel: jest.fn(() => 'claude-sonnet-4-20250514'),
}));

import {
  parseAIJsonResponse,
  validateAIResponse,
  handleAIError,
} from '@/lib/ai/helpers';

describe('AI Helper Functions', () => {
  describe('parseAIJsonResponse', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"name": "Test", "value": 123}';
      const result = parseAIJsonResponse(jsonString);
      expect(result).toEqual({ name: 'Test', value: 123 });
    });

    it('should parse JSON with markdown code blocks', () => {
      const jsonString = '```json\n{"name": "Test", "value": 123}\n```';
      const result = parseAIJsonResponse(jsonString);
      expect(result).toEqual({ name: 'Test', value: 123 });
    });

    it('should parse JSON with code blocks without newlines', () => {
      const jsonString = '```json{"name": "Test"}```';
      const result = parseAIJsonResponse(jsonString);
      expect(result).toEqual({ name: 'Test' });
    });

    it('should throw error for invalid JSON', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invalidJson = 'not a json string';
      expect(() => parseAIJsonResponse(invalidJson)).toThrow('Invalid JSON response from AI');

      consoleSpy.mockRestore();
    });

    it('should handle complex nested objects', () => {
      const jsonString = JSON.stringify({
        tasks: [
          { id: 1, title: 'Task 1' },
          { id: 2, title: 'Task 2' },
        ],
        metadata: { count: 2 },
      });
      const result = parseAIJsonResponse(jsonString);
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('metadata');
    });
  });

  describe('validateAIResponse', () => {
    interface TestResponse {
      name: string;
      age: number;
      email: string;
    }

    it('should return true for valid response with all required fields', () => {
      const response = { name: 'John', age: 30, email: 'john@example.com' };
      const isValid = validateAIResponse<TestResponse>(response, ['name', 'age', 'email']);
      expect(isValid).toBe(true);
    });

    it('should return false for response missing required fields', () => {
      const response = { name: 'John', age: 30 };
      const isValid = validateAIResponse<TestResponse>(response, ['name', 'age', 'email']);
      expect(isValid).toBe(false);
    });

    it('should return false for null response', () => {
      const isValid = validateAIResponse<TestResponse>(null, ['name', 'age']);
      expect(isValid).toBe(false);
    });

    it('should return false for non-object response', () => {
      const isValid = validateAIResponse<TestResponse>('string', ['name', 'age']);
      expect(isValid).toBe(false);
    });

    it('should return true for empty required fields array', () => {
      const response = { name: 'John' };
      const isValid = validateAIResponse<TestResponse>(response, []);
      expect(isValid).toBe(true);
    });

    it('should allow extra fields in response', () => {
      const response = { name: 'John', age: 30, email: 'john@example.com', extra: 'field' };
      const isValid = validateAIResponse<TestResponse>(response, ['name', 'age']);
      expect(isValid).toBe(true);
    });
  });

  describe('handleAIError', () => {
    it('should handle API key errors', () => {
      const error = new Error('Invalid API key provided');
      const result = handleAIError(error);
      expect(result.code).toBe('CONFIG_ERROR');
      expect(result.error).toContain('configuration error');
    });

    it('should handle rate limit errors', () => {
      const error = new Error('API rate limit exceeded');
      const result = handleAIError(error);
      expect(result.code).toBe('RATE_LIMIT');
      expect(result.error).toContain('Too many requests');
    });

    it('should handle timeout errors', () => {
      const error = new Error('Request timeout occurred');
      const result = handleAIError(error);
      expect(result.code).toBe('TIMEOUT');
      expect(result.error).toContain('timed out');
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Something went wrong');
      const result = handleAIError(error);
      expect(result.code).toBe('AI_ERROR');
      expect(result.error).toBe('Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const result = handleAIError(error);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.error).toBe('An unexpected error occurred');
    });

    it('should handle undefined errors', () => {
      const result = handleAIError(undefined);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.error).toBe('An unexpected error occurred');
    });
  });
});
