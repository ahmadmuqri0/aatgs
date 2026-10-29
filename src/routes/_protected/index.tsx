import { createFileRoute } from '@tanstack/react-router';
import { useLogout } from '#/hooks/auth';

export const Route = createFileRoute('/_protected/')({ component: Home });

function Home() {
  const { user } = Route.useRouteContext();
  const logout = useLogout();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">
        Welcome to TanStack Start, {user.name}
      </h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <button
        className="bg-slate-800 text-slate-100 px-3 py-1 rounded-md disabled:bg-slate-600 disabled:text-slate-300"
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? 'Logging out...' : 'logout'}
      </button>
    </div>
  );
}
