import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Menu, Bell, LogOut, Leaf, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationPanel } from './NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';

export function Layout() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Leaf className="mx-auto h-12 w-12 animate-pulse text-green-600" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/menu', label: 'Menu' },
    { path: '/sales', label: 'Sales' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/customers', label: 'Customers' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-2 px-2">
                    <img src="/assets/generated/logo-leaf.dim_128x128.png" alt="Salad Khatora" className="h-8 w-8" />
                    <span className="text-lg font-bold text-green-600">Salad Khatora</span>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? 'default' : 'ghost'}
                        className={location.pathname === item.path ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => {
                          navigate({ to: item.path });
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <img src="/assets/generated/logo-leaf.dim_128x128.png" alt="Salad Khatora" className="h-8 w-8" />
              <span className="text-xl font-bold text-green-600">Salad Khatora</span>
            </div>
          </div>

          <nav className="hidden lg:flex lg:gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className={location.pathname === item.path ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => navigate({ to: item.path })}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationPanel>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </NotificationPanel>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Salad Khatora. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'salad-khatora'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
