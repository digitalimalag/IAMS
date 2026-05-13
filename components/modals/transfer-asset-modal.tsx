'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Asset } from '@/lib/mock-data';

export interface AssetTransferRecord {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  fromType: 'employee' | 'department';
  fromValue: string;
  toType: 'employee' | 'department';
  toValue: string;
  transferDate: string;
  reason: string;
  notes?: string;
}

interface TransferAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onSubmit: (record: AssetTransferRecord) => void;
}

export function TransferAssetModal({ open, onOpenChange, asset, onSubmit }: TransferAssetModalProps) {
  const [transferType, setTransferType] = useState<'employee' | 'department'>('employee');
  const [toValue, setToValue] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const fromType = useMemo<'employee' | 'department'>(() => {
    return asset?.assignedToUserId ? 'employee' : 'department';
  }, [asset]);

  const fromValue = useMemo(() => {
    if (!asset) return '-';
    return asset.owner || asset.department || '-';
  }, [asset]);

  useEffect(() => {
    if (!open) return;
    setTransferType(asset?.assignedToUserId ? 'employee' : 'department');
    setToValue('');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setNotes('');
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    onSubmit({
      id: `TR-${Date.now()}`,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      fromType,
      fromValue,
      toType: transferType,
      toValue: toValue.trim(),
      transferDate,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Transfer Asset</DialogTitle>
          <DialogDescription>
            Reassign this asset to another employee or department and keep an audit-friendly chain by asset tag.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel>Asset Tag</FieldLabel>
              <Input value={asset?.assetTag || ''} disabled />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Transfer Type</FieldLabel>
              <Select value={transferType} onValueChange={(value: 'employee' | 'department') => setTransferType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Current Holder</FieldLabel>
              <Input value={fromValue} disabled />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Transfer Date</FieldLabel>
              <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <FieldLabel>Transfer To</FieldLabel>
            <Input
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              placeholder={transferType === 'employee' ? 'Employee name' : 'Department name'}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Reason</FieldLabel>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Resigned employee replacement / department allocation" required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Notes</FieldLabel>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional comments" />
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
