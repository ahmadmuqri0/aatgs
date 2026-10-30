import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/auth';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const schema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Please enter your password'),
    rememberMe: z.boolean(),
  });

  type FormSchema = z.infer<typeof schema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const login = useMutation({
    mutationFn: async (input: FormSchema) => {
      const { error } = await authClient.signIn.email(input);
      if (error) throw new Error(error.message || 'unable to login');
    },
    onSuccess: () => navigate({ to: '/' }),
  });

  function onSubmit(data: FormSchema) {
    login.mutate({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="m@example.com"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id={field.name}
                            type={showPassword ? 'text' : 'password'}
                            className="pr-10"
                          />
                          <Button
                            variant={'ghost'}
                            size={'sm'}
                            onClick={() =>
                              setShowPassword((current) => !current)
                            }
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="rememberMe"
                    control={form.control}
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel htmlFor={field.name}>
                          Remember me
                        </FieldLabel>
                      </Field>
                    )}
                  />
                  {login.isError && (
                    <Alert className="max-w-md border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
                      <AlertCircleIcon />
                      <AlertTitle>{login.error.name}</AlertTitle>
                      <AlertDescription>{login.error.message}</AlertDescription>
                    </Alert>
                  )}
                  <Field>
                    <Button type="submit" disabled={login.isPending}>
                      Login
                    </Button>
                    <FieldDescription className="text-center">
                      Don&apos;t have an account?{' '}
                      <Link to="/register">Register</Link>
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
