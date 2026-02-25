import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateRecipe, useUpdateRecipe, useGetIngredients } from '../hooks/useQueries';
import type { LocalRecipe } from '../hooks/useQueries';

interface FormValues {
  name: string;
  bowlSize: string;
}

interface RecipeIngredientEntry {
  ingredientId: number;
  quantity: number;
  unit: 'grams' | 'kilograms';
}

interface Props {
  recipe?: LocalRecipe | null;
  onSuccess?: () => void;
}

export default function RecipeForm({ recipe, onSuccess }: Props) {
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const { data: ingredients = [] } = useGetIngredients();

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientEntry[]>(
    recipe?.ingredients.map(ri => ({
      ingredientId: ri.ingredientId,
      quantity: ri.quantity.value,
      unit: ri.quantity.unit,
    })) ?? []
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: recipe?.name ?? '',
      bowlSize: recipe?.bowlSize ?? 'medium',
    },
  });

  const bowlSize = watch('bowlSize');

  const addIngredient = () => {
    setRecipeIngredients(prev => [...prev, { ingredientId: 0, quantity: 0, unit: 'grams' }]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredientEntry = (index: number, field: keyof RecipeIngredientEntry, value: any) => {
    setRecipeIngredients(prev => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
  };

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name.trim(),
      bowlSize: values.bowlSize as 'small' | 'medium' | 'large',
      ingredients: recipeIngredients
        .filter(ri => ri.ingredientId > 0)
        .map(ri => ({
          ingredientId: ri.ingredientId,
          quantity: { value: ri.quantity, unit: ri.unit },
        })),
    };

    try {
      if (recipe) {
        await updateRecipe.mutateAsync({ id: recipe.id, input });
        toast.success('Recipe updated');
      } else {
        await createRecipe.mutateAsync(input);
        toast.success('Recipe created');
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save recipe');
    }
  };

  const isPending = createRecipe.isPending || updateRecipe.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Recipe Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Recipe name is required' })}
          placeholder="e.g. Garden Fresh Salad"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Bowl Size</Label>
        <Select value={bowlSize} onValueChange={val => setValue('bowlSize', val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (250gm)</SelectItem>
            <SelectItem value="medium">Medium (350gm)</SelectItem>
            <SelectItem value="large">Large (500gm)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Ingredients</Label>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>

        {recipeIngredients.length === 0 && (
          <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
        )}

        {recipeIngredients.map((entry, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Select
              value={entry.ingredientId.toString()}
              onValueChange={val => updateIngredientEntry(index, 'ingredientId', parseInt(val))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map(ing => (
                  <SelectItem key={String(ing.id)} value={String(ing.id)}>
                    {ing.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              value={entry.quantity}
              onChange={e => updateIngredientEntry(index, 'quantity', parseFloat(e.target.value))}
              className="w-20"
              placeholder="Qty"
            />
            <Select
              value={entry.unit}
              onValueChange={val => updateIngredientEntry(index, 'unit', val as 'grams' | 'kilograms')}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grams">grams</SelectItem>
                <SelectItem value="kilograms">kg</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => removeIngredient(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
}
