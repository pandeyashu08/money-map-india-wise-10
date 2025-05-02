
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TaxPlanner = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tax Planner</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plan Your Taxes</CardTitle>
          <CardDescription>Optimize your tax savings with personalized strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. You will be able to calculate your taxes, find tax-saving opportunities, and get guidance on tax compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxPlanner;
