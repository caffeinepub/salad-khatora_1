import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { LocalInvoice } from '../hooks/useQueries';
import type { Customer } from '../backend';

interface Props {
  invoices: LocalInvoice[];
  customers: Customer[];
}

const paymentModeColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  card: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  upi: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function InvoiceList({ invoices, customers }: Props) {
  const [search, setSearch] = useState('');

  const getCustomerName = (customerId?: number) => {
    if (!customerId) return 'Walk-in';
    const c = customers.find(c => Number(c.id) === customerId);
    return c?.name ?? `Customer #${customerId}`;
  };

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    const customerName = getCustomerName(inv.customerId).toLowerCase();
    return customerName.includes(search.toLowerCase()) || inv.id.toString().includes(search);
  });

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No invoices yet. Create your first invoice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by customer or invoice #..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(inv => (
          <Card key={inv.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">Invoice #{inv.id}</p>
                  <p className="text-muted-foreground text-xs">{getCustomerName(inv.customerId)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentModeColors[inv.paymentMode]}`}>
                  {inv.paymentMode.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{inv.items.length}</span>
                </div>
                {inv.discount > 0 && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Discount</span>
                    <span>-₹{inv.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-border">
                  <span>Total</span>
                  <span>₹{inv.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
