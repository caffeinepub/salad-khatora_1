import React, { useState } from 'react';
import { Link, useRouter, Outlet } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  CalendarCheck,
  Menu,
  X,
  ClipboardList,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationPanel } from './NotificationPanel';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subscriptions', label: 'Subscriptions', icon: CalendarCheck },
  { path: '/plans', label: 'Plans', icon: ClipboardList },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/generated/salad-khatora-logo.dim_200x60.png"
                alt="Salad Khatora"
                className="h-8 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationPanel />
            {identity ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4"
            onClick={e => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 px-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Salad Khatora. Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
