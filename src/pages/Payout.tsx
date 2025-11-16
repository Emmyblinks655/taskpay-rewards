import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wallet, DollarSign } from 'lucide-react';

interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

const Payout = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchPayoutRequests();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        setBalance(Number(data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const { data } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setPayoutRequests(data);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    }
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payoutAmount = parseFloat(amount);
    if (payoutAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (payoutAmount < 10) {
      toast.error('Minimum payout amount is $10');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: user.id,
          amount: payoutAmount,
          method: method as 'bank' | 'crypto' | 'mobile_money',
          details: { account: accountDetails } as any,
        });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      setAmount('');
      setMethod('');
      setAccountDetails('');
      fetchPayoutRequests();
      fetchBalance();
    } catch (error: any) {
      console.error('Error submitting payout:', error);
      toast.error(error.message || 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default:
        return 'bg-warning/10 text-warning hover:bg-warning/20';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payout</h1>
          <p className="text-muted-foreground">
            Request payouts for your earned rewards
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Available Balance</CardTitle>
                <CardDescription>Your current earnings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>
              Minimum payout amount is $10.00
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPayout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max={balance}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={method} onValueChange={setMethod} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Account Details</Label>
                <Input
                  id="details"
                  placeholder="Enter account details"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting || !amount || !method}>
                {submitting ? 'Submitting...' : 'Submit Payout Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>Your previous payout requests</CardDescription>
          </CardHeader>
          <CardContent>
            {payoutRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No payout requests yet
              </p>
            ) : (
              <div className="space-y-4">
                {payoutRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">${request.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payout;
