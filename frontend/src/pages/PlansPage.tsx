import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetPlans, useGetSubscriptions } from '../hooks/useQueries';
import PlanForm from '../components/PlanForm';
import PlanList from '../components/PlanList';
import type { LocalPlan } from '../hooks/useQueries';

export default function PlansPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LocalPlan | null>(null);
  const { data: plans = [], isLoading } = useGetPlans();
  const { data: subscriptions = [] } = useGetSubscriptions();

  const handleAdd = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEdit = (plan: LocalPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const enrollmentCounts = plans.map(plan => ({
    planId: plan.id,
    count: subscriptions.filter(s => s.planId === plan.id).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Add Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading plans...</div>
      ) : (
        <PlanList plans={plans} enrollmentCounts={enrollmentCounts} onEdit={handleEdit} />
      )}

      <Dialog open={showForm} onOpenChange={open => { if (!open) handleSuccess(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={editingPlan}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
