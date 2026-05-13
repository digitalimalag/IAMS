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

type StorageAddon = {
  capacity: string;
  mediaType: 'HDD' | 'SSD';
  quantity: string;
};

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
  const [storageAddons, setStorageAddons] = useState<StorageAddon[]>([
    { capacity: '', mediaType: 'SSD', quantity: '1' },
  ]);

  const [customType, setCustomType] = useState('');

  const [categories, setCategories] = useState(ASSET_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (editingAsset) {
      const isPresetType = ASSET_TYPES.includes(editingAsset.type);
      setCustomType(isPresetType ? '' : editingAsset.type);
      const existingStorageAddons = Array.isArray(editingAsset.storageAddons) && editingAsset.storageAddons.length > 0
        ? editingAsset.storageAddons.map((addon): StorageAddon => ({
            capacity: addon.capacity || '',
            mediaType: (addon.mediaType === 'HDD' ? 'HDD' : 'SSD') as StorageAddon['mediaType'],
            quantity: String(addon.quantity || 1),
          }))
        : editingAsset.storage
          ? parseStorageSummary(editingAsset.storage)
          : [{ capacity: '', mediaType: 'SSD' as 'SSD', quantity: '1' }];
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
      setStorageAddons(existingStorageAddons);
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
      setStorageAddons([{ capacity: '', mediaType: 'SSD', quantity: '1' }]);
    }
  }, [editingAsset, open]);

  const effectiveType =
    formData.type === '__manual__' ? customType.trim() : formData.type;
  const showComputerSpecs = ['Laptop', 'Desktop', 'Server'].includes(effectiveType);
  const showStorageAddonField = ['Laptop', 'Desktop', 'Server', 'USB HDD/SSD'].includes(effectiveType);
  const showMiscStorage = ['Printer', 'Monitor', 'Router', 'Switch', 'UPS', 'TV', 'Network Rack'].includes(effectiveType);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStorageAddon = () => {
    setStorageAddons((prev) => [...prev, { capacity: '', mediaType: 'SSD', quantity: '1' }]);
  };

  const updateStorageAddon = (index: number, field: keyof StorageAddon, value: string) => {
    setStorageAddons((prev) =>
      prev.map((addon, idx) => (idx === index ? { ...addon, [field]: value } : addon))
    );
  };

  const removeStorageAddon = (index: number) => {
    setStorageAddons((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  const parseStorageSummary = (storage: string): StorageAddon[] => {
    const normalized = storage
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (normalized.length === 0) {
      return [{ capacity: '', mediaType: 'SSD' as 'SSD', quantity: '1' }];
    }

    return normalized.map((item): StorageAddon => {
      const match = item.match(/(.+?)\s+(\d+)\s*(HDD|SSD)\b/i);
      if (match) {
        return {
          capacity: match[1].trim(),
          quantity: match[2],
          mediaType: (match[3].toUpperCase() === 'HDD' ? 'HDD' : 'SSD') as StorageAddon['mediaType'],
        };
      }

      return {
        capacity: item,
        mediaType: 'SSD' as 'SSD',
        quantity: '1',
      };
    });
  };

  const storageSummary = storageAddons
    .map((addon) => {
      const capacity = addon.capacity.trim();
      const qty = Number(addon.quantity || '1') || 1;
      if (!capacity) return '';
      return `${capacity} ${qty} ${addon.mediaType}`;
    })
    .filter(Boolean)
    .join(', ');

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
      storage: showStorageAddonField ? storageSummary : (showMiscStorage ? formData.storage : ''),
      storageAddons: showStorageAddonField
        ? storageAddons
            .map((addon) => ({
              capacity: addon.capacity.trim(),
              mediaType: addon.mediaType,
              quantity: Number(addon.quantity || '1') || 1,
            }))
            .filter((addon) => addon.capacity)
        : [],
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

                {/* Storage Add-ons */}
                {showStorageAddonField && (
                  <FieldGroup>
                    <FieldLabel>HDD / SSD Add-ons</FieldLabel>
                    <div className="space-y-3 rounded-md border border-border bg-muted/40 p-3">
                      {storageAddons.map((addon, index) => (
                        <div key={`${addon.mediaType}-${index}`} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.5fr_auto]">
                          <Input
                            placeholder="e.g., 1 TB"
                            value={addon.capacity}
                            onChange={(e) => updateStorageAddon(index, 'capacity', e.target.value)}
                          />
                          <Select
                            value={addon.mediaType}
                            onValueChange={(value) => updateStorageAddon(index, 'mediaType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HDD">HDD</SelectItem>
                              <SelectItem value="SSD">SSD</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={addon.quantity}
                            onChange={(e) => updateStorageAddon(index, 'quantity', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => removeStorageAddon(index)}
                            disabled={storageAddons.length === 1}
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" className="gap-2" onClick={addStorageAddon}>
                        <Plus className="h-4 w-4" />
                        Add Storage Add-on
                      </Button>
                    </div>
                  </FieldGroup>
                )}

                {/* OS Installed */}
                {showComputerSpecs && (
                  <FieldGroup>
                    <FieldLabel>OS Installed</FieldLabel>
                    <Input
                      placeholder="e.g., Windows 11 Pro"
                      value={formData.osInstalled}
                      onChange={(e) => handleChange('osInstalled', e.target.value)}
                    />
                  </FieldGroup>
                )}
              </>
            )}

            {showStorageAddonField && !showComputerSpecs && (
              <FieldGroup>
                <FieldLabel>HDD / SSD Add-ons</FieldLabel>
                <div className="space-y-3 rounded-md border border-border bg-muted/40 p-3">
                  {storageAddons.map((addon, index) => (
                    <div key={`${addon.mediaType}-${index}`} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.5fr_auto]">
                      <Input
                        placeholder="e.g., 512 GB"
                        value={addon.capacity}
                        onChange={(e) => updateStorageAddon(index, 'capacity', e.target.value)}
                      />
                      <Select
                        value={addon.mediaType}
                        onValueChange={(value) => updateStorageAddon(index, 'mediaType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HDD">HDD</SelectItem>
                          <SelectItem value="SSD">SSD</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={addon.quantity}
                        onChange={(e) => updateStorageAddon(index, 'quantity', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => removeStorageAddon(index)}
                        disabled={storageAddons.length === 1}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="gap-2" onClick={addStorageAddon}>
                    <Plus className="h-4 w-4" />
                    Add Storage Add-on
                  </Button>
                </div>
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

            {/* Designation */}
            <FieldGroup>
              <FieldLabel>Designation</FieldLabel>
              <Input
                placeholder="e.g., Senior Designer"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
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
