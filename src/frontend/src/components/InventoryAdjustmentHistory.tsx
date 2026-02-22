import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, TrendingDown, TrendingUp, Package, Receipt, Loader2 } from 'lucide-react';
import { useIngredients, useInvoices } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { InvoiceDetailsDialog } from './InvoiceDetailsDialog';
import type { InventoryAdjustment, SalesInvoice } from '../backend';

export function InventoryAdjustmentHistory() {
  const { data: ingredients = [] } = useIngredients();
  const { data: invoices = [] } = useInvoices();
  const { actor, isFetching } = useActor();
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  // Fetch all adjustments for all ingredients
  const { data: allAdjustments = [], isLoading } = useQuery<InventoryAdjustment[]>({
    queryKey: ['allInventoryAdjustments'],
    queryFn: async () => {
      if (!actor) return [];
      const adjustmentsPromises = ingredients.map((ingredient) =>
        actor.getInventoryAdjustments(ingredient.id)
      );
      const adjustmentsArrays = await Promise.all(adjustmentsPromises);
      return adjustmentsArrays.flat();
    },
    enabled: !!actor && !isFetching && ingredients.length > 0,
  });

  const sortedAdjustments = useMemo(() => {
    return [...allAdjustments].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [allAdjustments]);

  const getIngredientName = (ingredientId: bigint) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    return ingredient?.name || 'Unknown Ingredient';
  };

  const formatQuantity = (adjustment: InventoryAdjustment) => {
    const value = Number(adjustment.quantityChanged.value);
    const absValue = Math.abs(value);
    const unit = adjustment.quantityChanged.unit === 'kilograms' ? 'kg' : 'g';
    return `${absValue} ${unit}`;
  };

  const handleViewInvoice = (invoiceId: bigint) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-muted-foreground">Loading adjustment history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Inventory Adjustment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAdjustments.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No inventory adjustments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAdjustments.map((adjustment, index) => {
                const isDeduction = Number(adjustment.quantityChanged.value) < 0;
                return (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: isDeduction ? '#ef4444' : '#22c55e' }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {isDeduction ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-semibold">{getIngredientName(adjustment.ingredientId)}</span>
                            <Badge variant={adjustment.reason === 'sale' ? 'destructive' : 'default'}>
                              {adjustment.reason === 'sale' ? 'Sale' : 'Restock'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {new Date(Number(adjustment.timestamp) / 1000000).toLocaleString()}
                            </span>
                            <span className={`font-semibold ${isDeduction ? 'text-red-600' : 'text-green-600'}`}>
                              {isDeduction ? '-' : '+'}{formatQuantity(adjustment)}
                            </span>
                          </div>
                          {adjustment.relatedInvoiceId && (
                            <div className="flex items-center gap-2 mt-2">
                              <Receipt className="h-3 w-3 text-muted-foreground" />
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => handleViewInvoice(adjustment.relatedInvoiceId!)}
                              >
                                View Invoice #{adjustment.relatedInvoiceId.toString()}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceDetailsDialog invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </>
  );
}
