"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
}

export default function DashboardLayout({ 
  children, 
  userName = "Utente", 
  userEmail = "", 
  userInitials = "U" 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0a071e] text-white">
        {/* Passiamo i dati utente alla sidebar se necessario */}
        <AppSidebar />
        
        <SidebarInset className="bg-[#0a071e]">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-[#110B3B]/40 backdrop-blur-xl px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-purple-200 hover:text-white hover:bg-white/10" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4 bg-white/20"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#" className="text-purple-200/70 hover:text-white">
                        Settlr
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block text-purple-200/40" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-white font-medium">Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Profilo utente dinamico in alto a destra */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-purple-200/80 hidden sm:inline">{userName}</span>
                <div className="size-8 rounded-full bg-linear-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {userInitials}
                </div>
              </div>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-6 pt-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}