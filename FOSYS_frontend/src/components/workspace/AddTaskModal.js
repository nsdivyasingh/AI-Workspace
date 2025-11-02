

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AddTaskModal = ({ isOpen, onClose, onAddTask, employees = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignee: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      status: 'Pending',
      assignee: formData.assignee || 'Unassigned', // optional
    };

  // ✅ send new task to parent component
    if (onAddTask) {
      onAddTask(newTask);
    }

    toast.success('Task created successfully!');
    setFormData({ title: '', description: '', dueDate: '', assignee: '' });
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{ fontFamily: 'Work Sans' }}>
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-slate-200">Task Title *</Label>
            <Input
              id="task-title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-slate-200">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="task-assignee" className="text-slate-200">Assign To *</Label>
            <select
              id="task-assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-2 text-white"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="task-due-date" className="text-slate-200">Due Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="task-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
