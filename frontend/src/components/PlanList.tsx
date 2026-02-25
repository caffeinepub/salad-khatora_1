import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Users } from 'lucide-react';
import { useDeletePlan } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { LocalPlan } from '../hooks/useQueries';

interface EnrollmentCount {
  planId: number;
  count: number;
}

interface Props {
  plans: LocalPlan[];
  enrollmentCounts: EnrollmentCount[];
  onEdit: (plan: LocalPlan) => void;
}

export default function PlanList({ plans, enrollmentCounts, onEdit }: Props) {
  const deletePlan = useDeletePlan();

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await deletePlan.mutateAsync(id);
      toast.success('Plan deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete plan');
    }
  };

  const getEnrollmentCount = (planId: number) => {
    return enrollmentCounts.find(e => e.planId === planId)?.count ?? 0;
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No plans yet. Create your first subscription plan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map(plan => {
        const count = getEnrollmentCount(plan.id);
        return (
          <Card key={plan.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">₹{plan.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletePlan.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bowl Size</span>
                  <Badge variant="outline">{plan.bowlSize}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bowl Price</span>
                  <span className="font-medium">₹{plan.bowlPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled</span>
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-muted-foreground" />
                    <span className="font-medium">{count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
