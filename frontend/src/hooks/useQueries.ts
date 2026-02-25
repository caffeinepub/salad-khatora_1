import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Ingredient, IngredientInput, Customer, CustomerInput, UserProfile } from '../backend';

// ─── Ingredients ────────────────────────────────────────────────────────────

export function useGetIngredients() {
  const { actor, isFetching } = useActor();
  return useQuery<Ingredient[]>({
    queryKey: ['ingredients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIngredients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: IngredientInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createIngredient(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

export function useUpdateIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: IngredientInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateIngredient(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

export function useDeleteIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteIngredient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

// Backward-compat alias
export const useIngredients = useGetIngredients;

// ─── Customers ──────────────────────────────────────────────────────────────

export function useGetCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomer(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: CustomerInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Backward-compat alias
export const useCustomers = useGetCustomers;

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Recipes (local state only - backend not yet implemented) ────────────────

export type LocalRecipe = {
  id: number;
  name: string;
  bowlSize: 'small' | 'medium' | 'large';
  ingredients: { ingredientId: number; quantity: { value: number; unit: 'grams' | 'kilograms' } }[];
};

let localRecipes: LocalRecipe[] = [];
let localRecipeNextId = 1;

export function useGetRecipes() {
  return useQuery<LocalRecipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => [...localRecipes],
    staleTime: 0,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<LocalRecipe, 'id'>) => {
      const recipe: LocalRecipe = { ...input, id: localRecipeNextId++ };
      localRecipes = [...localRecipes, recipe];
      return recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Omit<LocalRecipe, 'id'> }) => {
      localRecipes = localRecipes.map(r => r.id === id ? { ...input, id } : r);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      localRecipes = localRecipes.filter(r => r.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

// Backward-compat alias
export const useRecipes = useGetRecipes;

// ─── Plans (local state only - backend not yet implemented) ──────────────────

export type LocalPlan = {
  id: number;
  name: string;
  price: number;
  bowlSize: string;
  bowlPrice: number;
  createdAt: number;
};

let localPlans: LocalPlan[] = [];
let localPlanNextId = 1;

export function useGetPlans() {
  return useQuery<LocalPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => [...localPlans],
    staleTime: 0,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<LocalPlan, 'id' | 'createdAt'>) => {
      const plan: LocalPlan = { ...input, id: localPlanNextId++, createdAt: Date.now() };
      localPlans = [...localPlans, plan];
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Omit<LocalPlan, 'id' | 'createdAt'> }) => {
      localPlans = localPlans.map(p => p.id === id ? { ...input, id, createdAt: p.createdAt } : p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      localPlans = localPlans.filter(p => p.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// Backward-compat alias
export const usePlans = useGetPlans;

// ─── Subscriptions (local state only - backend not yet implemented) ──────────

export type LocalDayRecord = {
  date: string;
  status: 'pending' | 'delivered' | 'missed';
};

export type LocalSubscription = {
  id: number;
  customerId: number;
  planId: number;
  startDate: string;
  endDate: string;
  bowlSize: 'small' | 'medium' | 'large';
  price: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled';
  isActive: boolean;
  createdAt: number;
  dayRecords: LocalDayRecord[];
};

let localSubscriptions: LocalSubscription[] = [];
let localSubscriptionNextId = 1;

export function useGetSubscriptions() {
  return useQuery<LocalSubscription[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => [...localSubscriptions],
    staleTime: 0,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<LocalSubscription, 'id' | 'createdAt' | 'dayRecords' | 'isActive' | 'endDate'> & { endDate?: string }) => {
      const sub: LocalSubscription = {
        ...input,
        id: localSubscriptionNextId++,
        endDate: input.endDate ?? '',
        isActive: true,
        createdAt: Date.now(),
        dayRecords: [],
      };
      localSubscriptions = [...localSubscriptions, sub];
      return sub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Partial<LocalSubscription> }) => {
      localSubscriptions = localSubscriptions.map(s => s.id === id ? { ...s, ...input } : s);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      localSubscriptions = localSubscriptions.filter(s => s.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useUpdateDayRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, date, status }: { subscriptionId: number; date: string; status: 'pending' | 'delivered' | 'missed' }) => {
      localSubscriptions = localSubscriptions.map(s => {
        if (s.id !== subscriptionId) return s;
        const existing = s.dayRecords.find(d => d.date === date);
        if (existing) {
          return { ...s, dayRecords: s.dayRecords.map(d => d.date === date ? { ...d, status } : d) };
        } else {
          return { ...s, dayRecords: [...s.dayRecords, { date, status }] };
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// Backward-compat aliases
export const useSubscriptions = useGetSubscriptions;
export const useGetSubscriptionsAdvanced = useGetSubscriptions;

// ─── Invoices (local state only - backend not yet implemented) ───────────────

export type LocalInvoiceItem = {
  recipeId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type LocalInvoice = {
  id: number;
  customerId?: number;
  invoiceDate: number;
  items: LocalInvoiceItem[];
  discount: number;
  paymentMode: 'cash' | 'card' | 'upi';
  totalAmount: number;
};

let localInvoices: LocalInvoice[] = [];
let localInvoiceNextId = 1;

export function useGetInvoices() {
  return useQuery<LocalInvoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => [...localInvoices],
    staleTime: 0,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<LocalInvoice, 'id'>) => {
      const invoice: LocalInvoice = { ...input, id: localInvoiceNextId++ };
      localInvoices = [...localInvoices, invoice];
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      localInvoices = localInvoices.filter(i => i.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Backward-compat alias
export const useInvoices = useGetInvoices;

// ─── Inventory / Low Stock ───────────────────────────────────────────────────

export function useGetInventoryState() {
  const { data: ingredients = [], isLoading, error } = useGetIngredients();
  const totalValue = ingredients.reduce((sum, ing) => sum + ing.costPricePerUnit * ing.quantity.value, 0);
  return {
    data: { ingredients, totalValue },
    isLoading,
    error,
  };
}

export function useGetLowStockIngredients() {
  const { data: ingredients = [] } = useGetIngredients();
  const lowStock = ingredients.filter(ing => {
    const qty = ing.quantity.unit === 'kilograms' ? ing.quantity.value * 1000 : ing.quantity.value;
    const threshold = ing.lowStockThreshold.unit === 'kilograms' ? ing.lowStockThreshold.value * 1000 : ing.lowStockThreshold.value;
    return qty <= threshold;
  });
  return { data: lowStock };
}

export function useGetExpiringSubscriptions() {
  const { data: subscriptions = [] } = useGetSubscriptions();
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiring = subscriptions.filter(sub => {
    if (!sub.endDate) return false;
    const end = new Date(sub.endDate);
    return end >= today && end <= in7Days && sub.isActive;
  });
  return { data: expiring };
}
