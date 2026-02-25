import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { useDeleteRecipe, useGetIngredients } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { LocalRecipe } from '../hooks/useQueries';

interface Props {
  recipes: LocalRecipe[];
  onEdit: (recipe: LocalRecipe) => void;
}

export default function RecipeList({ recipes, onEdit }: Props) {
  const deleteRecipe = useDeleteRecipe();
  const { data: ingredients = [] } = useGetIngredients();

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe.mutateAsync(id);
      toast.success('Recipe deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete recipe');
    }
  };

  const getIngredientName = (id: number) => {
    const ing = ingredients.find(i => Number(i.id) === id);
    return ing?.name ?? `Ingredient #${id}`;
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No recipes yet. Create your first salad recipe.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map(recipe => (
        <Card key={recipe.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs">{recipe.bowlSize}</Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(recipe)}>
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deleteRecipe.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {recipe.ingredients.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Ingredients:</p>
                {recipe.ingredients.map((ri, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{getIngredientName(ri.ingredientId)}</span>
                    <span className="text-muted-foreground">{ri.quantity.value} {ri.quantity.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No ingredients</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
