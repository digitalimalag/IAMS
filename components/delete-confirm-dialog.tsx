'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmationLabel: string;
  confirmationValue: string;
  onConfirmationValueChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  error?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
}

export function DeleteConfirmDialog({
  open,
  title,
  description,
  confirmationLabel,
  confirmationValue,
  onConfirmationValueChange,
  reason,
  onReasonChange,
  onOpenChange,
  onConfirm,
  error,
  confirmLabel = 'Delete',
  confirmDisabled = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FieldGroup>
            <FieldLabel>{confirmationLabel}</FieldLabel>
            <Input
              value={confirmationValue}
              onChange={(e) => onConfirmationValueChange(e.target.value)}
              placeholder={`Type ${confirmationLabel.toLowerCase()}`}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Reason for deletion</FieldLabel>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Write a short reason for this deletion"
              className="min-h-24"
            />
          </FieldGroup>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
