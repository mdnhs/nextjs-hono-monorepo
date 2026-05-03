'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useLogin } from '@/features/auth/hooks/api/mutation/use-login';
import { loginSchema } from '@/features/auth/validations/login-schema';
import { useStore } from '@/hooks/api/query/use-stores';
import { authService } from '@/features/auth/services/service';

export default function StoreAdminLoginPage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const router = useRouter();
  
  const { data: storeResponse, isLoading: isLoadingStore } = useStore(storeSlug, true);
  const store = storeResponse?.data;

  const { mutate: login, isPending } = useLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await authService.getProfile();
        if (!response.error && response.data) {
          const role = response.data.role;
          // Only redirect if they have admin privileges
          if (role === 'STORE_ADMIN' || role === 'SELLER' || role === 'PLATFORM_ADMIN') {
            if (store) {
              redirectToDashboard(store.id);
            }
          }
        }
      } catch (err) {
        // Not logged in or error, stay on login page
      } finally {
        setIsCheckingAuth(false);
      }
    }
    
    if (store) {
      checkAuth();
    }
  }, [store]);

  function redirectToDashboard(storeId: string) {
    const host = window.location.hostname;
    const parts = host.split('.');
    const isLocalhost = host.endsWith('localhost');
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Determine base domain (remove one level of subdomain)
    let baseDomain = host;
    if (isLocalhost) {
      if (parts.length > 1) baseDomain = 'localhost';
    } else if (parts.length > 2) {
      baseDomain = parts.slice(-2).join('.');
    }
    
    if (host !== baseDomain) {
      // Switch from subdomain to base domain
      window.location.href = `${window.location.protocol}//${baseDomain}${port}/store-admin/${storeId}`;
    } else {
      router.push(`/store-admin/${storeId}`);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    login(result.data, {
      onSuccess: (response) => {
        if (!response.error && response.data) {
          const role = response.data.user.role;
          if (role === 'STORE_ADMIN' || role === 'SELLER' || role === 'PLATFORM_ADMIN') {
            if (store) {
               redirectToDashboard(store.id);
            } else {
               router.push(authService.getRedirectPath(role));
            }
          } else {
            // Logged in but not an admin, redirect to their default path
            router.push(authService.getRedirectPath(role));
          }
        }
      }
    });
  }

  if (isLoadingStore || (isCheckingAuth && store)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12'>
      <div className='w-full max-w-[400px] space-y-8'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className='text-2xl font-bold tracking-tight'>Store Administration</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Sign in to manage <strong>{store?.name || storeSlug}</strong>
          </p>
        </div>

        <div className='rounded-xl border bg-card p-8 shadow-sm'>
          <form onSubmit={handleSubmit} noValidate className='space-y-6'>
            <FieldGroup className='space-y-4'>
              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor='email' className='text-sm font-medium'>
                  Admin Email
                </FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='admin@example.com'
                  aria-invalid={!!errors.email || undefined}
                  className='h-11'
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password || undefined}>
                <div className='flex items-center justify-between'>
                  <FieldLabel htmlFor='password' className='text-sm font-medium'>
                    Password
                  </FieldLabel>
                </div>
                <div className='relative'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete='current-password'
                    placeholder='••••••••'
                    aria-invalid={!!errors.password || undefined}
                    className='h-11 pr-10'
                  />
                  <button
                    type='button'
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                <FieldError>{errors.password}</FieldError>
              </Field>
            </FieldGroup>

            <Button
              type='submit'
              className='h-11 w-full text-base font-semibold'
              disabled={isPending}
            >
              {isPending ? 'Authenticating…' : 'Sign in to Admin'}
            </Button>
          </form>
        </div>

        <Link
          href='/'
          className='flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to storefront
        </Link>
      </div>
    </div>
  );
}
