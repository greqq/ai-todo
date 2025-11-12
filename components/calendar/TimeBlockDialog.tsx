'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TimeBlockFormData) => Promise<void>;
  initialDate?: Date;
  initialHour?: number;
}

export interface TimeBlockFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  block_type: 'work' | 'personal' | 'focus' | 'buffer' | 'meeting' | 'break';
  is_protected: boolean;
}

export function TimeBlockDialog({
  open,
  onClose,
  onSave,
  initialDate,
  initialHour = 9
}: TimeBlockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TimeBlockFormData>({
    title: '',
    description: '',
    start_time: initialDate
      ? `${format(initialDate, 'yyyy-MM-dd')}T${initialHour.toString().padStart(2, '0')}:00`
      : '',
    end_time: initialDate
      ? `${format(initialDate, 'yyyy-MM-dd')}T${(initialHour + 1).toString().padStart(2, '0')}:00`
      : '',
    block_type: 'work',
    is_protected: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        block_type: 'work',
        is_protected: false
      });
    } catch (error) {
      console.error('Error saving time block:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Time Block</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Deep Work Session"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="block_type">Block Type</Label>
            <Select
              value={formData.block_type}
              onValueChange={(value) =>
                setFormData({ ...formData, block_type: value as TimeBlockFormData['block_type'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="focus">Focus Time</SelectItem>
                <SelectItem value="buffer">Buffer</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_protected"
              checked={formData.is_protected}
              onChange={(e) => setFormData({ ...formData, is_protected: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="is_protected" className="font-normal">
              Protected (cannot be overridden by tasks)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Time Block'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
