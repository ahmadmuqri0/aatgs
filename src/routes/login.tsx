import { createFileRoute, Link } from '@tanstack/react-router';
import { Field } from '#/components/Field';
import { useLogin } from '#/hooks/auth';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const login = useLogin();

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login.mutate({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
  }
  return (
    <main className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" autoComplete="email" />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        {login.error && (
          <p role="alert" className="text-sm text-red-600">
            {login.error.message}
          </p>
        )}
        <button
          type="submit"
          disabled={login.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
