import { useMemo } from 'react';
import { useGetInvoices, useGetRecipes } from './useQueries';
import type { LocalInvoice } from './useQueries';

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface TopSellingItem {
  recipeId: number;
  recipeName: string;
  quantity: number;
  revenue: number;
}

interface PaymentModeEntry {
  mode: string;
  count: number;
  amount: number;
  percentage: number;
}

interface SalesAnalytics {
  totalRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalInvoices: number;
  topSellingItems: TopSellingItem[];
  paymentModeDistribution: PaymentModeEntry[];
  subscriptionRevenue: number;
  regularRevenue: number;
  totalCustomers: number;
  repeatCustomers: number;
  revenueByDay: DailyRevenue[];
  dailyTrend: DailyRevenue[];
  monthlyTrend: DailyRevenue[];
}

export function useSalesAnalytics(): SalesAnalytics {
  const { data: invoices = [] } = useGetInvoices();
  const { data: recipes = [] } = useGetRecipes();

  return useMemo(() => {
    const empty: SalesAnalytics = {
      totalRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      averageOrderValue: 0,
      totalInvoices: 0,
      topSellingItems: [],
      paymentModeDistribution: [],
      subscriptionRevenue: 0,
      regularRevenue: 0,
      totalCustomers: 0,
      repeatCustomers: 0,
      revenueByDay: [],
      dailyTrend: [],
      monthlyTrend: [],
    };

    if (!invoices || invoices.length === 0) return empty;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let dailyRevenue = 0;
    let subscriptionRevenue = 0;
    let regularRevenue = 0;

    const dailyMap = new Map<string, number>();
    const recipeMap = new Map<string, { recipeId: number; quantity: number; revenue: number }>();
    const paymentMap = new Map<string, { mode: string; count: number; amount: number }>();
    const customerOrderCount = new Map<string, number>();

    for (const invoice of invoices as LocalInvoice[]) {
      const invoiceDateMs = invoice.invoiceDate;
      const invoiceDate = new Date(invoiceDateMs);
      const dateStr = invoiceDate.toISOString().split('T')[0];
      const amount = invoice.totalAmount;

      totalRevenue += amount;

      if (invoiceDateMs >= monthStart) {
        monthlyRevenue += amount;
      }

      if (dateStr === todayStr) {
        dailyRevenue += amount;
      }

      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + amount);

      if (invoice.customerId !== undefined && invoice.customerId !== null) {
        subscriptionRevenue += amount;
        const key = String(invoice.customerId);
        customerOrderCount.set(key, (customerOrderCount.get(key) || 0) + 1);
      } else {
        regularRevenue += amount;
      }

      const modeStr = invoice.paymentMode;
      const existing = paymentMap.get(modeStr) || { mode: modeStr, count: 0, amount: 0 };
      paymentMap.set(modeStr, { mode: modeStr, count: existing.count + 1, amount: existing.amount + amount });

      for (const item of invoice.items) {
        const key = item.recipeId.toString();
        const existingItem = recipeMap.get(key) || { recipeId: item.recipeId, quantity: 0, revenue: 0 };
        recipeMap.set(key, {
          recipeId: item.recipeId,
          quantity: existingItem.quantity + item.quantity,
          revenue: existingItem.revenue + item.totalPrice,
        });
      }
    }

    // Build last 30 days revenue array
    const revenueByDay: DailyRevenue[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      revenueByDay.push({ date: dateStr, revenue: dailyMap.get(dateStr) || 0 });
    }

    // 7-day trend
    const dailyTrend: DailyRevenue[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrend.push({ date: dateStr, revenue: dailyMap.get(dateStr) || 0 });
    }

    const topSellingItems: TopSellingItem[] = Array.from(recipeMap.values())
      .map((item) => {
        const recipe = recipes.find((r) => r.id === item.recipeId);
        return {
          ...item,
          recipeName: recipe?.name || `Recipe #${item.recipeId}`,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalPayments = Array.from(paymentMap.values()).reduce((s, e) => s + e.count, 0);
    const paymentModeDistribution: PaymentModeEntry[] = Array.from(paymentMap.values()).map((e) => ({
      ...e,
      percentage: totalPayments > 0 ? (e.count / totalPayments) * 100 : 0,
    }));

    const totalCustomers = customerOrderCount.size;
    const repeatCustomers = Array.from(customerOrderCount.values()).filter((c) => c > 1).length;

    return {
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
      averageOrderValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
      totalInvoices: invoices.length,
      topSellingItems,
      paymentModeDistribution,
      subscriptionRevenue,
      regularRevenue,
      totalCustomers,
      repeatCustomers,
      revenueByDay,
      dailyTrend,
      monthlyTrend: revenueByDay,
    };
  }, [invoices, recipes]);
}
