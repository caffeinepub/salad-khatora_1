import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoiceList } from '../components/InvoiceList';
import { SalesAnalyticsCards } from '../components/SalesAnalyticsCards';
import { RevenueChart } from '../components/RevenueChart';
import { useInvoices, useCustomers, useRecipes, useSubscriptions } from '../hooks/useQueries';

export function SalesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch all required data with loading states
  const { isLoading: invoicesLoading } = useInvoices();
  const { isLoading: customersLoading } = useCustomers();
  const { isLoading: recipesLoading } = useRecipes();
  const { isLoading: subscriptionsLoading } = useSubscriptions();

  const isLoading = invoicesLoading || customersLoading || recipesLoading || subscriptionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Sales & Billing</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Sales Analytics */}
      <SalesAnalyticsCards />

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Invoice List */}
      <InvoiceList />

      {/* Invoice Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceForm onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
