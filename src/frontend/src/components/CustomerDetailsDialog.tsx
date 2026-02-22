import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useCustomerInvoices, useRecipes } from '../hooks/useQueries';
import { User, Phone, Mail, MapPin, Edit, Receipt, Calendar, ShoppingBag } from 'lucide-react';
import type { Customer } from '../backend';

interface CustomerDetailsDialogProps {
  customer: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailsDialog({ customer, onClose, onEdit }: CustomerDetailsDialogProps) {
  const { data: invoices = [] } = useCustomerInvoices(customer.id);
  const { data: recipes = [] } = useRecipes();

  const parseContactInfo = (contactInfo: string) => {
    try {
      const parsed = JSON.parse(contactInfo);
      return {
        mobile: parsed.mobile || '',
        email: parsed.email || '',
        referenceSource: parsed.referenceSource || '',
        preferences: parsed.preferences || '',
      };
    } catch {
      return {
        mobile: '',
        email: '',
        referenceSource: '',
        preferences: '',
      };
    }
  };

  const contactInfo = parseContactInfo(customer.contactInfo);
  const totalPurchaseValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const numberOfOrders = invoices.length;

  const getRecipeName = (recipeId: bigint) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.name || 'Unknown Recipe';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </span>
            <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-xl font-semibold mb-2">{customer.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              {customer.isActive ? (
                <Badge className="bg-green-600">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {contactInfo.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contactInfo.mobile}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contactInfo.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{customer.address}</span>
                </div>
              )}
              {contactInfo.referenceSource && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{contactInfo.referenceSource}</span>
                </div>
              )}
              {contactInfo.preferences && (
                <div className="flex items-start gap-2 pt-2">
                  <span className="text-muted-foreground">Preferences:</span>
                  <span className="text-muted-foreground">{contactInfo.preferences}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Purchase Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <p className="text-2xl font-bold">{numberOfOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-green-600">₹{totalPurchaseValue.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Purchase History */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Purchase History
            </h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No purchase history yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {invoices
                  .sort((a, b) => Number(b.invoiceDate - a.invoiceDate))
                  .map((invoice) => (
                    <Card key={invoice.id.toString()}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">Invoice #{invoice.id.toString()}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Number(invoice.invoiceDate) / 1000000).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{invoice.totalAmount.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {invoice.paymentMode.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {invoice.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                              {item.quantity.toString()}x {getRecipeName(item.recipeId)} - ₹
                              {item.totalPrice.toFixed(2)}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
