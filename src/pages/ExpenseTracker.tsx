
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionManager from '@/components/TransactionManager';
import AIInsightCard from '@/components/AIInsightCard';
import { useAI } from '@/contexts/AIContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ExpenseTracker = () => {
  const { isAIEnabled, toggleAI, insights, isAILoading } = useAI();

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="ai-toggle" className="text-sm">AI Features</Label>
          <Switch 
            id="ai-toggle" 
            checked={isAIEnabled} 
            onCheckedChange={toggleAI} 
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionManager />
        </div>
        <div className="space-y-6">
          <AIInsightCard 
            insights={insights}
            isLoading={isAILoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
