import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_protected/')({ component: Home });

function Home() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || 'Unable to log out');
    },
    onSuccess: async () => {
      queryClient.clear();
      await router.navigate({ to: '/login' });
      await router.invalidate();
    },
  });

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
