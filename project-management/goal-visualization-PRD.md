# Product Requirements Document: Interactive Goal Breakdown & Visualization

## 1. Problem Statement

Users currently create long-term goals (3-12 months) but lack visibility into how to achieve them. There's no clear breakdown showing what needs to happen at each stage (6 months, 3 months, 1 month, weekly) to reach the goal. This leads to:
- Overwhelming large goals with no clear path forward
- Lack of progress tracking at intermediate milestones
- Difficulty understanding if they're on track
- No visual representation of the journey

## 2. User Needs

Users need to:
- **See the path**: Visualize how a 12-month goal breaks down into manageable chunks
- **Track progress**: Understand where they are in the journey at each level
- **Stay motivated**: See progress visually to maintain momentum
- **Understand scope**: Know what needs to be accomplished at 6 months, 3 months, 1 month, and weekly to hit the big goal

## 3. Feature Specifications

### 3.1 Scope

**In Scope:**
- Interactive timeline visualization for long-term goals (3+ months)
- AI-powered automatic breakdown of goals into hierarchical milestones
- Visual progress indicators at each level (6mo → 3mo → 1mo → weekly)
- Click-to-expand functionality to see tasks/milestones at each level
- Only applies to "big goals" - goals with `level: 'long_term'` or `level: 'quarterly'`

**Out of Scope (for now):**
- Manual editing of AI-generated breakdown (v1 is AI-only)
- Visualization for short-term goals or daily habits
- Gantt chart or calendar view
- Team/collaborative goal visualization

### 3.2 User Flow

1. **User creates a long-term goal** (3-12 months)
   - Enters goal title, description, target date
   - System detects it's a long-term goal (3+ months duration)

2. **AI generates hierarchical breakdown**
   - Creates sub-goals at appropriate levels based on duration:
     - 12-month goal → 6-month, 3-month, 1-month, weekly milestones
     - 6-month goal → 3-month, 1-month, weekly milestones
     - 3-month goal → 1-month, weekly milestones
   - Each sub-goal has clear deliverables and success criteria
   - Stores in database using existing `parent_goal_id` hierarchy

3. **User views interactive visualization**
   - Dashboard shows timeline visualization for active long-term goals
   - Horizontal timeline with nodes representing each milestone level
   - Color-coded by timeframe (e.g., 6mo = purple, 3mo = blue, 1mo = green, weekly = yellow)
   - Progress bars at each node showing completion percentage

4. **User interacts with timeline**
   - Click node to expand and see details
   - View associated tasks and milestones
   - See current progress and what's next
   - Identify blockers or delays visually

### 3.3 Technical Specifications

**Database Changes:**
- Leverage existing `goals` table structure
- Use existing fields: `parent_goal_id`, `level`, `completion_percentage`
- Levels hierarchy: `vision` → `long_term` → `quarterly` → `monthly` → `weekly`
- AI populates `smart_analysis` with breakdown logic

**AI Logic:**
- When long-term goal created, AI analyzes:
  - Total duration (start_date to target_date)
  - Goal type and complexity
  - User's available time (work hours, energy peaks)
- Generates sub-goals with:
  - Appropriate level assignment
  - Realistic target dates
  - Clear success criteria
  - Initial tasks for each sub-goal

**UI Components:**
- New component: `GoalTimelineVisualization.tsx`
- Built with Framer Motion for smooth animations
- Uses existing Radix UI components (Dialog for expanded view)
- Responsive design (mobile shows vertical timeline)

**Visualization Details:**
- Interactive SVG-based timeline
- Nodes represent milestone levels
- Connecting lines show progression
- Progress rings around each node
- Expand/collapse animations
- Tooltips on hover

### 3.4 Success Criteria

**Must Have (v1):**
- [ ] AI automatically breaks down 6-12 month goals into hierarchical sub-goals
- [ ] Interactive timeline visualization displays on dashboard
- [ ] Users can click nodes to see details and tasks
- [ ] Progress updates automatically as tasks complete
- [ ] Works for goals with 3+ month duration
- [ ] Mobile-responsive design

**Should Have (v2):**
- [ ] Users can manually adjust AI-generated breakdown
- [ ] Drag-and-drop to reorder milestones
- [ ] Visual indicators for behind-schedule milestones
- [ ] Export timeline as image/PDF

