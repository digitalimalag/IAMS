'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

export type RequestFormValues = {
  title: string;
  description: string;
  assetType: string;
  quantity: string;
  estimatedCost: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  department: string;
};

interface RequestFormProps {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  initialValues?: Partial<RequestFormValues>;
  onSubmit: (values: RequestFormValues) => void;
  error?: string;
}

const defaultValues: RequestFormValues = {
  title: '',
  description: '',
  assetType: '',
  quantity: '1',
  estimatedCost: '',
  priority: 'Medium',
  dueDate: '',
  department: '',
};

const REQUEST_PRIORITIES: RequestFormValues['priority'][] = ['Low', 'Medium', 'High'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export function RequestForm({ title, description, submitLabel, cancelHref, initialValues, onSubmit, error }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormValues>(defaultValues);

  useEffect(() => {
    setFormData({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (field: keyof RequestFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldGroup className="md:col-span-2">
              <FieldLabel>Title *</FieldLabel>
              <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="New Laptop for Finance Team" required />
            </FieldGroup>
            <FieldGroup className="md:col-span-2">
              <FieldLabel>Description *</FieldLabel>
              <Input value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Brief reason for the request" required />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Asset Type *</FieldLabel>
              <Input value={formData.assetType} onChange={(e) => handleChange('assetType', e.target.value)} placeholder="Laptop, Monitor, Printer..." required />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Quantity</FieldLabel>
              <Input type="number" min="1" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Estimated Cost</FieldLabel>
              <Input type="number" placeholder="0.00" value={formData.estimatedCost} onChange={(e) => handleChange('estimatedCost', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Priority</FieldLabel>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REQUEST_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Due Date</FieldLabel>
              <Input type="date" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
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
