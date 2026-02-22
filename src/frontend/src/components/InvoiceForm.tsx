import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateInvoice, useCustomers, useRecipes, useSubscriptions, useAddCustomer } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Search, Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PaymentMode, BowlSize } from '../backend';
import type { InvoiceInput, CustomerInput } from '../backend';
import { cn } from '@/lib/utils';

interface InvoiceFormProps {
  onClose: () => void;
}

interface InvoiceLineItem {
  recipeId: string;
  recipeName: string;
  bowlSize: string;
  quantity: number;
  unitPrice: number;
}

interface FormData {
  customerId: string;
  items: InvoiceLineItem[];
  discount: number;
  discountType: 'fixed' | 'percentage';
  taxPercentage: number;
  paymentMode: PaymentMode;
  notes: string;
}

interface NewCustomerFormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export function InvoiceForm({ onClose }: InvoiceFormProps) {
  const createMutation = useCreateInvoice();
  const addCustomerMutation = useAddCustomer();
  const { data: customers = [] } = useCustomers();
  const { data: recipes = [] } = useRecipes();
  const { data: subscriptions = [] } = useSubscriptions();

  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [recipeSearchOpen, setRecipeSearchOpen] = useState<number | null>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      customerId: '',
      items: [],
      discount: 0,
      discountType: 'fixed',
      taxPercentage: 0,
      paymentMode: PaymentMode.cash,
      notes: '',
    },
  });

  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    reset: resetCustomerForm,
    formState: { errors: customerErrors },
  } = useForm<NewCustomerFormData>({
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      address: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');
  const watchedDiscountType = watch('discountType');
  const watchedTaxPercentage = watch('taxPercentage');
  const watchedCustomerId = watch('customerId');

  // Calculate subtotal
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  // Calculate discount amount
  const discountAmount =
    watchedDiscountType === 'percentage'
      ? (subtotal * (watchedDiscount || 0)) / 100
      : watchedDiscount || 0;

  // Calculate subtotal after discount
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

  // Calculate tax
  const taxAmount = (subtotalAfterDiscount * (watchedTaxPercentage || 0)) / 100;

  // Calculate total
  const total = subtotalAfterDiscount + taxAmount;

  // Get customer subscription info
  const customerSubscription = watchedCustomerId
    ? subscriptions.find(
        (sub) => sub.customerId.toString() === watchedCustomerId && sub.isActive
      )
    : null;

  const getBowlSizeLabel = (bowlSize: BowlSize) => {
    switch (bowlSize) {
      case BowlSize.small:
        return '250gm';
      case BowlSize.medium:
        return '350gm';
      case BowlSize.large:
        return '500gm';
      default:
        return bowlSize;
    }
  };

  const getDefaultPrice = (bowlSize: BowlSize): number => {
    switch (bowlSize) {
      case BowlSize.small:
        return 150;
      case BowlSize.medium:
        return 200;
      case BowlSize.large:
        return 250;
      default:
        return 150;
    }
  };

  const handleAddRecipe = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id.toString() === recipeId);
    if (recipe) {
      append({
        recipeId: recipe.id.toString(),
        recipeName: recipe.name,
        bowlSize: getBowlSizeLabel(recipe.bowlSize),
        quantity: 1,
        unitPrice: getDefaultPrice(recipe.bowlSize),
      });
    }
    setRecipeSearchOpen(null);
    setRecipeSearchQuery('');
  };

  const onSubmitNewCustomer = async (data: NewCustomerFormData) => {
    try {
      const customerInput: CustomerInput = {
        name: data.name,
        contactInfo: JSON.stringify({
          mobile: data.mobile,
          email: data.email,
        }),
        address: data.address,
      };

      const newCustomerId = await addCustomerMutation.mutateAsync(customerInput);
      toast.success('Customer added successfully');
      setValue('customerId', newCustomerId.toString());
      setShowNewCustomerDialog(false);
      resetCustomerForm();
    } catch (error) {
      toast.error('Failed to add customer');
      console.error(error);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (data.items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }

    const invoiceInput: InvoiceInput = {
      customerId: data.customerId ? BigInt(data.customerId) : undefined,
      invoiceDate: BigInt(Date.now() * 1000000), // Convert to nanoseconds
      items: data.items.map((item) => ({
        recipeId: BigInt(item.recipeId),
        quantity: BigInt(item.quantity),
        unitPrice: item.unitPrice,
      })),
      discount: discountAmount,
      paymentMode: data.paymentMode,
    };

    try {
      await createMutation.mutateAsync(invoiceInput);
      toast.success('Invoice created successfully! Inventory has been updated.');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create invoice';
      if (errorMessage.includes('insufficient') || errorMessage.includes('stock')) {
        toast.error('Insufficient inventory! Please check ingredient stock levels.');
      } else {
        toast.error(errorMessage);
      }
      console.error(error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer</Label>
          <div className="flex gap-2">
            <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerSearchOpen}
                  className="flex-1 justify-between"
                >
                  {watchedCustomerId
                    ? customers.find((c) => c.id.toString() === watchedCustomerId)?.name
                    : 'Select customer or walk-in'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search customer by name or mobile..." />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setValue('customerId', '');
                          setCustomerSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            watchedCustomerId === '' ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        Walk-in Customer
                      </CommandItem>
                      {customers.map((customer) => {
                        let contactInfo = { mobile: '', email: '' };
                        try {
                          contactInfo = JSON.parse(customer.contactInfo);
                        } catch (e) {
                          // Fallback for old format
                        }
                        return (
                          <CommandItem
                            key={customer.id.toString()}
                            value={`${customer.name} ${contactInfo.mobile}`}
                            onSelect={() => {
                              setValue('customerId', customer.id.toString());
                              setCustomerSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                watchedCustomerId === customer.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              {contactInfo.mobile && (
                                <span className="text-xs text-muted-foreground">
                                  {contactInfo.mobile}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowNewCustomerDialog(true)}
              title="Add new customer"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {customerSubscription && (
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">Active Subscription</Badge>
              <span className="text-sm text-muted-foreground">
                {customerSubscription.planType === 'weekly6days' ? 'Weekly' : 'Monthly'} -{' '}
                {getBowlSizeLabel(customerSubscription.bowlSize)}
              </span>
            </div>
          )}
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Popover open={recipeSearchOpen === -1} onOpenChange={(open) => setRecipeSearchOpen(open ? -1 : null)}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search recipes..."
                    value={recipeSearchQuery}
                    onValueChange={setRecipeSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No recipe found.</CommandEmpty>
                    <CommandGroup>
                      {filteredRecipes.map((recipe) => (
                        <CommandItem
                          key={recipe.id.toString()}
                          value={recipe.name}
                          onSelect={() => handleAddRecipe(recipe.id.toString())}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <span className="font-medium">{recipe.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({getBowlSizeLabel(recipe.bowlSize)})
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              ₹{getDefaultPrice(recipe.bowlSize)}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {fields.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg bg-muted/30">
                  <div className="col-span-5">
                    <div className="font-medium text-sm">{watchedItems[index]?.recipeName}</div>
                    <div className="text-xs text-muted-foreground">{watchedItems[index]?.bowlSize}</div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`items.${index}.quantity`} className="text-xs">
                      Qty
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity` as const, {
                        required: true,
                        min: 1,
                        valueAsNumber: true,
                      })}
                      className="h-8"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`items.${index}.unitPrice`} className="text-xs">
                      Price
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`items.${index}.unitPrice` as const, {
                        required: true,
                        min: 0,
                        valueAsNumber: true,
                      })}
                      className="h-8"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="h-8 flex items-center font-semibold text-sm">
                      ₹{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-end justify-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount, Tax, and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount</Label>
            <div className="flex gap-2">
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                {...register('discount', { valueAsNumber: true })}
                className="flex-1"
              />
              <Select
                value={watchedDiscountType}
                onValueChange={(value: 'fixed' | 'percentage') => setValue('discountType', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">₹</SelectItem>
                  <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxPercentage">Tax (%)</Label>
            <Input
              id="taxPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register('taxPercentage', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <RadioGroup
            value={watch('paymentMode')}
            onValueChange={(value) => setValue('paymentMode', value as PaymentMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PaymentMode.cash} id="cash" />
              <Label htmlFor="cash" className="font-normal cursor-pointer">
                Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PaymentMode.card} id="card" />
              <Label htmlFor="card" className="font-normal cursor-pointer">
                Card
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PaymentMode.upi} id="upi" />
              <Label htmlFor="upi" className="font-normal cursor-pointer">
                UPI
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes or instructions..."
            {...register('notes')}
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="border-t pt-4 space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Discount {watchedDiscountType === 'percentage' && `(${watchedDiscount}%)`}:
            </span>
            <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal after discount:</span>
            <span className="font-medium">₹{subtotalAfterDiscount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({watchedTaxPercentage}%):</span>
            <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total Amount:</span>
            <span className="text-green-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={createMutation.isPending || fields.length === 0}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Invoice'
            )}
          </Button>
        </div>
      </form>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCustomer(onSubmitNewCustomer)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...registerCustomer('name', { required: 'Name is required' })}
                placeholder="Enter customer name"
              />
              {customerErrors.name && (
                <p className="text-sm text-red-500">{customerErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mobile"
                {...registerCustomer('mobile', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit mobile number',
                  },
                })}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              {customerErrors.mobile && (
                <p className="text-sm text-red-500">{customerErrors.mobile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                {...registerCustomer('email')}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                {...registerCustomer('address')}
                placeholder="Enter customer address"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewCustomerDialog(false);
                  resetCustomerForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={addCustomerMutation.isPending}
              >
                {addCustomerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Customer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
