import { resend, FROM_EMAIL } from './resend-client';
import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  getDailySummaryEmailHtml,
  getDailySummaryEmailText,
  getWeeklySummaryEmailHtml,
  getWeeklySummaryEmailText,
  WelcomeEmailData,
  DailySummaryEmailData,
  WeeklySummaryEmailData,
} from './templates';

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to AI TODO App! 🎉',
      html: getWelcomeEmailHtml(data),
      text: getWelcomeEmailText(data),
    });

    if (result.error) {
      console.error('Error sending welcome email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendDailySummaryEmail(
  to: string,
  data: DailySummaryEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `☀️ Your Daily Plan - ${data.date}`,
      html: getDailySummaryEmailHtml(data),
      text: getDailySummaryEmailText(data),
    });

    if (result.error) {
      console.error('Error sending daily summary email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending daily summary email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendWeeklySummaryEmail(
  to: string,
  data: WeeklySummaryEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '📊 Your Weekly Summary',
      html: getWeeklySummaryEmailHtml(data),
      text: getWeeklySummaryEmailText(data),
    });

    if (result.error) {
      console.error('Error sending weekly summary email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
