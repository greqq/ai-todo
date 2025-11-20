'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp, MoreVertical, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'career' | 'health' | 'financial' | 'relationships' | 'personal_growth' | 'creative' | 'other';
  parent_goal_id?: string;
  level: 'vision' | 'long_term' | 'quarterly' | 'monthly' | 'weekly';
  start_date?: string;
  target_date?: string;
  completed_at?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  success_criteria?: string[];
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  total_time_invested: number;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as Goal['type'],
    level: 'long_term' as Goal['level'],
    priority: 'medium' as Goal['priority'],
    start_date: '',
    target_date: '',
    success_criteria: [] as string[],
  });
  const [criteriaInput, setCriteriaInput] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGoals();
        setCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;

    try {
      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGoals();
        setEditDialogOpen(false);
        setSelectedGoal(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to archive this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const openEditDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      type: goal.type,
      level: goal.level,
      priority: goal.priority,
      start_date: goal.start_date || '',
      target_date: goal.target_date || '',
      success_criteria: goal.success_criteria || [],
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'other',
      level: 'long_term',
      priority: 'medium',
      start_date: '',
      target_date: '',
      success_criteria: [],
    });
    setCriteriaInput('');
  };

  const addSuccessCriteria = () => {
    if (criteriaInput.trim()) {
      setFormData(prev => ({
        ...prev,
        success_criteria: [...prev.success_criteria, criteriaInput.trim()]
      }));
      setCriteriaInput('');
    }
  };

  const removeSuccessCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      success_criteria: prev.success_criteria.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'on_hold': return 'warning';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type: Goal['type']) => {
    const colors: Record<Goal['type'], any> = {
      career: 'info',
      health: 'success',
      financial: 'warning',
      relationships: 'destructive',
      personal_growth: 'default',
      creative: 'secondary',
      other: 'outline',
    };
    return colors[type];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Manage your goals and track progress towards achieving them
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.length > 0
                ? Math.round(goals.reduce((acc, g) => acc + g.completion_percentage, 0) / goals.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.reduce((acc, g) => acc + g.total_tasks, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No goals yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first goal to start tracking your progress
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <Badge variant={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <Badge variant={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge variant={getTypeColor(goal.type)}>
                        {goal.type?.replace('_', ' ') ?? 'N/A'}
                      </Badge>
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkComplete(goal.id)}
                      disabled={goal.status === 'completed'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${goal.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates and Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(goal.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Date</p>
                      <p className="font-medium">{formatDate(goal.target_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="font-medium">{goal.completed_tasks} / {goal.total_tasks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Invested</p>
                      <p className="font-medium">{Math.round(goal.total_time_invested / 60)}h</p>
                    </div>
                  </div>

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Milestones</p>
                      <div className="space-y-1">
                        {goal.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle
                              className={`h-4 w-4 ${
                                milestone.completed
                                  ? 'text-green-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                              {milestone.title}
                            </span>
                            {milestone.target_date && (
                              <span className="text-muted-foreground ml-auto">
                                {formatDate(milestone.target_date)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Criteria */}
                  {goal.success_criteria && goal.success_criteria.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Success Criteria</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {goal.success_criteria.map((criteria, index) => (
                          <li key={index}>{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedGoal(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            <DialogDescription>
              {selectedGoal ? 'Update your goal details below.' : 'Define your goal and track your progress towards achieving it.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Launch my startup"
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal in detail..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
                >
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="financial">Financial</option>
                  <option value="relationships">Relationships</option>
                  <option value="personal_growth">Personal Growth</option>
                  <option value="creative">Creative</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Goal['level'] }))}
                >
                  <option value="vision">Vision</option>
                  <option value="long_term">Long Term</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Success Criteria</Label>
              <div className="flex gap-2">
                <Input
                  value={criteriaInput}
                  onChange={(e) => setCriteriaInput(e.target.value)}
                  placeholder="Add a success criterion..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSuccessCriteria();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSuccessCriteria}>
                  Add
                </Button>
              </div>
              {formData.success_criteria.length > 0 && (
                <ul className="space-y-1">
                  {formData.success_criteria.map((criteria, index) => (
                    <li key={index} className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                      <span>{criteria}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSuccessCriteria(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setSelectedGoal(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedGoal ? handleUpdateGoal : handleCreateGoal}
              disabled={!formData.title.trim()}
            >
              {selectedGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
