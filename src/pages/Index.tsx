
import React from 'react';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import TransactionManager from '@/components/TransactionManager';
import TaxCalculator from '@/components/TaxCalculator';
import InvestmentCalculator from '@/components/InvestmentCalculator';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto my-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>
          
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="tax">Tax Planner</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionManager />
            </TabsContent>
            
            <TabsContent value="tax">
              <TaxCalculator />
            </TabsContent>
            
            <TabsContent value="investments">
              <InvestmentCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
