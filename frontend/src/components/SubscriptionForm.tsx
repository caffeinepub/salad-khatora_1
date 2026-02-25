import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSubscription, useUpdateSubscription, useGetCustomers, useGetPlans } from '../hooks/useQueries';
import type { LocalSubscription } from '../hooks/useQueries';
import { calculateEndDate } from '../utils/dateCalculations';

interface FormValues {
  customerId: string;
  planId: string;
  startDate: string;
  bowlSize: string;
  price: string;
  paymentStatus: string;
}

interface Props {
  subscription?: LocalSubscription | null;
  onSuccess?: () => void;
}

export default function SubscriptionForm({ subscription, onSuccess }: Props) {
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const { data: customers = [] } = useGetCustomers();
  const { data: plans = [] } = useGetPlans();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      customerId: subscription?.customerId.toString() ?? '',
      planId: subscription?.planId.toString() ?? '',
      startDate: subscription?.startDate ?? new Date().toISOString().split('T')[0],
      bowlSize: subscription?.bowlSize ?? 'medium',
      price: subscription?.price.toString() ?? '',
      paymentStatus: subscription?.paymentStatus ?? 'pending',
    },
  });

  const planId = watch('planId');
  const startDate = watch('startDate');
  const bowlSize = watch('bowlSize');

  // Auto-fill price from plan
  useEffect(() => {
    if (planId) {
      const plan = plans.find(p => p.id.toString() === planId);
      if (plan) {
        setValue('price', plan.bowlPrice.toString());
        setValue('bowlSize', plan.bowlSize);
      }
    }
  }, [planId, plans, setValue]);

  const endDate = startDate ? calculateEndDate(startDate, 24) : '';

  const onSubmit = async (values: FormValues) => {
    const input = {
      customerId: parseInt(values.customerId),
      planId: parseInt(values.planId),
      startDate: values.startDate,
      endDate,
      bowlSize: values.bowlSize as 'small' | 'medium' | 'large',
      price: parseFloat(values.price),
      paymentStatus: values.paymentStatus as 'paid' | 'pending' | 'overdue' | 'cancelled',
    };

    try {
      if (subscription) {
        await updateSubscription.mutateAsync({ id: subscription.id, input });
        toast.success('Subscription updated');
      } else {
        await createSubscription.mutateAsync(input);
        toast.success('Subscription created');
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save subscription');
    }
  };

  const isPending = createSubscription.isPending || updateSubscription.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Customer</Label>
        <Select
          value={watch('customerId')}
          onValueChange={val => setValue('customerId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map(c => (
              <SelectItem key={String(c.id)} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <p className="text-destructive text-xs">Customer is required</p>}
      </div>

      <div className="space-y-1">
        <Label>Plan</Label>
        <Select
          value={watch('planId')}
          onValueChange={val => setValue('planId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name} — {p.bowlSize} — ₹{p.bowlPrice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>End Date (auto)</Label>
          <Input value={endDate} readOnly className="bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Bowl Size</Label>
          <Select value={watch('bowlSize')} onValueChange={val => setValue('bowlSize', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (250gm)</SelectItem>
              <SelectItem value="medium">Medium (350gm)</SelectItem>
              <SelectItem value="large">Large (500gm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { required: 'Price is required' })}
            placeholder="0.00"
          />
          {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Payment Status</Label>
        <Select value={watch('paymentStatus')} onValueChange={val => setValue('paymentStatus', val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : subscription ? 'Update Subscription' : 'Add Subscription'}
        </Button>
      </div>
    </form>
  );
}
