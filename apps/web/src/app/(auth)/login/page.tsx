'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useLogin } from '@/features/auth/hooks/api/mutation/use-login';
import { loginSchema } from '@/features/auth/validations/login-schema';

const FEATURES = [
  'Role-based portals — Admin, Seller, Buyer',
  'Real-time orders and inventory management',
  'Multi-store support with custom domains',
];

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

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
    <div className='flex min-h-screen'>
      {/* ── Left panel ── */}
      <div
        className='relative hidden lg:flex lg:w-[44%] flex-col justify-between overflow-hidden p-12'
        style={{
          backgroundColor: '#0D0D0D',
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      >
        {/* Vignette overlay */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 65%)',
          }}
        />

        {/* Logo */}
        <Link
          href='/'
          className='relative z-10 flex items-center gap-2.5 text-white/70 transition-colors hover:text-white'
        >
          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-white'>
            <span
              className='text-[11px] font-black tracking-tighter text-[#0D0D0D]'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              SH
            </span>
          </div>
          <span
            className='text-sm font-semibold tracking-tight'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Shoply
          </span>
        </Link>

        {/* Copy */}
        <div className='relative z-10'>
          <h1
            className='mb-5 font-black leading-[0.88] text-white'
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(54px, 4.8vw, 82px)',
              letterSpacing: '-0.045em',
            }}
          >
            Welcome
            <br />
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>back.</span>
          </h1>
          <p className='mb-10 max-w-[260px] text-sm leading-relaxed text-white/45'>
            Sign in to manage your store or platform. Your role is detected automatically.
          </p>

          <ul className='space-y-4'>
            {FEATURES.map((f) => (
              <li key={f} className='flex items-start gap-3'>
                <span className='mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15'>
                  <Check className='h-2.5 w-2.5 text-white/40' strokeWidth={2.5} />
                </span>
                <span className='text-[13px] leading-snug text-white/45'>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className='relative z-10 text-[11px] text-white/18'>
          © {new Date().getFullYear()} Shoply Inc.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className='flex flex-1 flex-col bg-background'>
        {/* Top bar */}
        <div className='flex items-center justify-between px-6 py-5 lg:px-12'>
          {/* Mobile logo */}
          <Link
            href='/'
            className='flex items-center gap-2 text-foreground lg:hidden'
          >
            <div className='flex h-6 w-6 items-center justify-center rounded bg-foreground'>
              <span
                className='text-[10px] font-black text-background'
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                SH
              </span>
            </div>
            <span
              className='text-sm font-semibold'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Shoply
            </span>
          </Link>
          <div className='hidden lg:block' />

          <Link
            href='/'
            className='flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='h-3 w-3' />
            Back to home
          </Link>
        </div>

        {/* Form */}
        <div className='flex flex-1 items-center justify-center px-6 pb-16 pt-4 lg:px-16'>
          <div className='w-full max-w-[380px]'>
            {/* Heading */}
            <div className='mb-8'>
              <h2
                className='mb-1.5 text-[22px] font-bold tracking-tight'
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Sign in to your account
              </h2>
              <p className='text-sm text-muted-foreground'>
                Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className='space-y-1'>
              <FieldGroup>
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
                    className='h-10'
                  />
                  <FieldError>{errors.email}</FieldError>
                </Field>

                <Field data-invalid={!!errors.password || undefined}>
                  <div className='flex items-center justify-between'>
                    <FieldLabel htmlFor='password' className='text-sm font-medium'>
                      Password
                    </FieldLabel>
                    <Link
                      href='/forgot-password'
                      tabIndex={-1}
                      className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                    >
                      Forgot password?
                    </Link>
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
                      className='h-10 pr-10'
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

              <div className='pt-3'>
                <Button
                  type='submit'
                  className='h-10 w-full text-sm font-semibold'
                  disabled={isPending}
                >
                  {isPending ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>

            <p className='mt-7 text-center text-[13px] text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link
                href='/register'
                className='font-semibold text-foreground underline underline-offset-4 transition-opacity hover:opacity-70'
              >
                Create seller account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
