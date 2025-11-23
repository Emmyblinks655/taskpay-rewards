import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [target, setTarget] = useState("");
  const [processing, setProcessing] = useState(false);
  const [category, setCategory] = useState<"airtime" | "data" | "cable_tv" | "electricity" | "internet">("airtime");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchServices();
    fetchBalance();
  }, [user, navigate, category]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("status", true)
      .eq("category", category)
      .order("operator_name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setServices(data || []);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setBalance(data.balance);
    }
  };

  const handlePurchase = async () => {
    if (!selectedService || !target) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-vtu-order", {
        body: {
          service_id: selectedService.id,
          target,
        },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Order placed successfully!" });
      setSelectedService(null);
      setTarget("");
      fetchBalance();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const key = `${service.country_code}_${service.operator_name}`;
    if (!acc[key]) {
      acc[key] = {
        country: service.country_code,
        operator: service.operator_name,
        services: [],
      };
    }
    acc[key].services.push(service);
    return acc;
  }, {} as Record<string, any>);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Services</h1>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
          </Card>
        </div>

        <Tabs value={category} onValueChange={(value) => setCategory(value as typeof category)}>
          <TabsList>
            <TabsTrigger value="airtime">Airtime</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="cable_tv">Cable TV</TabsTrigger>
            <TabsTrigger value="electricity">Electricity</TabsTrigger>
            <TabsTrigger value="internet">Internet</TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="space-y-6">
            {Object.values(groupedServices).map((group: any) => (
              <div key={`${group.country}_${group.operator}`}>
                <h2 className="text-xl font-semibold mb-4">
                  {group.operator} ({group.country})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.services.map((service: any) => (
                    <Card key={service.id} className="p-6">
                      <h3 className="font-semibold mb-2">{service.name}</h3>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {service.currency} {(service.sale_price || service.price).toFixed(2)}
                        </p>
                        {service.sale_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {service.currency} {service.price.toFixed(2)}
                          </p>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => setSelectedService(service)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Purchase {service.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Phone Number / Account Number</Label>
                                <Input
                                  value={target}
                                  onChange={(e) => setTarget(e.target.value)}
                                  placeholder="Enter recipient number"
                                />
                              </div>
                              <div className="bg-muted p-4 rounded">
                                <p className="text-sm">Amount: {service.currency} {(service.sale_price || service.price).toFixed(2)}</p>
                                <p className="text-sm">Your Balance: ${balance.toFixed(2)}</p>
                              </div>
                              <Button
                                className="w-full"
                                onClick={handlePurchase}
                                disabled={processing}
                              >
                                {processing ? "Processing..." : "Confirm Purchase"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Services;
