'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/features/auth/hooks/api/mutation/use-login';
import { loginSchema } from '@/features/auth/validations/login-schema';

const GridBackground = () => (
  <div
    aria-hidden
    className='pointer-events-none absolute inset-0 overflow-hidden'
    style={{
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '64px 64px',
    }}
  />
);

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    login(result.data);
  }

  return (
    <section className='relative overflow-hidden'>
      <GridBackground />

      <div className='relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32'>
        {/* Left — copy */}
        <div>
          <div
            className='mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium'
            style={{
              backgroundColor: 'rgba(0,0,0,0.06)',
              color: '#444',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span
              className='inline-block size-1.5 rounded-full'
              style={{ backgroundColor: '#22C55E' }}
            />
            Seller &amp; Admin Portal
          </div>

          <h1
            className='mb-5 font-black leading-none'
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(48px, 7vw, 96px)',
              letterSpacing: '-0.04em',
              lineHeight: 0.92,
            }}
          >
            Welcome
            <br />
            <span style={{ color: '#9CA3AF' }}>back.</span>
          </h1>

          <p className='max-w-sm text-base leading-relaxed text-muted-foreground'>
            Sign in to manage your store or platform. Your role is detected
            automatically.
          </p>
        </div>

        {/* Right — form */}
        <div>
          <Card className='max-w-md'>
            <CardHeader>
              <CardTitle className='text-lg'>Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to continue.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup>
                  <Field data-invalid={!!errors.email || undefined}>
                    <FieldLabel htmlFor='email'>Email</FieldLabel>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      required
                      autoComplete='email'
                      placeholder='you@example.com'
                      aria-invalid={!!errors.email || undefined}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </Field>

                  <Field data-invalid={!!errors.password || undefined}>
                    <div className='flex items-center justify-between'>
                      <FieldLabel htmlFor='password'>Password</FieldLabel>
                      <Link
                        href='/forgot-password'
                        className='text-xs text-muted-foreground hover:text-foreground'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      required
                      autoComplete='current-password'
                      placeholder='••••••••'
                      aria-invalid={!!errors.password || undefined}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>
                </FieldGroup>

                <Button
                  type='submit'
                  className='mt-5 w-full'
                  size='lg'
                  disabled={isPending}
                >
                  {isPending ? 'Signing in…' : 'Sign in'}
                </Button>

                <FieldSeparator className='mt-5'>or</FieldSeparator>

                <Button
                  type='button'
                  variant='outline'
                  className='mt-5 w-full'
                  size='lg'
                  disabled={isPending}
                >
                  Continue with Google
                </Button>
              </form>
            </CardContent>

            <CardFooter className='justify-center'>
              <p className='text-sm text-muted-foreground'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/register'
                  className='font-medium text-foreground hover:underline'
                >
                  Create seller account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
