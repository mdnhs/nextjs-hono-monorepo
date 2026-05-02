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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/features/auth/hooks/api/mutation/use-register';
import { registerSchema } from '@/features/auth/validations/register-schema';

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

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsChecked, setTermsChecked] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value;

    const values = {
      name: get('name'),
      email: get('email'),
      password: get('password'),
      confirmPassword: get('confirmPassword'),
      terms: termsChecked,
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
    register({
      name: result.data.name,
      email: result.data.email,
      password: result.data.password,
    });
  }

  return (
    <section className='relative overflow-hidden'>
      <GridBackground />

      <div className='relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32'>
        {/* Left — copy */}
        <div className='lg:sticky lg:top-32'>
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
            Free to join
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
            Start
            <br />
            <span style={{ color: '#9CA3AF' }}>selling.</span>
          </h1>

          <p className='max-w-sm text-base leading-relaxed text-muted-foreground'>
            Create your seller account and launch your own storefront in
            minutes. No credit card required.
          </p>

          <ul className='mt-8 flex flex-col gap-3'>
            {[
              'Custom store domain',
              'Dedicated product catalog',
              'Real-time order tracking',
            ].map((item) => (
              <li key={item} className='flex items-center gap-2 text-sm'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  aria-hidden
                >
                  <circle
                    cx='8'
                    cy='8'
                    r='7.25'
                    stroke='rgba(0,0,0,0.12)'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M5 8l2 2 4-4'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span className='text-muted-foreground'>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div>
          <Card className='max-w-md'>
            <CardHeader>
              <CardTitle className='text-lg'>Create seller account</CardTitle>
              <CardDescription>
                Fill in your details to get started on Shoply.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup>
                  <Field data-invalid={!!errors.name || undefined}>
                    <FieldLabel htmlFor='name'>Full name</FieldLabel>
                    <Input
                      id='name'
                      name='name'
                      type='text'
                      required
                      autoComplete='name'
                      placeholder='Jane Smith'
                      aria-invalid={!!errors.name || undefined}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </Field>

                  <Field data-invalid={!!errors.email || undefined}>
                    <FieldLabel htmlFor='email'>Email</FieldLabel>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      required
                      autoComplete='email'
                      placeholder='you@store.com'
                      aria-invalid={!!errors.email || undefined}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </Field>

                  <Field data-invalid={!!errors.password || undefined}>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      required
                      autoComplete='new-password'
                      placeholder='Min. 6 characters'
                      aria-invalid={!!errors.password || undefined}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>

                  <Field data-invalid={!!errors.confirmPassword || undefined}>
                    <FieldLabel htmlFor='confirmPassword'>
                      Confirm password
                    </FieldLabel>
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      required
                      autoComplete='new-password'
                      placeholder='••••••••'
                      aria-invalid={!!errors.confirmPassword || undefined}
                    />
                    <FieldError>{errors.confirmPassword}</FieldError>
                  </Field>

                  <Field
                    orientation='horizontal'
                    className='items-start pt-1'
                    data-invalid={!!errors.terms || undefined}
                  >
                    <Checkbox
                      id='terms'
                      checked={termsChecked}
                      onCheckedChange={(v) => setTermsChecked(v === true)}
                      aria-invalid={!!errors.terms || undefined}
                    />
                    <FieldLabel htmlFor='terms' className='font-normal'>
                      I agree to the{' '}
                      <Link
                        href='/terms'
                        className='underline underline-offset-4 hover:text-foreground'
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href='/privacy'
                        className='underline underline-offset-4 hover:text-foreground'
                      >
                        Privacy Policy
                      </Link>
                    </FieldLabel>
                  </Field>
                  <FieldError>{errors.terms}</FieldError>
                </FieldGroup>

                <Button
                  type='submit'
                  className='mt-5 w-full'
                  size='lg'
                  disabled={isPending}
                >
                  {isPending ? 'Creating account…' : 'Create account'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className='justify-center'>
              <p className='text-sm text-muted-foreground'>
                Already have an account?{' '}
                <Link
                  href='/login'
                  className='font-medium text-foreground hover:underline'
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
