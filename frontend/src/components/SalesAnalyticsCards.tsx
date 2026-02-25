import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, UserCheck, ShoppingBag, CreditCard } from 'lucide-react';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';

export function SalesAnalyticsCards() {
  const analytics = useSalesAnalytics();

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{analytics.dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Sales for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{analytics.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month's sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.repeatCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalCustomers > 0
                ? `${((analytics.repeatCustomers / analytics.totalCustomers) * 100).toFixed(0)}% of total`
                : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Top Selling Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topSellingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topSellingItems.map((item, index) => (
                <div key={item.recipeId.toString()} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.recipeName}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Mode Distribution & Revenue Split */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.paymentModeDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No payment data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.paymentModeDistribution.map((mode) => (
                  <div key={mode.mode} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          mode.mode === 'cash'
                            ? 'bg-green-100 text-green-800'
                            : mode.mode === 'card'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                        }
                      >
                        {mode.mode.charAt(0).toUpperCase() + mode.mode.slice(1)}
                      </Badge>
                      <span className="text-sm">{mode.count} transactions</span>
                    </div>
                    <span className="font-semibold">{mode.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Subscription Revenue</span>
                  <span className="font-semibold text-green-600">₹{analytics.subscriptionRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${analytics.totalRevenue > 0 ? (analytics.subscriptionRevenue / analytics.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Regular Revenue</span>
                  <span className="font-semibold">₹{analytics.regularRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${analytics.totalRevenue > 0 ? (analytics.regularRevenue / analytics.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Average Order Value</span>
                  <span className="text-lg font-bold">₹{analytics.averageOrderValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
