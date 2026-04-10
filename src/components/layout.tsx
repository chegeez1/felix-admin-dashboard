import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingCart, List, Users, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarHeader } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/orders", icon: ShoppingCart },
    { label: "Plans", href: "/plans", icon: List },
    { label: "Customers", href: "/customers", icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/20">
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
          <SidebarHeader className="p-4 border-b border-sidebar-border/50">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h1 className="font-bold text-sidebar-foreground">Felix Admin</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="mt-4 gap-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link href={item.href} className="flex items-center gap-3 w-full p-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-sidebar-border/50">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </Sidebar>
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
