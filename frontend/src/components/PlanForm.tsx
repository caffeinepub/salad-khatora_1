import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePlan, useUpdatePlan } from '../hooks/useQueries';
import type { LocalPlan } from '../hooks/useQueries';

interface FormValues {
  name: string;
  price: string;
  bowlSize: string;
  bowlPrice: string;
}

interface Props {
  plan?: LocalPlan | null;
  onSuccess?: () => void;
}

export default function PlanForm({ plan, onSuccess }: Props) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: plan?.name ?? '',
      price: plan?.price.toString() ?? '',
      bowlSize: plan?.bowlSize ?? 'medium',
      bowlPrice: plan?.bowlPrice.toString() ?? '',
    },
  });

  const bowlSize = watch('bowlSize');

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name.trim(),
      price: parseFloat(values.price),
      bowlSize: values.bowlSize,
      bowlPrice: parseFloat(values.bowlPrice),
    };

    try {
      if (plan) {
        await updatePlan.mutateAsync({ id: plan.id, input });
        toast.success('Plan updated');
      } else {
        await createPlan.mutateAsync(input);
        toast.success('Plan created');
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save plan');
    }
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Plan Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Plan name is required' })}
          placeholder="e.g. Monthly Salad Plan"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="price">Plan Price (₹)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register('price', { required: 'Price is required' })}
          placeholder="0.00"
        />
        {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Bowl Size</Label>
        <Select value={bowlSize} onValueChange={val => setValue('bowlSize', val)}>
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
        <Label htmlFor="bowlPrice">Bowl Price (₹)</Label>
        <Input
          id="bowlPrice"
          type="number"
          step="0.01"
          {...register('bowlPrice', { required: 'Bowl price is required' })}
          placeholder="0.00"
        />
        {errors.bowlPrice && <p className="text-destructive text-xs">{errors.bowlPrice.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
