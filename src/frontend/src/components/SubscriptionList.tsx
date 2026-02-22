import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { useDeleteSubscription } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Variant_weekly6days_monthly24days, Variant_cancelled_pending_paid_overdue } from '../backend';
import type { Subscription, Customer } from '../backend';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  customers: Customer[];
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionList({ subscriptions, customers, onEdit }: SubscriptionListProps) {
  const deleteMutation = useDeleteSubscription();

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No subscriptions added yet. Click "Add Subscription" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const getCustomerName = (customerId: bigint) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getBowlSizeLabel = (bowlSize: string) => {
    switch (bowlSize) {
      case 'small':
        return '250gm';
      case 'medium':
        return '350gm';
      case 'large':
        return '500gm';
      default:
        return bowlSize;
    }
  };

  const getPlanTypeLabel = (planType: Variant_weekly6days_monthly24days) => {
    return planType === Variant_weekly6days_monthly24days.weekly6days ? 'Weekly (6 days/week)' : 'Monthly (24 days/month)';
  };

  const getPaymentStatusBadge = (status: Variant_cancelled_pending_paid_overdue) => {
    switch (status) {
      case Variant_cancelled_pending_paid_overdue.paid:
        return <Badge className="bg-green-600">Paid</Badge>;
      case Variant_cancelled_pending_paid_overdue.pending:
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case Variant_cancelled_pending_paid_overdue.overdue:
        return <Badge className="bg-red-600">Overdue</Badge>;
      case Variant_cancelled_pending_paid_overdue.cancelled:
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Subscription deleted successfully');
    } catch (error) {
      toast.error('Failed to delete subscription');
      console.error(error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((subscription) => {
        const isExpired = !subscription.isActive;
        const endDate = new Date(subscription.endDate);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <Card key={subscription.id.toString()}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  {getCustomerName(subscription.customerId)}
                </CardTitle>
                <div className="mt-2 flex gap-2">
                  {isExpired ? (
                    <Badge variant="secondary">Expired</Badge>
                  ) : (
                    <Badge className="bg-green-600">Active</Badge>
                  )}
                  {getPaymentStatusBadge(subscription.paymentStatus)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(subscription)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this subscription? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(subscription.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{getPlanTypeLabel(subscription.planType)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Bowl Size:</span>{' '}
                <span className="font-medium">{getBowlSizeLabel(subscription.bowlSize)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">₹{subscription.price.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Period:</span>{' '}
                <span className="font-medium">
                  {subscription.startDate} to {subscription.endDate}
                </span>
              </div>
              {!isExpired && daysRemaining <= 2 && daysRemaining >= 0 && (
                <div className="text-sm text-orange-600 font-medium">
                  ⚠️ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
