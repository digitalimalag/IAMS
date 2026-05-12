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
import { Plus, X } from 'lucide-react';
import { Asset } from '@/lib/mock-data';

interface AddAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (asset: any) => void;
  editingAsset?: Asset | null;
}

const ASSET_TYPES = [
  'Desktop', 
  'Laptop', 
  'Server', 
  'Printer', 
  'Monitor', 
  'Router', 
  'Switch',
  'USB HDD/SSD',
  'UPS',
  'TV',
  'Network Rack',
  'Power Cable',
  'VGA Cable',
  'HDMI Cable',
  'D to HDMI Cable',
  'USB Keyboard',
  'WL Keyboard',
  'USB Mouse',
  'WL Mouse',
];

const ASSET_CATEGORIES = [
  'Power Cable',
  'VGA Cable',
  'HDMI Cable',
  'D to HDMI Cable',
  'USB Keyboard',
  'WL Keyboard',
  'USB Mouse',
  'WL Mouse',
];

const STATUSES = ['Active', 'Inactive', 'Maintenance', 'Retired'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export function AddAssetModal({ open, onOpenChange, onSubmit, editingAsset }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    designation: '',
    processor: '',
    ram: '',
    storage: '',
    osInstalled: '',
    purchaseDate: '',
    warrantyExpiry: '',
    status: 'Active' as any,
    location: '',
    owner: '',
    assetTag: '',
    department: '',
    cost: '',
    notes: '',
  });

  const [customType, setCustomType] = useState('');

  const [categories, setCategories] = useState(ASSET_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (editingAsset) {
      const isPresetType = ASSET_TYPES.includes(editingAsset.type);
      setCustomType(isPresetType ? '' : editingAsset.type);
      setFormData({
        id: editingAsset.id,
        name: editingAsset.name,
        type: isPresetType ? editingAsset.type : '__manual__',
        serialNumber: editingAsset.serialNumber,
        manufacturer: editingAsset.manufacturer,
        model: editingAsset.model,
        designation: editingAsset.designation || '',
        processor: editingAsset.processor || '',
        ram: editingAsset.ram || '',
        storage: editingAsset.storage || '',
        osInstalled: editingAsset.osInstalled || '',
        purchaseDate: editingAsset.purchaseDate,
        warrantyExpiry: editingAsset.warrantyExpiry,
        status: editingAsset.status,
        location: editingAsset.location,
        owner: editingAsset.owner,
        assetTag: editingAsset.assetTag,
        department: editingAsset.department,
        cost: editingAsset.cost.toString(),
        notes: editingAsset.notes,
      });
    } else {
      setCustomType('');
      setFormData({
        id: '',
        name: '',
        type: '',
        serialNumber: '',
        manufacturer: '',
        model: '',
        designation: '',
        processor: '',
        ram: '',
        storage: '',
        osInstalled: '',
        purchaseDate: '',
        warrantyExpiry: '',
        status: 'Active',
        location: '',
        owner: '',
        assetTag: '',
        department: '',
        cost: '',
        notes: '',
      });
    }
  }, [editingAsset, open]);

  const effectiveType =
    formData.type === '__manual__' ? customType.trim() : formData.type;
  const showComputerSpecs = ['Laptop', 'Desktop', 'Server'].includes(effectiveType);
  const showStorageField = ['Laptop', 'Desktop', 'Server', 'USB HDD/SSD'].includes(effectiveType);
  const showMiscStorage = ['Printer', 'Monitor', 'Router', 'Switch', 'UPS', 'TV', 'Network Rack'].includes(effectiveType);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: effectiveType,
      designation: formData.designation.trim(),
      processor: showComputerSpecs ? formData.processor : '',
      ram: showComputerSpecs ? formData.ram : '',
      storage: showComputerSpecs || showStorageField ? formData.storage : '',
      osInstalled: showComputerSpecs ? formData.osInstalled : '',
      cost: parseFloat(formData.cost) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {editingAsset 
              ? 'Update the asset details below.' 
              : 'Fill in the details below to add a new IT asset to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Asset Tag */}
            <FieldGroup>
              <FieldLabel>Asset Tag</FieldLabel>
              <Input
                placeholder="e.g., IT-2024-001"
                value={formData.assetTag}
                onChange={(e) => handleChange('assetTag', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Name */}
            <FieldGroup>
              <FieldLabel>Asset Name</FieldLabel>
              <Input
                placeholder="e.g., John&apos;s Laptop"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Type */}
            <FieldGroup>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  handleChange('type', value);
                  if (value !== '__manual__') setCustomType('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  <SelectItem value="__manual__">Other (manual)</SelectItem>
                </SelectContent>
              </Select>
              {formData.type === '__manual__' && (
                <Input
                  className="mt-2"
                  placeholder="Enter asset type (e.g., Biometric Device)"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  required
                />
              )}
            </FieldGroup>

            {/* Serial Number */}
            <FieldGroup>
              <FieldLabel>Serial Number</FieldLabel>
              <Input
                placeholder="e.g., SN-12345-001"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Manufacturer */}
            <FieldGroup>
              <FieldLabel>Manufacturer</FieldLabel>
              <Input
                placeholder="e.g., Dell"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
            </FieldGroup>

            {/* Model */}
            <FieldGroup>
              <FieldLabel>Model</FieldLabel>
              <Input
                placeholder="e.g., XPS 15"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </FieldGroup>

            {/* Designation */}
            <FieldGroup>
              <FieldLabel>Designation</FieldLabel>
              <Input
                placeholder="e.g., Senior Designer"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
              />
            </FieldGroup>

            {showComputerSpecs && (
              <>
                {/* Processor */}
                <FieldGroup>
                  <FieldLabel>Processor</FieldLabel>
                  <Input
                    placeholder="e.g., Intel Core i7-13700H"
                    value={formData.processor}
                    onChange={(e) => handleChange('processor', e.target.value)}
                  />
                </FieldGroup>

                {/* RAM */}
                <FieldGroup>
                  <FieldLabel>RAM</FieldLabel>
                  <Input
                    placeholder="e.g., 32 GB"
                    value={formData.ram}
                    onChange={(e) => handleChange('ram', e.target.value)}
                  />
                </FieldGroup>

                {/* OS Installed */}
                <FieldGroup>
                  <FieldLabel>OS Installed</FieldLabel>
                  <Input
                    placeholder="e.g., Windows 11 Pro"
                    value={formData.osInstalled}
                    onChange={(e) => handleChange('osInstalled', e.target.value)}
                  />
                </FieldGroup>
              </>
            )}

            {showStorageField && !showComputerSpecs && (
              <FieldGroup>
                <FieldLabel>HDD/SSD</FieldLabel>
                <Input
                  placeholder="e.g., 512 GB SSD"
                  value={formData.storage}
                  onChange={(e) => handleChange('storage', e.target.value)}
                />
              </FieldGroup>
            )}

            {showMiscStorage && (
              <FieldGroup>
                <FieldLabel>Storage / Capacity</FieldLabel>
                <Input
                  placeholder="e.g., 2 TB, 8 GB, 24-Port"
                  value={formData.storage}
                  onChange={(e) => handleChange('storage', e.target.value)}
                />
              </FieldGroup>
            )}

            {/* Purchase Date */}
            <FieldGroup>
              <FieldLabel>Purchase Date</FieldLabel>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
              />
            </FieldGroup>

            {/* Warranty Expiry */}
            <FieldGroup>
              <FieldLabel>Warranty Expiry</FieldLabel>
              <Input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
              />
            </FieldGroup>

            {/* Status */}
            <FieldGroup>
              <FieldLabel>Status</FieldLabel>
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
            </FieldGroup>

            {/* Location */}
            <FieldGroup>
              <FieldLabel>Location</FieldLabel>
              <Input
                placeholder="e.g., Office A - Desk 1"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </FieldGroup>

            {/* Owner */}
            <FieldGroup>
              <FieldLabel>Owner</FieldLabel>
              <Input
                placeholder="e.g., John Doe"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
              />
            </FieldGroup>

            {/* Department */}
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
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
            </FieldGroup>

            {/* Cost */}
            <FieldGroup>
              <FieldLabel>Cost</FieldLabel>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
              />
            </FieldGroup>
          </div>

          {/* Asset Categories Management */}
          <FieldGroup>
            <FieldLabel>Asset Categories</FieldLabel>
            <div className="space-y-3 p-3 bg-muted/50 rounded-md border border-border">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm border border-primary/20"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="hover:opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {showAddCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className="h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCategory}
                    className="h-8 bg-primary hover:bg-primary/90"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory('');
                    }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddCategory(true)}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </Button>
              )}
            </div>
          </FieldGroup>

          {/* Notes */}
          <FieldGroup>
            <FieldLabel>Notes</FieldLabel>
            <Input
              placeholder="Additional notes about this asset..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="h-24"
            />
          </FieldGroup>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingAsset ? 'Update Asset' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
