import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adSchema } from '@/lib/validationSchemas';

const AdminAds = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [formData, setFormData] = useState({
    ad_name: '',
    ad_type: 'code' as 'code' | 'image',
    ad_content: '',
    placement: [] as ('homepage' | 'dashboard' | 'tasks' | 'free_accounts')[],
    status: true,
  });

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/dashboard');
    if (isAdmin) fetchAds();
  }, [isAdmin, loading]);

  const fetchAds = async () => {
    const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    setAds(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const validated = adSchema.parse(formData);
      
      if (editingAd) {
        await supabase.from('ads').update(validated as any).eq('id', editingAd.id);
        toast.success('Ad updated successfully');
      } else {
        await supabase.from('ads').insert([validated as any]);
        toast.success('Ad created successfully');
      }

      setShowDialog(false);
      setEditingAd(null);
      setFormData({ ad_name: '', ad_type: 'code', ad_content: '', placement: [], status: true });
      fetchAds();
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to save ad');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    await supabase.from('ads').delete().eq('id', id);
    toast.success('Ad deleted');
    fetchAds();
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      ad_name: ad.ad_name,
      ad_type: ad.ad_type,
      ad_content: ad.ad_content,
      placement: ad.placement || [],
      status: ad.status,
    });
    setShowDialog(true);
  };

  const togglePlacement = (placement: 'homepage' | 'dashboard' | 'tasks' | 'free_accounts') => {
    setFormData(prev => ({
      ...prev,
      placement: prev.placement.includes(placement)
        ? prev.placement.filter(p => p !== placement)
        : [...prev.placement, placement]
    }));
  };

  if (loading || !isAdmin) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Ads</h1>
            <p className="text-muted-foreground">Control ad placements across the platform</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ad
          </Button>
        </div>

        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{ad.ad_name}</CardTitle>
                      <Badge variant={ad.status ? 'default' : 'secondary'}>
                        {ad.status ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{ad.ad_type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {ad.placement?.map((p: string) => (
                        <Badge key={p} variant="secondary">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">{ad.ad_content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad_name">Ad Name</Label>
              <Input
                id="ad_name"
                value={formData.ad_name}
                onChange={(e) => setFormData({ ...formData, ad_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad_type">Ad Type</Label>
              <Select value={formData.ad_type} onValueChange={(value: any) => setFormData({ ...formData, ad_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">AdSense Code</SelectItem>
                  <SelectItem value="image">Image URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad_content">
                {formData.ad_type === 'code' ? 'AdSense Code' : 'Image URL'}
              </Label>
              <Textarea
                id="ad_content"
                value={formData.ad_content}
                onChange={(e) => setFormData({ ...formData, ad_content: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Ad Placement</Label>
              <div className="space-y-2">
                {(['homepage', 'dashboard', 'tasks', 'free_accounts'] as const).map((placement) => (
                  <div key={placement} className="flex items-center space-x-2">
                    <Checkbox
                      id={placement}
                      checked={formData.placement.includes(placement)}
                      onCheckedChange={() => togglePlacement(placement)}
                    />
                    <label htmlFor={placement} className="text-sm capitalize cursor-pointer">
                      {placement.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAds;
