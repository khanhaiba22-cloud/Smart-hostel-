import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-mesh">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar title={title} />
          <main className="flex-1 p-5 overflow-auto page-enter">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
