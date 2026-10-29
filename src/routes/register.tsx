import { createFileRoute, Link } from '@tanstack/react-router';
import { Field } from '#/components/Field';
import { useRegister } from '#/hooks/auth';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
});

function RouteComponent() {
  const register = useRegister();

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    register.mutate({
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
  }

  return (
    <main className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field id="name" label="Name" autoComplete="name" />
        <Field id="email" label="Email" type="email" autoComplete="email" />
        <Field
          id="password"
          label="Password"
          type="password"
          minLength={8}
          autoComplete="new-password"
        />
        {register.error && (
          <p role="alert" className="text-sm text-red-600">
            {register.error.message}
          </p>
        )}
        <button
          type="submit"
          disabled={register.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already registered?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
