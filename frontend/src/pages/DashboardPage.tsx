import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, CalendarCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGetCustomers, useGetIngredients, useGetInvoices, useGetSubscriptions, useGetLowStockIngredients } from '../hooks/useQueries';

export default function DashboardPage() {
  const { data: customers = [] } = useGetCustomers();
  const { data: ingredients = [] } = useGetIngredients();
  const { data: invoices = [] } = useGetInvoices();
  const { data: subscriptions = [] } = useGetSubscriptions();
  const { data: lowStock = [] } = useGetLowStockIngredients();

  const activeSubscriptions = subscriptions.filter(s => s.isActive).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: CalendarCheck,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Ingredients',
      value: ingredients.length,
      icon: Package,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(0)}`,
      icon: ShoppingCart,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Salad Khatora management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle size={18} />
              Low Stock Alerts ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStock.map(ing => (
                <div key={String(ing.id)} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded-md text-sm">
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    {ing.quantity.value} {ing.quantity.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} />
              Recent Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No customers yet</p>
            ) : (
              <div className="space-y-2">
                {customers.slice(-5).reverse().map(c => (
                  <div key={String(c.id)} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.address || 'No address'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Invoices</span>
                <span className="font-semibold">{invoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">₹{totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low Stock Items</span>
                <span className={`font-semibold ${lowStock.length > 0 ? 'text-orange-500' : 'text-primary'}`}>
                  {lowStock.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                <span className="font-semibold text-primary">{activeSubscriptions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
