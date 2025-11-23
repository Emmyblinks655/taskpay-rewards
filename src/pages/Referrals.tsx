import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

const Referrals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_referrals: 0,
    total_commission: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchReferrals();
  }, [user, navigate]);

  const fetchReferrals = async () => {
    if (!user) return;

    // Get referrals where current user is the referrer
    const { data: refData } = await supabase
      .from("referrals")
      .select(`
        *,
        referred:referred_id(email),
        order:order_id(created_at)
      `)
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (refData) {
      setReferrals(refData);
      const totalCommission = refData.reduce((sum, ref) => sum + parseFloat(ref.commission_amount.toString()), 0);
      setStats({
        total_referrals: refData.length,
        total_commission: totalCommission,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Referrals</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-3xl font-bold">{stats.total_referrals}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-3xl font-bold">${stats.total_commission.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Commission History</h2>
          <div className="space-y-4">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium">{ref.referred?.email || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+${ref.commission_amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{ref.commission_percent}%</p>
                </div>
              </div>
            ))}
            {referrals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No referrals yet. Share your referral code to earn commissions!
              </p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Referrals;
