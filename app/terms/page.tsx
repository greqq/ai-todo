import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: November 13, 2025</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to AI TODO App. These Terms of Service (&quot;Terms&quot;) govern your use of our application
              and services. By accessing or using our service, you agree to be bound by these Terms.
              If you do not agree to these Terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By creating an account and using AI TODO App, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and our Privacy Policy. You must be at least 16 years old
              to use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              AI TODO App is an AI-powered productivity application that helps users achieve their goals
              through intelligent task generation, energy management, and personalized coaching. Our service
              includes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Goal and task management</li>
              <li>AI-powered daily task generation</li>
              <li>Progress tracking and analytics</li>
              <li>Energy tracking and optimization</li>
              <li>AI coaching and insights</li>
              <li>Calendar and planning tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Account and Responsibilities</h2>
            <h3 className="text-xl font-semibold mb-2">3.1 Account Creation</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">3.2 User Responsibilities</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You will use the service in compliance with all applicable laws and regulations</li>
              <li>You will not use the service for any illegal or unauthorized purpose</li>
              <li>You will not interfere with or disrupt the service or servers</li>
              <li>You will not attempt to gain unauthorized access to any part of the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-4">You agree NOT to use the service to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Harass, abuse, or harm another person or entity</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation</li>
              <li>Violate any intellectual property rights of others</li>
              <li>Collect or store personal data about other users without their consent</li>
              <li>Use automated systems (bots, scrapers) to access the service without permission</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Use the service to generate spam or unsolicited communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. AI Features and Limitations</h2>
            <h3 className="text-xl font-semibold mb-2">5.1 AI-Generated Content</h3>
            <p className="mb-4">
              Our service uses artificial intelligence to generate task suggestions, insights, and recommendations.
              You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>AI is Not Perfect:</strong> AI-generated suggestions may not always be accurate, complete, or suitable for your needs</li>
              <li><strong>No Professional Advice:</strong> AI suggestions are not professional advice (legal, medical, financial, or otherwise)</li>
              <li><strong>User Discretion:</strong> You are solely responsible for evaluating and acting on AI-generated content</li>
              <li><strong>No Guarantees:</strong> We do not guarantee that AI features will meet your expectations or achieve your goals</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">5.2 AI Model Changes</h3>
            <p className="mb-4">
              We reserve the right to change, update, or discontinue AI models and features at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Ownership and Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-2">6.1 Your Data</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>You Own Your Data:</strong> You retain all rights to the content you create (goals, tasks, reflections)</li>
              <li><strong>License to Us:</strong> You grant us a license to use your data to provide and improve the service</li>
              <li><strong>Export and Delete:</strong> You can export or delete your data at any time from Settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">6.2 Our Intellectual Property</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The service, including design, code, and features, is owned by AI TODO App</li>
              <li>You may not copy, modify, or create derivative works without permission</li>
              <li>Our trademarks and logos may not be used without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability and Support</h2>
            <h3 className="text-xl font-semibold mb-2">7.1 Service Availability</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>No Guarantees:</strong> We strive for high availability but do not guarantee uninterrupted access</li>
              <li><strong>Maintenance:</strong> We may perform maintenance that temporarily interrupts service</li>
              <li><strong>Force Majeure:</strong> We are not liable for outages due to circumstances beyond our control</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">7.2 Support</h3>
            <p className="mb-4">
              We provide support via email and in-app help resources. Support availability and response times
              may vary based on your subscription level.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Fees and Payment (Future)</h2>
            <p className="mb-4">
              Currently, AI TODO App is in beta and free to use. When we introduce paid features:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We will provide clear pricing information before charging</li>
              <li>You will need to provide payment information for paid features</li>
              <li>Fees are non-refundable except as required by law</li>
              <li>We may change pricing with 30 days notice</li>
              <li>You can cancel paid subscriptions at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <h3 className="text-xl font-semibold mb-2">9.1 Termination by You</h3>
            <p className="mb-4">
              You may terminate your account at any time by deleting it from the Settings page. Upon deletion,
              your data will be permanently removed within 30 days.
            </p>

            <h3 className="text-xl font-semibold mb-2">9.2 Termination by Us</h3>
            <p className="mb-4">We may suspend or terminate your account if:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You violate these Terms of Service</li>
              <li>You engage in fraudulent or illegal activity</li>
              <li>You abuse or misuse the service</li>
              <li>Required by law or legal process</li>
            </ul>
            <p className="mb-4">
              We will provide notice of termination when possible, but reserve the right to terminate immediately
              in cases of serious violations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that the service will be uninterrupted or error-free</li>
              <li>Warranties that AI-generated content will be accurate or reliable</li>
              <li>Warranties that defects will be corrected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI TODO APP SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruptions or data loss</li>
              <li>Actions taken based on AI-generated suggestions</li>
              <li>Third-party content or services</li>
            </ul>
            <p className="mb-4">
              Our total liability shall not exceed the amount you paid us in the 12 months before the claim,
              or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless AI TODO App and its affiliates from any claims,
              damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your use of the service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you submit to the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Posting the updated Terms with a new &quot;Last updated&quot; date</li>
              <li>Sending an email notification (if you have not opted out)</li>
              <li>Displaying a notice in the app</li>
            </ul>
            <p className="mb-4">
              Your continued use of the service after changes constitutes acceptance of the updated Terms.
              If you do not agree to the changes, you must stop using the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law and Disputes</h2>
            <h3 className="text-xl font-semibold mb-2">14.1 Governing Law</h3>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
              without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mb-2">14.2 Dispute Resolution</h3>
            <p className="mb-4">
              Any disputes arising from these Terms or the service shall be resolved through:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>First, good faith negotiation between the parties</li>
              <li>If negotiation fails, binding arbitration or court proceedings as applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Miscellaneous</h2>
            <h3 className="text-xl font-semibold mb-2">15.1 Entire Agreement</h3>
            <p className="mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and
              AI TODO App regarding the service.
            </p>

            <h3 className="text-xl font-semibold mb-2">15.2 Severability</h3>
            <p className="mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
              will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-2">15.3 Waiver</h3>
            <p className="mb-4">
              Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such
              right or provision.
            </p>

            <h3 className="text-xl font-semibold mb-2">15.4 Assignment</h3>
            <p className="mb-4">
              You may not assign or transfer these Terms without our written consent. We may assign these Terms
              without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="list-none mb-4 space-y-2">
              <li><strong>Email:</strong> legal@aitodoapp.com</li>
              <li><strong>Support:</strong> support@aitodoapp.com</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Questions?</h3>
            <p className="mb-4">
              We are committed to providing a fair and transparent service. If you have any questions or
              concerns about these Terms, please reach out to us.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/privacy">View Privacy Policy</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
