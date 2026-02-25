import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, AlertTriangle } from 'lucide-react';
import { useDeleteIngredient } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Ingredient } from '../backend';

interface Props {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
}

export default function IngredientList({ ingredients, onEdit }: Props) {
  const deleteIngredient = useDeleteIngredient();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await deleteIngredient.mutateAsync(id);
      toast.success('Ingredient deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete ingredient');
    }
  };

  const isLowStock = (ing: Ingredient) => {
    const qty = ing.quantity.unit === 'kilograms' ? ing.quantity.value * 1000 : ing.quantity.value;
    const threshold = ing.lowStockThreshold.unit === 'kilograms' ? ing.lowStockThreshold.value * 1000 : ing.lowStockThreshold.value;
    return qty <= threshold;
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No ingredients yet. Add your first ingredient to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ingredients.map(ing => (
        <Card key={String(ing.id)} className={isLowStock(ing) ? 'border-orange-300 dark:border-orange-700' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{ing.name}</h3>
                {isLowStock(ing) && (
                  <Badge variant="destructive" className="mt-1 text-xs flex items-center gap-1 w-fit">
                    <AlertTriangle size={10} />
                    Low Stock
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(ing)}>
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(ing.id)}
                  disabled={deleteIngredient.isPending}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-medium text-foreground">
                  {ing.quantity.value.toFixed(2)} {ing.quantity.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cost/Unit</span>
                <span className="font-medium text-foreground">₹{ing.costPricePerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Supplier</span>
                <span className="font-medium text-foreground truncate ml-2">{ing.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Threshold</span>
                <span className="font-medium text-foreground">
                  {ing.lowStockThreshold.value.toFixed(2)} {ing.lowStockThreshold.unit}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
