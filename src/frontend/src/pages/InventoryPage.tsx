import { useState } from 'react';
import { useIngredients, useAddIngredient, useUpdateIngredient, useInventoryState } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Package } from 'lucide-react';
import { IngredientForm } from '../components/IngredientForm';
import { IngredientList } from '../components/IngredientList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV } from '../utils/csvExport';
import { toast } from 'sonner';
import type { Ingredient } from '../backend';

export function InventoryPage() {
  const { data: ingredients, isLoading } = useIngredients();
  const { data: inventoryState } = useInventoryState();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const handleExport = () => {
    if (!ingredients || ingredients.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = ingredients.map((ing) => ({
      Name: ing.name,
      Quantity: `${ing.quantity.value} ${ing.quantity.unit === 'grams' ? 'g' : 'kg'}`,
      'Cost Price': `₹${ing.costPricePerUnit}`,
      Supplier: ing.supplierName,
      'Low Stock Threshold': `${ing.lowStockThreshold.value} ${ing.lowStockThreshold.unit === 'grams' ? 'g' : 'kg'}`,
    }));

    exportToCSV(csvData, 'inventory-export');
    toast.success('Inventory exported successfully');
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIngredient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Inventory Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </div>

      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">₹{inventoryState?.totalValue.toFixed(2) || '0.00'}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {ingredients?.length || 0} ingredients in stock
          </p>
        </CardContent>
      </Card>

      {/* Ingredients List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading ingredients...</p>
        </div>
      ) : (
        <IngredientList ingredients={ingredients || []} onEdit={handleEdit} />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
          </DialogHeader>
          <IngredientForm ingredient={editingIngredient} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
