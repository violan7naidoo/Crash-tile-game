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
import { Home, Wallet, History, Shield, LogOut } from 'lucide-react';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import { GameHistoryProvider } from '@/context/GameHistoryContext';

function VervetLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">🐒</span>
      <h1 className="text-xl font-bold font-headline">Vervet Venture</h1>
    </div>
  );
}

function UserProfile() {
  const { balance } = useWallet();
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="font-semibold">CheekyMonkey</p>
        <p className="text-sm text-muted-foreground">
          R{balance.toFixed(2)}
        </p>
      </div>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="@shadcn" />
        <AvatarFallback>CM</AvatarFallback>
      </Avatar>
    </div>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/dashboard', label: 'Game', icon: Home },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/history', label: 'History', icon: History },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-2">
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
                <Link href="/admin">
                  <SidebarMenuButton isActive={pathname.startsWith('/admin')} tooltip="Admin">
                    <Shield />
                    <span>Admin Panel</span>
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
      <SidebarInset className="w-[calc(100%-12rem)]">
        <header className="flex h-16 items-center justify-between border-b px-4">
            <SidebarTrigger className="ml-2" />
            <UserProfile />
        </header>
        <main className="flex-1 overflow-y-auto p-2 md:p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <GameHistoryProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </GameHistoryProvider>
    </WalletProvider>
  );
}
