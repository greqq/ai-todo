'use client';

import ChatInterface from '@/components/chat/ChatInterface';

/**
 * AI Chat Page
 * Interactive chat with AI productivity coach
 *
 * Based on specification Section 3.10: AI Chat Interface
 */
export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface />
    </div>
  );
}
