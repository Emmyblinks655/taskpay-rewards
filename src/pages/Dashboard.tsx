import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wallet, ListChecks, Gift, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user?.id)
        .single();
      
      if (profile) {
        setBalance(Number(profile.balance));
      }

      // Fetch active tasks count
      const { count: tasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', true);
      
      if (tasks) setTaskCount(tasks);

      // Fetch user submissions count
      const { count: submissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      if (submissions) setSubmissionCount(submissions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Your Balance',
      value: `$${balance.toFixed(2)}`,
      description: 'Available for payout',
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Available Tasks',
      value: taskCount.toString(),
      description: 'Tasks you can complete',
      icon: ListChecks,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Your Submissions',
      value: submissionCount.toString(),
      description: 'Tasks you\'ve submitted',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Complete tasks and earn rewards
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                    <Icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start Earning</CardTitle>
              <CardDescription>
                Browse and complete tasks to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tasks">
                <Button className="w-full">Browse Tasks</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free Accounts</CardTitle>
              <CardDescription>
                Claim free social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/free-accounts">
                <Button variant="outline" className="w-full">
                  View Free Accounts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Import cn utility
import { cn } from '@/lib/utils';

export default Dashboard;
