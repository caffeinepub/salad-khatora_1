import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, History } from 'lucide-react';

// InventoryAdjustmentHistory is a placeholder since the backend no longer
// exposes inventory adjustment endpoints. It shows an informational message.
export function InventoryAdjustmentHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Inventory Adjustment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Adjustment history is not available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            This feature will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
