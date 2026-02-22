import { Card, CardContent } from '@/components/ui/card';

export function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Subscription Management</h1>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Subscription management functionality coming soon.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will allow you to manage weekly and monthly meal plans for your customers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
