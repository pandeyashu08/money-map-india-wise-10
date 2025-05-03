
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BadgeDollarSign, TrendingUp, ArrowRight, Wallet, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Financial data interface
interface FinancialData {
  monthly_income: number;
  monthly_expenses: number;
  savings_goal: number;
}

// Transaction interface
interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasFinancialData, setHasFinancialData] = useState<boolean | null>(null);
  
  // Get financial data
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financialData', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, monthly_expenses, savings_goal')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      // Check if financial data is complete
      const hasData = Boolean(
        data && 
        data.monthly_income !== null && 
        data.monthly_expenses !== null && 
        data.savings_goal !== null
      );
      
      setHasFinancialData(hasData);
      return data as FinancialData;
    },
    enabled: !!user,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching financial data:', error);
        setHasFinancialData(false);
      }
    }
  });
  
  // Get recent transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching transactions:', error);
      }
    }
  });
  
  // Calculate financial metrics
  const totalBalance = financialData ? 
    financialData.monthly_income - financialData.monthly_expenses : 0;
  
  const savingsRate = financialData && financialData.monthly_income > 0 ?
    ((financialData.monthly_income - financialData.monthly_expenses) / financialData.monthly_income * 100).toFixed(1) : '0';
  
  // Process transaction data for charts
  const getExpensesByCategory = () => {
    if (!transactions || transactions.length === 0) return [];
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + transaction.amount);
    });
    
    return Array.from(categoryMap).map(([name, value]) => ({ name, value }));
  };
  
  // Monthly income/expense chart data
  const getMonthlyData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // If we have real transactions, use them
    if (transactions && transactions.length > 0) {
      // Group by month
      const monthlyData = Array(12).fill(0).map((_, i) => ({
        name: monthNames[i],
        income: 0,
        expenses: 0
      }));
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expenses += transaction.amount;
        }
      });
      
      return monthlyData;
    }
    
    // Otherwise use monthly income/expense from profile
    if (financialData) {
      return monthNames.map(name => ({
        name,
        income: financialData.monthly_income / 12,
        expenses: financialData.monthly_expenses / 12
      }));
    }
    
    // Fallback to empty data
    return monthNames.map(name => ({ name, income: 0, expenses: 0 }));
  };
  
  if (isLoadingFinancial) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2">Loading your financial data...</p>
        </div>
      </div>
    );
  }
  
  // Show setup prompt if no financial data
  if (hasFinancialData === false) {
    return (
      <div className="mt-8">
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle>Complete Your Financial Setup</CardTitle>
            <CardDescription>
              To get the most out of Money Map, please complete your financial setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We need some basic information about your finances to provide personalized insights 
              and recommendations. This will help us track your progress towards your financial goals.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/financial-details">
                Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild variant="outline">
          <Link to="/financial-details">
            Update Financial Details
          </Link>
        </Button>
      </div>
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl font-bold">
              ₹{totalBalance.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDollarSign 
              className={`h-8 w-8 ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} 
            />
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Income</CardDescription>
            <CardTitle className="text-2xl font-bold">
              ₹{financialData?.monthly_income.toLocaleString() || '0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Expenses</CardDescription>
            <CardTitle className="text-2xl font-bold">
              ₹{financialData?.monthly_expenses.toLocaleString() || '0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Wallet className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Savings Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {savingsRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              Your income vs. expenses for the past months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={getMonthlyData()}
              index="name"
              categories={["income", "expenses"]}
              colors={["blue", "red"]}
              valueFormatter={(value) => `₹${value.toLocaleString()}`}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Where your money is going
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center h-48">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : getExpensesByCategory().length > 0 ? (
              <PieChart 
                data={getExpensesByCategory()}
                index="name"
                valueFormatter={(value) => `₹${value.toLocaleString()}`}
                className="aspect-[4/3]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground mb-2">No expense data available yet</p>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/expenses">Add Expenses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center h-24">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3 px-4">{transaction.description}</td>
                      <td className="py-3 px-4">{transaction.category}</td>
                      <td className={`py-3 px-4 text-right ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No transactions recorded yet</p>
              <Button asChild>
                <Link to="/expenses">Add Your First Transaction</Link>
              </Button>
            </div>
          )}
        </CardContent>
        {transactions && transactions.length > 0 && (
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/expenses">View All Transactions</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
