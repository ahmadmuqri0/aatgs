import { Link } from '@tanstack/react-router';
import type { User } from 'better-auth';
import { BookOpenIcon, TerminalIcon } from 'lucide-react';
import type * as React from 'react';

import { NavMain } from '#/components/nav-main';
import { NavUser } from '#/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';
import type { NavItem } from '#/types';

const items: NavItem[] = [
  {
    title: 'Assignment',
    url: '/',
    icon: <BookOpenIcon />,
  },
];

type Props = React.ComponentProps<typeof Sidebar> & {
  user: User;
};

export function AppSidebar({ user, ...props }: Props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">AATGS</span>
                <span className="truncate text-xs">
                  Automated Assignment Task Generation System
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
