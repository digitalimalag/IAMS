'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import type { Asset, Issue } from '@/lib/mock-data';
import { formatDateYMD } from '@/lib/date';

export type IssueFormValues = {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  assetId: string;
  assignedTo: string;
  designation: string;
  createdDate: string;
  dueDate: string;
  department: string;
};

interface IssueFormProps {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  initialValues?: Partial<IssueFormValues>;
  assets?: Asset[];
  isEmployee?: boolean;
  defaultDepartment?: string;
  onSubmit: (values: IssueFormValues) => void;
  error?: string;
}

const defaultValues: IssueFormValues = {
  id: '',
  title: '',
  description: '',
  status: 'Open',
  priority: 'Medium',
  assetId: 'none',
  assignedTo: '',
  designation: '',
  createdDate: '',
  dueDate: '',
  department: '',
};

const STATUSES: IssueFormValues['status'][] = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES: IssueFormValues['priority'][] = ['Low', 'Medium', 'High'];
const ASSIGNEES = ['Mike Chen', 'Lisa Park', 'David Smith', 'Emma Wilson'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export function IssueForm({
  title,
  description,
  submitLabel,
  cancelHref,
  initialValues,
  assets = [],
  isEmployee = false,
  defaultDepartment,
  onSubmit,
  error,
}: IssueFormProps) {
  const [formData, setFormData] = useState<IssueFormValues>(defaultValues);

  useEffect(() => {
    setFormData({
      ...defaultValues,
      ...initialValues,
      createdDate: initialValues?.createdDate || formatDateYMD(new Date()),
      department: initialValues?.department || defaultDepartment || '',
    });
  }, [defaultDepartment, initialValues]);

  const handleChange = (field: keyof IssueFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: isEmployee ? 'Open' : formData.status,
      department: isEmployee ? (defaultDepartment || formData.department) : formData.department,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <FieldGroup>
              <FieldLabel>Ticket Subject</FieldLabel>
              <Input placeholder="Brief description of the ticket" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Issue Details</FieldLabel>
              <Input placeholder="Detailed description of the ticket..." value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="h-24" />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldGroup>
              <FieldLabel>Status</FieldLabel>
              {isEmployee ? (
                <Input value="Open" disabled />
              ) : (
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Priority</FieldLabel>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Related IT Asset</FieldLabel>
              <Select value={formData.assetId} onValueChange={(value) => handleChange('assetId', value)}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Asset</SelectItem>
                  {assets.map((asset) => <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Assigned IT Team Member</FieldLabel>
              {isEmployee ? (
                <Input value="Auto-assigned" disabled />
              ) : (
                <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                  <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                  <SelectContent>{ASSIGNEES.map((assignee) => <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Designation</FieldLabel>
              <Input placeholder="e.g., Support Specialist" value={formData.designation} onChange={(e) => handleChange('designation', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Due Date</FieldLabel>
              <Input type="date" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
              {isEmployee ? (
                <Input value={defaultDepartment || ''} disabled />
              ) : (
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </FieldGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href={cancelHref}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
