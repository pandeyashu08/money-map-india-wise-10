
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Calculator, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-card shadow-md rounded-lg p-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-blue-600">Money Map</h1>
          </div>
          
          <div>
            {user ? (
              <Button asChild>
                <Link to="/">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="space-x-4">
                <Link to="/auth" className="text-blue-600 hover:underline font-medium">
                  Login
                </Link>
                <Button asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Master Your Finances with <span className="text-orange-500">Money Map</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Track expenses, plan investments, and gain clarity on your financial health. 
            All in one place with a stunning, modern interface.
          </p>
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link to={user ? "/" : "/auth"}>
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features That Empower You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={Wallet}
              title="Track Expenses"
              description="Effortlessly monitor your income and spending with beautiful visualizations." 
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Plan Investments"
              description="Use the SIP calculator to project your growth and reach your financial goals." 
            />
            <FeatureCard 
              icon={Calculator}
              title="Estimate Taxes"
              description="Get a basic idea of your potential tax liability and plan better." 
            />
            <FeatureCard 
              icon={BarChart}
              title="Visualize Data"
              description="Understand your finances with clear charts and actionable insights." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t">
        <div className="container mx-auto text-center">
          <p className="text-gray-500">© 2025 Money Map</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
