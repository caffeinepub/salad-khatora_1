import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetRecipes } from '../hooks/useQueries';
import RecipeForm from '../components/RecipeForm';
import RecipeList from '../components/RecipeList';
import type { LocalRecipe } from '../hooks/useQueries';

export default function MenuPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<LocalRecipe | null>(null);
  const { data: recipes = [], isLoading } = useGetRecipes();

  const handleAdd = () => {
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleEdit = (recipe: LocalRecipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground">Manage your salad recipes</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Add Recipe
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading recipes...</div>
      ) : (
        <RecipeList recipes={recipes} onEdit={handleEdit} />
      )}

      <Dialog open={showForm} onOpenChange={open => { if (!open) handleSuccess(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
          </DialogHeader>
          <RecipeForm
            recipe={editingRecipe}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
