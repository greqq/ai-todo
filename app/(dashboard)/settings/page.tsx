'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select-old';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Timezone list (common timezones)
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

interface UserPreferences {
  work_hours_start: string;
  work_hours_end: string;
  energy_peak_time: 'morning' | 'afternoon' | 'evening' | 'night';
  default_task_duration: number;
  pomodoro_duration: number;
  daily_task_limit: number;
  enable_notifications: boolean;
  enable_email_reminders: boolean;
  enable_email_notifications: boolean;
  enable_daily_summary_email: boolean;
  enable_weekly_summary_email: boolean;
}

interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  timezone: string;
  language: string;
  preferences: UserPreferences;
}

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [timezone, setTimezone] = useState('UTC');
  const [workHoursStart, setWorkHoursStart] = useState('09:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('17:00');
  const [energyPeakTime, setEnergyPeakTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [defaultTaskDuration, setDefaultTaskDuration] = useState(60);
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [dailyTaskLimit, setDailyTaskLimit] = useState(5);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableEmailReminders, setEnableEmailReminders] = useState(true);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableDailySummaryEmail, setEnableDailySummaryEmail] = useState(true);
  const [enableWeeklySummaryEmail, setEnableWeeklySummaryEmail] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);

        // Set form values from fetched data
        setTimezone(data.timezone || 'UTC');
        if (data.preferences) {
          setWorkHoursStart(data.preferences.work_hours_start || '09:00');
          setWorkHoursEnd(data.preferences.work_hours_end || '17:00');
          setEnergyPeakTime(data.preferences.energy_peak_time || 'morning');
          setDefaultTaskDuration(data.preferences.default_task_duration || 60);
          setPomodoroDuration(data.preferences.pomodoro_duration || 25);
          setDailyTaskLimit(data.preferences.daily_task_limit || 5);
          setEnableNotifications(data.preferences.enable_notifications ?? true);
          setEnableEmailReminders(data.preferences.enable_email_reminders ?? true);
          setEnableEmailNotifications(data.preferences.enable_email_notifications ?? true);
          setEnableDailySummaryEmail(data.preferences.enable_daily_summary_email ?? true);
          setEnableWeeklySummaryEmail(data.preferences.enable_weekly_summary_email ?? true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timezone,
          preferences: {
            work_hours_start: workHoursStart,
            work_hours_end: workHoursEnd,
            energy_peak_time: energyPeakTime,
            default_task_duration: defaultTaskDuration,
            pomodoro_duration: pomodoroDuration,
            daily_task_limit: dailyTaskLimit,
            enable_notifications: enableNotifications,
            enable_email_reminders: enableEmailReminders,
            enable_email_notifications: enableEmailNotifications,
            enable_daily_summary_email: enableDailySummaryEmail,
            enable_weekly_summary_email: enableWeeklySummaryEmail,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();

      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-todo-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setExporting(false);
    }
  };

  const handleResetOnboarding = async () => {
    setResettingOnboarding(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/reset-onboarding', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset onboarding');
      }

      setMessage({ type: 'success', text: 'Onboarding reset! Redirecting...' });

      // Redirect to onboarding page after a short delay
      setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      setMessage({ type: 'error', text: 'Failed to reset onboarding' });
      setResettingOnboarding(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out and redirect
      setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your basic profile information from your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={user?.fullName || profile?.full_name || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your productivity settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for scheduling tasks and daily planning
            </p>
          </div>

          {/* Work Hours */}
          <div className="space-y-4">
            <Label>Work Hours</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="work-start" className="text-sm text-muted-foreground">
                  Start Time
                </Label>
                <Input
                  id="work-start"
                  type="time"
                  value={workHoursStart}
                  onChange={(e) => setWorkHoursStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-end" className="text-sm text-muted-foreground">
                  End Time
                </Label>
                <Input
                  id="work-end"
                  type="time"
                  value={workHoursEnd}
                  onChange={(e) => setWorkHoursEnd(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your typical working hours for task scheduling
            </p>
          </div>

          {/* Energy Peak Time */}
          <div className="space-y-2">
            <Label htmlFor="energy-peak">Peak Energy Time</Label>
            <Select
              id="energy-peak"
              value={energyPeakTime}
              onChange={(e) => setEnergyPeakTime(e.target.value as any)}
            >
              <option value="morning">Morning (6 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
              <option value="evening">Evening (6 PM - 10 PM)</option>
              <option value="night">Night (10 PM - 2 AM)</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              When you feel most focused and energized
            </p>
          </div>

          {/* Task Duration */}
          <div className="space-y-2">
            <Label htmlFor="task-duration">Default Task Duration (minutes)</Label>
            <Select
              id="task-duration"
              value={defaultTaskDuration.toString()}
              onChange={(e) => setDefaultTaskDuration(parseInt(e.target.value))}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default time estimate for new tasks
            </p>
          </div>

          {/* Pomodoro Duration */}
          <div className="space-y-2">
            <Label htmlFor="pomodoro">Pomodoro Duration (minutes)</Label>
            <Select
              id="pomodoro"
              value={pomodoroDuration.toString()}
              onChange={(e) => setPomodoroDuration(parseInt(e.target.value))}
            >
              <option value="15">15 minutes</option>
              <option value="25">25 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Length of focus sessions in focus mode
            </p>
          </div>

          {/* Daily Task Limit */}
          <div className="space-y-2">
            <Label htmlFor="task-limit">Daily Task Limit</Label>
            <Select
              id="task-limit"
              value={dailyTaskLimit.toString()}
              onChange={(e) => setDailyTaskLimit(parseInt(e.target.value))}
            >
              <option value="3">3 tasks</option>
              <option value="5">5 tasks</option>
              <option value="7">7 tasks</option>
              <option value="10">10 tasks</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Maximum number of high-priority tasks per day
            </p>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <Label>Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-notifications" className="text-sm font-normal">
                    Enable In-App Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications within the app
                  </p>
                </div>
                <input
                  id="enable-notifications"
                  type="checkbox"
                  checked={enableNotifications}
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="space-y-4">
            <Label>Email Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-email-notifications" className="text-sm font-normal">
                    Enable Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Master toggle for all email notifications
                  </p>
                </div>
                <input
                  id="enable-email-notifications"
                  type="checkbox"
                  checked={enableEmailNotifications}
                  onChange={(e) => setEnableEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between pl-6">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-daily-summary" className="text-sm font-normal">
                    Daily Summary Emails
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive your daily plan each morning
                  </p>
                </div>
                <input
                  id="enable-daily-summary"
                  type="checkbox"
                  checked={enableDailySummaryEmail}
                  onChange={(e) => setEnableDailySummaryEmail(e.target.checked)}
                  disabled={!enableEmailNotifications}
                  className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between pl-6">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-weekly-summary" className="text-sm font-normal">
                    Weekly Summary Emails
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive your weekly progress report
                  </p>
                </div>
                <input
                  id="enable-weekly-summary"
                  type="checkbox"
                  checked={enableWeeklySummaryEmail}
                  onChange={(e) => setEnableWeeklySummaryEmail(e.target.checked)}
                  disabled={!enableEmailNotifications}
                  className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between pl-6">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-email-reminders" className="text-sm font-normal">
                    Task Reminder Emails
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive reminders for upcoming tasks
                  </p>
                </div>
                <input
                  id="enable-email-reminders"
                  type="checkbox"
                  checked={enableEmailReminders}
                  onChange={(e) => setEnableEmailReminders(e.target.checked)}
                  disabled={!enableEmailNotifications}
                  className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Re-run Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Life Reset Guide</CardTitle>
          <CardDescription>
            Re-do the comprehensive onboarding experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-medium">Re-run Life Reset Onboarding</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Go through the comprehensive 5-phase Life Reset interview again to refine your goals, vision, and routines.
              This won&apos;t delete your existing data - it will create new goals and update your Life Reset Map.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">What you&apos;ll experience:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>5-phase deep assessment (Current Life, Anti-Vision, Vision, Time Horizons, Obstacles)</li>
              <li>Create multiple goals with automatic breakdown into milestones</li>
              <li>Define morning and evening routines</li>
              <li>Generate a personalized Life Reset Map and roadmap</li>
              <li>Takes 10-20 minutes to complete</li>
            </ul>
          </div>
          <Button
            onClick={handleResetOnboarding}
            disabled={resettingOnboarding}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {resettingOnboarding ? 'Resetting...' : 'Start Life Reset Guide'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Data */}
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Export Your Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download all your data in JSON format. This includes goals, tasks, reflections, and analytics.
              </p>
            </div>
            <Button onClick={handleExportData} disabled={exporting} variant="outline">
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Delete Account */}
          <div className="space-y-3 pt-6 border-t border-destructive/20">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
              >
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3 p-4 border border-destructive rounded-md bg-destructive/5">
                <p className="text-sm font-medium">
                  Are you sure? This will permanently delete all your data.
                </p>
                <p className="text-sm text-muted-foreground">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm:
                </p>
                <Input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="max-w-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    variant="destructive"
                    size="sm"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
