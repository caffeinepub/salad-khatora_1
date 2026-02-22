import { useMemo } from 'react';
import { useInvoices, useCustomers, useSubscriptions, useRecipes } from './useQueries';
import type { SalesInvoice } from '../backend';

interface SalesAnalytics {
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  dailyTrend: { date: string; revenue: number }[];
  monthlyTrend: { date: string; revenue: number }[];
  topSellingItems: { recipeId: bigint; recipeName: string; quantity: number; revenue: number }[];
  totalCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
  paymentModeDistribution: { mode: string; count: number; percentage: number }[];
  subscriptionRevenue: number;
  regularRevenue: number;
}

export function useSalesAnalytics(): SalesAnalytics {
  const { data: invoices = [] } = useInvoices();
  const { data: customers = [] } = useCustomers();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: recipes = [] } = useRecipes();

  return useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = todayStart - 29 * 24 * 60 * 60 * 1000;

    // Calculate daily and monthly revenue
    const dailyRevenue = invoices
      .filter((inv) => Number(inv.invoiceDate) / 1000000 >= todayStart)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const monthlyRevenue = invoices
      .filter((inv) => Number(inv.invoiceDate) / 1000000 >= monthStart)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Calculate 7-day trend
    const dailyTrend: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const revenue = invoices
        .filter((inv) => {
          const invTime = Number(inv.invoiceDate) / 1000000;
          return invTime >= dayStart && invTime < dayEnd;
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      dailyTrend.push({ date: dateStr, revenue });
    }

    // Calculate 30-day trend
    const monthlyTrend: { date: string; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(todayStart - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const revenue = invoices
        .filter((inv) => {
          const invTime = Number(inv.invoiceDate) / 1000000;
          return invTime >= dayStart && invTime < dayEnd;
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      monthlyTrend.push({ date: dateStr, revenue });
    }

    // Calculate top-selling items
    const recipeStats = new Map<string, { quantity: number; revenue: number }>();
    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const key = item.recipeId.toString();
        const existing = recipeStats.get(key) || { quantity: 0, revenue: 0 };
        recipeStats.set(key, {
          quantity: existing.quantity + Number(item.quantity),
          revenue: existing.revenue + item.totalPrice,
        });
      });
    });

    const topSellingItems = Array.from(recipeStats.entries())
      .map(([recipeIdStr, stats]) => {
        const recipeId = BigInt(recipeIdStr);
        const recipe = recipes.find((r) => r.id === recipeId);
        return {
          recipeId,
          recipeName: recipe?.name || 'Unknown Recipe',
          quantity: stats.quantity,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate customer insights
    const customerOrderCounts = new Map<string, number>();
    invoices.forEach((invoice) => {
      if (invoice.customerId) {
        const key = invoice.customerId.toString();
        customerOrderCounts.set(key, (customerOrderCounts.get(key) || 0) + 1);
      }
    });

    const totalCustomers = customers.length;
    const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
    const averageOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    // Calculate payment mode distribution
    const paymentModeCounts = new Map<string, number>();
    invoices.forEach((invoice) => {
      const mode = invoice.paymentMode;
      paymentModeCounts.set(mode, (paymentModeCounts.get(mode) || 0) + 1);
    });

    const totalInvoices = invoices.length;
    const paymentModeDistribution = Array.from(paymentModeCounts.entries()).map(([mode, count]) => ({
      mode: mode.charAt(0).toUpperCase() + mode.slice(1),
      count,
      percentage: totalInvoices > 0 ? (count / totalInvoices) * 100 : 0,
    }));

    // Calculate subscription vs regular revenue
    const activeSubscriptionCustomerIds = new Set(
      subscriptions.filter((sub) => sub.isActive).map((sub) => sub.customerId.toString())
    );

    let subscriptionRevenue = 0;
    let regularRevenue = 0;

    invoices.forEach((invoice) => {
      if (invoice.customerId && activeSubscriptionCustomerIds.has(invoice.customerId.toString())) {
        subscriptionRevenue += invoice.totalAmount;
      } else {
        regularRevenue += invoice.totalAmount;
      }
    });

    return {
      dailyRevenue,
      monthlyRevenue,
      totalRevenue,
      dailyTrend,
      monthlyTrend,
      topSellingItems,
      totalCustomers,
      repeatCustomers,
      averageOrderValue,
      paymentModeDistribution,
      subscriptionRevenue,
      regularRevenue,
    };
  }, [invoices, customers, subscriptions, recipes]);
}
