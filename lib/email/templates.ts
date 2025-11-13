// Email Templates for AI TODO App

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export interface DailySummaryEmailData {
  userName: string;
  date: string;
  tasksCompleted: number;
  tasksPlanned: number;
  completionRate: number;
  todayTasks: Array<{
    title: string;
    goalTitle?: string;
    energyRequired: string;
  }>;
  dashboardUrl: string;
}

export interface WeeklySummaryEmailData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  tasksPlanned: number;
  completionRate: number;
  timeInvested: number; // in hours
  keyWins: string[];
  challenges: string[];
  suggestionsForNextWeek: string[];
  dashboardUrl: string;
}

// Welcome Email Template
export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI TODO App</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AI TODO App! 🎉</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to your personal AI productivity coach! We're excited to help you achieve your goals through intelligent task planning and energy management.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin-top: 0; font-size: 20px; color: #667eea;">Getting Started</h2>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Complete your onboarding interview to set up your first goal</li>
        <li style="margin-bottom: 10px;">Review your AI-generated daily tasks each morning</li>
        <li style="margin-bottom: 10px;">Track your energy levels and complete tasks</li>
        <li style="margin-bottom: 10px;">Reflect on your day each evening</li>
        <li>Review your weekly summary every week</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Questions? Reply to this email or visit our help center.<br>
      You can manage your email preferences in Settings.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to AI TODO App!

Hi ${data.userName},

Welcome to your personal AI productivity coach! We're excited to help you achieve your goals through intelligent task planning and energy management.

Getting Started:
• Complete your onboarding interview to set up your first goal
• Review your AI-generated daily tasks each morning
• Track your energy levels and complete tasks
• Reflect on your day each evening
• Review your weekly summary every week

Get started: ${data.dashboardUrl}

Questions? Reply to this email or visit our help center.
You can manage your email preferences in Settings.
  `.trim();
}

// Daily Summary Email Template
export function getDailySummaryEmailHtml(data: DailySummaryEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Plan - ${data.date}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">☀️ Good morning, ${data.userName}!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Here's your plan for ${data.date}</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    ${data.tasksCompleted > 0 ? `
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-weight: 600;">
        🎯 Yesterday: ${data.tasksCompleted} of ${data.tasksPlanned} tasks completed (${data.completionRate}%)
      </p>
    </div>
    ` : ''}

    <h2 style="font-size: 20px; margin-bottom: 20px; color: #111827;">Today's Priority Tasks</h2>

    ${data.todayTasks.length > 0 ? `
      <div style="margin-bottom: 20px;">
        ${data.todayTasks.map((task, index) => `
          <div style="background: #f9fafb; border-left: 3px solid #667eea; padding: 15px; margin-bottom: 12px; border-radius: 4px;">
            <div style="font-weight: 600; font-size: 16px; color: #111827; margin-bottom: 5px;">
              ${index + 1}. ${task.title}
            </div>
            ${task.goalTitle ? `
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
                📊 Goal: ${task.goalTitle}
              </div>
            ` : ''}
            <div style="font-size: 14px; color: #6b7280;">
              ⚡ Energy: ${task.energyRequired}
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <p style="color: #6b7280;">No tasks scheduled for today. Add some tasks to get started!</p>
    `}

    <div style="text-align: center; margin: 30px 0 20px 0;">
      <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Open Dashboard
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 20px;">
      💪 You've got this! Make today count.
    </p>

    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Don't want daily emails? <a href="${data.dashboardUrl}/settings" style="color: #667eea;">Update preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getDailySummaryEmailText(data: DailySummaryEmailData): string {
  const tasksText = data.todayTasks.map((task, index) =>
    `${index + 1}. ${task.title}${task.goalTitle ? ` (Goal: ${task.goalTitle})` : ''} - Energy: ${task.energyRequired}`
  ).join('\n');

  return `
Good morning, ${data.userName}!

Here's your plan for ${data.date}

${data.tasksCompleted > 0 ? `Yesterday: ${data.tasksCompleted} of ${data.tasksPlanned} tasks completed (${data.completionRate}%)\n` : ''}

Today's Priority Tasks:
${tasksText || 'No tasks scheduled for today.'}

Open Dashboard: ${data.dashboardUrl}

You've got this! Make today count.

Don't want daily emails? Update preferences: ${data.dashboardUrl}/settings
  `.trim();
}

// Weekly Summary Email Template
export function getWeeklySummaryEmailHtml(data: WeeklySummaryEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Summary</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📊 Your Weekly Summary</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${data.weekStart} - ${data.weekEnd}</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 25px;">Hi ${data.userName},</p>

    <!-- Stats Section -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="margin-top: 0; font-size: 18px; color: #111827;">Week at a Glance</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea;">${data.tasksCompleted}</div>
          <div style="font-size: 14px; color: #6b7280;">Tasks Completed</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea;">${data.completionRate}%</div>
          <div style="font-size: 14px; color: #6b7280;">Completion Rate</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${data.timeInvested}h</div>
        <div style="font-size: 14px; color: #6b7280;">Time Invested</div>
      </div>
    </div>

    <!-- Key Wins -->
    ${data.keyWins.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h3 style="font-size: 18px; color: #111827; margin-bottom: 12px;">🏆 Key Wins</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${data.keyWins.map(win => `<li style="margin-bottom: 8px;">${win}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Challenges -->
    ${data.challenges.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h3 style="font-size: 18px; color: #111827; margin-bottom: 12px;">💡 Areas for Improvement</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${data.challenges.map(challenge => `<li style="margin-bottom: 8px;">${challenge}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Suggestions -->
    ${data.suggestionsForNextWeek.length > 0 ? `
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
      <h3 style="font-size: 18px; color: #1e40af; margin-top: 0; margin-bottom: 12px;">🎯 Focus for Next Week</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
        ${data.suggestionsForNextWeek.map(suggestion => `<li style="margin-bottom: 8px;">${suggestion}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0 20px 0;">
      <a href="${data.dashboardUrl}/analytics" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Full Analytics
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 20px;">
      Keep up the great work! 🚀
    </p>

    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Manage your email preferences in <a href="${data.dashboardUrl}/settings" style="color: #667eea;">Settings</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getWeeklySummaryEmailText(data: WeeklySummaryEmailData): string {
  return `
Your Weekly Summary
${data.weekStart} - ${data.weekEnd}

Hi ${data.userName},

Week at a Glance:
• Tasks Completed: ${data.tasksCompleted} of ${data.tasksPlanned}
• Completion Rate: ${data.completionRate}%
• Time Invested: ${data.timeInvested} hours

${data.keyWins.length > 0 ? `
Key Wins:
${data.keyWins.map(win => `• ${win}`).join('\n')}
` : ''}

${data.challenges.length > 0 ? `
Areas for Improvement:
${data.challenges.map(challenge => `• ${challenge}`).join('\n')}
` : ''}

${data.suggestionsForNextWeek.length > 0 ? `
Focus for Next Week:
${data.suggestionsForNextWeek.map(suggestion => `• ${suggestion}`).join('\n')}
` : ''}

View Full Analytics: ${data.dashboardUrl}/analytics

Keep up the great work!

Manage your email preferences: ${data.dashboardUrl}/settings
  `.trim();
}
