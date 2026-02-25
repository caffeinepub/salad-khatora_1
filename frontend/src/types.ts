import type { Ingredient as BackendIngredient, Customer as BackendCustomer } from './backend';

// Re-export backend types directly
export type Ingredient = BackendIngredient;
export type Customer = BackendCustomer;

// Local types for features managed in frontend state
export type { LocalRecipe as Recipe } from './hooks/useQueries';
export type { LocalPlan as Plan } from './hooks/useQueries';
export type { LocalSubscription as SubscriptionAdvanced } from './hooks/useQueries';
export type { LocalInvoice as SalesInvoice } from './hooks/useQueries';
export type { LocalDayRecord as DayRecord } from './hooks/useQueries';
export type { LocalInvoiceItem as InvoiceItem } from './hooks/useQueries';

export type BowlSize = 'small' | 'medium' | 'large';
export type PaymentMode = 'cash' | 'card' | 'upi';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

// Stub types for components that reference old backend types
export type InventoryAdjustment = {
  ingredientId: bigint;
  quantityChanged: { value: number; unit: string };
  timestamp: bigint;
  reason: { __kind__: string };
  relatedInvoiceId?: bigint | null;
};

export type InventoryState = {
  ingredients: Ingredient[];
  totalValue: number;
};
