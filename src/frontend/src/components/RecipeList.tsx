import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { useIngredients } from '../hooks/useQueries';
import type { Recipe } from '../backend';

interface RecipeListProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onEdit }: RecipeListProps) {
  const { data: ingredients } = useIngredients();

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No recipes added yet. Click "Add Recipe" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const getBowlSizeLabel = (size: string) => {
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

  const getIngredientName = (id: bigint) => {
    return ingredients?.find((ing) => ing.id === id)?.name || 'Unknown';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Card key={recipe.id.toString()}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/assets/generated/salad-bowl-icon.dim_256x256.png"
                  alt="Salad Bowl"
                  className="h-8 w-8"
                />
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
              </div>
              <Badge variant="secondary">{getBowlSizeLabel(recipe.bowlSize)}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(recipe)}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">Ingredients:</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  • {getIngredientName(ing.ingredientId)} - {ing.quantity.value.toString()}g
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
