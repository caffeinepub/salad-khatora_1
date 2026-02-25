import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useQueries';
import type { Customer } from '../backend';

interface FormValues {
  name: string;
  mobile: string;
  email: string;
  address: string;
  preferences: string;
}

interface Props {
  customer?: Customer | null;
  onSuccess?: () => void;
}

function parseContactInfo(contactInfo: string) {
  try {
    return JSON.parse(contactInfo);
  } catch {
    return { mobile: contactInfo, email: '', preferences: '' };
  }
}

export default function CustomerForm({ customer, onSuccess }: Props) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const parsed = customer ? parseContactInfo(customer.contactInfo) : {};

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: customer?.name ?? '',
      mobile: parsed.mobile ?? '',
      email: parsed.email ?? '',
      address: customer?.address ?? '',
      preferences: parsed.preferences ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const contactInfo = JSON.stringify({
      mobile: values.mobile,
      email: values.email,
      preferences: values.preferences,
    });

    const input = {
      name: values.name.trim(),
      contactInfo,
      address: values.address.trim(),
    };

    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, input });
        toast.success('Customer updated successfully');
      } else {
        await createCustomer.mutateAsync(input);
        toast.success('Customer added successfully');
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save customer');
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g. Manjula Sharma"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="mobile">Mobile Number</Label>
        <Input
          id="mobile"
          {...register('mobile', {
            required: 'Mobile is required',
            pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit mobile number' },
          })}
          placeholder="10-digit mobile number"
          maxLength={10}
        />
        {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@example.com"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Delivery address"
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="preferences">Preferences / Notes</Label>
        <Textarea
          id="preferences"
          {...register('preferences')}
          placeholder="Dietary preferences, allergies, notes..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
}
