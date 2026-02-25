import React from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import MenuPage from './pages/MenuPage';
import SalesPage from './pages/SalesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CustomersPage from './pages/CustomersPage';
import PlansPage from './pages/PlansPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DashboardPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/subscriptions',
  component: SubscriptionsPage,
});

const customersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/customers',
  component: CustomersPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/inventory',
  component: InventoryPage,
});

const menuRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/menu',
  component: MenuPage,
});

const salesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/sales',
  component: SalesPage,
});

const plansRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/plans',
  component: PlansPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    subscriptionsRoute,
    customersRoute,
    inventoryRoute,
    menuRoute,
    salesRoute,
    plansRoute,
  ]),
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
