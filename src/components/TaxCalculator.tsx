
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calculator } from 'lucide-react';
import TaxCalculatorForm from './tax-calculator/TaxCalculatorForm';
import TaxCalculatorResults from './tax-calculator/TaxCalculatorResults';
import { formatCurrency } from '@/utils/financialUtils';
import { TaxDataProvider } from './tax-calculator/TaxDataContext';

const TaxCalculator: React.FC = () => {
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleCalculate = () => {
    setShowResults(true);
    setTimeout(() => {
      const resultsElement = document.getElementById('tax-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="space-y-8">
      <TaxDataProvider>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Income Tax Calculator (AY 2025-26)</h2>
            <p className="text-muted-foreground">Plan your taxes and maximize savings</p>
          </div>
        </div>

        <TaxCalculatorForm onCalculate={handleCalculate} />
        
        {showResults && (
          <div id="tax-results" className="animate-fade-in">
            <TaxCalculatorResults />
          </div>
        )}
      </TaxDataProvider>
    </div>
  );
};

export default TaxCalculator;
