import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Phone, Mail, MapPin, User, Receipt, ShoppingBag } from 'lucide-react';
import { useInvoices } from '../hooks/useQueries';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import type { Customer } from '../backend';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export function CustomerList({ customers, onEdit }: CustomerListProps) {
  const { data: invoices = [] } = useInvoices();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No customers added yet. Click "Add Customer" to get started.</p>
        </CardContent>
      </Card>
    );
  }

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

  const getCustomerStats = (customerId: bigint) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customerId);
    const totalOrders = customerInvoices.length;
    const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return { totalOrders, totalSpent };
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => {
          const contactInfo = parseContactInfo(customer.contactInfo);
          const stats = getCustomerStats(customer.id);

          return (
            <Card
              key={customer.id.toString()}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    {customer.name}
                  </CardTitle>
                  <div className="mt-2">
                    {customer.isActive ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(customer);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {contactInfo.mobile && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{contactInfo.mobile}</span>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium truncate">{contactInfo.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">{customer.address}</span>
                  </div>
                )}
                {contactInfo.referenceSource && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{contactInfo.referenceSource}</span>
                  </div>
                )}
                {/* Customer Stats */}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{stats.totalOrders} orders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-green-600" />
                    <span className="font-semibold text-green-600">₹{stats.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={(customer) => {
            setSelectedCustomer(null);
            onEdit(customer);
          }}
        />
      )}
    </>
  );
}
