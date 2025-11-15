'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Clock,
  Zap,
  Star,
  Edit,
  Trash2,
  GripVertical,
  Sunrise,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutineTask {
  id: string;
  title: string;
  description?: string;
  estimated_duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  routine_type: 'morning' | 'evening';
  is_optional?: boolean;
  completed_today?: boolean;
  order_index?: number;
}

interface RoutineCardProps {
  task: RoutineTask;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onEdit?: (task: RoutineTask) => void;
  onDelete?: (taskId: string) => void;
  dragHandle?: boolean;
}

export function RoutineCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  dragHandle = false,
}: RoutineCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed_today || false);

  const energyConfig = {
    high: { color: 'text-red-600', icon: '🔥', label: 'High Energy' },
    medium: { color: 'text-yellow-600', icon: '⚡', label: 'Medium Energy' },
    low: { color: 'text-green-600', icon: '🌱', label: 'Low Energy' },
  };

  const routineTypeConfig = {
    morning: {
      icon: Sunrise,
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      label: 'Morning'
    },
    evening: {
      icon: Moon,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      label: 'Evening'
    },
  };

  const energyInfo = energyConfig[task.energy_required];
  const routineInfo = routineTypeConfig[task.routine_type];
  const RoutineIcon = routineInfo.icon;

  const handleToggle = (checked: boolean) => {
    setIsCompleted(checked);
    if (onToggleComplete) {
      onToggleComplete(task.id, checked);
    }
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isCompleted && 'bg-green-50 border-green-200'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {dragHandle && (
            <GripVertical className="mt-1 h-5 w-5 flex-shrink-0 cursor-move text-muted-foreground" />
          )}

          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
            className="mt-1"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className={cn(
                'text-base',
                isCompleted && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </CardTitle>

              <div className="flex flex-shrink-0 gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {task.description && !isCompleted && (
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={routineInfo.color}>
                <RoutineIcon className="mr-1 h-3 w-3" />
                {routineInfo.label}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.estimated_duration_minutes} min</span>
              </div>

              <div className={cn('flex items-center gap-1 text-xs', energyInfo.color)}>
                <Zap className="h-3 w-3" />
                <span>{energyInfo.label}</span>
              </div>

              {task.is_optional && (
                <Badge variant="outline" className="bg-gray-50 text-xs">
                  Optional
                </Badge>
              )}

              {!task.is_optional && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Star className="h-3 w-3 fill-purple-600" />
                  <span>Required</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {isCompleted && (
        <CardContent className="border-t bg-green-50/50 pt-3">
          <p className="text-xs text-green-700">
            ✓ Completed today - Great job!
          </p>
        </CardContent>
      )}
    </Card>
  );
}
