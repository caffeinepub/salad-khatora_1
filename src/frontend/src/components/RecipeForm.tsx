import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddRecipe, useUpdateRecipe, useIngredients } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import type { Recipe, RecipeInput, BowlSize } from '../backend';
import { Variant_kilograms_grams } from '../backend';

interface RecipeFormProps {
  recipe?: Recipe | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  bowlSize: BowlSize;
  ingredients: Array<{
    ingredientId: string;
    quantity: string;
  }>;
}

export function RecipeForm({ recipe, onClose }: RecipeFormProps) {
  const addMutation = useAddRecipe();
  const updateMutation = useUpdateRecipe();
  const { data: availableIngredients } = useIngredients();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: recipe
      ? {
          name: recipe.name,
          bowlSize: recipe.bowlSize,
          ingredients: recipe.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId.toString(),
            quantity: ing.quantity.value.toString(),
          })),
        }
      : {
          bowlSize: 'small' as BowlSize,
          ingredients: [{ ingredientId: '', quantity: '' }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const bowlSize = watch('bowlSize');

  const onSubmit = async (data: FormData) => {
    if (data.ingredients.length === 0 || data.ingredients.some((ing) => !ing.ingredientId || !ing.quantity)) {
      toast.error('Please add at least one ingredient with quantity');
      return;
    }

    const recipeInput: RecipeInput = {
      name: data.name,
      bowlSize: data.bowlSize,
      ingredients: data.ingredients.map((ing) => ({
        ingredientId: BigInt(ing.ingredientId),
        quantity: {
          value: BigInt(Math.floor(parseFloat(ing.quantity))),
          unit: Variant_kilograms_grams.grams,
        },
      })),
    };

    try {
      if (recipe) {
        await updateMutation.mutateAsync({ id: recipe.id, recipe: recipeInput });
        toast.success('Recipe updated successfully');
      } else {
        await addMutation.mutateAsync(recipeInput);
        toast.success('Recipe added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save recipe');
      console.error(error);
    }
  };

  const getBowlSizeLabel = (size: BowlSize) => {
    switch (size) {
      case 'small':
        return '250gm';
      case 'medium':
        return '350gm';
      case 'large':
        return '500gm';
      default:
        return size;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Recipe Name *</Label>
        <Input id="name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Protein Bowl" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bowlSize">Bowl Size *</Label>
        <Select value={bowlSize} onValueChange={(value) => setValue('bowlSize', value as BowlSize)}>
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
          <Label>Ingredients *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ingredientId: '', quantity: '' })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={watch(`ingredients.${index}.ingredientId`)}
                  onValueChange={(value) => setValue(`ingredients.${index}.ingredientId`, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIngredients?.map((ing) => (
                      <SelectItem key={ing.id.toString()} value={ing.id.toString()}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  step="0.01"
                  {...register(`ingredients.${index}.quantity`, { required: true, min: 0 })}
                  placeholder="Grams"
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
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
          {addMutation.isPending || updateMutation.isPending ? 'Saving...' : recipe ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
