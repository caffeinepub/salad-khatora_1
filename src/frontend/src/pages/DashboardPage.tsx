import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryState, useLowStockIngredients, useExpiringSubscriptions, useCustomers } from '../hooks/useQueries';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';
import { Package, TrendingUp, AlertTriangle, Leaf, Calendar, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';

export function DashboardPage() {
  const { data: inventoryState } = useInventoryState();
  const { data: lowStockItems } = useLowStockIngredients();
  const { data: expiringSubscriptions = [] } = useExpiringSubscriptions();
  const { data: customers = [] } = useCustomers();
  const analytics = useSalesAnalytics();
  const navigate = useNavigate();

  const getCustomerName = (customerId: bigint) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getBowlSizeLabel = (bowlSize: string) => {
    switch (bowlSize) {
      case 'small':
        return '250gm';
      case 'medium':
        return '350gm';
      case 'large':
        return '500gm';
      default:
        return bowlSize;
    }
  };

  const getPlanTypeLabel = (planType: string) => {
    return planType === 'weekly6days' ? 'Weekly' : 'Monthly';
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

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

      {/* Expiring Subscriptions Alerts */}
      {expiringSubscriptions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Subscriptions Expiring Soon
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {expiringSubscriptions.map((subscription) => {
              const daysRemaining = getDaysRemaining(subscription.endDate);
              return (
                <Card
                  key={subscription.id.toString()}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate({ to: '/subscriptions' })}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      {getCustomerName(subscription.customerId)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Plan:</span>{' '}
                      <span className="font-medium">{getPlanTypeLabel(subscription.planType)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Bowl Size:</span>{' '}
                      <span className="font-medium">{getBowlSizeLabel(subscription.bowlSize)}</span>
                    </p>
                    <p className="text-sm font-semibold text-orange-600">
                      Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
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
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{analytics.dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue today</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{analytics.monthlyRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Average order value: ₹{analytics.averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Customers:</span>
                <span className="font-semibold">{analytics.totalCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Repeat Customers:</span>
                <span className="font-semibold">{analytics.repeatCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Retention Rate:</span>
                <span className="font-semibold text-green-600">
                  {analytics.totalCustomers > 0
                    ? `${((analytics.repeatCustomers / analytics.totalCustomers) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </div>
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
