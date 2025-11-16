import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Coins, LayoutDashboard, ListTodo, Gift, DollarSign, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const userNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tasks', icon: ListTodo, label: 'Tasks' },
    { href: '/free-accounts', icon: Gift, label: 'Free Accounts' },
    { href: '/payout', icon: DollarSign, label: 'Payout' },
  ];

  const adminNavItems = [
    { href: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { href: '/admin/tasks', icon: ListTodo, label: 'Manage Tasks' },
    { href: '/admin/submissions', icon: ListTodo, label: 'Submissions' },
    { href: '/admin/payouts', icon: DollarSign, label: 'Payouts' },
    { href: '/admin/accounts', icon: Gift, label: 'Free Accounts' },
  ];

  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">TaskPay</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'gap-2',
                      isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Button variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
