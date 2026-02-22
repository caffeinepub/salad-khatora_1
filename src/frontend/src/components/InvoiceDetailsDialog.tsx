import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useCustomers, useRecipes } from '../hooks/useQueries';
import { Calendar, User, CreditCard, Receipt } from 'lucide-react';
import type { SalesInvoice, BowlSize } from '../backend';

interface InvoiceDetailsDialogProps {
  invoice: SalesInvoice;
  onClose: () => void;
}

export function InvoiceDetailsDialog({ invoice, onClose }: InvoiceDetailsDialogProps) {
  const { data: customers = [] } = useCustomers();
  const { data: recipes = [] } = useRecipes();

  const customer = invoice.customerId ? customers.find((c) => c.id === invoice.customerId) : null;

  const getRecipeName = (recipeId: bigint) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.name || 'Unknown Recipe';
  };

  const getBowlSizeLabel = (recipeId: bigint) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return '';
    switch (recipe.bowlSize) {
      case 'small':
        return '250gm';
      case 'medium':
        return '350gm';
      case 'large':
        return '500gm';
      default:
        return '';
    }
  };

  const parseContactInfo = (contactInfo: string) => {
    try {
      const parsed = JSON.parse(contactInfo);
      return {
        mobile: parsed.mobile || '',
        email: parsed.email || '',
      };
    } catch {
      return { mobile: '', email: '' };
    }
  };

  const customerContact = customer ? parseContactInfo(customer.contactInfo) : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="text-lg font-semibold">#{invoice.id.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(Number(invoice.invoiceDate) / 1000000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            {customer ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="font-medium">{customer.name}</span>
                </p>
                {customerContact?.mobile && (
                  <p>
                    <span className="text-muted-foreground">Mobile:</span>{' '}
                    <span className="font-medium">{customerContact.mobile}</span>
                  </p>
                )}
                {customerContact?.email && (
                  <p>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{customerContact.email}</span>
                  </p>
                )}
                {customer.address && (
                  <p>
                    <span className="text-muted-foreground">Address:</span>{' '}
                    <span className="font-medium">{customer.address}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Walk-in Customer</p>
            )}
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-3">Items Ordered</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getRecipeName(item.recipeId)}</p>
                        <p className="text-xs text-muted-foreground">{getBowlSizeLabel(item.recipeId)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity.toString()}</TableCell>
                    <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                ₹
                {invoice.items
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-red-600">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-green-600">₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Mode:
              </span>
              <Badge
                className={
                  invoice.paymentMode === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : invoice.paymentMode === 'card'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                }
              >
                {invoice.paymentMode.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
