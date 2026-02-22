import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, UserCheck } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerList } from '../components/CustomerList';
import { useCustomers } from '../hooks/useQueries';
import type { Customer } from '../backend';

export function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { data: customers = [], isLoading } = useCustomers();

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCustomer(null);
  };

  const activeCustomers = customers.filter((c) => c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Customer Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers.length}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading customers...</p>
          </CardContent>
        </Card>
      ) : (
        <CustomerList customers={customers} onEdit={handleEdit} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm customer={selectedCustomer} onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
