import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';
import type { Customer } from '../backend';
import { useGetInvoices } from '../hooks/useQueries';

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onClose: () => void;
}

export function CustomerDetailsDialog({ customer, open, onClose }: CustomerDetailsDialogProps) {
  const { data: allInvoices = [] } = useGetInvoices();
  // Filter invoices for this customer (customerId is stored as number in local invoices)
  const invoices = allInvoices.filter(inv => inv.customerId === Number(customer.id));

  let contactInfo: any = {};
  try {
    contactInfo = JSON.parse(customer.contactInfo);
  } catch {
    contactInfo = { mobile: customer.contactInfo };
  }

  const totalSpent = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <Badge
            variant={customer.isActive ? 'default' : 'secondary'}
            className={customer.isActive ? 'bg-green-600 text-white' : ''}
          >
            {customer.isActive ? 'Active' : 'Inactive'}
          </Badge>

          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Contact Information</h3>
            {contactInfo.mobile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{contactInfo.mobile}</span>
              </div>
            )}
            {contactInfo.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{contactInfo.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{customer.address}</span>
              </div>
            )}
            {contactInfo.reference && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Reference:</span> {contactInfo.reference}
              </div>
            )}
            {contactInfo.preferences && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Preferences:</span> {contactInfo.preferences}
              </div>
            )}
          </div>

          <Separator />

          {/* Purchase Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Purchase History
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{invoices.length}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">₹{totalSpent.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </div>

          {invoices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Invoices</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invoices
                  .slice()
                  .sort((a, b) => b.invoiceDate - a.invoiceDate)
                  .slice(0, 10)
                  .map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30"
                    >
                      <span className="text-muted-foreground">
                        #{invoice.id} — {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                      </span>
                      <span className="font-medium">₹{invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
