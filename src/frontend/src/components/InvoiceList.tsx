import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Receipt, Calendar, User, CreditCard, Filter } from 'lucide-react';
import { useInvoices, useCustomers, useSubscriptions } from '../hooks/useQueries';
import { InvoiceDetailsDialog } from './InvoiceDetailsDialog';
import type { SalesInvoice } from '../backend';

export function InvoiceList() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: customers = [] } = useCustomers();
  const { data: subscriptions = [] } = useSubscriptions();
  const [searchText, setSearchText] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  const activeSubscriptionCustomerIds = useMemo(() => {
    return new Set(subscriptions.filter((sub) => sub.isActive).map((sub) => sub.customerId.toString()));
  }, [subscriptions]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        // Search filter
        const customer = customers.find((c) => c.id === invoice.customerId);
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          !searchText ||
          invoice.id.toString().includes(searchLower) ||
          customer?.name.toLowerCase().includes(searchLower);

        // Payment mode filter
        const matchesPaymentMode = paymentModeFilter === 'all' || invoice.paymentMode === paymentModeFilter;

        // Customer type filter
        let matchesCustomerType = true;
        if (customerTypeFilter === 'subscription') {
          matchesCustomerType =
            !!invoice.customerId && activeSubscriptionCustomerIds.has(invoice.customerId.toString());
        } else if (customerTypeFilter === 'regular') {
          matchesCustomerType =
            !invoice.customerId || !activeSubscriptionCustomerIds.has(invoice.customerId.toString());
        }

        return matchesSearch && matchesPaymentMode && matchesCustomerType;
      })
      .sort((a, b) => Number(b.invoiceDate - a.invoiceDate));
  }, [invoices, customers, searchText, paymentModeFilter, customerTypeFilter, activeSubscriptionCustomerIds]);

  const getCustomerName = (customerId?: bigint) => {
    if (!customerId) return 'Walk-in Customer';
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getPaymentModeBadge = (mode: string) => {
    const variants: Record<string, string> = {
      cash: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      card: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      upi: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return variants[mode] || '';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading invoices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sales History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice # or customer..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="subscription">Subscription Customers</SelectItem>
                <SelectItem value="regular">Regular Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice List */}
          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchText || paymentModeFilter !== 'all' || customerTypeFilter !== 'all'
                  ? 'No invoices match your filters'
                  : 'No invoices created yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredInvoices.map((invoice) => {
                const isSubscriptionCustomer =
                  invoice.customerId && activeSubscriptionCustomerIds.has(invoice.customerId.toString());

                return (
                  <Card
                    key={invoice.id.toString()}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Invoice #{invoice.id.toString()}</span>
                            {isSubscriptionCustomer && (
                              <Badge variant="outline" className="text-xs">
                                Subscription
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Number(invoice.invoiceDate) / 1000000).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {getCustomerName(invoice.customerId)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getPaymentModeBadge(invoice.paymentMode)}>
                            {invoice.paymentMode.toUpperCase()}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₹{invoice.totalAmount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{invoice.items.length} items</div>
                          </div>
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
