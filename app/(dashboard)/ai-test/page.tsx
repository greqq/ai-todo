'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const testAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/test');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to test AI integration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to test custom prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">AI Integration Test</h1>

      {/* Test Both Models */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Sonnet & Haiku</h2>
        <Button onClick={testAI} disabled={loading}>
          {loading ? 'Testing...' : 'Run AI Test'}
        </Button>
      </div>

      {/* Custom Prompt Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Custom Prompt Test</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter a prompt to test..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <Button onClick={testCustomPrompt} disabled={loading || !customPrompt.trim()}>
            {loading ? 'Testing...' : 'Test Prompt'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>

          {result.success && result.tests && (
            <>
              {/* Sonnet Result */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2">Claude Sonnet (Complex Reasoning)</h3>
                <p className="text-sm mb-2">{result.tests.sonnet.response}</p>
                <div className="text-xs text-gray-600">
                  Cost: ${result.tests.sonnet.cost.toFixed(6)} |
                  Tokens: {result.tests.sonnet.usage?.totalTokens || 'N/A'}
                </div>
              </div>

              {/* Haiku Result */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2">Claude Haiku (Simple Tasks)</h3>
                <p className="text-sm mb-2">{result.tests.haiku.response}</p>
                <div className="text-xs text-gray-600">
                  Cost: ${result.tests.haiku.cost.toFixed(6)} |
                  Tokens: {result.tests.haiku.usage?.totalTokens || 'N/A'}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold mb-2">Cost Estimates</h3>
                <ul className="text-sm space-y-1">
                  <li>This request: ${result.costEstimates.thisRequest.toFixed(6)}</li>
                  <li>Estimated monthly per user: ${result.costEstimates.estimatedMonthlyPerUser.toFixed(2)}</li>
                </ul>
              </div>
            </>
          )}

          {result.success && result.response && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">AI Response</h3>
              <p className="text-sm mb-2">{result.response}</p>
              <div className="text-xs text-gray-600">
                Cost: ${result.cost?.toFixed(6)} |
                Tokens: {result.usage?.totalTokens || 'N/A'}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer font-semibold">View Raw JSON</summary>
            <pre className="mt-4 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
