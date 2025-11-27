import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <SidebarTrigger className="bg-sidebar border border-sidebar-border rounded-md p-2" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
