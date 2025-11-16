import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Instagram, Twitter, Youtube, Send, CheckCircle2 } from 'lucide-react';

interface FreeAccount {
  id: string;
  platform_name: string;
  username: string;
  password: string;
  status: boolean;
  claimed_by: string | null;
}

const FreeAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<FreeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<FreeAccount | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('free_accounts')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAccount = async () => {
    if (!selectedAccount || !user) return;

    setClaiming(true);
    try {
      const { error } = await supabase
        .from('free_accounts')
        .update({
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', selectedAccount.id)
        .is('claimed_by', null);

      if (error) throw error;

      toast.success('Account claimed successfully!');
      fetchAccounts();
      setSelectedAccount(null);
    } catch (error: any) {
      console.error('Error claiming account:', error);
      toast.error(error.message || 'Failed to claim account');
    } finally {
      setClaiming(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('instagram') || lower.includes('ig')) return Instagram;
    if (lower.includes('twitter') || lower.includes('x')) return Twitter;
    if (lower.includes('youtube') || lower.includes('yt')) return Youtube;
    if (lower.includes('telegram')) return Send;
    return CheckCircle2;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Free Accounts</h1>
          <p className="text-muted-foreground">
            Claim free social media accounts
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No accounts available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const Icon = getPlatformIcon(account.platform_name);
              const isClaimed = !!account.claimed_by;
              const isClaimedByUser = account.claimed_by === user?.id;

              return (
                <Card key={account.id} className={isClaimed ? 'opacity-60' : 'hover:shadow-lg transition-shadow'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <Icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">{account.platform_name}</CardTitle>
                      </div>
                      {isClaimed && (
                        <Badge variant={isClaimedByUser ? 'default' : 'secondary'}>
                          {isClaimedByUser ? 'Yours' : 'Claimed'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isClaimedByUser ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Username:</p>
                          <p className="text-sm text-muted-foreground">{account.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Password:</p>
                          <p className="text-sm text-muted-foreground font-mono">{account.password}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isClaimed ? 'This account has been claimed by another user' : 'Click to claim this account'}
                      </p>
                    )}
                  </CardContent>
                  {!isClaimed && (
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedAccount(account)}
                      >
                        Claim Account
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Free Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to claim this {selectedAccount?.platform_name} account?
              Once claimed, you'll see the login credentials.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedAccount(null)}
              disabled={claiming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaimAccount}
              disabled={claiming}
            >
              {claiming ? 'Claiming...' : 'Claim Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FreeAccounts;
