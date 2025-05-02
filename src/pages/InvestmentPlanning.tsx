
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const InvestmentPlanning = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Investment Planning</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plan Your Investments</CardTitle>
          <CardDescription>Optimize your investment portfolio for maximum returns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. You will be able to track your investments, analyze performance, and get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentPlanning;
