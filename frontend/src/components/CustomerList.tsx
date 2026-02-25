import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import { useDeleteCustomer, useGetInvoices } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Customer } from '../backend';

interface Props {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

function parseContactInfo(contactInfo: string) {
  try {
    return JSON.parse(contactInfo);
  } catch {
    return { mobile: contactInfo, email: '', preferences: '' };
  }
}

export default function CustomerList({ customers, onEdit }: Props) {
  const deleteCustomer = useDeleteCustomer();
  const { data: invoices = [] } = useGetInvoices();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success('Customer deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete customer');
    }
  };

  const getCustomerStats = (customerId: bigint) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === Number(customerId));
    const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return { orders: customerInvoices.length, totalSpent };
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No customers yet. Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map(customer => {
        const contact = parseContactInfo(customer.contactInfo);
        const stats = getCustomerStats(customer.id);
        return (
          <Card key={String(customer.id)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <Badge variant={customer.isActive ? 'default' : 'secondary'} className="mt-1 text-xs">
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(customer.id)}
                    disabled={deleteCustomer.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {contact.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} />
                    <span>{contact.mobile}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>

              {stats.orders > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
                  <span className="text-muted-foreground">{stats.orders} orders</span>
                  <span className="font-medium text-foreground">₹{stats.totalSpent.toFixed(0)} spent</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
