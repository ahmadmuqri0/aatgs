import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getSession } from '#/func/auth.function';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: '/login',
      });
    }

    return { user: session.user };
  },
  component: () => <Outlet />,
});
