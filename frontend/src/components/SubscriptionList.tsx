import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { useDeleteSubscription, useGetCustomers, useGetPlans } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { LocalSubscription } from '../hooks/useQueries';
import { calculateEndDate } from '../utils/dateCalculations';
import DeliveryDayList from './DeliveryDayList';

interface Props {
  subscriptions: LocalSubscription[];
  onEdit: (sub: LocalSubscription) => void;
}

const paymentStatusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function SubscriptionList({ subscriptions, onEdit }: Props) {
  const deleteSubscription = useDeleteSubscription();
  const { data: customers = [] } = useGetCustomers();
  const { data: plans = [] } = useGetPlans();

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      await deleteSubscription.mutateAsync(id);
      toast.success('Subscription deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete subscription');
    }
  };

  const getCustomerName = (customerId: number) => {
    const c = customers.find(c => Number(c.id) === customerId);
    return c?.name ?? `Customer #${customerId}`;
  };

  const getPlanName = (planId: number) => {
    const p = plans.find(p => p.id === planId);
    return p?.name ?? `Plan #${planId}`;
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No subscriptions yet. Add your first subscription to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {subscriptions.map(sub => {
        const endDate = calculateEndDate(sub.startDate, 24);
        return (
          <Card key={sub.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{getCustomerName(sub.customerId)}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getPlanName(sub.planId)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatusColors[sub.paymentStatus]}`}>
                    {sub.paymentStatus}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(sub)}>
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(sub.id)}
                    disabled={deleteSubscription.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>{sub.startDate} → {endDate}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline">{sub.bowlSize}</Badge>
                <Badge variant="outline">₹{sub.price}</Badge>
                {sub.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <DeliveryDayList subscription={sub} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
