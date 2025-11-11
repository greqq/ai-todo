# TODO List

## 🔴 Critical - Before Production

### AI Task Generation Refinement
**Priority: High**
**Status: Working but needs refinement**

The daily task generation logic (`/app/api/ai/generate-daily-tasks/route.ts` and `/lib/ai/task-generation-helpers.ts`) is functional but not 100% accurate. Current implementation works fine for MVP, but needs refinement before production deployment.

**Issues to address:**
- [ ] Token usage tracking might not accurately split input vs output tokens (currently using `totalTokens` for both)
- [ ] User context gathering could be optimized to reduce database queries
- [ ] AI prompt could be refined based on real user feedback and usage patterns
- [ ] Consider caching user context for repeat calls within a session
- [ ] Add more sophisticated filtering for available tasks (consider task dependencies, blockers)
- [ ] Improve time block suggestions based on actual user calendar integration
- [ ] Fine-tune the balance between different task types (Q1 vs Q2 tasks)
- [ ] Add validation for edge cases (no goals, no tasks, etc.)

**Files to review:**
- `app/api/ai/generate-daily-tasks/route.ts`
- `lib/ai/task-generation-helpers.ts`
- `lib/ai/prompts.ts` (getDailyTaskGenerationPrompt)

---

## 🟡 Medium Priority - Enhancements

### Features to Add
- [ ] Calendar integration for existing commitments
- [ ] Task dependency handling in AI suggestions
- [ ] More sophisticated energy pattern learning
- [ ] User feedback loop on AI suggestions (was this helpful?)
- [ ] Historical task completion data to improve future suggestions

---

## 🟢 Low Priority - Nice to Have

### UI/UX Improvements
- [ ] Add animations to daily task suggestions
- [ ] Show loading skeleton while generating tasks
- [ ] Add tooltips explaining Eisenhower quadrants
- [ ] Keyboard shortcuts for accepting/rejecting tasks

---

## 📝 Technical Debt

### Code Quality
- [ ] Add comprehensive error handling throughout AI routes
- [ ] Write unit tests for AI helper functions
- [ ] Add integration tests for task generation flow
- [ ] Document API endpoints with OpenAPI/Swagger
- [ ] Add rate limiting to AI endpoints

---

## 🔧 Infrastructure

### Monitoring & Observability
- [ ] Set up logging for AI usage and costs
- [ ] Add performance monitoring for AI response times
- [ ] Create dashboard for tracking AI costs per user
- [ ] Set up alerts for unusual AI usage patterns

---

_Last updated: 2025-11-11_
