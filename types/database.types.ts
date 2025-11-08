export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          timezone: string
          language: string
          preferences: Json
          onboarding_completed: boolean
          onboarding_mode: string | null
          onboarding_data: Json
          total_tasks_completed: number
          total_goals_completed: number
          current_streak_days: number
          longest_streak_days: number
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
          language?: string
          preferences?: Json
          onboarding_completed?: boolean
          onboarding_mode?: string | null
          onboarding_data?: Json
          total_tasks_completed?: number
          total_goals_completed?: number
          current_streak_days?: number
          longest_streak_days?: number
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
          language?: string
          preferences?: Json
          onboarding_completed?: boolean
          onboarding_mode?: string | null
          onboarding_data?: Json
          total_tasks_completed?: number
          total_goals_completed?: number
          current_streak_days?: number
          longest_streak_days?: number
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          type: string
          parent_goal_id: string | null
          level: string
          start_date: string | null
          target_date: string | null
          completed_at: string | null
          priority: string
          status: string
          success_criteria: string[] | null
          smart_analysis: Json | null
          completion_percentage: number
          total_tasks: number
          completed_tasks: number
          total_time_invested: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          type?: string
          parent_goal_id?: string | null
          level?: string
          start_date?: string | null
          target_date?: string | null
          completed_at?: string | null
          priority?: string
          status?: string
          success_criteria?: string[] | null
          smart_analysis?: Json | null
          completion_percentage?: number
          total_tasks?: number
          completed_tasks?: number
          total_time_invested?: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          type?: string
          parent_goal_id?: string | null
          level?: string
          start_date?: string | null
          target_date?: string | null
          completed_at?: string | null
          priority?: string
          status?: string
          success_criteria?: string[] | null
          smart_analysis?: Json | null
          completion_percentage?: number
          total_tasks?: number
          completed_tasks?: number
          total_time_invested?: number
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          parent_task_id: string | null
          created_at: string
          updated_at: string
          title: string
          description: string | null
          due_date: string | null
          scheduled_start: string | null
          scheduled_end: string | null
          deadline_type: string
          estimated_duration_minutes: number | null
          actual_duration_minutes: number | null
          status: string
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          priority_score: number
          energy_required: string
          task_type: string
          eisenhower_quadrant: string | null
          ai_quadrant_reasoning: string | null
          context_tags: string[] | null
          location: string | null
          is_recurring: boolean
          recurrence_rule: Json | null
          parent_recurring_task_id: string | null
          source: string
          depends_on_task_ids: string[] | null
          blocking_task_ids: string[] | null
          times_postponed: number
          first_postponed_at: string | null
          postponement_reasons: string[] | null
          is_procrastination_flagged: boolean
          energy_impact: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          parent_task_id?: string | null
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          due_date?: string | null
          scheduled_start?: string | null
          scheduled_end?: string | null
          deadline_type?: string
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          status?: string
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          priority_score?: number
          energy_required?: string
          task_type?: string
          eisenhower_quadrant?: string | null
          ai_quadrant_reasoning?: string | null
          context_tags?: string[] | null
          location?: string | null
          is_recurring?: boolean
          recurrence_rule?: Json | null
          parent_recurring_task_id?: string | null
          source?: string
          depends_on_task_ids?: string[] | null
          blocking_task_ids?: string[] | null
          times_postponed?: number
          first_postponed_at?: string | null
          postponement_reasons?: string[] | null
          is_procrastination_flagged?: boolean
          energy_impact?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          parent_task_id?: string | null
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          due_date?: string | null
          scheduled_start?: string | null
          scheduled_end?: string | null
          deadline_type?: string
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          status?: string
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          priority_score?: number
          energy_required?: string
          task_type?: string
          eisenhower_quadrant?: string | null
          ai_quadrant_reasoning?: string | null
          context_tags?: string[] | null
          location?: string | null
          is_recurring?: boolean
          recurrence_rule?: Json | null
          parent_recurring_task_id?: string | null
          source?: string
          depends_on_task_ids?: string[] | null
          blocking_task_ids?: string[] | null
          times_postponed?: number
          first_postponed_at?: string | null
          postponement_reasons?: string[] | null
          is_procrastination_flagged?: boolean
          energy_impact?: string | null
        }
      }
      milestones: {
        Row: {
          id: string
          goal_id: string
          created_at: string
          title: string
          description: string | null
          target_date: string | null
          completed: boolean
          completed_at: string | null
          order_index: number
        }
        Insert: {
          id?: string
          goal_id: string
          created_at?: string
          title: string
          description?: string | null
          target_date?: string | null
          completed?: boolean
          completed_at?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          goal_id?: string
          created_at?: string
          title?: string
          description?: string | null
          target_date?: string | null
          completed?: boolean
          completed_at?: string | null
          order_index?: number
        }
      }
      backlog_items: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          created_at: string
          updated_at: string
          title: string
          description: string | null
          category: string
          priority: string
          status: string
          ai_suggested_schedule_date: string | null
          ai_eisenhower_quadrant: string | null
          ai_effort_estimate: string | null
          ai_impact_score: number | null
          promoted_to_task_id: string | null
          promoted_at: string | null
          archived_at: string | null
          archive_reason: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          category?: string
          priority?: string
          status?: string
          ai_suggested_schedule_date?: string | null
          ai_eisenhower_quadrant?: string | null
          ai_effort_estimate?: string | null
          ai_impact_score?: number | null
          promoted_to_task_id?: string | null
          promoted_at?: string | null
          archived_at?: string | null
          archive_reason?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          category?: string
          priority?: string
          status?: string
          ai_suggested_schedule_date?: string | null
          ai_eisenhower_quadrant?: string | null
          ai_effort_estimate?: string | null
          ai_impact_score?: number | null
          promoted_to_task_id?: string | null
          promoted_at?: string | null
          archived_at?: string | null
          archive_reason?: string | null
        }
      }
      daily_reflections: {
        Row: {
          id: string
          user_id: string
          date: string
          created_at: string
          tasks_completed: number
          tasks_planned: number
          completion_rate: number | null
          what_went_well: string | null
          what_blocked_me: string | null
          energy_level_end_of_day: number | null
          ai_insights: string | null
          ai_suggestions: string[] | null
          mood: string | null
          focus_quality: number | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          created_at?: string
          tasks_completed?: number
          tasks_planned?: number
          completion_rate?: number | null
          what_went_well?: string | null
          what_blocked_me?: string | null
          energy_level_end_of_day?: number | null
          ai_insights?: string | null
          ai_suggestions?: string[] | null
          mood?: string | null
          focus_quality?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          created_at?: string
          tasks_completed?: number
          tasks_planned?: number
          completion_rate?: number | null
          what_went_well?: string | null
          what_blocked_me?: string | null
          energy_level_end_of_day?: number | null
          ai_insights?: string | null
          ai_suggestions?: string[] | null
          mood?: string | null
          focus_quality?: number | null
        }
      }
      energy_logs: {
        Row: {
          id: string
          user_id: string
          timestamp: string
          energy_level: number
          time_of_day: string | null
          context: string | null
          task_id: string | null
          task_was_energizing: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          timestamp?: string
          energy_level: number
          time_of_day?: string | null
          context?: string | null
          task_id?: string | null
          task_was_energizing?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          timestamp?: string
          energy_level?: number
          time_of_day?: string | null
          context?: string | null
          task_id?: string | null
          task_was_energizing?: boolean | null
        }
      }
      weekly_summaries: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          week_end_date: string
          created_at: string
          total_tasks_completed: number
          total_tasks_planned: number
          completion_rate: number | null
          total_time_invested_minutes: number
          average_daily_tasks: number | null
          days_with_80_percent_completion: number
          goal_progress: Json | null
          average_energy_level: number | null
          most_energizing_task_types: string[] | null
          most_draining_task_types: string[] | null
          most_productive_days: string[] | null
          most_productive_times: string[] | null
          key_wins: string[] | null
          challenges: string[] | null
          patterns_detected: string[] | null
          suggestions_for_next_week: string[] | null
          goals_needing_attention: string[] | null
          backlog_items_suggested: string[] | null
          current_streak: number
          new_personal_bests: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          week_end_date: string
          created_at?: string
          total_tasks_completed?: number
          total_tasks_planned?: number
          completion_rate?: number | null
          total_time_invested_minutes?: number
          average_daily_tasks?: number | null
          days_with_80_percent_completion?: number
          goal_progress?: Json | null
          average_energy_level?: number | null
          most_energizing_task_types?: string[] | null
          most_draining_task_types?: string[] | null
          most_productive_days?: string[] | null
          most_productive_times?: string[] | null
          key_wins?: string[] | null
          challenges?: string[] | null
          patterns_detected?: string[] | null
          suggestions_for_next_week?: string[] | null
          goals_needing_attention?: string[] | null
          backlog_items_suggested?: string[] | null
          current_streak?: number
          new_personal_bests?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          week_end_date?: string
          created_at?: string
          total_tasks_completed?: number
          total_tasks_planned?: number
          completion_rate?: number | null
          total_time_invested_minutes?: number
          average_daily_tasks?: number | null
          days_with_80_percent_completion?: number
          goal_progress?: Json | null
          average_energy_level?: number | null
          most_energizing_task_types?: string[] | null
          most_draining_task_types?: string[] | null
          most_productive_days?: string[] | null
          most_productive_times?: string[] | null
          key_wins?: string[] | null
          challenges?: string[] | null
          patterns_detected?: string[] | null
          suggestions_for_next_week?: string[] | null
          goals_needing_attention?: string[] | null
          backlog_items_suggested?: string[] | null
          current_streak?: number
          new_personal_bests?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
