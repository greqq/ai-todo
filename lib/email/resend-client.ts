import { Resend } from 'resend';

// Allow empty API key at build time, but email sending will fail at runtime if not set
export const resend = new Resend(process.env.RESEND_API_KEY || '');

export const FROM_EMAIL = 'AI TODO App <noreply@yourdomain.com>'; // Update with your domain
export const SUPPORT_EMAIL = 'support@yourdomain.com'; // Update with your support email
