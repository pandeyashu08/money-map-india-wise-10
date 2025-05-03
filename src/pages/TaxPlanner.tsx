
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TaxCalculator from '@/components/TaxCalculator';

const TaxPlanner = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tax Planner</h1>
      </div>
      
      <TaxCalculator />
    </div>
  );
};

export default TaxPlanner;
