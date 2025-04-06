
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { formatCurrency } from '@/utils/financialUtils';
import { useTaxData } from './TaxDataContext';
import FinancialChart from '../FinancialChart';

const TaxCalculatorResults: React.FC = () => {
  const {
    selectedRegime,
    oldRegimeTotal,
    newRegimeTotal,
    taxSavings,
    betterRegime,
    oldRegimeBreakdown,
    newRegimeBreakdown,
    taxComparisonData,
    totalIncome,
    exportAsPDF,
    shareCalculation,
    getTaxRecommendations
  } = useTaxData();

  const taxRecommendations = getTaxRecommendations();

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax Calculation Results</CardTitle>
          <CardDescription>Comparison between old and new tax regimes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className={cn(
              "flex-1 rounded-lg p-4 transition-colors",
              selectedRegime === 'old' ? "bg-finance-blue/5 border-2 border-finance-blue" : "bg-muted"
            )}>
              <p className="text-sm font-medium">Old Regime Tax</p>
              <h4 className="text-2xl font-bold">{formatCurrency(oldRegimeTotal)}</h4>
              <p className="text-xs text-muted-foreground">
                Effective Rate: {totalIncome > 0 ? ((oldRegimeTotal / totalIncome) * 100).toFixed(2) : 0}%
              </p>
            </div>
            
            <div className={cn(
              "flex-1 rounded-lg p-4 transition-colors",
              selectedRegime === 'new' ? "bg-finance-green/5 border-2 border-finance-green" : "bg-muted"
            )}>
              <p className="text-sm font-medium">New Regime Tax</p>
              <h4 className="text-2xl font-bold">{formatCurrency(newRegimeTotal)}</h4>
              <p className="text-xs text-muted-foreground">
                Effective Rate: {totalIncome > 0 ? ((newRegimeTotal / totalIncome) * 100).toFixed(2) : 0}%
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              betterRegime === 'new' ? 'bg-finance-green/10 text-finance-green' : 'bg-finance-blue/10 text-finance-blue'
            }`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Recommended Tax Regime</p>
              <p className="text-sm">
                The <span className="font-bold">{betterRegime === 'new' ? 'New' : 'Old'} Regime</span> is better for you, 
                saving <span className="font-bold text-finance-green">{formatCurrency(taxSavings)}</span>
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <FinancialChart
              title="Tax Regime Comparison"
              type="bar"
              data={taxComparisonData}
            />
          </div>
          
          <div className="pt-3 flex flex-wrap gap-2 md:justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportAsPDF}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
              Export PDF
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={shareCalculation}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax Breakdown & Tips</CardTitle>
          <CardDescription>Detailed breakdown and optimization tips</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4 pt-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Old Regime Breakdown</h3>
                <div className="space-y-2">
                  {oldRegimeBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium text-sm mb-2">New Regime Breakdown</h3>
                <div className="space-y-2">
                  {newRegimeBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="pt-4">
              <div className="space-y-4">
                {taxRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-finance-blue/10 text-finance-blue flex items-center justify-center mr-2 mt-0.5">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-finance-blue/10 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-finance-blue mr-2" />
                    <h4 className="font-medium">Important Note</h4>
                  </div>
                  <p className="text-sm mt-2">
                    This is a simplified tax calculator for income tax calculation. For complex tax situations
                    involving multiple income sources, capital gains, or business income, please consult
                    a tax professional.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculatorResults;
