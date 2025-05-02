
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ExpenseTracker = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Your Expenses</CardTitle>
          <CardDescription>Manage and analyze your income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. You will be able to track your expenses, categorize them, and view detailed analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;
