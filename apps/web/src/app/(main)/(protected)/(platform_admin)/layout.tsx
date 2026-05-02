import { type ReactNode } from 'react';
import { PlatformAdminSidebar } from '@/components/layout/sidebar/platform-admin-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DashboardNavbar } from '@/components/layout/dashboard-navbar';
import { AdminBreadcrumb } from './_components/admin-breadcrumb';

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <PlatformAdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mx-1 h-4 data-[orientation=vertical]:h-4" />
            <AdminBreadcrumb />
          </div>
          <DashboardNavbar />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
