import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { calculateOldRegimeTax, calculateNewRegimeTax, formatCurrency } from '@/utils/financialUtils';
import StatCard from './StatCard';
import FinancialChart from './FinancialChart';
import { AlertCircle, Landmark, CheckCircle2, ArrowRight, Calculator, BadgeIndianRupee, Info, ChevronDown } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TaxCalculator: React.FC = () => {
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'advanced'>('simple');
  const [assessmentYear, setAssessmentYear] = useState<'2024-25' | '2025-26' | '2026-27'>('2025-26');
  const [salaryIncome, setSalaryIncome] = useState<number>(1000000);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(1000000);
  const [hasOtherIncome, setHasOtherIncome] = useState<boolean>(false);
  const [businessIncome, setBusinessIncome] = useState<number>(0);
  const [capitalGains, setCapitalGains] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  
  const [hra, setHra] = useState<number>(0);
  const [lta, setLta] = useState<number>(0);
  const [professionalTax, setProfessionalTax] = useState<number>(2400);
  const [totalExemptions, setTotalExemptions] = useState<number>(2400);
  
  const [section80C, setSection80C] = useState<number>(150000);
  const [section80D, setSection80D] = useState<number>(25000);
  const [nps, setNps] = useState<number>(50000);
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(0);
  const [educationLoanInterest, setEducationLoanInterest] = useState<number>(0);
  const [hasOtherDeductions, setHasOtherDeductions] = useState<boolean>(true);
  const [standardDeduction, setStandardDeduction] = useState<boolean>(true);
  const [employmentType, setEmploymentType] = useState<'private' | 'government'>('private');
  const [employerNpsContribution, setEmployerNpsContribution] = useState<number>(0);
  const [basicSalary, setBasicSalary] = useState<number>(500000);
  
  const [oldRegimeTax, setOldRegimeTax] = useState<number>(0);
  const [newRegimeTax, setNewRegimeTax] = useState<number>(0);
  const [oldRegimeSurcharge, setOldRegimeSurcharge] = useState<number>(0);
  const [newRegimeSurcharge, setNewRegimeSurcharge] = useState<number>(0);
  const [oldRegimeCess, setOldRegimeCess] = useState<number>(0);
  const [newRegimeCess, setNewRegimeCess] = useState<number>(0);
  const [oldRegimeTotal, setOldRegimeTotal] = useState<number>(0);
  const [newRegimeTotal, setNewRegimeTotal] = useState<number>(0);
  
  const [selectedRegime, setSelectedRegime] = useState<'old' | 'new'>('old');
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    let grossTotalIncome = salaryIncome;
    
    if (hasOtherIncome) {
      grossTotalIncome += otherIncome + businessIncome + capitalGains + rentalIncome;
    }
    
    setTotalIncome(grossTotalIncome);
    
    const exemptionsTotal = hra + lta + professionalTax;
    setTotalExemptions(exemptionsTotal);
    
    let taxableIncomeOldRegime = grossTotalIncome - exemptionsTotal;
    
    if (standardDeduction) {
      taxableIncomeOldRegime -= 50000;
    }
    
    if (hasOtherDeductions) {
      const eligible80C = Math.min(section80C, 150000);
      const eligible80D = Math.min(section80D, 25000);
      const eligibleNPS = Math.min(nps, 50000);
      const eligibleHousingLoan = Math.min(housingLoanInterest, 200000);
      const eligibleEducationLoan = educationLoanInterest;
      
      taxableIncomeOldRegime -= (eligible80C + eligible80D + eligibleNPS + eligibleHousingLoan + eligibleEducationLoan);
    }
    
    if (employerNpsContribution > 0) {
      const maxNpsLimit = employmentType === 'private' 
        ? basicSalary * 0.14
        : basicSalary * 0.10;
      
      const eligibleEmployerNps = Math.min(employerNpsContribution, maxNpsLimit);
      taxableIncomeOldRegime -= eligibleEmployerNps;
    }
    
    taxableIncomeOldRegime = Math.max(0, taxableIncomeOldRegime);
    
    let taxableIncomeNewRegime = grossTotalIncome;
    
    if (standardDeduction) {
      taxableIncomeNewRegime -= 75000;
    }
    
    taxableIncomeNewRegime = Math.max(0, taxableIncomeNewRegime);
    
    const oldBasicTax = calculateOldRegimeTax(taxableIncomeOldRegime);
    const newBasicTax = calculateNewRegimeTax(taxableIncomeNewRegime);
    
    let oldSurcharge = 0;
    let newSurcharge = 0;
    
    if (taxableIncomeOldRegime > 5000000) {
      if (taxableIncomeOldRegime <= 10000000) {
        oldSurcharge = oldBasicTax * 0.10;
      } else if (taxableIncomeOldRegime <= 20000000) {
        oldSurcharge = oldBasicTax * 0.15;
      } else if (taxableIncomeOldRegime <= 50000000) {
        oldSurcharge = oldBasicTax * 0.25;
      } else {
        oldSurcharge = oldBasicTax * 0.37;
      }
    }
    
    if (taxableIncomeNewRegime > 5000000) {
      if (taxableIncomeNewRegime <= 10000000) {
        newSurcharge = newBasicTax * 0.10;
      } else if (taxableIncomeNewRegime <= 20000000) {
        newSurcharge = newBasicTax * 0.15;
      } else if (taxableIncomeNewRegime <= 50000000) {
        newSurcharge = newBasicTax * 0.25;
      } else {
        newSurcharge = newBasicTax * 0.37;
      }
    }
    
    const oldCess = (oldBasicTax + oldSurcharge) * 0.04;
    const newCess = (newBasicTax + newSurcharge) * 0.04;
    
    const oldTotal = oldBasicTax + oldSurcharge + oldCess;
    const newTotal = newBasicTax + newSurcharge + newCess;
    
    setOldRegimeTax(oldBasicTax);
    setNewRegimeTax(newBasicTax);
    setOldRegimeSurcharge(oldSurcharge);
    setNewRegimeSurcharge(newSurcharge);
    setOldRegimeCess(oldCess);
    setNewRegimeCess(newCess);
    setOldRegimeTotal(oldTotal);
    setNewRegimeTotal(newTotal);
    
    if (newTotal < oldTotal) {
      setSelectedRegime('new');
    } else {
      setSelectedRegime('old');
    }
  }, [
    salaryIncome, 
    otherIncome,
    businessIncome,
    capitalGains,
    rentalIncome,
    hasOtherIncome,
    hra,
    lta,
    professionalTax,
    section80C, 
    section80D, 
    nps, 
    housingLoanInterest,
    educationLoanInterest,
    hasOtherDeductions,
    standardDeduction,
    employmentType,
    employerNpsContribution,
    basicSalary
  ]);
  
  const taxComparisonData = [
    { name: 'Old Regime', value: oldRegimeTotal, color: '#0466C8' },
    { name: 'New Regime', value: newRegimeTotal, color: '#38B000' }
  ];
  
  const oldRegimeBreakdown = [
    { name: 'Gross Total Income', value: totalIncome },
    { name: 'Total Exemptions', value: totalExemptions },
    { name: 'Standard Deduction', value: standardDeduction ? 50000 : 0 },
    { name: 'Other Deductions', value: hasOtherDeductions ? 
      (Math.min(section80C, 150000) + Math.min(section80D, 25000) + Math.min(nps, 50000) + 
      Math.min(housingLoanInterest, 200000) + educationLoanInterest) : 0 
    },
    { name: 'Taxable Income', value: Math.max(0, totalIncome - totalExemptions - 
      (standardDeduction ? 50000 : 0) - 
      (hasOtherDeductions ? 
        (Math.min(section80C, 150000) + Math.min(section80D, 25000) + Math.min(nps, 50000) + 
        Math.min(housingLoanInterest, 200000) + educationLoanInterest) : 0)) 
    },
    { name: 'Basic Tax', value: oldRegimeTax },
    { name: 'Surcharge', value: oldRegimeSurcharge },
    { name: 'Health & Education Cess (4%)', value: oldRegimeCess },
    { name: 'Total Tax Liability', value: oldRegimeTotal }
  ];
  
  const newRegimeBreakdown = [
    { name: 'Gross Total Income', value: totalIncome },
    { name: 'Standard Deduction', value: standardDeduction ? 75000 : 0 },
    { name: 'Taxable Income', value: Math.max(0, totalIncome - (standardDeduction ? 75000 : 0)) },
    { name: 'Basic Tax', value: newRegimeTax },
    { name: 'Surcharge', value: newRegimeSurcharge },
    { name: 'Health & Education Cess (4%)', value: newRegimeCess },
    { name: 'Total Tax Liability', value: newRegimeTotal }
  ];
  
  const taxSavings = Math.max(oldRegimeTotal, newRegimeTotal) - Math.min(oldRegimeTotal, newRegimeTotal);
  const betterRegime = newRegimeTotal < oldRegimeTotal ? 'new' : 'old';
  
  const getTaxRecommendations = () => {
    const recommendations = [];
    
    recommendations.push(`The ${betterRegime} tax regime is better for you, saving you ${formatCurrency(taxSavings)}`);
    
    if (betterRegime === 'old' && section80C < 150000) {
      recommendations.push(`Invest ${formatCurrency(150000 - section80C)} more in 80C options like ELSS, PPF, or EPF to maximize your tax benefits`);
    }
    
    if (betterRegime === 'old' && nps < 50000) {
      recommendations.push(`Consider investing ${formatCurrency(50000 - nps)} more in NPS to get additional tax benefits under 80CCD(1B)`);
    }
    
    if (betterRegime === 'old' && section80D < 25000) {
      recommendations.push(`Get health insurance coverage to utilize remaining ${formatCurrency(25000 - section80D)} deduction under section 80D`);
    }
    
    if (hra === 0) {
      recommendations.push("If you're paying rent, claim HRA exemption by submitting rent receipts to your employer");
    }
    
    if (housingLoanInterest === 0) {
      recommendations.push("Consider home loan to avail interest deduction up to ₹2,00,000 under Section 24B");
    }
    
    return recommendations;
  };
  
  const taxRecommendations = getTaxRecommendations();
  
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Income Tax Calculator FY {assessmentYear}</h2>
          <p className="text-muted-foreground">Plan your taxes and maximize savings</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="calculator-mode">Advanced Mode</Label>
            <Switch 
              id="calculator-mode" 
              checked={calculatorMode === 'advanced'}
              onCheckedChange={(checked) => setCalculatorMode(checked ? 'advanced' : 'simple')}
            />
          </div>
          
          <RadioGroup 
            defaultValue="2025-26" 
            value={assessmentYear}
            onValueChange={(value) => setAssessmentYear(value as '2024-25' | '2025-26' | '2026-27')}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="2024-25" id="ay-2024-25" />
              <Label htmlFor="ay-2024-25">AY 2024-25</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="2025-26" id="ay-2025-26" />
              <Label htmlFor="ay-2025-26">AY 2025-26</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="2026-27" id="ay-2026-27" />
              <Label htmlFor="ay-2026-27">AY 2026-27</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeIndianRupee className="h-5 w-5 text-finance-blue" />
              Income Details
            </CardTitle>
            <CardDescription>Enter your income from all sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Salary Income
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Enter your total annual salary income including basic, HRA, allowances before any deductions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Input
                type="number"
                value={salaryIncome}
                onChange={(e) => setSalaryIncome(Number(e.target.value) || 0)}
                placeholder="e.g., 1000000"
              />
            </div>
            
            {calculatorMode === 'advanced' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Basic Salary + DA
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Enter your basic salary and dearness allowance (usually 40-60% of CTC)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <Input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                  placeholder="e.g., 500000"
                />
              </div>
            )}
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="has-other-income" 
                checked={hasOtherIncome}
                onCheckedChange={(checked) => setHasOtherIncome(checked as boolean)}
              />
              <div>
                <label htmlFor="has-other-income" className="block text-sm font-medium cursor-pointer">
                  I have other income sources
                </label>
              </div>
            </div>
            
            {hasOtherIncome && (
              <div className="space-y-4 pl-6 border-l-2 border-l-muted">
                <div>
                  <label className="block text-sm font-medium mb-1">Other Income</label>
                  <Input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                    placeholder="Interest, dividends, etc."
                  />
                </div>
                
                {calculatorMode === 'advanced' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Business Income</label>
                      <Input
                        type="number"
                        value={businessIncome}
                        onChange={(e) => setBusinessIncome(Number(e.target.value) || 0)}
                        placeholder="Business or profession income"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Capital Gains</label>
                      <Input
                        type="number"
                        value={capitalGains}
                        onChange={(e) => setCapitalGains(Number(e.target.value) || 0)}
                        placeholder="Short or long term capital gains"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rental Income</label>
                      <Input
                        type="number"
                        value={rentalIncome}
                        onChange={(e) => setRentalIncome(Number(e.target.value) || 0)}
                        placeholder="Income from house property"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-sm font-medium">Total Gross Income</p>
              <h3 className="text-2xl font-bold text-finance-blue">{formatCurrency(totalIncome)}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-finance-blue" />
              {calculatorMode === 'advanced' ? 'Exemptions & Deductions' : 'Deductions'}
            </CardTitle>
            <CardDescription>Enter your eligible deductions under tax regimes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="standard-deduction" 
                checked={standardDeduction}
                onCheckedChange={(checked) => setStandardDeduction(checked as boolean)}
              />
              <div>
                <label htmlFor="standard-deduction" className="block text-sm font-medium cursor-pointer">
                  Standard Deduction
                  <span className="block text-xs text-muted-foreground">
                    (₹50,000 for Old Regime, ₹75,000 for New Regime)
                  </span>
                </label>
              </div>
            </div>
            
            {calculatorMode === 'advanced' && (
              <>
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left">
                    <span>Exemptions (for Old Regime)</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2 pl-4 border-l-2 border-l-muted">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        HRA Exemption
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">HRA exemption is the minimum of: 1) Actual HRA received, 2) Rent paid minus 10% of basic salary, 3) 50% of basic salary (in metro cities) or 40% (in non-metro)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value) || 0)}
                        placeholder="Enter eligible HRA exemption"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        LTA Exemption
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Leave Travel Allowance exemption for journeys undertaken within India</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        value={lta}
                        onChange={(e) => setLta(Number(e.target.value) || 0)}
                        placeholder="Enter eligible LTA amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Professional Tax
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Tax levied by state governments on professionals (typically ₹2,400 per year)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        value={professionalTax}
                        onChange={(e) => setProfessionalTax(Number(e.target.value) || 0)}
                        placeholder="Enter professional tax paid"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left">
                    <span>Employer NPS Contribution</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2 pl-4 border-l-2 border-l-muted">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-sm text-muted-foreground">Employment Type:</label>
                        <div className="flex space-x-2">
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="private" id="private" 
                              checked={employmentType === 'private'}
                              onClick={() => setEmploymentType('private')}
                            />
                            <Label htmlFor="private" className="text-sm">Private</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="government" id="government" 
                              checked={employmentType === 'government'}
                              onClick={() => setEmploymentType('government')}
                            />
                            <Label htmlFor="government" className="text-sm">Government</Label>
                          </div>
                        </div>
                      </div>
                      <label className="block text-sm font-medium mb-1">
                        Employer NPS Contribution
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Employer's contribution to NPS is tax-free up to 10% (govt) or 14% (private) of Basic+DA under Section 80CCD(2)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        value={employerNpsContribution}
                        onChange={(e) => setEmployerNpsContribution(Number(e.target.value) || 0)}
                        placeholder="Enter employer's NPS contribution"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum eligible amount: {formatCurrency(employmentType === 'private' ? basicSalary * 0.14 : basicSalary * 0.10)}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="has-other-deductions" 
                checked={hasOtherDeductions}
                onCheckedChange={(checked) => setHasOtherDeductions(checked as boolean)}
              />
              <div>
                <label htmlFor="has-other-deductions" className="block text-sm font-medium cursor-pointer">
                  I have deductions under Old Regime
                </label>
              </div>
            </div>
            
            {hasOtherDeductions && (
              <div className="space-y-4 pl-6 border-l-2 border-l-muted">
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
                {calculatorMode === 'advanced' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Education Loan Interest (80E)
                    </label>
                    <Input
                      type="number"
                      value={educationLoanInterest}
                      onChange={(e) => setEducationLoanInterest(Number(e.target.value) || 0)}
                      placeholder="Enter education loan interest"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                onClick={handleCalculate}
                className="w-full bg-finance-blue hover:bg-blue-700 flex items-center justify-center gap-2"
                size="lg"
              >
                <Calculator className="h-4 w-4" />
                Calculate Tax
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showResults && (
        <div id="tax-results" className="grid gap-6 md:grid-cols-2 mt-8">
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
                        This is a simplified tax calculator for FY {assessmentYear}. For complex tax situations
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
      )}
    </div>
  );
};

export default TaxCalculator;
