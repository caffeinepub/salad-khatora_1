import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetSubscriptions } from '../hooks/useQueries';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import type { LocalSubscription } from '../hooks/useQueries';

export default function SubscriptionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<LocalSubscription | null>(null);
  const { data: subscriptions = [], isLoading } = useGetSubscriptions();

  const activeCount = subscriptions.filter(s => s.isActive).length;

  const handleAdd = () => {
    setEditingSubscription(null);
    setShowForm(true);
  };

  const handleEdit = (sub: LocalSubscription) => {
    setEditingSubscription(sub);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground">
            {activeCount} active subscription{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Add Subscription
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading subscriptions...</div>
      ) : (
        <SubscriptionList subscriptions={subscriptions} onEdit={handleEdit} />
      )}

      <Dialog open={showForm} onOpenChange={open => { if (!open) handleSuccess(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSubscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            subscription={editingSubscription}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
