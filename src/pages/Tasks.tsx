import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ExternalLink, Upload, DollarSign } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  link: string;
  reward: number;
  type: string;
  status: boolean;
}

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [usernameProof, setUsernameProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !user) return;

    setSubmitting(true);
    try {
      let proofImageUrl = null;

      // Upload image if provided
      if (proofImage) {
        const fileExt = proofImage.name.split('.').pop();
        const fileName = `${user.id}/${selectedTask.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, proofImage);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('task-proofs')
          .getPublicUrl(fileName);
        
        proofImageUrl = publicUrl;
      }

      // Submit task
      const { error } = await supabase
        .from('task_submissions')
        .insert({
          user_id: user.id,
          task_id: selectedTask.id,
          proof_image: proofImageUrl,
          username_proof: usernameProof || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already submitted this task');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Task submitted successfully! Awaiting approval.');
      setSelectedTask(null);
      setProofImage(null);
      setUsernameProof('');
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error(error.message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const getTaskTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      twitter_follow: 'Follow on X/Twitter',
      instagram_follow: 'Follow on Instagram',
      youtube_subscribe: 'Subscribe on YouTube',
      telegram_join: 'Join Telegram',
      platform_signup: 'Sign up on Platform',
      visit_url: 'Visit URL',
    };
    return types[type] || type;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Available Tasks</h1>
          <p className="text-muted-foreground">
            Complete tasks and earn rewards
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
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tasks available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {task.reward}
                    </Badge>
                  </div>
                  <CardDescription>{getTaskTypeDisplay(task.type)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(task.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTask(task)}
                  >
                    Submit Task
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task Proof</DialogTitle>
            <DialogDescription>
              Upload a screenshot or enter your username as proof of completion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof-image">Screenshot Proof (Optional)</Label>
              <Input
                id="proof-image"
                type="file"
                accept="image/*"
                onChange={(e) => setProofImage(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username-proof">Username Proof (Optional)</Label>
              <Input
                id="username-proof"
                placeholder="Enter your username"
                value={usernameProof}
                onChange={(e) => setUsernameProof(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTask(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={submitting || (!proofImage && !usernameProof)}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Tasks;
