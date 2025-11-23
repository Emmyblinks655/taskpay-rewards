import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  amount: number;
  cost: number;
  target: string;
  status: string;
  provider_ref: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  profiles: { email: string };
  services: { name: string; operator_name: string };
}

const AdminVTUOrders = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/not-authorized");
    }
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, loading, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles(email),
          services(name, operator_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleRetry = async (orderId: string) => {
    try {
      const { error } = await supabase.functions.invoke("process-vtu-order", {
        body: { order_id: orderId, retry: true },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order retry initiated",
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading || loadingData) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">VTU Orders</h1>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{order.services?.name}</h3>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User: {order.profiles?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Target: {order.target}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount: ${order.amount.toFixed(2)} | Cost: ${order.cost.toFixed(2)}
                  </p>
                  {order.provider_ref && (
                    <p className="text-sm text-muted-foreground">
                      Ref: {order.provider_ref}
                    </p>
                  )}
                  {order.error_message && (
                    <p className="text-sm text-destructive">
                      Error: {order.error_message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                {order.status === "failed" && (
                  <Button
                    onClick={() => handleRetry(order.id)}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVTUOrders;
