import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateIngredient, useUpdateIngredient } from '../hooks/useQueries';
import type { Ingredient } from '../backend';
import { Variant_kilograms_grams } from '../backend';

interface FormValues {
  name: string;
  quantity: string;
  unit: string;
  costPrice: string;
  supplier: string;
  lowStockThreshold: string;
  lowStockUnit: string;
}

interface Props {
  ingredient?: Ingredient | null;
  onSuccess?: () => void;
}

export default function IngredientForm({ ingredient, onSuccess }: Props) {
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: ingredient?.name ?? '',
      quantity: ingredient?.quantity.value.toString() ?? '',
      unit: ingredient?.quantity.unit ?? Variant_kilograms_grams.grams,
      costPrice: ingredient?.costPricePerUnit.toString() ?? '',
      supplier: ingredient?.supplierName ?? '',
      lowStockThreshold: ingredient?.lowStockThreshold.value.toString() ?? '',
      lowStockUnit: ingredient?.lowStockThreshold.unit ?? Variant_kilograms_grams.grams,
    },
  });

  const unit = watch('unit');
  const lowStockUnit = watch('lowStockUnit');

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name.trim(),
      quantity: {
        value: parseFloat(values.quantity),
        unit: values.unit === 'kilograms' ? Variant_kilograms_grams.kilograms : Variant_kilograms_grams.grams,
      },
      costPricePerUnit: parseFloat(values.costPrice),
      supplierName: values.supplier.trim(),
      lowStockThreshold: {
        value: parseFloat(values.lowStockThreshold),
        unit: values.lowStockUnit === 'kilograms' ? Variant_kilograms_grams.kilograms : Variant_kilograms_grams.grams,
      },
    };

    try {
      if (ingredient) {
        await updateIngredient.mutateAsync({ id: ingredient.id, input });
        toast.success('Ingredient updated successfully');
      } else {
        await createIngredient.mutateAsync(input);
        toast.success('Ingredient added successfully');
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save ingredient');
    }
  };

  const isPending = createIngredient.isPending || updateIngredient.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Ingredient Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g. Lettuce"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            {...register('quantity', { required: 'Quantity is required' })}
            placeholder="0.00"
          />
          {errors.quantity && <p className="text-destructive text-xs">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Unit</Label>
          <Select value={unit} onValueChange={val => setValue('unit', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grams">Grams</SelectItem>
              <SelectItem value="kilograms">Kilograms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="costPrice">Cost Price per Unit (₹)</Label>
        <Input
          id="costPrice"
          type="number"
          step="0.01"
          {...register('costPrice', { required: 'Cost price is required' })}
          placeholder="0.00"
        />
        {errors.costPrice && <p className="text-destructive text-xs">{errors.costPrice.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="supplier">Supplier Name</Label>
        <Input
          id="supplier"
          {...register('supplier', { required: 'Supplier is required' })}
          placeholder="e.g. Fresh Farms"
        />
        {errors.supplier && <p className="text-destructive text-xs">{errors.supplier.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            step="0.01"
            {...register('lowStockThreshold', { required: 'Threshold is required' })}
            placeholder="0.00"
          />
          {errors.lowStockThreshold && <p className="text-destructive text-xs">{errors.lowStockThreshold.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Threshold Unit</Label>
          <Select value={lowStockUnit} onValueChange={val => setValue('lowStockUnit', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grams">Grams</SelectItem>
              <SelectItem value="kilograms">Kilograms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : ingredient ? 'Update Ingredient' : 'Add Ingredient'}
        </Button>
      </div>
    </form>
  );
}
