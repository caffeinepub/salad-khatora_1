import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, DollarSign, Download, History } from 'lucide-react';
import { IngredientForm } from '../components/IngredientForm';
import { IngredientList } from '../components/IngredientList';
import { useInventoryState, useIngredients } from '../hooks/useQueries';
import { exportToCSV } from '../utils/csvExport';
import type { Ingredient } from '../backend';
import { InventoryAdjustmentHistory } from '../components/InventoryAdjustmentHistory';

export function InventoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const { data: inventoryState } = useInventoryState();
  const { data: ingredients = [] } = useIngredients();

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIngredient(null);
  };

  const handleExportCSV = () => {
    const csvData = ingredients.map((ingredient) => ({
      Name: ingredient.name,
      Quantity: `${ingredient.quantity.value} ${ingredient.quantity.unit}`,
      'Cost Price': ingredient.costPricePerUnit,
      Supplier: ingredient.supplierName,
      'Low Stock Threshold': `${ingredient.lowStockThreshold.value} ${ingredient.lowStockThreshold.unit}`,
    }));
    exportToCSV(csvData, 'inventory');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Inventory Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryState?.ingredients.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active ingredients in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{inventoryState?.totalValue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingredients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ingredients">
            <Package className="mr-2 h-4 w-4" />
            Ingredients
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Adjustment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <IngredientList ingredients={ingredients} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="history">
          <InventoryAdjustmentHistory />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
          </DialogHeader>
          <IngredientForm ingredient={editingIngredient} onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
