
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { calculateOldRegimeTax, calculateNewRegimeTax, formatCurrency } from '@/utils/financialUtils';
import StatCard from './StatCard';
import FinancialChart from './FinancialChart';
import { AlertCircle, Landmark, CheckCircle2, ArrowRight } from 'lucide-react';

const TaxCalculator: React.FC = () => {
  const [salaryIncome, setSalaryIncome] = useState<number>(1000000);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(1000000);
  
  const [section80C, setSection80C] = useState<number>(150000);
  const [section80D, setSection80D] = useState<number>(25000);
  const [nps, setNps] = useState<number>(50000);
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(0);
  
  const [oldRegimeTax, setOldRegimeTax] = useState<number>(0);
  const [newRegimeTax, setNewRegimeTax] = useState<number>(0);
  
  const [selectedRegime, setSelectedRegime] = useState<'old' | 'new'>('old');

  // Calculate taxes whenever inputs change
  useEffect(() => {
    const total = salaryIncome + otherIncome;
    setTotalIncome(total);
    
    // Apply deductions for old regime
    let taxableIncomeOldRegime = total;
    const eligible80C = Math.min(section80C, 150000);
    const eligible80D = Math.min(section80D, 25000);
    const eligibleNPS = Math.min(nps, 50000);
    const eligibleHousingLoan = Math.min(housingLoanInterest, 200000);
    
    taxableIncomeOldRegime -= (eligible80C + eligible80D + eligibleNPS + eligibleHousingLoan);
    taxableIncomeOldRegime = Math.max(0, taxableIncomeOldRegime);
    
    const oldTax = calculateOldRegimeTax(taxableIncomeOldRegime);
    const newTax = calculateNewRegimeTax(total);
    
    setOldRegimeTax(oldTax);
    setNewRegimeTax(newTax);
    
    // Auto-select the better regime
    if (newTax < oldTax) {
      setSelectedRegime('new');
    } else {
      setSelectedRegime('old');
    }
  }, [
    salaryIncome, 
    otherIncome, 
    section80C, 
    section80D, 
    nps, 
    housingLoanInterest
  ]);
  
  // Data for comparison chart
  const taxComparisonData = [
    { name: 'Old Regime', value: oldRegimeTax, color: '#0466C8' },
    { name: 'New Regime', value: newRegimeTax, color: '#38B000' }
  ];
  
  // Tax breakdown data
  const oldRegimeBreakdown = [
    { name: 'Total Income', value: totalIncome },
    { name: 'Deductions', value: Math.min(section80C, 150000) + Math.min(section80D, 25000) + Math.min(nps, 50000) + Math.min(housingLoanInterest, 200000) },
    { name: 'Taxable Income', value: Math.max(0, totalIncome - (Math.min(section80C, 150000) + Math.min(section80D, 25000) + Math.min(nps, 50000) + Math.min(housingLoanInterest, 200000))) },
    { name: 'Tax Amount', value: oldRegimeTax }
  ];
  
  const newRegimeBreakdown = [
    { name: 'Total Income', value: totalIncome },
    { name: 'Standard Deduction', value: 50000 },
    { name: 'Taxable Income', value: Math.max(0, totalIncome - 50000) },
    { name: 'Tax Amount', value: newRegimeTax }
  ];
  
  // Recommendations based on tax calculation
  const taxSavings = Math.max(oldRegimeTax, newRegimeTax) - Math.min(oldRegimeTax, newRegimeTax);
  const betterRegime = newRegimeTax < oldRegimeTax ? 'new' : 'old';
  
  // Get tax recommendations
  const getTaxRecommendations = () => {
    const recommendations = [];
    
    // Regime recommendation
    recommendations.push(`The ${betterRegime} tax regime is better for you, saving you ${formatCurrency(taxSavings)}`);
    
    // 80C recommendations
    if (betterRegime === 'old' && section80C < 150000) {
      recommendations.push(`Invest ${formatCurrency(150000 - section80C)} more in 80C options like ELSS, PPF, or EPF to maximize your tax benefits`);
    }
    
    // NPS recommendation
    if (betterRegime === 'old' && nps < 50000) {
      recommendations.push(`Consider investing ${formatCurrency(50000 - nps)} more in NPS to get additional tax benefits under 80CCD(1B)`);
    }
    
    // Health insurance recommendation
    if (betterRegime === 'old' && section80D < 25000) {
      recommendations.push(`Get health insurance coverage to utilize remaining ${formatCurrency(25000 - section80D)} deduction under section 80D`);
    }
    
    return recommendations;
  };
  
  const taxRecommendations = getTaxRecommendations();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Tax Calculator FY 2025-26</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income Details</CardTitle>
            <CardDescription>Enter your income from all sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Salary Income</label>
              <Input
                type="number"
                value={salaryIncome}
                onChange={(e) => setSalaryIncome(Number(e.target.value) || 0)}
                placeholder="Enter your annual salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Income</label>
              <Input
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                placeholder="Interest, rent, capital gains, etc."
              />
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium">Total Income</p>
              <h3 className="text-2xl font-bold text-finance-blue">{formatCurrency(totalIncome)}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deductions & Exemptions</CardTitle>
            <CardDescription>Enter your eligible deductions under old tax regime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Section 80C (Max ₹1,50,000)
                <span className="text-xs text-muted-foreground ml-2">PPF, ELSS, LIC, etc.</span>
              </label>
              <Input
                type="number"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value) || 0)}
                placeholder="Enter 80C investments"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Health Insurance (80D)
                <span className="text-xs text-muted-foreground ml-2">Medical Insurance Premium</span>
              </label>
              <Input
                type="number"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value) || 0)}
                placeholder="Enter health insurance premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                NPS Contribution (80CCD(1B))
                <span className="text-xs text-muted-foreground ml-2">Additional ₹50,000</span>
              </label>
              <Input
                type="number"
                value={nps}
                onChange={(e) => setNps(Number(e.target.value) || 0)}
                placeholder="Enter NPS contribution"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Housing Loan Interest (Max ₹2,00,000)
              </label>
              <Input
                type="number"
                value={housingLoanInterest}
                onChange={(e) => setHousingLoanInterest(Number(e.target.value) || 0)}
                placeholder="Enter housing loan interest"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Calculation Results</CardTitle>
            <CardDescription>Comparison between old and new tax regimes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <StatCard
                title="Old Regime Tax"
                value={formatCurrency(oldRegimeTax)}
                className="flex-1"
              />
              <StatCard
                title="New Regime Tax"
                value={formatCurrency(newRegimeTax)}
                className="flex-1"
              />
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                selectedRegime === 'new' ? 'bg-finance-green/10 text-finance-green' : 'bg-finance-blue/10 text-finance-blue'
              }`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Recommended Tax Regime</p>
                <p className="text-sm">
                  The <span className="font-bold">{selectedRegime === 'new' ? 'New' : 'Old'} Regime</span> is better for you, 
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
                      This is a simplified tax calculator for FY 2025-26. For complex tax situations
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
    </div>
  );
};

export default TaxCalculator;
