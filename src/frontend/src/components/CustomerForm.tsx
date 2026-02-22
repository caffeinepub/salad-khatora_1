import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Customer, CustomerInput } from '../backend';

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  mobile: string;
  email: string;
  referenceSource: string;
  preferences: string;
  address: string;
}

export function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const addMutation = useAddCustomer();
  const updateMutation = useUpdateCustomer();

  // Parse existing customer data
  const parseContactInfo = (contactInfo: string) => {
    try {
      const parsed = JSON.parse(contactInfo);
      return {
        mobile: parsed.mobile || '',
        email: parsed.email || '',
        referenceSource: parsed.referenceSource || '',
        preferences: parsed.preferences || '',
      };
    } catch {
      return {
        mobile: '',
        email: '',
        referenceSource: '',
        preferences: '',
      };
    }
  };

  const existingData = customer ? parseContactInfo(customer.contactInfo) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: customer
      ? {
          name: customer.name,
          mobile: existingData?.mobile || '',
          email: existingData?.email || '',
          referenceSource: existingData?.referenceSource || '',
          preferences: existingData?.preferences || '',
          address: customer.address,
        }
      : {},
  });

  const onSubmit = async (data: FormData) => {
    // Combine contact info into a JSON string
    const contactInfo = JSON.stringify({
      mobile: data.mobile,
      email: data.email,
      referenceSource: data.referenceSource,
      preferences: data.preferences,
    });

    const customerInput: CustomerInput = {
      name: data.name,
      contactInfo,
      address: data.address,
    };

    try {
      if (customer) {
        await updateMutation.mutateAsync({ id: customer.id, customerData: customerInput });
        toast.success('Customer updated successfully');
      } else {
        await addMutation.mutateAsync(customerInput);
        toast.success('Customer added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save customer');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Customer Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g., John Doe"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <Input
            id="mobile"
            type="tel"
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit mobile number',
              },
            })}
            placeholder="9876543210"
            maxLength={10}
          />
          {errors.mobile && <p className="text-sm text-red-500">{errors.mobile.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceSource">Reference Source</Label>
        <Input
          id="referenceSource"
          {...register('referenceSource')}
          placeholder="e.g., Friend, Social Media, Walk-in"
        />
        <p className="text-xs text-muted-foreground">How did the customer find you?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferences">Preferences</Label>
        <Textarea
          id="preferences"
          {...register('preferences')}
          placeholder="e.g., Allergies, favorite ingredients, dietary restrictions"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Customer preferences and notes</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          {...register('address', { required: 'Address is required' })}
          placeholder="Enter delivery address"
          rows={3}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
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
          {addMutation.isPending || updateMutation.isPending ? 'Saving...' : customer ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
