'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Sparkles, Archive, Target, Clock, Zap, MoreVertical, Edit, Trash2,
  ArrowRight, Brain, Package
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

interface BacklogItem {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  category: 'idea' | 'task' | 'project' | 'research' | 'learn';
  priority: 'nice_to_have' | 'important' | 'critical';
  status: 'new' | 'reviewing' | 'ready' | 'parked';
  ai_suggested_schedule_date: string | null;
  ai_eisenhower_quadrant: string | null;
  ai_effort_estimate: 'small' | 'medium' | 'large' | null;
  ai_impact_score: number | null;
  promoted_to_task_id: string | null;
  promoted_at: string | null;
  created_at: string;
  updated_at: string;
  goal?: Goal;
}

export default function BacklogPage() {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prioritizing, setPrioritizing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);

  // Filters
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'idea' as BacklogItem['category'],
    priority: 'nice_to_have' as BacklogItem['priority'],
    status: 'new' as BacklogItem['status'],
    goal_id: 'none',
  });

  const [promoteFormData, setPromoteFormData] = useState({
    due_date: '',
    scheduled_start: '',
    scheduled_end: '',
    estimated_duration_minutes: 30,
    energy_required: 'medium',
    task_type: 'deep_work',
  });

  useEffect(() => {
    fetchBacklogItems();
    fetchGoals();
  }, [viewFilter, categoryFilter, priorityFilter, goalFilter]);

  const fetchBacklogItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (viewFilter !== 'all') params.append('view', viewFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (goalFilter !== 'all' && goalFilter !== 'none') params.append('goal_id', goalFilter);

      const response = await fetch(`/api/backlog?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch backlog items');

      const data = await response.json();
      setBacklogItems(data);
    } catch (error) {
      console.error('Error fetching backlog items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Failed to fetch goals');

      const data = await response.json();
      setGoals(data.filter((g: Goal) => g.status === 'active'));
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal_id: formData.goal_id === 'none' ? null : formData.goal_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create backlog item');

      setCreateDialogOpen(false);
      resetForm();
      fetchBacklogItems();
    } catch (error) {
      console.error('Error creating backlog item:', error);
      alert('Failed to create backlog item');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.title.trim()) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/backlog/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal_id: formData.goal_id === 'none' ? null : formData.goal_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to update backlog item');

      setEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
      fetchBacklogItems();
    } catch (error) {
      console.error('Error updating backlog item:', error);
      alert('Failed to update backlog item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this backlog item?')) return;

    try {
      const response = await fetch(`/api/backlog/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to archive backlog item');

      fetchBacklogItems();
    } catch (error) {
      console.error('Error archiving backlog item:', error);
      alert('Failed to archive backlog item');
    }
  };

  const handlePrioritize = async () => {
    try {
      setPrioritizing(true);
      const response = await fetch('/api/backlog/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bulk',
        }),
      });

      if (!response.ok) throw new Error('Failed to prioritize backlog items');

      const data = await response.json();

      fetchBacklogItems();
    } catch (error) {
      console.error('Error prioritizing backlog items:', error);
      alert('Failed to prioritize backlog items');
    } finally {
      setPrioritizing(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedItem) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/backlog/${selectedItem.id}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoteFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote backlog item');
      }

      const data = await response.json();

      setPromoteDialogOpen(false);
      setSelectedItem(null);
      resetPromoteForm();
      fetchBacklogItems();
    } catch (error: any) {
      console.error('Error promoting backlog item:', error);
      alert(error.message || 'Failed to promote backlog item');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (item: BacklogItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      priority: item.priority,
      status: item.status,
      goal_id: item.goal_id || 'none',
    });
    setEditDialogOpen(true);
  };

  const openPromoteDialog = (item: BacklogItem) => {
    setSelectedItem(item);
    setPromoteFormData({
      due_date: item.ai_suggested_schedule_date || '',
      scheduled_start: '',
      scheduled_end: '',
      estimated_duration_minutes: item.ai_effort_estimate === 'small' ? 30 : item.ai_effort_estimate === 'large' ? 120 : 60,
      energy_required: 'medium',
      task_type: 'deep_work',
    });
    setPromoteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'idea',
      priority: 'nice_to_have',
      status: 'new',
      goal_id: 'none',
    });
  };

  const resetPromoteForm = () => {
    setPromoteFormData({
      due_date: '',
      scheduled_start: '',
      scheduled_end: '',
      estimated_duration_minutes: 30,
      energy_required: 'medium',
      task_type: 'deep_work',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'idea': return <Sparkles className="w-4 h-4" />;
      case 'task': return <Target className="w-4 h-4" />;
      case 'project': return <Package className="w-4 h-4" />;
      case 'research': return <Brain className="w-4 h-4" />;
      case 'learn': return <Zap className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'important': return 'default';
      case 'nice_to_have': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'reviewing': return 'secondary';
      case 'parked': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredItems = backlogItems;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backlog</h1>
          <p className="text-muted-foreground">
            Capture ideas and tasks for later
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrioritize}
            disabled={prioritizing || backlogItems.length === 0}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {prioritizing ? 'Prioritizing...' : 'AI Prioritize'}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backlogItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready to Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogItems.filter(item => item.ai_suggested_schedule_date).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogItems.filter(item => item.priority === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stale Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogItems.filter(item => {
                const sixtyDaysAgo = new Date();
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                return new Date(item.created_at) < sixtyDaysAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Views */}
      <Tabs value={viewFilter} onValueChange={setViewFilter}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="suggested">AI Suggested</TabsTrigger>
          <TabsTrigger value="stale">Stale Items</TabsTrigger>
        </TabsList>

        <TabsContent value={viewFilter} className="space-y-4 mt-4">
          {/* Additional Filters */}
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="learn">Learn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="nice_to_have">Nice to Have</SelectItem>
              </SelectContent>
            </Select>

            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="none">No Goal</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Backlog Items List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No backlog items found. Add your first idea!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(item.category)}
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.promoted_to_task_id && (
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              Promoted
                            </Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.goal && (
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{item.goal.title}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Added {formatDate(item.created_at)}</span>
                          </div>
                          {item.ai_suggested_schedule_date && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Sparkles className="w-3 h-3" />
                              <span>Suggested: {formatDate(item.ai_suggested_schedule_date)}</span>
                            </div>
                          )}
                          {item.ai_effort_estimate && (
                            <Badge variant="outline">
                              {item.ai_effort_estimate} effort
                            </Badge>
                          )}
                          {item.ai_impact_score && (
                            <Badge variant="outline">
                              Impact: {item.ai_impact_score}/10
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.promoted_to_task_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPromoteDialog(item)}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Promote
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Backlog Item</DialogTitle>
            <DialogDescription>
              Capture an idea, task, or project for later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to capture?"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="learn">Learn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="goal">Related Goal (Optional)</Label>
              <Select
                value={formData.goal_id}
                onValueChange={(value) => setFormData({ ...formData, goal_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Goal</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Backlog Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="learn">Learn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="parked">Parked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Related Goal</Label>
              <Select
                value={formData.goal_id}
                onValueChange={(value) => setFormData({ ...formData, goal_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Goal</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote to Task Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Task</DialogTitle>
            <DialogDescription>
              Convert this backlog item into an active task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={promoteFormData.due_date}
                onChange={(e) => setPromoteFormData({ ...promoteFormData, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="5"
                step="5"
                value={promoteFormData.estimated_duration_minutes}
                onChange={(e) => setPromoteFormData({ ...promoteFormData, estimated_duration_minutes: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Energy Required</Label>
              <Select
                value={promoteFormData.energy_required}
                onValueChange={(value) => setPromoteFormData({ ...promoteFormData, energy_required: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Task Type</Label>
              <Select
                value={promoteFormData.task_type}
                onValueChange={(value) => setPromoteFormData({ ...promoteFormData, task_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deep_work">Deep Work</SelectItem>
                  <SelectItem value="shallow_work">Shallow Work</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email_communication">Email/Communication</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromote} disabled={saving}>
              {saving ? 'Promoting...' : 'Promote to Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
