import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSubmissions = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/not-authorized');
    if (isAdmin) fetchSubmissions();
  }, [isAdmin, loading]);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('task_submissions')
      .select('*, tasks(*), profiles(email)')
      .order('created_at', { ascending: false });
    setSubmissions(data || []);
  };

  const handleApprove = async (submission: any) => {
    try {
      const { error } = await supabase.rpc('approve_task_submission', { 
        submission_id: submission.id 
      });
      
      if (error) throw error;
      
      toast.success('Submission approved and reward added');
      fetchSubmissions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve submission');
    }
  };

  if (loading || !isAdmin) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Task Submissions</h1>
        <div className="space-y-4">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{sub.tasks?.title}</CardTitle>
                  <Badge>{sub.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">User: {sub.profiles?.email}</p>
                {sub.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(sub)} className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;
