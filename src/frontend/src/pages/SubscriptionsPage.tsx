import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { SubscriptionForm } from '../components/SubscriptionForm';
import { SubscriptionList } from '../components/SubscriptionList';
import { useSubscriptions, useCustomers, useExpiringSubscriptions } from '../hooks/useQueries';
import type { Subscription } from '../backend';

export function SubscriptionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const { data: customers = [] } = useCustomers();
  const { data: expiringSubscriptions = [] } = useExpiringSubscriptions();

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubscription(null);
  };

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Subscription Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Within 2 days</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </CardContent>
        </Card>
      ) : (
        <SubscriptionList subscriptions={subscriptions} customers={customers} onEdit={handleEdit} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubscription ? 'Edit Subscription' : 'Add New Subscription'}</DialogTitle>
          </DialogHeader>
          <SubscriptionForm subscription={selectedSubscription} onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
