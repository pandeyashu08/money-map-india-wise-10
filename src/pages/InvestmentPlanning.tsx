
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvestmentCalculator from '@/components/InvestmentCalculator';

const InvestmentPlanning = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Investment Planning</h1>
      </div>
      
      <InvestmentCalculator />
    </div>
  );
};

export default InvestmentPlanning;
