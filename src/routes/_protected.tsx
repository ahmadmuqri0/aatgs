import { createFileRoute, Link, Outlet, redirect, useMatches } from '@tanstack/react-router';
import { Fragment } from 'react';

import { AppSidebar } from '#/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb';
import { Separator } from '#/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar';
import { getSession } from '#/feat/auth/auth.functions';

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
  component: Layout,
});

function Layout() {
  const { user } = Route.useRouteContext();
  const crumbs = useMatches({
    select: (matches) =>
      matches.flatMap((m) =>
        m.loaderData?.crumb ? [{ title: m.loaderData.crumb, path: m.pathname }] : [],
      ),
  });
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                  <Fragment key={crumb.path}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {i === crumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link to={crumb.path} />}>
                          {crumb.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
