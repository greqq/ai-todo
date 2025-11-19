/**
 * Life Reset Guide Type Definitions
 *
 * Defines interfaces for the comprehensive Life Reset onboarding process
 * including 5 phases of interview data and the generated Life Reset Map.
 */

// ============================================================================
// Phase 1: Current Life Assessment
// ============================================================================

export interface CurrentLifeAssessment {
  daily_routine: string;
  work_situation: string;
  living_situation?: string;
  relationship_status?: string;
  financial_status?: string;
  energy_patterns: string;
  stress_factors: string[];
  commitments: string[];
  satisfaction_scores: {
    work: number; // 1-10
    health: number;
    relationships: number;
    finances: number;
    personal_growth: number;
  };
}

// ============================================================================
// Phase 2: Anti-Vision (What user wants to AVOID)
// ============================================================================

export interface AntiVision {
  work_antipatterns: string[];
  lifestyle_antipatterns: string[];
  relationship_antipatterns: string[];
  health_antipatterns: string[];
  financial_antipatterns: string[];
}

// ============================================================================
// Phase 3: Vision (What user WANTS)
// ============================================================================

export interface Vision {
  financial_goals: string;
  career_vision: string;
  lifestyle_vision: string;
  relationship_vision: string;
  health_vision: string;
  time_vision: string;
}

// ============================================================================
// Phase 4: Time Horizons
// ============================================================================

export interface TimeHorizons {
  long_term_5_10y: string[];
  medium_term_1_3y: string[];
  short_term_3_12m: string[];
  immediate_1m: string[];
  daily_habits: string[];
}

// ============================================================================
// Phase 5: Obstacles & Support
// ============================================================================

export interface Obstacles {
  distractions: string[];
  habits_to_break: string[];
  limiting_beliefs: string[];
  external_constraints: string[];
  support_needs: string[];
}

// ============================================================================
// Complete Onboarding Data Structure
// ============================================================================

export interface LifeResetOnboardingData {
  phase_1_current_life: CurrentLifeAssessment;
  phase_2_anti_vision: AntiVision;
  phase_3_vision: Vision;
  phase_4_time_horizons: TimeHorizons;
  phase_5_obstacles: Obstacles;
  completed_at: string; // ISO timestamp
  interview_duration_minutes: number;
}

// ============================================================================
// Life Reset Map (Generated Output)
// ============================================================================

export interface RoutineTimeBlock {
  time: string; // HH:MM format
  duration_minutes: number;
  activity: string;
  purpose: string;
  optional?: boolean;
}

export interface RoutineTask {
  title: string;
  description: string;
  duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  task_type: 'deep_work' | 'admin' | 'communication' | 'learning' | 'creative' | 'physical' | 'planning';
}

export interface MorningRoutine {
  description: string;
  time_blocks: RoutineTimeBlock[];
  tasks: RoutineTask[];
  non_negotiables: string[];
}

export interface EveningRoutine {
  description: string;
  time_blocks: RoutineTimeBlock[];
  tasks: RoutineTask[];
  non_negotiables: string[];
}

export interface SkillResource {
  title: string;
  type: 'book' | 'course' | 'youtube' | 'article' | 'other';
  url?: string;
  author?: string;
}

export interface SkillDevelopment {
  skill: string;
  priority: number; // 1-10
  resources: SkillResource[];
  timeframe?: string;
}

export interface GoalDefinition {
  title: string;
  description: string;
  type: 'career' | 'health' | 'financial' | 'relationships' | 'personal_growth' | 'creative' | 'other';
  category: 'primary' | 'secondary' | 'lifestyle';
  start_date: string; // YYYY-MM-DD
  target_date: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  success_criteria: string[];
  milestones?: MilestoneDefinition[];
  timeframe_months?: number;
}

export interface MilestoneDefinition {
  title: string;
  description: string;
  target_date: string; // YYYY-MM-DD
}

export interface GoalsHierarchy {
  primary_goal: GoalDefinition;
  secondary_goals: GoalDefinition[];
  long_term: string[];
  medium_term: string[];
  short_term: string[];
  immediate: string[];
}

export interface DailyTimeBlock {
  name: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  purpose: string;
  task_types: string[]; // deep_work, learning, admin, etc.
}

export interface DailyStructure {
  work_hours_start: string; // HH:MM
  work_hours_end: string; // HH:MM
  energy_peak_time: 'morning' | 'afternoon' | 'evening' | 'night';
  time_blocks: DailyTimeBlock[];
}

export interface WeeklyPlan {
  focus: string;
  daily_tasks: string[];
}

export interface ImplementationStrategy {
  week_1_plan: WeeklyPlan;
  month_1_milestones: string[];
  month_2_milestones: string[];
  month_3_milestones: string[];
  accountability_methods: string[];
  tracking_methods: string[];
}

export interface InitialTask {
  title: string;
  description: string;
  estimated_duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  task_type: 'deep_work' | 'admin' | 'communication' | 'learning' | 'creative' | 'physical' | 'planning';
  eisenhower_quadrant: 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important';
  goal_id?: string;
}

export interface LifeResetMap {
  vision_statement: string;
  goals_hierarchy: GoalsHierarchy;
  morning_routine: MorningRoutine;
  evening_routine: EveningRoutine;
  skills_development: SkillDevelopment[];
  daily_structure: DailyStructure;
  implementation: ImplementationStrategy;
  initial_tasks: InitialTask[];
}

// ============================================================================
// Interview State Management
// ============================================================================

export interface InterviewMessage {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export interface PhaseDefinition {
  id: number;
  name: string;
  description: string;
  estimatedMinutes: number;
  icon: string;
  questions: number;
}

export interface InterviewState {
  currentPhase: number;
  totalPhases: number;
  messages: InterviewMessage[];
  collectedData: Partial<LifeResetOnboardingData>;
  isComplete: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface LifeResetChatRequest {
  phase: number;
  userMessage: string;
  previousMessages: InterviewMessage[];
  collectedData: Partial<LifeResetOnboardingData>;
}

export interface LifeResetChatResponse {
  aiMessage: string;
  phase: number;
  needsClarification: boolean;
  proceedToNextPhase: boolean;
  allPhasesComplete: boolean;
  collectedData?: any; // Accumulated interview data from all phases
}

export interface CompleteOnboardingRequest {
  interviewAnswers: LifeResetOnboardingData;
  interviewDuration: number;
}

export interface CompleteOnboardingResponse {
  success: boolean;
  lifeResetMap: LifeResetMap;
  primaryGoal: any; // Will use Goal type from database
  secondaryGoals: any[];
  message: string;
}
