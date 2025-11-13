import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'AI TODO App <noreply@yourdomain.com>'; // Update with your domain
export const SUPPORT_EMAIL = 'support@yourdomain.com'; // Update with your support email
