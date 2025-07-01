'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { LayoutDashboard, ListTodo, LineChart } from 'lucide-react';

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">TaskWise AI</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/"
            asChild
            isActive={pathname === '/'}
            tooltip="Dashboard"
          >
            <a href="/">
              <LayoutDashboard />
              <span>Dashboard</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/tasks"
            asChild
            isActive={pathname === '/tasks'}
            tooltip="All Tasks"
          >
            <a href="/tasks">
              <ListTodo />
              <span>All Tasks</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/reporting"
            asChild
            isActive={pathname === '/reporting'}
            tooltip="Reporting"
          >
            <a href="/reporting">
              <LineChart />
              <span>Reporting</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
