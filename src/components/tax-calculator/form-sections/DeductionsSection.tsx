
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calculator, Info, ChevronDown, Home, 
  Umbrella, BadgeIndianRupee, GraduationCap, HeartPulse, HandHeart, Landmark
} from 'lucide-react';
import { formatCurrency } from '@/utils/financialUtils';
import { useTaxData } from '../TaxDataContext';
import Section80C from './Section80C';

interface DeductionsSectionProps {
  onCalculate: () => void;
}

const DeductionsSection: React.FC<DeductionsSectionProps> = ({ onCalculate }) => {
  const {
    calculatorMode,
    selectedRegime,
    
    standardDeduction,
    setStandardDeduction,
    
    hasOtherDeductions,
    setHasOtherDeductions,
    
    section80C,
    section80D,
    setSection80D,
    section80G,
    setSection80G,
    section80TTA,
    setSection80TTA,
    nps,
    setNps,
    housingLoanInterest,
    setHousingLoanInterest,
    educationLoanInterest,
    setEducationLoanInterest,
    
    employmentType,
    setEmploymentType,
    employerNpsContribution,
    setEmployerNpsContribution,
    basicSalary,
    
    lta,
    setLta,
    professionalTax,
    setProfessionalTax,
    otherExemptions,
    setOtherExemptions
  } = useTaxData();

  return (
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
        
        {selectedRegime === 'old' && (
          <>
            <Collapsible className="w-full">
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left">
                <span className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Additional Exemptions (Old Regime)
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2 pl-4 border-l-2 border-l-muted">
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Other Exemptions
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">Any other exemptions like special allowances under Section 10</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Input
                    type="number"
                    value={otherExemptions}
                    onChange={(e) => setOtherExemptions(Number(e.target.value) || 0)}
                    placeholder="Enter other exemptions"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible className="w-full">
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left">
                <span className="flex items-center">
                  <Umbrella className="h-4 w-4 mr-2" />
                  Employer NPS Contribution
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2 pl-4 border-l-2 border-l-muted">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm text-muted-foreground">Employment Type:</label>
                    <RadioGroup value={employmentType} onValueChange={(value) => setEmploymentType(value as 'private' | 'government')}>
                      <div className="flex space-x-2">
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private" className="text-sm">Private</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="government" id="government" />
                          <Label htmlFor="government" className="text-sm">Government</Label>
                        </div>
                      </div>
                    </RadioGroup>
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
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="has-other-deductions" 
                checked={hasOtherDeductions}
                onCheckedChange={(checked) => setHasOtherDeductions(checked as boolean)}
              />
              <div>
                <label htmlFor="has-other-deductions" className="block text-sm font-medium cursor-pointer">
                  I have deductions under Chapter VI-A
                </label>
              </div>
            </div>
            
            {hasOtherDeductions && (
              <div className="space-y-4 pl-6 border-l-2 border-l-muted">
                <Section80C />
                
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <HeartPulse className="h-4 w-4 mr-1" />
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
                  <label className="flex items-center text-sm font-medium mb-1">
                    <HandHeart className="h-4 w-4 mr-1" />
                    Donations (80G)
                    <span className="text-xs text-muted-foreground ml-2">Donations to approved funds/charities</span>
                  </label>
                  <Input
                    type="number"
                    value={section80G}
                    onChange={(e) => setSection80G(Number(e.target.value) || 0)}
                    placeholder="Enter donation amount"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Landmark className="h-4 w-4 mr-1" />
                    Interest on Savings (80TTA)
                    <span className="text-xs text-muted-foreground ml-2">Max ₹10,000</span>
                  </label>
                  <Input
                    type="number"
                    value={section80TTA}
                    onChange={(e) => setSection80TTA(Number(e.target.value) || 0)}
                    placeholder="Enter savings account interest"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Umbrella className="h-4 w-4 mr-1" />
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
                  <label className="flex items-center text-sm font-medium mb-1">
                    <Home className="h-4 w-4 mr-1" />
                    Housing Loan Interest (Max ₹2,00,000)
                  </label>
                  <Input
                    type="number"
                    value={housingLoanInterest}
                    onChange={(e) => setHousingLoanInterest(Number(e.target.value) || 0)}
                    placeholder="Enter housing loan interest"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium mb-1">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Education Loan Interest (80E)
                  </label>
                  <Input
                    type="number"
                    value={educationLoanInterest}
                    onChange={(e) => setEducationLoanInterest(Number(e.target.value) || 0)}
                    placeholder="Enter education loan interest"
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {selectedRegime === 'new' && (
          <>
            <div className="py-2 px-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">In the New Tax Regime, most deductions under Chapter VI-A are not allowed except for employer's NPS contribution and transport allowance for disabled persons.</p>
            </div>
            
            <Collapsible className="w-full">
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left">
                <span className="flex items-center">
                  <Umbrella className="h-4 w-4 mr-2" />
                  Employer NPS Contribution
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2 pl-4 border-l-2 border-l-muted">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm text-muted-foreground">Employment Type:</label>
                    <RadioGroup value={employmentType} onValueChange={(value) => setEmploymentType(value as 'private' | 'government')}>
                      <div className="flex space-x-2">
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="private" id="private-new" />
                          <Label htmlFor="private-new" className="text-sm">Private</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="government" id="government-new" />
                          <Label htmlFor="government-new" className="text-sm">Government</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <label className="block text-sm font-medium mb-1">
                    Employer NPS Contribution
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">Employer's contribution to NPS is tax-free up to 10% (govt) or 14% (private) of Basic+DA even in the new regime</p>
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
        
        <div className="pt-4">
          <Button 
            onClick={onCalculate}
            className="w-full bg-finance-blue hover:bg-blue-700 flex items-center justify-center gap-2"
            size="lg"
          >
            <Calculator className="h-4 w-4" />
            Calculate Tax
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionsSection;
