
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart2, TrendingUp, Wallet, LineChart, PiggyBank, 
  ArrowRight, Plus, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useFinancialData } from '@/contexts/FinancialDataContext';
import { FinancialChart } from '@/components/FinancialChart';
import CountUp from 'react-countup';
import TransactionList from '@/components/TransactionList';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState<'1w' | '1m' | '3m' | '1y'>('1m');
  const { 
    summary, transactions, profile, isLoading, formatCurrency, formatCompactCurrency 
  } = useFinancialData();

  // More detailed spending breakdown data
  const spendingBreakdownData = [
    { name: 'Housing', value: 25000 },
    { name: 'Food', value: 6000 },
    { name: 'Transport', value: 5000 },
    { name: 'Utilities', value: 4000 },
    { name: 'Entertainment', value: 3500 },
    { name: 'Health', value: 2500 },
    { name: 'Shopping', value: 2000 }
  ];

  // Financial health radar chart data
  const financialHealthData = [
    { name: 'Savings Rate', value: summary.savingsRate, fullMark: 100 },
    { name: 'Debt Ratio', value: 25, fullMark: 100 },
    { name: 'Emergency Fund', value: 75, fullMark: 100 },
    { name: 'Investment', value: 60, fullMark: 100 },
    { name: 'Budget Adherence', value: 85, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your finances.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Tabs defaultValue={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="1w">1W</TabsTrigger>
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button asChild variant="outline" className="ml-2">
            <Link to="/expenses">
              <Plus className="h-4 w-4 mr-1" /> New Transaction
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <CountUp
                    end={summary.totalBalance}
                    prefix="₹"
                    separator=","
                    duration={1}
                    preserveValue
                  />
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 3.2%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <CountUp
                    end={profile?.monthly_income || 0}
                    prefix="₹"
                    separator=","
                    duration={1}
                    preserveValue
                  />
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 5%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <CountUp
                    end={profile?.monthly_expenses || 0}
                    prefix="₹"
                    separator=","
                    duration={1}
                    preserveValue
                  />
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-red-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> 2.5%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <CountUp
                    end={summary.savingsRate}
                    suffix="%"
                    decimals={1}
                    duration={1}
                    preserveValue
                  />
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 1.8%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">Track your money flow over time</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <FinancialChart
                type="bar"
                data={summary.monthlyData}
                index="name"
                categories={["income", "expenses"]}
                colors={["#2563eb", "#dc2626"]}
                valueFormatter={(value) => `₹${value.toLocaleString()}`}
                className="h-[300px]"
              />
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">Where your money goes</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <FinancialChart
                type="pie"
                data={spendingBreakdownData}
                index="name"
                category="value"
                colors={["#2563eb", "#4ade80", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]}
                valueFormatter={(value) => `₹${value.toLocaleString()}`}
                className="h-[300px]"
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <p className="text-sm text-muted-foreground">Your latest financial activity</p>
            </div>
            <Button asChild variant="link" size="sm" className="ml-auto">
              <Link to="/expenses">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              formatCurrency={formatCurrency}
              limit={5}
              showViewAll={true}
            />
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Track your savings progress</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <FinancialChart
                type="area"
                data={summary.monthlyData.map(m => ({ name: m.name, savings: m.income - m.expenses }))}
                index="name"
                categories={["savings"]}
                colors={["#10b981"]}
                valueFormatter={(value) => `₹${value.toLocaleString()}`}
                className="h-[300px]"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
