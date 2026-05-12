'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { useState, useEffect } from 'react';
import type { Asset, Issue } from '@/lib/mock-data';
import { formatDateYMD } from '@/lib/date';

interface AddIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (issue: any) => void;
  editingIssue?: Issue | null;
  assets?: Asset[];
  isEmployee?: boolean;
  defaultDepartment?: string;
}

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const ASSIGNEES = ['Mike Chen', 'Lisa Park', 'David Smith', 'Emma Wilson'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export function AddIssueModal({
  open,
  onOpenChange,
  onSubmit,
  editingIssue,
  assets = [],
  isEmployee = false,
  defaultDepartment,
}: AddIssueModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    status: 'Open' as any,
    priority: 'Medium' as any,
    assetId: 'none',
    assignedTo: '',
    designation: '',
    createdDate: '',
    dueDate: '',
    department: '',
  });

  useEffect(() => {
    if (editingIssue) {
      setFormData({
        id: editingIssue.id,
        title: editingIssue.title,
        description: editingIssue.description,
        status: editingIssue.status,
        priority: editingIssue.priority,
        assetId: editingIssue.assetId,
        assignedTo: editingIssue.assignedTo,
        designation: editingIssue.designation || '',
        createdDate: editingIssue.createdDate,
        dueDate: editingIssue.dueDate,
        department: editingIssue.department,
      });
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        assetId: 'none',
        assignedTo: '',
        designation: '',
        createdDate: formatDateYMD(new Date()),
        dueDate: '',
        department: defaultDepartment || '',
      });
    }
  }, [defaultDepartment, editingIssue, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: isEmployee ? 'Open' : formData.status,
      department: isEmployee ? (defaultDepartment || formData.department) : formData.department,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingIssue ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
          <DialogDescription>
            {editingIssue 
              ? 'Update the ticket details below.' 
              : 'Report a new IT help desk ticket for an IT asset or service request.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Title */}
            <FieldGroup>
              <FieldLabel>Ticket Subject</FieldLabel>
              <Input
                placeholder="Brief description of the ticket"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Description */}
            <FieldGroup>
              <FieldLabel>Issue Details</FieldLabel>
              <Input
                placeholder="Detailed description of the ticket..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="h-24"
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <FieldGroup>
              <FieldLabel>Status</FieldLabel>
              {isEmployee ? (
                <Input value="Open" disabled />
              ) : (
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FieldGroup>

            {/* Priority */}
            <FieldGroup>
              <FieldLabel>Priority</FieldLabel>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            {/* Asset */}
            <FieldGroup>
              <FieldLabel>Related IT Asset</FieldLabel>
              <Select value={formData.assetId} onValueChange={(value) => handleChange('assetId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Asset</SelectItem>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetTag})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            {/* Assigned To */}
            <FieldGroup>
              <FieldLabel>Assigned IT Team Member</FieldLabel>
              {isEmployee ? (
                <Input value="Auto-assigned" disabled />
              ) : (
                <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Designation</FieldLabel>
              <Input
                placeholder="e.g., Support Specialist"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
              />
            </FieldGroup>

            {/* Due Date */}
            <FieldGroup>
              <FieldLabel>Due Date</FieldLabel>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </FieldGroup>

            {/* Department */}
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
              {isEmployee ? (
                <Input value={defaultDepartment || ''} disabled />
              ) : (
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FieldGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingIssue ? 'Update Ticket' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
