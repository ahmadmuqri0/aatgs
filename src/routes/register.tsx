import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { authClient } from '#/feat/auth/auth-client';
import { getSession } from '#/feat/auth/auth.functions';

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: '/' });
    }
  },
  component: Register,
});

function Register() {
  const [isHidden, setIsHidden] = useState(true);
  const [isConfirmHidden, setIsConfirmHidden] = useState(true);

  const navigate = useNavigate();

  const schema = z
    .object({
      fullname: z.string().min(1, 'Please enter your name'),
      email: z.email(),
      password: z
        .string('Require a password')
        .min(8, 'Minimum 8 character')
        .max(128, 'Maximum 128 character'),
      confirm: z.string('Please confirm your password'),
    })
    .refine((data) => data.password === data.confirm, {
      error: 'Password do not match',
      path: ['confirm'],
    });

  type FormSchema = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  const { mutate, error, isError, isPending } = useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const { error } = await authClient.signUp.email(input);
      if (error) throw new Error(error.message || 'Unable to create account');
    },
    onSuccess: () => navigate({ to: '/' }),
  });

  function onSubmit(data: FormSchema) {
    mutate({
      name: data.fullname,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your information below to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="fullname"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="John Doe"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          placeholder="m@example.com"
                          autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id={field.name}
                            type={isHidden ? 'password' : 'text'}
                            className="pr-10"
                          />
                          <Button
                            variant={'ghost'}
                            size={'sm'}
                            onClick={() => setIsHidden((current) => !current)}
                            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          >
                            {isHidden ? (
                              <EyeIcon className="h-4 w-4" />
                            ) : (
                              <EyeOffIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="confirm"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id={field.name}
                            type={isConfirmHidden ? 'password' : 'text'}
                            className="pr-10"
                          />

                          <Button
                            variant={'ghost'}
                            size={'sm'}
                            onClick={() => setIsConfirmHidden((current) => !current)}
                            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          >
                            {isConfirmHidden ? (
                              <EyeIcon className="h-4 w-4" />
                            ) : (
                              <EyeOffIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  {isError && (
                    <Alert className="max-w-md border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
                      <AlertCircleIcon />
                      <AlertTitle>{error.name}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  <Field>
                    <Button type="submit" disabled={isPending}>
                      Create Account
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Already have an account? <Link to="/login">Log in</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
