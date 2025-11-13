import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: November 13, 2025</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to AI TODO App. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data and tell you about
              your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
            <p className="mb-4">We collect and process the following types of data:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, and authentication credentials</li>
              <li><strong>Goals and Tasks:</strong> Your goals, tasks, descriptions, deadlines, and completion status</li>
              <li><strong>Reflections:</strong> Daily and weekly reflection responses and insights</li>
              <li><strong>Energy Logs:</strong> Energy level tracking data and patterns</li>
              <li><strong>Usage Data:</strong> How you interact with the app, feature usage, and completion rates</li>
              <li><strong>Preferences:</strong> Your settings, timezone, work hours, and notification preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
            <p className="mb-4">We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>AI-Powered Task Generation:</strong> To generate personalized daily task suggestions based on your goals and patterns</li>
              <li><strong>Progress Tracking:</strong> To calculate completion rates, track goal progress, and generate analytics</li>
              <li><strong>Personalized Insights:</strong> To provide AI-generated insights, coaching, and recommendations</li>
              <li><strong>Service Improvement:</strong> To improve our AI models, features, and user experience</li>
              <li><strong>Communication:</strong> To send you important updates, summaries, and notifications (if enabled)</li>
            </ul>
            <p className="mb-4 font-semibold text-lg">We never sell your data to third parties.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. AI Processing</h2>
            <p className="mb-4">
              We use Anthropic&apos;s Claude AI to power intelligent features in our app. Here&apos;s what you need to know:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Data Sent to Anthropic:</strong> When using AI features, we send relevant context (goals, tasks, reflections) to Anthropic&apos;s API</li>
              <li><strong>No Training on Your Data:</strong> Anthropic does not train their models on user data sent through their API</li>
              <li><strong>Minimal Data Transfer:</strong> We only send the minimum necessary context for AI features to work</li>
              <li><strong>Secure Processing:</strong> All data is transmitted securely over encrypted connections</li>
            </ul>
            <p className="mb-4">
              For more information about Anthropic&apos;s data practices, please visit:{' '}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Anthropic Privacy Policy
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights (GDPR Compliance)</h2>
            <p className="mb-4">Under GDPR and other privacy laws, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Right to Access:</strong> You can export all your data in JSON format from the Settings page</li>
              <li><strong>Right to Rectification:</strong> You can edit any of your data directly in the app</li>
              <li><strong>Right to Erasure:</strong> You can delete your account and all associated data from the Settings page</li>
              <li><strong>Right to Data Portability:</strong> Export your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> You can opt out of analytics and email notifications in Settings</li>
              <li><strong>Right to Withdraw Consent:</strong> You can change your preferences at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Database:</strong> Your data is stored in Supabase (PostgreSQL database) with encryption at rest</li>
              <li><strong>Row Level Security:</strong> Database policies ensure you can only access your own data</li>
              <li><strong>Secure Transmission:</strong> All data is transmitted over HTTPS/SSL encryption</li>
              <li><strong>Authentication:</strong> Managed by Clerk with industry-standard security practices</li>
              <li><strong>Access Control:</strong> Strict access controls limit who can access user data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Active Accounts:</strong> Your data is retained as long as your account is active</li>
              <li><strong>Deleted Accounts:</strong> All data is permanently deleted within 30 days of account deletion</li>
              <li><strong>Backups:</strong> Database backups are retained for 90 days for disaster recovery purposes</li>
              <li><strong>AI Processing:</strong> Data sent to Anthropic is not stored by them after processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="mb-4">We use minimal cookies and tracking:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and app functionality</li>
              <li><strong>Analytics:</strong> Privacy-focused analytics to understand feature usage (you can opt out)</li>
              <li><strong>No Third-Party Advertising:</strong> We do not use advertising cookies or trackers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>Supabase:</strong> Database hosting and storage</li>
              <li><strong>Anthropic:</strong> AI processing for task generation and insights</li>
              <li><strong>Vercel:</strong> Application hosting and deployment</li>
              <li><strong>Resend:</strong> Transactional email delivery (if notifications enabled)</li>
            </ul>
            <p className="mb-4">Each service has their own privacy policy and security practices.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our service is not intended for children under 16 years of age. We do not knowingly collect
              personal information from children under 16. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p className="mb-4">
              Your data may be transferred to and processed in countries other than your country of residence.
              We ensure that appropriate safeguards are in place to protect your data in accordance with this
              privacy policy and applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting
              the new privacy policy on this page and updating the &quot;Last updated&quot; date. We encourage you to
              review this privacy policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <ul className="list-none mb-4 space-y-2">
              <li><strong>Email:</strong> privacy@aitodoapp.com</li>
              <li><strong>Data Protection Officer:</strong> dpo@aitodoapp.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-4">We process your personal data under the following legal bases:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Contract:</strong> To provide the service you signed up for</li>
              <li><strong>Consent:</strong> For optional features like email notifications and analytics</li>
              <li><strong>Legitimate Interest:</strong> To improve our service and prevent fraud</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Your Privacy Matters</h3>
            <p className="mb-4">
              We are committed to transparency and protecting your privacy. You have full control over your data
              and can export or delete it at any time from your Settings page.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/settings">Manage Your Data</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">View Terms of Service</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
