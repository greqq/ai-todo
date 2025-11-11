'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Star,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DailyTaskSuggestion {
  task_id: string;
  title: string;
  description: string;
  estimated_duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  task_type: string;
  eisenhower_quadrant: string;
  suggested_time_block?: string;
  linked_goal_id?: string;
  is_eat_the_frog?: boolean;
  reasoning: string;
}

interface DailyTaskSuggestionsProps {
  onTasksAccepted?: () => void;
}

const energyColors = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

const energyIcons = {
  high: '⚡',
  medium: '💡',
  low: '🌱',
};

const quadrantLabels: Record<string, string> = {
  q1_urgent_important: 'Urgent & Important',
  q2_not_urgent_important: 'Important, Not Urgent',
  q3_urgent_not_important: 'Urgent, Not Important',
  q4_not_urgent_not_important: 'Not Urgent or Important',
};

const quadrantColors: Record<string, string> = {
  q1_urgent_important: 'bg-red-100 text-red-700 border-red-300',
  q2_not_urgent_important: 'bg-blue-100 text-blue-700 border-blue-300',
  q3_urgent_not_important: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  q4_not_urgent_not_important: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function DailyTaskSuggestions({
  onTasksAccepted,
}: DailyTaskSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [suggestions, setSuggestions] = useState<DailyTaskSuggestion[]>([]);
  const [dailyMessage, setDailyMessage] = useState<string>('');
  const [focusSuggestion, setFocusSuggestion] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTasks, setEditedTasks] = useState<
    Map<number, Partial<DailyTaskSuggestion>>
  >(new Map());

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/generate-daily-tasks', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      setDailyMessage(data.daily_message);
      setFocusSuggestion(data.focus_suggestion);

      // Select all tasks by default
      const allIndices = new Set<number>(
        data.suggestions.map((_: any, index: number) => index)
      );
      setSelectedTasks(allIndices);
    } catch (err: any) {
      setError(err.message || 'Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTasks = async () => {
    setAccepting(true);
    setError('');

    try {
      // Get selected tasks with any edits applied
      const tasksToAccept = Array.from(selectedTasks).map((index) => {
        const task = suggestions[index];
        const edits = editedTasks.get(index);
        return { ...task, ...edits };
      });

      const response = await fetch('/api/ai/accept-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToAccept }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept tasks');
      }

      // Clear suggestions and notify parent
      setSuggestions([]);
      setSelectedTasks(new Set());
      setEditedTasks(new Map());
      setDailyMessage('');
      setFocusSuggestion('');

      if (onTasksAccepted) {
        onTasksAccepted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept tasks');
    } finally {
      setAccepting(false);
    }
  };

  const toggleTaskSelection = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const startEditingTask = (index: number) => {
    setEditingTask(index);
  };

  const saveTaskEdit = (index: number) => {
    setEditingTask(null);
  };

  const cancelTaskEdit = (index: number) => {
    const newEdits = new Map(editedTasks);
    newEdits.delete(index);
    setEditedTasks(newEdits);
    setEditingTask(null);
  };

  const updateTaskField = (
    index: number,
    field: keyof DailyTaskSuggestion,
    value: any
  ) => {
    const newEdits = new Map(editedTasks);
    const currentEdits = newEdits.get(index) || {};
    newEdits.set(index, { ...currentEdits, [field]: value });
    setEditedTasks(newEdits);
  };

  const getTaskValue = (index: number, field: keyof DailyTaskSuggestion) => {
    const edits = editedTasks.get(index);
    return edits?.[field] ?? suggestions[index][field];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Daily Task Suggestions
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered task recommendations based on your goals and energy
            patterns
          </p>
        </div>
        {suggestions.length === 0 && (
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Daily Tasks
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Daily Message & Focus */}
      {dailyMessage && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                🌟 Today&apos;s Message
              </h3>
              <p className="text-gray-700">{dailyMessage}</p>
            </div>
            {focusSuggestion && (
              <div>
                <h3 className="font-semibold text-lg mb-2">🎯 Today&apos;s Focus</h3>
                <p className="text-gray-700">{focusSuggestion}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Task Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Select tasks you want to add to your day ({selectedTasks.size} of{' '}
              {suggestions.length} selected)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedTasks(
                    new Set(suggestions.map((_, i) => i))
                  )
                }
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTasks(new Set())}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {suggestions.map((task, index) => {
            const isSelected = selectedTasks.has(index);
            const isEditing = editingTask === index;
            const title = getTaskValue(index, 'title') as string;
            const description = getTaskValue(index, 'description') as string;
            const duration = getTaskValue(
              index,
              'estimated_duration_minutes'
            ) as number;

            return (
              <Card
                key={index}
                className={`p-5 transition-all ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTaskSelection(index)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div>
                      {isEditing ? (
                        <Input
                          value={title}
                          onChange={(e) =>
                            updateTaskField(index, 'title', e.target.value)
                          }
                          className="font-semibold text-lg"
                        />
                      ) : (
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {task.is_eat_the_frog && (
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          )}
                          {title}
                          {task.is_eat_the_frog && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-700 border-yellow-300"
                            >
                              Eat the Frog
                            </Badge>
                          )}
                        </h3>
                      )}
                    </div>

                    {/* Description */}
                    {isEditing ? (
                      <Textarea
                        value={description}
                        onChange={(e) =>
                          updateTaskField(index, 'description', e.target.value)
                        }
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-600">{description}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={energyColors[task.energy_required]}
                      >
                        {energyIcons[task.energy_required]} {task.energy_required}{' '}
                        energy
                      </Badge>
                      <Badge variant="outline" className="border-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {duration} min
                      </Badge>
                      {task.eisenhower_quadrant && (
                        <Badge
                          variant="outline"
                          className={
                            quadrantColors[task.eisenhower_quadrant] ||
                            'border-gray-300'
                          }
                        >
                          {quadrantLabels[task.eisenhower_quadrant] ||
                            task.eisenhower_quadrant}
                        </Badge>
                      )}
                      {task.suggested_time_block && (
                        <Badge variant="outline" className="border-blue-300">
                          <Zap className="h-3 w-3 mr-1" />
                          {task.suggested_time_block}
                        </Badge>
                      )}
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
                      <strong>Why this task:</strong> {task.reasoning}
                    </div>

                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveTaskEdit(index)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelTaskEdit(index)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingTask(index)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSuggestions([]);
                setSelectedTasks(new Set());
                setEditedTasks(new Map());
                setDailyMessage('');
                setFocusSuggestion('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptTasks}
              disabled={accepting || selectedTasks.size === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Tasks...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Add {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''} to
                  My Day
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
