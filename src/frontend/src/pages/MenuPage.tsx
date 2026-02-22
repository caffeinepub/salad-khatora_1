import { useState } from 'react';
import { useRecipes, useAddRecipe, useUpdateRecipe } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RecipeForm } from '../components/RecipeForm';
import { RecipeList } from '../components/RecipeList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Recipe } from '../backend';

export function MenuPage() {
  const { data: recipes, isLoading } = useRecipes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Menu Management</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      ) : (
        <RecipeList recipes={recipes || []} onEdit={handleEdit} />
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
          </DialogHeader>
          <RecipeForm recipe={editingRecipe} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
