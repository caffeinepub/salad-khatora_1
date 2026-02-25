import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useGetLowStockIngredients, useGetExpiringSubscriptions, useGetCustomers } from '../hooks/useQueries';

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { data: lowStock = [] } = useGetLowStockIngredients();
  const { data: expiring = [] } = useGetExpiringSubscriptions();
  const { data: customers = [] } = useGetCustomers();

  const totalNotifications = lowStock.length + expiring.length;

  const getCustomerName = (customerId: number) => {
    const c = customers.find(c => Number(c.id) === customerId);
    return c?.name ?? `Customer #${customerId}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {totalNotifications > 0 && (
            <p className="text-xs text-muted-foreground">{totalNotifications} alert{totalNotifications !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {totalNotifications === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map(ing => (
                <div key={String(ing.id)} className="p-3 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Low Stock: {ing.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ing.quantity.value.toFixed(2)} {ing.quantity.unit} remaining
                    </p>
                  </div>
                </div>
              ))}
              {expiring.map(sub => (
                <div key={sub.id} className="p-3 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Expiring: {getCustomerName(sub.customerId)}</p>
                    <p className="text-xs text-muted-foreground">
                      Ends {sub.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPanel;
