import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddIngredient, useUpdateIngredient } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Ingredient, IngredientInput } from '../backend';
import { Variant_kilograms_grams } from '../backend';

interface IngredientFormProps {
  ingredient?: Ingredient | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  quantity: string;
  unit: 'grams' | 'kilograms';
  costPricePerUnit: string;
  supplierName: string;
  lowStockThreshold: string;
}

export function IngredientForm({ ingredient, onClose }: IngredientFormProps) {
  const addMutation = useAddIngredient();
  const updateMutation = useUpdateIngredient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          quantity: ingredient.quantity.value.toString(),
          unit: ingredient.quantity.unit === Variant_kilograms_grams.grams ? 'grams' : 'kilograms',
          costPricePerUnit: ingredient.costPricePerUnit.toString(),
          supplierName: ingredient.supplierName,
          lowStockThreshold: ingredient.lowStockThreshold.value.toString(),
        }
      : {
          unit: 'grams',
        },
  });

  const unit = watch('unit');

  const onSubmit = async (data: FormData) => {
    const ingredientInput: IngredientInput = {
      name: data.name,
      quantity: {
        value: BigInt(Math.floor(parseFloat(data.quantity))),
        unit: data.unit === 'grams' ? Variant_kilograms_grams.grams : Variant_kilograms_grams.kilograms,
      },
      costPricePerUnit: parseFloat(data.costPricePerUnit),
      supplierName: data.supplierName,
      lowStockThreshold: {
        value: BigInt(Math.floor(parseFloat(data.lowStockThreshold))),
        unit: data.unit === 'grams' ? Variant_kilograms_grams.grams : Variant_kilograms_grams.kilograms,
      },
    };

    try {
      if (ingredient) {
        await updateMutation.mutateAsync({ id: ingredient.id, ingredient: ingredientInput });
        toast.success('Ingredient updated successfully');
      } else {
        await addMutation.mutateAsync(ingredientInput);
        toast.success('Ingredient added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save ingredient');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ingredient Name *</Label>
        <Input id="name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Lettuce" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            {...register('quantity', { required: 'Quantity is required', min: 0 })}
            placeholder="0"
          />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select value={unit} onValueChange={(value) => setValue('unit', value as 'grams' | 'kilograms')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grams">Grams (g)</SelectItem>
              <SelectItem value="kilograms">Kilograms (kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="costPricePerUnit">Cost Price per Unit (₹) *</Label>
        <Input
          id="costPricePerUnit"
          type="number"
          step="0.01"
          {...register('costPricePerUnit', { required: 'Cost price is required', min: 0 })}
          placeholder="0.00"
        />
        {errors.costPricePerUnit && <p className="text-sm text-red-500">{errors.costPricePerUnit.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierName">Supplier Name *</Label>
        <Input
          id="supplierName"
          {...register('supplierName', { required: 'Supplier name is required' })}
          placeholder="e.g., Fresh Farms"
        />
        {errors.supplierName && <p className="text-sm text-red-500">{errors.supplierName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
        <Input
          id="lowStockThreshold"
          type="number"
          step="0.01"
          {...register('lowStockThreshold', { required: 'Threshold is required', min: 0 })}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">Alert when stock falls below this amount</p>
        {errors.lowStockThreshold && <p className="text-sm text-red-500">{errors.lowStockThreshold.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          disabled={addMutation.isPending || updateMutation.isPending}
        >
          {addMutation.isPending || updateMutation.isPending ? 'Saving...' : ingredient ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
