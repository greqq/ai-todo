import { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type BacklogItem = Database['public']['Tables']['backlog_items']['Row']
export type DailyReflection = Database['public']['Tables']['daily_reflections']['Row']
export type EnergyLog = Database['public']['Tables']['energy_logs']['Row']
export type WeeklySummary = Database['public']['Tables']['weekly_summaries']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type BacklogItemInsert = Database['public']['Tables']['backlog_items']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Enums
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type GoalStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type Priority = 'high' | 'medium' | 'low'
export type EnergyLevel = 'high' | 'medium' | 'low'
export type EisenhowerQuadrant = 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important'
