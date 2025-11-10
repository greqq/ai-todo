# Cleanup Before Production

This file tracks temporary files, test pages, and development artifacts that should be removed before production deployment.

## 🗑️ Files to Delete

### Test Pages
- [ ] `/app/(dashboard)/ai-test/page.tsx` - AI integration test page
  - Created: 2025-11-09
  - Purpose: Manual testing of Claude Sonnet/Haiku integration
  - Reason to delete: Development/testing only, not needed for end users

### Test API Routes
- [ ] `/app/api/test-db/route.ts` - Database connection test (if exists)
  - Check if this is still needed or can be removed

## 📝 Things to Review

### Development Features
- [ ] Review console.log statements in AI cost tracking
  - File: `/lib/ai/cost-tracking.ts`
  - Only logs in development mode currently (good)

### Environment Variables
- [ ] Remove any unused/test environment variables from `.env.local`
- [ ] Ensure `.env.example` is up to date for new developers

## ✅ Before Production Checklist

### Code Cleanup
- [ ] Remove all test pages (listed above)
- [ ] Remove debugging console.logs
- [ ] Remove commented-out code
- [ ] Check for TODO/FIXME comments

### Performance
- [ ] Address webpack warning about large strings in prompts (if needed)
- [ ] Run production build and check bundle size
- [ ] Optimize images and assets

### Security
- [ ] Ensure all API routes have authentication checks
- [ ] Review RLS policies in Supabase
- [ ] Check that sensitive data isn't logged
- [ ] Verify CORS settings

### Testing
- [ ] Test all critical user flows
- [ ] Test on mobile devices
- [ ] Test with real Claude API (not just test endpoint)

## 📌 Notes

- Keep this file updated as you add more temporary development features
- Review this list before each major deployment
- Some test files might be useful to keep in a separate `/tests` directory rather than deleting entirely

---

**Last Updated:** 2025-11-10
