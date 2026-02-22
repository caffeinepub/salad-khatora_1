import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <img src="/assets/generated/logo-leaf.dim_128x128.png" alt="Salad Khatora" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Salad Khatora</CardTitle>
          <CardDescription>Business Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to manage your salad business inventory, sales, and subscriptions.
          </p>
          <Button
            onClick={login}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading ? 'Loading...' : 'Sign In with Internet Identity'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secure authentication using passkeys, Google, Microsoft, or Apple
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
