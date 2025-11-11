'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  CheckCircle,
  Moon,
  TrendingUp,
  Lightbulb,
  Heart,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface EveningReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReflectionComplete: () => void;
}

const moodOptions = [
  { value: 'great', label: '😄 Great', color: 'bg-green-100 text-green-700' },
  { value: 'good', label: '🙂 Good', color: 'bg-blue-100 text-blue-700' },
  { value: 'okay', label: '😐 Okay', color: 'bg-yellow-100 text-yellow-700' },
  {
    value: 'struggling',
    label: '😟 Struggling',
    color: 'bg-orange-100 text-orange-700',
  },
  { value: 'bad', label: '😞 Bad', color: 'bg-red-100 text-red-700' },
];

export function EveningReflectionDialog({
  open,
  onOpenChange,
  onReflectionComplete,
}: EveningReflectionDialogProps) {
  const [stage, setStage] = useState<'reflecting' | 'analyzing' | 'complete'>(
    'reflecting'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form fields
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatBlockedMe, setWhatBlockedMe] = useState('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [mood, setMood] = useState<string>('okay');

  // AI response
  const [acknowledgment, setAcknowledgment] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestionForTomorrow, setSuggestionForTomorrow] = useState('');
  const [encouragingMessage, setEncouragingMessage] = useState('');
  const [stats, setStats] = useState<{
    completed_tasks: number;
    incomplete_tasks: number;
    completion_rate: number;
  } | null>(null);

  const handleSubmitReflection = async () => {
    setLoading(true);
    setError('');
    setStage('analyzing');

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get AI analysis
      const response = await fetch('/api/reflections/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          what_went_well: whatWentWell,
          what_blocked_me: whatBlockedMe,
          energy_level: energyLevel,
          mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze reflection');
      }

      const data = await response.json();

      setAcknowledgment(data.acknowledgment);
      setInsights(data.insights || []);
      setSuggestionForTomorrow(data.suggestion_for_tomorrow);
      setEncouragingMessage(data.encouraging_message);
      setStats(data.stats);

      setStage('complete');
    } catch (err: any) {
      console.error('Error submitting reflection:', err);
      setError(err.message || 'Failed to process your reflection');
      setStage('reflecting');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onReflectionComplete();
    onOpenChange(false);
    // Reset form for next time
    setTimeout(() => {
      setStage('reflecting');
      setWhatWentWell('');
      setWhatBlockedMe('');
      setEnergyLevel(5);
      setMood('okay');
      setError('');
    }, 500);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const canSubmit =
    whatWentWell.trim().length > 0 || whatBlockedMe.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {stage === 'reflecting' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl flex items-center gap-3">
                <Moon className="h-8 w-8 text-indigo-500" />
                Evening Reflection
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Take a moment to reflect on your day. What went well? What could be
                improved?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Completion Summary */}
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Today&apos;s Progress</h3>
                    <p className="text-sm text-gray-600">
                      Check your tasks page for detailed stats
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-indigo-500" />
                </div>
              </Card>

              {/* What went well */}
              <div className="space-y-2">
                <Label htmlFor="what-went-well" className="text-base font-semibold">
                  What went well today? ✨
                </Label>
                <Textarea
                  id="what-went-well"
                  placeholder="Reflect on your wins, big or small..."
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* What blocked me */}
              <div className="space-y-2">
                <Label htmlFor="what-blocked-me" className="text-base font-semibold">
                  What blocked you or could be improved? 🤔
                </Label>
                <Textarea
                  id="what-blocked-me"
                  placeholder="Any challenges or obstacles you faced..."
                  value={whatBlockedMe}
                  onChange={(e) => setWhatBlockedMe(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Energy Level */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Energy level right now: {energyLevel}/10
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Drained</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  How are you feeling overall?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMood(option.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        mood === option.value
                          ? `${option.color} border-current`
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Today
              </Button>
              <Button
                onClick={handleSubmitReflection}
                disabled={!canSubmit || loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get AI Insights
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'analyzing' && (
          <div className="py-12 flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            <p className="text-gray-600">
              Analyzing your day and generating insights...
            </p>
          </div>
        )}

        {stage === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                Reflection Complete
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Stats Summary */}
              {stats && (
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Today&apos;s Completion
                      </h3>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-3xl font-bold text-green-700">
                            {stats.completion_rate}%
                          </p>
                          <p className="text-sm text-gray-600">Completion rate</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-gray-700">
                            {stats.completed_tasks}
                          </p>
                          <p className="text-sm text-gray-600">Tasks completed</p>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-500" />
                  </div>
                </Card>
              )}

              {/* Acknowledgment */}
              {acknowledgment && (
                <Card className="p-6 border-l-4 border-l-blue-400">
                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Acknowledgment</h3>
                      <p className="text-gray-700">{acknowledgment}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Insights */}
              {insights.length > 0 && (
                <Card className="p-6 border-l-4 border-l-purple-400">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                      <ul className="space-y-2">
                        {insights.map((insight, index) => (
                          <li key={index} className="text-gray-700 flex gap-2">
                            <span className="text-purple-500">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Suggestion for Tomorrow */}
              {suggestionForTomorrow && (
                <Card className="p-6 border-l-4 border-l-amber-400">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        For Tomorrow
                      </h3>
                      <p className="text-gray-700">{suggestionForTomorrow}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Encouraging Message */}
              {encouragingMessage && (
                <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <p className="text-center text-lg font-medium text-gray-800">
                    {encouragingMessage}
                  </p>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Done - See you tomorrow!
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
