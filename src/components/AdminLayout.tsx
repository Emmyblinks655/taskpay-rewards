import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  ListTodo, 
  CheckSquare, 
  DollarSign, 
  Gift, 
  Image,
  LogOut,
  Server,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'VTU Orders', url: '/admin/vtu-orders', icon: ListTodo },
  { title: 'VTU Services', url: '/admin/vtu-services', icon: Gift },
  { title: 'VTU Providers', url: '/admin/vtu-providers', icon: Server },
  { title: 'Tasks', url: '/admin/tasks', icon: ListTodo },
  { title: 'Submissions', url: '/admin/submissions', icon: CheckSquare },
  { title: 'Payouts', url: '/admin/payouts', icon: DollarSign },
  { title: 'Free Accounts', url: '/admin/accounts', icon: Gift },
  { title: 'Ads', url: '/admin/ads', icon: Image },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-primary">TaskPay Admin</h2>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => navigate(item.url)}
                          isActive={isActive(item.url)}
                          className="cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 bg-background">
            <SidebarTrigger />
          </header>
          
          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
