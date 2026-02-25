import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetIngredients } from '../hooks/useQueries';
import IngredientForm from '../components/IngredientForm';
import IngredientList from '../components/IngredientList';
import type { Ingredient } from '../backend';

export default function InventoryPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const { data: ingredients = [], isLoading } = useGetIngredients();

  const handleAdd = () => {
    setEditingIngredient(null);
    setShowForm(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your ingredients and stock levels</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Add Ingredient
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading ingredients...</div>
      ) : (
        <IngredientList ingredients={ingredients} onEdit={handleEdit} />
      )}

      <Dialog open={showForm} onOpenChange={open => { if (!open) handleSuccess(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
          </DialogHeader>
          <IngredientForm
            ingredient={editingIngredient}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
