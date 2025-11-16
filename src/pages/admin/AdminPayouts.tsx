import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminPayouts = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/dashboard');
    if (isAdmin) fetchPayouts();
  }, [isAdmin, loading]);

  const fetchPayouts = async () => {
    const { data } = await supabase
      .from('payout_requests')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });
    setPayouts(data || []);
  };

  const handleMarkPaid = async (id: string) => {
    await supabase.from('payout_requests').update({ status: 'paid' }).eq('id', id);
    toast.success('Marked as paid');
    fetchPayouts();
  };

  if (loading || !isAdmin) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payout Requests</h1>
        <div className="space-y-4">
          {payouts.map((payout) => (
            <Card key={payout.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>${payout.amount}</CardTitle>
                  <Badge>{payout.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">User: {payout.profiles?.email}</p>
                <p className="text-sm">Method: {payout.method}</p>
                {payout.status === 'pending' && (
                  <Button className="mt-4" onClick={() => handleMarkPaid(payout.id)}>
                    Mark as Paid
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPayouts;