**Could Have (Future):**
- [ ] Multiple visualization styles (timeline, roadmap, tree)
- [ ] Animation showing progress over time
- [ ] Comparison of estimated vs actual progress

## 4. Success Metrics

### Primary Metrics:
- **Goal completion rate**: % increase in long-term goals completed
- **Engagement**: % of users who interact with timeline visualization
- **Breakdown usage**: % of long-term goals that use AI breakdown feature

### Secondary Metrics:
- Time spent viewing visualization
- Click-through rate on timeline nodes
- User retention after creating first long-term goal
- Task completion rate for sub-goals vs top-level goals

### Target Goals:
- 20% increase in long-term goal completion rate within 3 months
- 60%+ of users interact with timeline for active goals
- 80%+ of long-term goals use AI breakdown

## 5. User Experience Requirements

### Visual Design:
- **Clean and modern**: Follows existing TailwindCSS design system
- **Intuitive**: Clear visual hierarchy, obvious interactivity
- **Motivating**: Progress should feel rewarding and encouraging
- **Accessible**: Proper contrast, keyboard navigation, screen reader support

### Interactions:
- **Smooth animations**: Using Framer Motion for transitions
- **Responsive feedback**: Immediate visual response to clicks/hovers
- **Progressive disclosure**: Don't overwhelm - show summary, expand for details
- **Mobile-first**: Timeline works on small screens (vertical layout)

### Performance:
- Timeline renders in <500ms
- Smooth 60fps animations
- Lazy load task details on expand
- Optimistic UI updates for progress changes

## 6. Technical Considerations

### Data Structure:
```typescript
// Existing goals table - leverage hierarchical structure
{
  id: uuid
  parent_goal_id: uuid | null  // Links to parent goal
  level: 'vision' | 'long_term' | 'quarterly' | 'monthly' | 'weekly'
  title: string
  target_date: timestamp
  completion_percentage: number
  // ... other fields
}
```

### AI Breakdown Algorithm:
1. Calculate duration in months
2. Determine appropriate milestone levels
3. Divide timeline proportionally
4. Generate specific deliverables for each level
5. Create initial tasks for nearest milestone
6. Store as child goals with `parent_goal_id` reference

### Frontend State:
- Use React Query to fetch goal hierarchy
- Zustand for UI state (expanded nodes, selected node)
- Framer Motion for animation state

### Challenges & Mitigations:
- **Challenge**: Complex goal hierarchies (many levels)
  - **Mitigation**: Limit to 4 levels max, collapse deep trees

- **Challenge**: Performance with many goals
  - **Mitigation**: Virtualization, lazy loading, pagination

- **Challenge**: Mobile screen space
  - **Mitigation**: Vertical timeline, swipeable nodes

## 7. Dependencies

### Technical Dependencies:
- Anthropic Claude API (already integrated)
- Framer Motion (already in package.json)
- Existing Supabase schema and RLS policies

### Feature Dependencies:
- Goals API must support nested fetching
- Task completion must trigger goal progress recalculation (already exists)

### Team Dependencies:
- AI prompt engineering for quality breakdown generation
- UI/UX design for timeline visualization
- Frontend development for interactive components

## 8. Open Questions

1. Should we allow users to override AI-generated breakdown in v1?
   - **Decision needed**: Manual editing adds complexity but gives control

2. How do we handle goal date changes?
   - **Proposal**: Auto-adjust child goal dates proportionally

3. Should visualization be on dashboard or separate page?
   - **Proposal**: Dashboard widget + full-page detailed view

4. What happens if user manually creates sub-goals before AI?
   - **Proposal**: AI detects existing structure and fills gaps only

## 9. Next Steps

1. Design mockups for timeline visualization (desktop + mobile)
2. Define AI prompt for goal breakdown generation
3. Implement database queries for hierarchical goal fetching
4. Build `GoalTimelineVisualization` component
5. Create API endpoint `/api/goals/[id]/breakdown` for AI generation
6. Test with real user goals of varying complexity
7. Gather user feedback and iterate

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Status**: Draft - Awaiting Review
