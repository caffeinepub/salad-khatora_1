import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetInvoices, useGetCustomers } from '../hooks/useQueries';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';
import type { LocalInvoice } from '../hooks/useQueries';

export default function SalesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: invoices = [], isLoading } = useGetInvoices();
  const { data: customers = [] } = useGetCustomers();

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} · ₹{totalRevenue.toFixed(2)} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          New Invoice
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
      ) : (
        <InvoiceList invoices={invoices} customers={customers} />
      )}

      <Dialog open={showForm} onOpenChange={open => { if (!open) handleSuccess(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
