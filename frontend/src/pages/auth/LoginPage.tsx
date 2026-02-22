import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Log in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger text-center font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-danger">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              hasError={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="error-text text-sm font-medium text-danger mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password <span className="text-danger">*</span></Label>
            </div>
            <Input
              id="password"
              type="password"
              hasError={!!errors.password}
              {...register('password')}
            />
            {errors.password && <p className="error-text text-sm font-medium text-danger mt-1">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
