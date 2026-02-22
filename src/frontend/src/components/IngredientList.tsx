import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertTriangle } from 'lucide-react';
import type { Ingredient } from '../backend';
import { Variant_kilograms_grams } from '../backend';

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
}

export function IngredientList({ ingredients, onEdit }: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No ingredients added yet. Click "Add Ingredient" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const formatQuantity = (value: bigint, unit: Variant_kilograms_grams) => {
    return `${value.toString()} ${unit === Variant_kilograms_grams.grams ? 'g' : 'kg'}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ingredients.map((ingredient) => {
        const isLowStock = ingredient.quantity.value < ingredient.lowStockThreshold.value;

        return (
          <Card key={ingredient.id.toString()} className={isLowStock ? 'border-orange-500' : ''}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                {isLowStock && (
                  <Badge variant="destructive" className="mt-2">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Low Stock
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => onEdit(ingredient)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{formatQuantity(ingredient.quantity.value, ingredient.quantity.unit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost Price:</span>
                <span className="font-medium">₹{ingredient.costPricePerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium">{ingredient.supplierName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Threshold:</span>
                <span className="font-medium">
                  {formatQuantity(ingredient.lowStockThreshold.value, ingredient.lowStockThreshold.unit)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
