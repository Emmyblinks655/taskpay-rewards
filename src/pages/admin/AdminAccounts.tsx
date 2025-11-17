import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { freeAccountSchema } from '@/lib/validationSchemas';

const AdminAccounts = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ platform_name: '', username: '', password: '' });

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/not-authorized');
    if (isAdmin) fetchAccounts();
  }, [isAdmin, loading]);

  const fetchAccounts = async () => {
    const { data } = await supabase.from('free_accounts').select('*');
    setAccounts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate input
      const validated = freeAccountSchema.parse(formData);
      
      await supabase.from('free_accounts').insert([validated as any]);
      toast.success('Account added successfully');
      setShowDialog(false);
      setFormData({ platform_name: '', username: '', password: '' });
      fetchAccounts();
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to add account');
      }
    }
  };

  if (loading || !isAdmin) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Free Accounts</h1>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardHeader>
                <CardTitle>{acc.platform_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Username: {acc.username}</p>
                <p className="text-sm">Status: {acc.claimed_by ? 'Claimed' : 'Available'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Free Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Platform Name" onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })} required />
            <Input placeholder="Username" onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            <Input placeholder="Password" type="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <DialogFooter>
              <Button type="submit">Add Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAccounts;
