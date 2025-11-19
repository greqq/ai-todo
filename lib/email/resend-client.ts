import { Resend } from 'resend';

// Use a placeholder key during build if not set (will fail at runtime if actually used)
const RESEND_KEY = process.env.RESEND_API_KEY || 're_placeholder_key_for_build';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined - email functionality will not work');
}

export const resend = new Resend(RESEND_KEY);

export const FROM_EMAIL = 'AI TODO App <noreply@yourdomain.com>'; // Update with your domain
export const SUPPORT_EMAIL = 'support@yourdomain.com'; // Update with your support email
