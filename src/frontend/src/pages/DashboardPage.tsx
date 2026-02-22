import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryState, useLowStockIngredients } from '../hooks/useQueries';
import { Package, TrendingUp, AlertTriangle, Leaf } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DashboardPage() {
  const { data: inventoryState } = useInventoryState();
  const { data: lowStockItems } = useLowStockIngredients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Dashboard</h1>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} ingredient{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{inventoryState?.totalValue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryState?.ingredients.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active ingredients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0.00</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Salad Khatora</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your salad business efficiently with our comprehensive management system. Track inventory, create
            recipes, manage sales, and handle customer subscriptions all in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
