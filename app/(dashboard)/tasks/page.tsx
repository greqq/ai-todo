'use client';

import { useState, useEffect } from 'react';
import {
  Plus, CheckCircle, Circle, Clock, Calendar, Zap, Target,
  MoreVertical, Edit, Trash2, ChevronDown, ChevronRight, Flag, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Goal {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  deadline_type: string;
  estimated_duration_minutes: number | null;
  actual_duration_minutes: number | null;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed_at: string | null;
  priority_score: number;
  energy_required: 'high' | 'medium' | 'low';
  task_type: string;
  eisenhower_quadrant: string | null;
  context_tags: string[] | null;
  location: string | null;
  is_recurring: boolean;
  source: string;
  times_postponed: number;
  is_procrastination_flagged: boolean;
  energy_impact: string | null;
  created_at: string;
  updated_at: string;
  goal?: Goal;
  subtasks?: Task[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [energyFilter, setEnergyFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_id: 'none',
    parent_task_id: '',
    due_date: '',
    scheduled_start: '',
    scheduled_end: '',
    estimated_duration_minutes: 30,
    energy_required: 'medium' as Task['energy_required'],
    task_type: 'deep_work',
    deadline_type: 'flexible',
    context_tags: [] as string[],
    location: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchGoals();
  }, [statusFilter, energyFilter, goalFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = '/api/tasks?includeSubtasks=true';

      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (energyFilter !== 'all') {
        url += `&energy_required=${energyFilter}`;
      }
      if (goalFilter !== 'all') {
        url += `&goal_id=${goalFilter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals?status=active');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal_id: formData.goal_id && formData.goal_id !== 'none' ? formData.goal_id : null,
          parent_task_id: formData.parent_task_id || null,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal_id: formData.goal_id && formData.goal_id !== 'none' ? formData.goal_id : null,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setEditDialogOpen(false);
        setSelectedTask(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTasks();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    if (task.status === 'completed') {
      // Reopen task
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'todo' }),
        });

        if (response.ok) {
          await fetchTasks();
        }
      } catch (error) {
        console.error('Error reopening task:', error);
      }
    } else {
      await handleCompleteTask(task.id);
    }
  };

  const handleChangeStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      goal_id: task.goal_id || 'none',
      parent_task_id: task.parent_task_id || '',
      due_date: task.due_date || '',
      scheduled_start: task.scheduled_start || '',
      scheduled_end: task.scheduled_end || '',
      estimated_duration_minutes: task.estimated_duration_minutes || 30,
      energy_required: task.energy_required,
      task_type: task.task_type,
      deadline_type: task.deadline_type,
      context_tags: task.context_tags || [],
      location: task.location || '',
    });
    setEditDialogOpen(true);
  };

  const openCreateSubtask = (parentTaskId: string) => {
    setFormData({
      ...formData,
      parent_task_id: parentTaskId,
    });
    setCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_id: 'none',
      parent_task_id: '',
      due_date: '',
      scheduled_start: '',
      scheduled_end: '',
      estimated_duration_minutes: 30,
      energy_required: 'medium',
      task_type: 'deep_work',
      deadline_type: 'flexible',
      context_tags: [],
      location: '',
    });
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-700';
    }
  };

  const getQuadrantBadge = (quadrant: string | null) => {
    if (!quadrant) return null;

    const colors = {
      q1: 'bg-red-100 text-red-800',
      q2: 'bg-green-100 text-green-800',
      q3: 'bg-yellow-100 text-yellow-800',
      q4: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      q1: 'Q1: Urgent & Important',
      q2: 'Q2: Important',
      q3: 'Q3: Urgent',
      q4: 'Q4: Neither',
    };

    return (
      <Badge className={colors[quadrant as keyof typeof colors] || ''}>
        {labels[quadrant as keyof typeof labels] || quadrant}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderTask = (task: Task, isSubtask = false) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);

    return (
      <div key={task.id} className={isSubtask ? 'ml-8' : ''}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {hasSubtasks && (
                  <button
                    onClick={() => toggleTaskExpansion(task.id)}
                    className="mt-1 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}

                <button
                  onClick={() => handleToggleStatus(task)}
                  className="mt-1"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : task.status === 'in_progress' ? (
                    <PlayCircle className="h-5 w-5 text-blue-600 fill-blue-100" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : getStatusColor(task.status)}`}>
                      {task.title}
                    </h3>
                    {task.is_procrastination_flagged && (
                      <span title="Procrastination flagged">
                        <Flag className="h-4 w-4 text-red-500" />
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.goal && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {task.goal.title}
                      </Badge>
                    )}

                    {task.due_date && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.due_date)}
                      </Badge>
                    )}

                    {task.estimated_duration_minutes && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.estimated_duration_minutes}m
                      </Badge>
                    )}

                    <Badge variant="outline" className="text-xs">
                      <Zap className={`h-3 w-3 mr-1 ${getEnergyColor(task.energy_required)}`} />
                      {task.energy_required} energy
                    </Badge>

                    {task.eisenhower_quadrant && getQuadrantBadge(task.eisenhower_quadrant)}

                    {task.times_postponed > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Postponed {task.times_postponed}x
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {task.status !== 'in_progress' && task.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in_progress')}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Task
                    </DropdownMenuItem>
                  )}
                  {task.status === 'in_progress' && (
                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'todo')}>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark as To Do
                    </DropdownMenuItem>
                  )}
                  {task.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => openEditDialog(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!isSubtask && (
                    <DropdownMenuItem onClick={() => openCreateSubtask(task.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {hasSubtasks && isExpanded && (
          <div className="ml-4">
            {task.subtasks!.map((subtask) => renderTask(subtask, true))}
          </div>
        )}
      </div>
    );
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and subtasks</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <Label>Goal Filter</Label>
          <Select value={goalFilter} onValueChange={setGoalFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All goals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All goals</SelectItem>
              {goals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Energy Level</Label>
          <Select value={energyFilter} onValueChange={setEnergyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All</TabsTrigger>
          <TabsTrigger value="todo" onClick={() => setStatusFilter('todo')}>To Do</TabsTrigger>
          <TabsTrigger value="in_progress" onClick={() => setStatusFilter('in_progress')}>In Progress</TabsTrigger>
          <TabsTrigger value="completed" onClick={() => setStatusFilter('completed')}>Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No tasks yet. Create your first task to get started!
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => renderTask(task))
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-2">
          {todoTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No tasks to do. Great job!
              </CardContent>
            </Card>
          ) : (
            todoTasks.map((task) => renderTask(task))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-2">
          {inProgressTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No tasks in progress.
              </CardContent>
            </Card>
          ) : (
            inProgressTasks.map((task) => renderTask(task))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No completed tasks yet.
              </CardContent>
            </Card>
          ) : (
            completedTasks.map((task) => renderTask(task))
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedTask(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Update task details' : 'Add a new task to your list'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Review quarterly metrics"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal">Link to Goal</Label>
                <Select value={formData.goal_id} onValueChange={(value) => setFormData({ ...formData, goal_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No goal</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="energy_required">Energy Required</Label>
                <Select value={formData.energy_required} onValueChange={(value: any) => setFormData({ ...formData, energy_required: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select value={formData.task_type} onValueChange={(value) => setFormData({ ...formData, task_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep_work">Deep Work</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline_type">Deadline Type</Label>
                <Select value={formData.deadline_type} onValueChange={(value) => setFormData({ ...formData, deadline_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="hard">Hard Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedTask(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={selectedTask ? handleUpdateTask : handleCreateTask}>
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
