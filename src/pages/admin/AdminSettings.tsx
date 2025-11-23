import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({
    global_markup_percent: 0,
    referral_commission_percent: 1,
    max_commission_percent: 5,
    kyc_required: false,
    min_withdrawal: 10,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/not-authorized");
    }
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, loading, navigate]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*");

    if (data) {
      const settingsMap: any = {};
      data.forEach((setting) => {
        const val = setting.value as any;
        if (setting.key === "global_markup_percent") {
          settingsMap.global_markup_percent = val.value;
        } else if (setting.key === "referral_commission") {
          settingsMap.referral_commission_percent = val.referral_commission_percent;
          settingsMap.max_commission_percent = val.max_commission_percent;
        } else if (setting.key === "kyc_required") {
          settingsMap.kyc_required = val.value;
        } else if (setting.key === "min_withdrawal") {
          settingsMap.min_withdrawal = val.value;
        }
      });
      setSettings(settingsMap);
    }
  };

  const handleSave = async () => {
    try {
      const updates = [
        {
          key: "global_markup_percent",
          value: { value: parseFloat(settings.global_markup_percent) },
        },
        {
          key: "referral_commission",
          value: {
            referral_commission_percent: parseFloat(settings.referral_commission_percent),
            max_commission_percent: parseFloat(settings.max_commission_percent),
          },
        },
        {
          key: "kyc_required",
          value: { value: settings.kyc_required },
        },
        {
          key: "min_withdrawal",
          value: { value: parseFloat(settings.min_withdrawal) },
        },
      ];

      for (const update of updates) {
        await supabase
          .from("settings")
          .update({ value: update.value as any })
          .eq("key", update.key);
      }

      toast({ title: "Success", description: "Settings updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Settings</h1>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Global Markup Percent (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.global_markup_percent}
              onChange={(e) => setSettings({ ...settings, global_markup_percent: e.target.value })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Default markup applied to all services
            </p>
          </div>

          <div>
            <Label>Referral Commission Percent (%)</Label>
            <Input
              type="number"
              step="0.1"
              max="5"
              value={settings.referral_commission_percent}
              onChange={(e) => setSettings({ ...settings, referral_commission_percent: e.target.value })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Commission given to referrers on successful orders (max 5%)
            </p>
          </div>

          <div>
            <Label>Minimum Withdrawal Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.min_withdrawal}
              onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
