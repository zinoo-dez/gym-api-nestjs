import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      const payload = { ...data, role: 'MEMBER' };
      const response = await authService.register(payload);
      setAuth(response.user, response.accessToken);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details below to create your member account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger text-center font-medium">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-danger">*</span></Label>
              <Input
                id="firstName"
                hasError={!!errors.firstName}
                {...register('firstName')}
              />
              {errors.firstName && <p className="error-text text-sm font-medium text-danger mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-danger">*</span></Label>
              <Input
                id="lastName"
                hasError={!!errors.lastName}
                {...register('lastName')}
              />
              {errors.lastName && <p className="error-text text-sm font-medium text-danger mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
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
            <Label htmlFor="password">Password <span className="text-danger">*</span></Label>
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
