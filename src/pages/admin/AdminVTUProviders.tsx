import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const AdminVTUProviders = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    api_key_encrypted: "",
    enabled: true,
    priority: "1",
    config_json: "{}",
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/not-authorized");
    }
    if (isAdmin) {
      fetchProviders();
    }
  }, [isAdmin, loading, navigate]);

  const fetchProviders = async () => {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("priority", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProviders(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const configJson = JSON.parse(formData.config_json);
      const { error } = await supabase.from("providers").insert({
        name: formData.name,
        api_key_encrypted: formData.api_key_encrypted,
        enabled: formData.enabled,
        priority: parseInt(formData.priority),
        config_json: configJson,
      } as any);

      if (error) throw error;

      toast({ title: "Success", description: "Provider created successfully" });
      setOpen(false);
      fetchProviders();
      setFormData({
        name: "",
        api_key_encrypted: "",
        enabled: true,
        priority: "1",
        config_json: "{}",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleEnabled = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("providers")
      .update({ enabled: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchProviders();
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">VTU Providers</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Provider Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={formData.api_key_encrypted}
                    onChange={(e) => setFormData({ ...formData, api_key_encrypted: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Priority (Higher = Preferred)</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Config JSON</Label>
                  <Input
                    value={formData.config_json}
                    onChange={(e) => setFormData({ ...formData, config_json: e.target.value })}
                    placeholder='{"base_url": "...", "timeout": 30}'
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label>Enabled</Label>
                </div>
                <Button type="submit" className="w-full">Create Provider</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {providers.map((provider) => (
            <Card key={provider.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Priority: {provider.priority}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    API Key: {provider.api_key_encrypted.substring(0, 20)}...
                  </p>
                </div>
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={() => toggleEnabled(provider.id, provider.enabled)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVTUProviders;
