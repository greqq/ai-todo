import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-24">
        <div className="max-w-5xl w-full items-center justify-between text-center">
          <h1 className="text-6xl font-bold mb-4">
            AI-Powered Goal Achievement
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your personal productivity coach that helps you achieve your goals, not just check off tasks.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
