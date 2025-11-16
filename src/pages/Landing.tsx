import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ListChecks, Gift, DollarSign, ArrowRight } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: ListChecks,
      title: 'Complete Tasks',
      description: 'Easy tasks like following on social media, subscribing to channels, and more',
    },
    {
      icon: Coins,
      title: 'Earn Rewards',
      description: 'Get paid for every task you complete and watch your balance grow',
    },
    {
      icon: Gift,
      title: 'Free Accounts',
      description: 'Claim free social media accounts including Instagram, X, TikTok, and more',
    },
    {
      icon: DollarSign,
      title: 'Easy Payouts',
      description: 'Request payouts via bank transfer, crypto, or mobile money',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">TaskPay</span>
          </div>
          
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Complete Tasks.
            <br />
            <span className="text-primary">Earn Rewards.</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Join thousands of users earning money by completing simple social media tasks.
            Get paid fast and claim free accounts.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start Earning Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start earning in three simple steps
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join TaskPay today and start completing tasks to earn real money.
              It's free to join and you can request payouts anytime.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TaskPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
