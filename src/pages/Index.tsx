
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import ExpenseTracker from '@/components/ExpenseTracker';
import TaxCalculator from '@/components/TaxCalculator';
import InvestmentCalculator from '@/components/InvestmentCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="tax">Tax Planner</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="dashboard" className="mt-0">
              <DashboardOverview />
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-0">
              <ExpenseTracker />
            </TabsContent>
            
            <TabsContent value="tax" className="mt-0">
              <TaxCalculator />
            </TabsContent>
            
            <TabsContent value="investments" className="mt-0">
              <InvestmentCalculator />
            </TabsContent>
          </div>
        </Tabs>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2025 Money Map - Personal Finance Platform for Indians
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
