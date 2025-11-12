'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Sparkles, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AI Chat Interface
 * Real-time chat with AI productivity coach
 *
 * Based on specification Section 3.10
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';
      const aiMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add empty AI message that will be updated
      setMessages((prev) => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and accumulate the text chunk
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the AI message with accumulated content
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = accumulatedContent;
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      // Remove the empty AI message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      inputRef.current?.form?.requestSubmit();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Productivity Coach
            </h1>
            <p className="text-sm text-gray-500">
              Ask me anything about your goals, tasks, or productivity
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              I can help you with questions about your goals, tasks, productivity
              patterns, and more. Just ask!
            </p>
            <div className="grid gap-3 w-full max-w-md">
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => handleSuggestionClick("What should I focus on today?")}
              >
                <span className="text-sm">What should I focus on today?</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => handleSuggestionClick("How am I progressing on my goals?")}
              >
                <span className="text-sm">How am I progressing on my goals?</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => handleSuggestionClick("When am I most productive?")}
              >
                <span className="text-sm">When am I most productive?</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full flex-shrink-0">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3 justify-start">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Tip: Ask about your goals, tasks, productivity patterns, or request
          advice
        </p>
      </div>
    </div>
  );
}
