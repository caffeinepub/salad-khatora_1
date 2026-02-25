import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useUpdateDayRecord } from '../hooks/useQueries';
import type { LocalSubscription } from '../hooks/useQueries';
import { calculateEndDate, generateDeliveryDays } from '../utils/dateCalculations';
import { toast } from 'sonner';

interface Props {
  subscription: LocalSubscription;
}

export default function DeliveryDayList({ subscription }: Props) {
  const [expanded, setExpanded] = useState(false);
  const updateDayRecord = useUpdateDayRecord();

  // Generate delivery days using start date and computed end date
  const endDate = calculateEndDate(subscription.startDate, 24);
  const deliveryDays = generateDeliveryDays(subscription.startDate, endDate);

  const getStatus = (date: string): 'pending' | 'delivered' | 'missed' => {
    const record = subscription.dayRecords.find(d => d.date === date);
    return record?.status ?? 'pending';
  };

  const handleToggle = async (date: string) => {
    const current = getStatus(date);
    const next: 'pending' | 'delivered' | 'missed' =
      current === 'pending' ? 'delivered' : current === 'delivered' ? 'missed' : 'pending';
    try {
      await updateDayRecord.mutateAsync({ subscriptionId: subscription.id, date, status: next });
    } catch {
      toast.error('Failed to update delivery status');
    }
  };

  const delivered = deliveryDays.filter(d => getStatus(d) === 'delivered').length;
  const missed = deliveryDays.filter(d => getStatus(d) === 'missed').length;
  const pending = deliveryDays.length - delivered - missed;

  const statusIcon = (status: 'pending' | 'delivered' | 'missed') => {
    if (status === 'delivered') return <CheckCircle2 size={14} className="text-primary" />;
    if (status === 'missed') return <XCircle size={14} className="text-destructive" />;
    return <Clock size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium">Delivery Days ({deliveryDays.length})</span>
        <div className="flex items-center gap-3">
          <span className="text-primary text-xs">{delivered} delivered</span>
          <span className="text-destructive text-xs">{missed} missed</span>
          <span className="text-muted-foreground text-xs">{pending} pending</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="p-2 grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          {deliveryDays.map(date => {
            const status = getStatus(date);
            return (
              <button
                key={date}
                type="button"
                onClick={() => handleToggle(date)}
                className={`flex flex-col items-center p-1 rounded text-xs transition-colors hover:bg-muted ${
                  status === 'delivered' ? 'bg-primary/10' :
                  status === 'missed' ? 'bg-destructive/10' : ''
                }`}
                title={`${date} — ${status}`}
              >
                {statusIcon(status)}
                <span className="mt-0.5 text-muted-foreground">
                  {date.slice(5)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
