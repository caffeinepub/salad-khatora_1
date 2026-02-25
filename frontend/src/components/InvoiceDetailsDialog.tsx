import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, User, Calendar, CreditCard } from 'lucide-react';
import type { LocalInvoice } from '../hooks/useQueries';
import type { Customer } from '../backend';
import { useGetRecipes } from '../hooks/useQueries';

interface InvoiceDetailsDialogProps {
  invoice: LocalInvoice;
  customers: Customer[];
  open: boolean;
  onClose: () => void;
}

function getPaymentModeLabel(mode: string): string {
  switch (mode) {
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'upi': return 'UPI';
    default: return mode;
  }
}

export function InvoiceDetailsDialog({ invoice, customers, open, onClose }: InvoiceDetailsDialogProps) {
  const { data: recipes = [] } = useGetRecipes();

  const getCustomerName = (customerId?: number): string => {
    if (customerId === undefined || customerId === null) return 'Walk-in Customer';
    const customer = customers.find((c) => Number(c.id) === customerId);
    return customer?.name || `Customer #${customerId}`;
  };

  const getRecipeName = (recipeId: number): string => {
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.name || `Recipe #${recipeId}`;
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Meta */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{getCustomerName(invoice.customerId)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <Badge variant="outline">{getPaymentModeLabel(invoice.paymentMode)}</Badge>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Items</h3>
            {invoice.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{getRecipeName(item.recipeId)}</span>
                  <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>{item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <div className="flex items-center gap-0.5">
                <IndianRupee className="h-4 w-4" />
                <span>{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
