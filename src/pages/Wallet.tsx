import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchWalletData();
  }, [user, navigate]);

  const fetchWalletData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, referral_code")
      .eq("id", user.id)
      .single();

    if (profile) {
      setBalance(profile.balance);
      setReferralCode(profile.referral_code);
    }

    const { data: txData } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (txData) {
      setTransactions(txData);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === "credit" || type === "commission" || type === "topup" ? (
      <ArrowDownLeft className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowUpRight className="h-5 w-5 text-red-500" />
    );
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
      case "commission":
      case "topup":
        return "text-green-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Wallet</h1>

        <Card className="p-8 bg-gradient-to-br from-primary to-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Available Balance</p>
              <p className="text-4xl font-bold mt-2">${balance.toFixed(2)}</p>
            </div>
            <WalletIcon className="h-16 w-16 opacity-20" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm opacity-80">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <code className="bg-background/20 px-3 py-1 rounded text-lg font-mono">
                {referralCode}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                    {tx.reference && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {tx.reference}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getTransactionColor(tx.type)}`}>
                    {tx.type === "debit" || tx.type === "withdrawal" ? "-" : "+"}
                    ${tx.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {tx.type}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
