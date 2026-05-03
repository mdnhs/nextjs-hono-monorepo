'use client';

import { useState } from 'react';
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
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useStorefrontRegister } from '@/features/auth/hooks/api/mutation/use-storefront-register';
import { registerSchema } from '@/features/auth/validations/register-schema';
import { useStore } from '@/hooks/api/query/use-stores';

export default function BuyerRegisterPage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const router = useRouter();
  
  const { data: storeResponse } = useStore(storeSlug, true);
  const store = storeResponse?.data;

  const { mutate: register, isPending } = useStorefrontRegister();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    register(result.data, {
      onSuccess: (response) => {
        if (!response.error) {
          router.push('/');
        }
      }
    });
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-muted/30 px-6 py-12'>
      <div className='w-full max-w-[440px] space-y-8'>
        <div className='flex flex-col items-center text-center'>
          <Link
            href='/'
            className='mb-6 flex items-center gap-2 transition-opacity hover:opacity-80'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <span className='text-lg font-bold'>
                {store?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <span className='text-xl font-bold tracking-tight'>{store?.name || 'Store'}</span>
          </Link>
          <h2 className='text-2xl font-bold tracking-tight'>Create your account</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Join {store?.name || 'our store'} to start shopping.
          </p>
        </div>

        <div className='rounded-xl border bg-card p-8 shadow-sm'>
          <form onSubmit={handleSubmit} noValidate className='space-y-6'>
            <FieldGroup className='space-y-4'>
              <Field data-invalid={!!errors.name || undefined}>
                <FieldLabel htmlFor='name' className='text-sm font-medium'>
                  Full Name
                </FieldLabel>
                <Input
                  id='name'
                  name='name'
                  placeholder='John Doe'
                  required
                  aria-invalid={!!errors.name || undefined}
                  className='h-11'
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor='email' className='text-sm font-medium'>
                  Email address
                </FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='you@example.com'
                  aria-invalid={!!errors.email || undefined}
                  className='h-11'
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password || undefined}>
                <FieldLabel htmlFor='password' className='text-sm font-medium'>
                  Password
                </FieldLabel>
                <div className='relative'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete='new-password'
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
              {isPending ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className='mt-8 text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='font-semibold text-primary hover:underline'
            >
              Sign in
            </Link>
          </div>
        </div>

        <Link
          href='/'
          className='flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to store
        </Link>
      </div>
    </div>
  );
}
