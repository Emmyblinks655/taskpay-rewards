import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

const AdminVTUServices = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider_service_id: "",
    category: "airtime",
    country_code: "",
    operator_name: "",
    name: "",
    price: "",
    sale_price: "",
    currency: "USD",
    status: true,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/not-authorized");
    }
    if (isAdmin) {
      fetchServices();
    }
  }, [isAdmin, loading, navigate]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setServices(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("services").insert({
      ...formData,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Service created successfully" });
      setOpen(false);
      fetchServices();
      setFormData({
        provider_service_id: "",
        category: "airtime",
        country_code: "",
        operator_name: "",
        name: "",
        price: "",
        sale_price: "",
        currency: "USD",
        status: true,
      });
      
      // Notify users
      await supabase.functions.invoke("notify-users", {
        body: {
          type: "new_service",
          subject: "New Service Available",
          message: `New service added: ${formData.name}`,
        },
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("services")
      .update({ status: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchServices();
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">VTU Services</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Provider Service ID</Label>
                  <Input
                    value={formData.provider_service_id}
                    onChange={(e) => setFormData({ ...formData, provider_service_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airtime">Airtime</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="cable_tv">Cable TV</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country Code</Label>
                  <Input
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label>Operator Name</Label>
                  <Input
                    value={formData.operator_name}
                    onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Sale Price (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    maxLength={3}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Service</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.operator_name} • {service.country_code} • {service.category}
                  </p>
                  <p className="text-sm mt-2">
                    Price: {service.currency} {service.price.toFixed(2)}
                    {service.sale_price && ` • Sale: ${service.currency} ${service.sale_price.toFixed(2)}`}
                  </p>
                </div>
                <Switch
                  checked={service.status}
                  onCheckedChange={() => toggleStatus(service.id, service.status)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVTUServices;
