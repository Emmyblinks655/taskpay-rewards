import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ListTodo, DollarSign, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    pendingSubmissions: 0,
    pendingPayouts: 0,
    totalAccounts: 0,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/not-authorized');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [users, tasks, submissions, payouts, accounts] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payout_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('free_accounts').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalTasks: tasks.count || 0,
        pendingSubmissions: submissions.count || 0,
        pendingPayouts: payouts.count || 0,
        totalAccounts: accounts.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks.toString(),
      icon: ListTodo,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions.toString(),
      icon: ListTodo,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts.toString(),
      icon: DollarSign,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Free Accounts',
      value: stats.totalAccounts.toString(),
      icon: Gift,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your TaskPay platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
