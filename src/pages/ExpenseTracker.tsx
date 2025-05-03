
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseTrackerComponent from '@/components/ExpenseTracker';

const ExpenseTracker = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
      </div>
      
      <ExpenseTrackerComponent />
    </div>
  );
};

export default ExpenseTracker;
