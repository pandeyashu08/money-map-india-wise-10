
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BadgeIndianRupee, Info, Building, Briefcase, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from '@/utils/financialUtils';
import { useTaxData } from '../TaxDataContext';

const IncomeSection: React.FC = () => {
  const {
    salaryIncome,
    setSalaryIncome,
    basicSalary,
    setBasicSalary,
    hasOtherIncome,
    setHasOtherIncome,
    otherIncome,
    setOtherIncome,
    rentalIncome,
    setRentalIncome,
    businessIncome,
    setBusinessIncome,
    capitalGains,
    setCapitalGains,
    agricultureIncome,
    setAgricultureIncome,
    totalIncome,
    
    receivesHRA,
    setReceivesHRA,
    isMetroCity,
    setIsMetroCity,
    hasHomeLoan,
    setHasHomeLoan,
    
    calculatorMode
  } = useTaxData();

  return (
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
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="receives-hra" 
              checked={receivesHRA}
              onCheckedChange={(checked) => setReceivesHRA(checked as boolean)}
            />
            <label htmlFor="receives-hra" className="text-sm cursor-pointer">I receive HRA</label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="is-metro-city" 
              checked={isMetroCity}
              onCheckedChange={(checked) => setIsMetroCity(checked as boolean)}
            />
            <label htmlFor="is-metro-city" className="text-sm cursor-pointer">I live in a metro city (Delhi, Mumbai, Kolkata, Chennai)</label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="has-home-loan" 
              checked={hasHomeLoan}
              onCheckedChange={(checked) => setHasHomeLoan(checked as boolean)}
            />
            <label htmlFor="has-home-loan" className="text-sm cursor-pointer">I have a home loan</label>
          </div>
        </div>
        
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
              <label className="flex items-center text-sm font-medium mb-1">
                <Building className="h-4 w-4 mr-1" /> 
                Rental Income
              </label>
              <Input
                type="number"
                value={rentalIncome}
                onChange={(e) => setRentalIncome(Number(e.target.value) || 0)}
                placeholder="Income from house property"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-1" /> 
                Business/Professional Income
              </label>
              <Input
                type="number"
                value={businessIncome}
                onChange={(e) => setBusinessIncome(Number(e.target.value) || 0)}
                placeholder="Business or profession income"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <TrendingUp className="h-4 w-4 mr-1" /> 
                Capital Gains
              </label>
              <Input
                type="number"
                value={capitalGains}
                onChange={(e) => setCapitalGains(Number(e.target.value) || 0)}
                placeholder="Short or long term capital gains"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <BadgeIndianRupee className="h-4 w-4 mr-1" /> 
                Other Income
              </label>
              <Input
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                placeholder="Interest, dividends, etc."
              />
            </div>
            
            {calculatorMode === 'advanced' && (
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  <TrendingUp className="h-4 w-4 mr-1" /> 
                  Agricultural Income
                </label>
                <Input
                  type="number"
                  value={agricultureIncome}
                  onChange={(e) => setAgricultureIncome(Number(e.target.value) || 0)}
                  placeholder="Agricultural income (exempt but may affect tax rate)"
                />
              </div>
            )}
          </div>
        )}
        
        <div className="pt-2">
          <p className="text-sm font-medium">Total Gross Income</p>
          <h3 className="text-2xl font-bold text-finance-blue">{formatCurrency(totalIncome)}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSection;
