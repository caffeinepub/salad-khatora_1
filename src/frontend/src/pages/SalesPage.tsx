import { Card, CardContent } from '@/components/ui/card';

export function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Sales & Billing</h1>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Sales and billing functionality coming soon.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will allow you to create invoices and track sales with automatic inventory deduction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
