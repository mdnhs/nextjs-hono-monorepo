'use client';

import { useState } from 'react';
import { useLocations } from '@/hooks/api/query/use-inventory';
import { useAdjustInventory } from '@/hooks/api/mutation/use-inventory-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface InventoryManagerProps {
  variantId: string;
  sku: string;
}

export function InventoryManager({ variantId, sku }: InventoryManagerProps) {
  const { data: locationsResponse, isLoading: isLoadingLocs } = useLocations();
  const adjustMutation = useAdjustInventory();
  
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [adjustment, setAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>('Manual adjustment');

  const locations = locationsResponse?.data ?? [];

  const handleAdjust = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        variantId,
        locationId: selectedLocation,
        delta: adjustment,
        reason,
      });
      toast.success('Inventory adjusted successfully');
      setAdjustment(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust inventory');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Inventory</CardTitle>
        <CardDescription>Update stock levels for SKU: {sku}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select a warehouse/store" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name} {loc.isDefault && '(Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adjustment">Quantity Adjustment</Label>
            <Input
              id="adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value))}
              placeholder="e.g. 10 or -5"
            />
          </div>
          <div className="space-y-2 text-xs flex flex-col justify-end text-muted-foreground">
            <p>Positive numbers add to stock.</p>
            <p>Negative numbers remove from stock.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Stock shipment, Damage, etc."
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleAdjust}
          disabled={adjustMutation.isPending || isLoadingLocs}
        >
          {adjustMutation.isPending ? 'Updating...' : 'Apply Adjustment'}
        </Button>
      </CardContent>
    </Card>
  );
}
