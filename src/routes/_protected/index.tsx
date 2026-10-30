import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/auth';

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
      <Button
        type="button"
        size={'lg'}
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? 'Logging out...' : 'logout'}
      </Button>
    </div>
  );
}
