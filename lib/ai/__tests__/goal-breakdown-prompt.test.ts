/**
 * Test file for Goal Breakdown Prompt
 * Validates that the prompt handles various goal durations and edge cases
 */

import { getGoalBreakdownPrompt } from '../prompts';

describe('Goal Breakdown Prompt', () => {
  describe('Duration-based hierarchy generation', () => {
    it('should generate 4-level hierarchy for 12-month goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Launch successful SaaS product',
        goalDescription: 'Build and launch a B2B SaaS product with paying customers',
        goalType: 'career',
        startDate: '2025-01-01',
        targetDate: '2025-12-31',
        successCriteria: ['10 paying customers', '$5K MRR', 'Product-market fit achieved'],
        userContext: {
          workHoursStart: '09:00',
          workHoursEnd: '17:00',
          energyPeakTime: 'morning',
          timezone: 'America/New_York'
        }
      });

      // Should include all 4 levels in prompt
      expect(prompt).toContain('long_term');
      expect(prompt).toContain('quarterly');
      expect(prompt).toContain('monthly');
      expect(prompt).toContain('weekly');
      expect(prompt).toContain('12 months');
      expect(prompt).toContain('Launch successful SaaS product');
      expect(prompt).toContain('10 paying customers');
    });

    it('should generate 3-level hierarchy for 6-month goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Complete advanced web development course',
        goalType: 'personal_growth',
        startDate: '2025-01-01',
        targetDate: '2025-06-30',
        successCriteria: ['Complete all modules', 'Build 3 portfolio projects']
      });

      expect(prompt).toContain('quarterly');
      expect(prompt).toContain('monthly');
      expect(prompt).toContain('weekly');
      expect(prompt).not.toContain('long_term');
      expect(prompt).toContain('6 months');
    });

    it('should generate 2-level hierarchy for 3-month goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Lose 15 pounds',
        goalType: 'health',
        startDate: '2025-01-01',
        targetDate: '2025-03-31',
        successCriteria: ['Reach 165 lbs', 'Exercise 4x/week consistently']
      });

      expect(prompt).toContain('monthly');
      expect(prompt).toContain('weekly');
      expect(prompt).not.toContain('quarterly');
      expect(prompt).not.toContain('long_term');
      expect(prompt).toContain('3 months');
    });

    it('should generate weekly-only hierarchy for short goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Complete home office setup',
        goalType: 'other',
        startDate: '2025-01-01',
        targetDate: '2025-01-31',
        successCriteria: ['Desk and chair purchased', 'Lighting installed', 'Cable management complete']
      });

      expect(prompt).toContain('weekly');
      expect(prompt).not.toContain('monthly');
      expect(prompt).not.toContain('quarterly');
      expect(prompt).toContain('1 months'); // or less
    });
  });

  describe('Edge case handling', () => {
    it('should handle vague goal with minimal information', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Get better at programming',
        goalType: 'personal_growth',
        startDate: '2025-01-01',
        targetDate: '2025-06-30'
      });

      expect(prompt).toContain('Get better at programming');
      expect(prompt).toContain('Not provided'); // description
      expect(prompt).toContain('Not specified'); // success criteria
      expect(prompt).toContain('vague');
      expect(prompt).toContain('flag that refinement may be needed');
    });

    it('should handle very long duration goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Become senior software engineer',
        goalType: 'career',
        startDate: '2025-01-01',
        targetDate: '2026-12-31', // 24 months
        successCriteria: ['Promotion to senior role', 'Lead major project']
      });

      expect(prompt).toContain('24 months');
      expect(prompt).toContain('ambitious');
      expect(prompt).toContain('Warn that this is ambitious');
    });

    it('should handle goal without user context', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Write a book',
        goalType: 'creative',
        startDate: '2025-01-01',
        targetDate: '2025-12-31'
      });

      expect(prompt).toContain('Write a book');
      expect(prompt).toContain('12 months');
      // Should still work without user context
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe('Prompt structure and requirements', () => {
    it('should include all required fields in output format', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Complete marathon',
        goalType: 'health',
        startDate: '2025-01-01',
        targetDate: '2025-10-01'
      });

      // Check that JSON output structure is defined
      expect(prompt).toContain('breakdown');
      expect(prompt).toContain('title');
      expect(prompt).toContain('description');
      expect(prompt).toContain('level');
      expect(prompt).toContain('target_date');
      expect(prompt).toContain('success_criteria');
      expect(prompt).toContain('initial_tasks');
      expect(prompt).toContain('breakdown_notes');
      expect(prompt).toContain('refinement_suggestions');
    });

    it('should include breakdown strategy guidance', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Master Spanish language',
        goalType: 'personal_growth',
        startDate: '2025-01-01',
        targetDate: '2025-12-31'
      });

      expect(prompt).toContain('BREAKDOWN STRATEGY');
      expect(prompt).toContain('Work backwards');
      expect(prompt).toContain('foundational work');
      expect(prompt).toContain('core execution');
      expect(prompt).toContain('refinement and completion');
    });

    it('should include edge case handling instructions', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Test goal',
        goalType: 'other',
        startDate: '2025-01-01',
        targetDate: '2025-06-01'
      });

      expect(prompt).toContain('EDGE CASE HANDLING');
      expect(prompt).toContain('vague');
      expect(prompt).toContain('unusually long');
      expect(prompt).toContain('very short');
      expect(prompt).toContain('success criteria missing');
    });

    it('should adapt to goal type', () => {
      const careerPrompt = getGoalBreakdownPrompt({
        goalTitle: 'Get promoted',
        goalType: 'career',
        startDate: '2025-01-01',
        targetDate: '2025-12-31'
      });

      const healthPrompt = getGoalBreakdownPrompt({
        goalTitle: 'Run 5K',
        goalType: 'health',
        startDate: '2025-01-01',
        targetDate: '2025-06-01'
      });

      expect(careerPrompt).toContain('career');
      expect(healthPrompt).toContain('health');
      expect(careerPrompt).toContain('career goals focus on skills/outcomes');
      expect(healthPrompt).toContain('health goals on habits/metrics');
    });
  });

  describe('Real-world goal scenarios', () => {
    it('should handle career transition goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Transition from marketing to product management',
        goalDescription: 'Build PM skills and secure first PM role at tech company',
        goalType: 'career',
        startDate: '2025-01-01',
        targetDate: '2025-09-30',
        successCriteria: [
          'Complete PM certification course',
          'Lead 2 cross-functional projects',
          'Receive PM job offer'
        ],
        userContext: {
          workHoursStart: '09:00',
          workHoursEnd: '18:00',
          energyPeakTime: 'morning'
        }
      });

      expect(prompt).toContain('Transition from marketing to product management');
      expect(prompt).toContain('Complete PM certification course');
      expect(prompt).toContain('9 months');
    });

    it('should handle fitness goal with specific metrics', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Bench press 225 lbs',
        goalDescription: 'Progressive strength training to hit 225 lb bench press',
        goalType: 'health',
        startDate: '2025-01-15',
        targetDate: '2025-07-15',
        successCriteria: [
          'Bench press 225 lbs for 1 rep',
          'Consistent 4x/week gym attendance',
          'Proper form maintained'
        ]
      });

      expect(prompt).toContain('Bench press 225 lbs');
      expect(prompt).toContain('6 months');
      expect(prompt).toContain('health');
    });

    it('should handle creative project goal', () => {
      const prompt = getGoalBreakdownPrompt({
        goalTitle: 'Write and publish first novel',
        goalDescription: '80,000 word fiction novel, self-published on Amazon',
        goalType: 'creative',
        startDate: '2025-02-01',
        targetDate: '2026-01-31',
        successCriteria: [
          '80,000 words written',
          'Complete editing and revision',
          'Published on Amazon',
          '50 reviews collected'
        ]
      });

      expect(prompt).toContain('Write and publish first novel');
      expect(prompt).toContain('80,000 word');
      expect(prompt).toContain('12 months');
      expect(prompt).toContain('creative');
    });
  });
});
