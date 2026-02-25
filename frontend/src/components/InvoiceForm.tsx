import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateInvoice, useGetCustomers, useGetRecipes } from '../hooks/useQueries';
import type { LocalInvoiceItem } from '../hooks/useQueries';

interface FormValues {
  customerId: string;
  invoiceDate: string;
  discount: string;
  paymentMode: string;
}

interface Props {
  onSuccess?: () => void;
}

export default function InvoiceForm({ onSuccess }: Props) {
  const createInvoice = useCreateInvoice();
  const { data: customers = [] } = useGetCustomers();
  const { data: recipes = [] } = useGetRecipes();

  const [items, setItems] = useState<{ recipeId: number; quantity: number; unitPrice: number }[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      customerId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      discount: '0',
      paymentMode: 'cash',
    },
  });

  const paymentMode = watch('paymentMode');
  const customerId = watch('customerId');

  const addItem = () => {
    setItems(prev => [...prev, { recipeId: 0, quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const onSubmit = async (values: FormValues) => {
    const discount = parseFloat(values.discount) || 0;
    const totalAmount = Math.max(0, subtotal - discount);

    const invoiceItems: LocalInvoiceItem[] = items
      .filter(item => item.recipeId > 0)
      .map(item => ({
        recipeId: item.recipeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }));

    const input = {
      customerId: values.customerId ? parseInt(values.customerId) : undefined,
      invoiceDate: new Date(values.invoiceDate).getTime(),
      items: invoiceItems,
      discount,
      paymentMode: values.paymentMode as 'cash' | 'card' | 'upi',
      totalAmount,
    };

    try {
      await createInvoice.mutateAsync(input);
      toast.success('Invoice created');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1">
        <Label>Customer (optional)</Label>
        <Select value={customerId} onValueChange={val => setValue('customerId', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Walk-in customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Walk-in</SelectItem>
            {customers.map(c => (
              <SelectItem key={String(c.id)} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="invoiceDate">Invoice Date</Label>
        <Input
          id="invoiceDate"
          type="date"
          {...register('invoiceDate', { required: true })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus size={14} className="mr-1" />
            Add Item
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No items added yet.</p>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Select
              value={item.recipeId.toString()}
              onValueChange={val => updateItem(index, 'recipeId', parseInt(val))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select recipe" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map(r => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
              className="w-16"
              placeholder="Qty"
            />
            <Input
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
              className="w-24"
              placeholder="Price"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => removeItem(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}

        {items.length > 0 && (
          <div className="text-right text-sm font-medium">
            Subtotal: ₹{subtotal.toFixed(2)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="discount">Discount (₹)</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            {...register('discount')}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <Label>Payment Mode</Label>
          <Select value={paymentMode} onValueChange={val => setValue('paymentMode', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <span className="font-semibold">
          Total: ₹{Math.max(0, subtotal - (parseFloat(watch('discount')) || 0)).toFixed(2)}
        </span>
        <Button type="submit" disabled={createInvoice.isPending}>
          {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
