import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAddSubscription, useUpdateSubscription, useCustomers } from '../hooks/useQueries';
import { toast } from 'sonner';
import { BowlSize, Variant_cancelled_pending_paid_overdue, Variant_weekly6days_monthly24days } from '../backend';
import type { Subscription, SubscriptionInput } from '../backend';

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onClose: () => void;
}

interface FormData {
  customerId: string;
  planType: 'weekly6days' | 'monthly24days';
  startDate: string;
  endDate: string;
  bowlSize: 'small' | 'medium' | 'large';
  price: string;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled';
}

export function SubscriptionForm({ subscription, onClose }: SubscriptionFormProps) {
  const addMutation = useAddSubscription();
  const updateMutation = useUpdateSubscription();
  const { data: customers = [] } = useCustomers();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: subscription
      ? {
          customerId: subscription.customerId.toString(),
          planType: subscription.planType === Variant_weekly6days_monthly24days.weekly6days ? 'weekly6days' : 'monthly24days',
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          bowlSize: subscription.bowlSize,
          price: subscription.price.toString(),
          paymentStatus: subscription.paymentStatus,
        }
      : {
          planType: 'weekly6days',
          bowlSize: 'medium',
          paymentStatus: 'pending',
        },
  });

  const startDate = watch('startDate');

  const onSubmit = async (data: FormData) => {
    // Validate end date is after start date
    if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const subscriptionInput: SubscriptionInput = {
      customerId: BigInt(data.customerId),
      planType: data.planType === 'weekly6days' ? Variant_weekly6days_monthly24days.weekly6days : Variant_weekly6days_monthly24days.monthly24days,
      startDate: data.startDate,
      endDate: data.endDate,
      bowlSize: data.bowlSize as BowlSize,
      price: parseFloat(data.price),
      paymentStatus: data.paymentStatus as Variant_cancelled_pending_paid_overdue,
    };

    try {
      if (subscription) {
        await updateMutation.mutateAsync({ id: subscription.id, subscriptionInput });
        toast.success('Subscription updated successfully');
      } else {
        await addMutation.mutateAsync(subscriptionInput);
        toast.success('Subscription added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save subscription');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer *</Label>
        <Controller
          name="customerId"
          control={control}
          rules={{ required: 'Customer is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id.toString()} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Plan Type *</Label>
        <Controller
          name="planType"
          control={control}
          rules={{ required: 'Plan type is required' }}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly6days" id="weekly" />
                <Label htmlFor="weekly" className="font-normal cursor-pointer">
                  Weekly (6 days/week)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly24days" id="monthly" />
                <Label htmlFor="monthly" className="font-normal cursor-pointer">
                  Monthly (24 days/month)
                </Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.planType && <p className="text-sm text-red-500">{errors.planType.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate', { required: 'End date is required' })}
            min={startDate}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bowlSize">Bowl Size *</Label>
        <Controller
          name="bowlSize"
          control={control}
          rules={{ required: 'Bowl size is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select bowl size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">250gm</SelectItem>
                <SelectItem value="medium">350gm</SelectItem>
                <SelectItem value="large">500gm</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.bowlSize && <p className="text-sm text-red-500">{errors.bowlSize.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (₹) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Price must be positive' },
          })}
          placeholder="e.g., 1500"
        />
        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentStatus">Payment Status *</Label>
        <Controller
          name="paymentStatus"
          control={control}
          rules={{ required: 'Payment status is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.paymentStatus && <p className="text-sm text-red-500">{errors.paymentStatus.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          disabled={addMutation.isPending || updateMutation.isPending}
        >
          {addMutation.isPending || updateMutation.isPending ? 'Saving...' : subscription ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
