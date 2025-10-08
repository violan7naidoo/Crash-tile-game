'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Users, History, Home, LogOut, Shield } from 'lucide-react';

function VervetLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">🛡️</span>
      <h1 className="text-xl font-bold font-headline">Admin Panel</h1>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/admin', label: 'Game Config', icon: Settings },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/game-history', label: 'Game History', icon: History },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <VervetLogo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton tooltip="Back to Game">
                    <Home />
                    <span>Back to Game</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/login">
                  <SidebarMenuButton tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">Admin User</p>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
