import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateOldRegimeTax, calculateNewRegimeTax } from '@/utils/financialUtils';

type EmploymentType = 'private' | 'government';
type AssessmentYear = '2024-25' | '2025-26' | '2026-27';
type CalculatorMode = 'simple' | 'advanced';
type TaxRegime = 'old' | 'new';

interface TaxDataContextType {
  // General settings
  calculatorMode: CalculatorMode;
  setCalculatorMode: (mode: CalculatorMode) => void;
  assessmentYear: AssessmentYear;
  setAssessmentYear: (year: AssessmentYear) => void;
  selectedRegime: TaxRegime;
  setSelectedRegime: (regime: TaxRegime) => void;
  
  // Income details
  salaryIncome: number;
  setSalaryIncome: (amount: number) => void;
  basicSalary: number;
  setBasicSalary: (amount: number) => void;
  hasOtherIncome: boolean;
  setHasOtherIncome: (has: boolean) => void;
  otherIncome: number;
  setOtherIncome: (amount: number) => void;
  rentalIncome: number;
  setRentalIncome: (amount: number) => void;
  businessIncome: number;
  setBusinessIncome: (amount: number) => void;
  capitalGains: number;
  setCapitalGains: (amount: number) => void;
  agricultureIncome: number;
  setAgricultureIncome: (amount: number) => void;
  totalIncome: number;
  
  // HRA and other flags
  receivesHRA: boolean;
  setReceivesHRA: (receives: boolean) => void;
  isMetroCity: boolean;
  setIsMetroCity: (is: boolean) => void;
  hasHomeLoan: boolean;
  setHasHomeLoan: (has: boolean) => void;
  
  // Exemptions
  hra: number;
  setHra: (amount: number) => void;
  lta: number;
  setLta: (amount: number) => void;
  professionalTax: number;
  setProfessionalTax: (amount: number) => void;
  totalExemptions: number;
  
  // Standard deduction
  standardDeduction: boolean;
  setStandardDeduction: (has: boolean) => void;
  
  // Deductions
  hasOtherDeductions: boolean;
  setHasOtherDeductions: (has: boolean) => void;
  
  // 80C components
  epfContribution: number;
  setEpfContribution: (amount: number) => void;
  ppfInvestment: number;
  setPpfInvestment: (amount: number) => void;
  elssInvestment: number;
  setElssInvestment: (amount: number) => void;
  lifeInsurance: number;
  setLifeInsurance: (amount: number) => void;
  tuitionFees: number;
  setTuitionFees: (amount: number) => void;
  otherEightyC: number;
  setOtherEightyC: (amount: number) => void;
  section80C: number;
  
  // Other deductions
  section80D: number;
  setSection80D: (amount: number) => void;
  nps: number;
  setNps: (amount: number) => void;
  housingLoanInterest: number;
  setHousingLoanInterest: (amount: number) => void;
  educationLoanInterest: number;
  setEducationLoanInterest: (amount: number) => void;
  
  // Employment details
  employmentType: EmploymentType;
  setEmploymentType: (type: EmploymentType) => void;
  employerNpsContribution: number;
  setEmployerNpsContribution: (amount: number) => void;
  
  // Tax calculation results
  oldRegimeTax: number;
  newRegimeTax: number;
  oldRegimeSurcharge: number;
  newRegimeSurcharge: number;
  oldRegimeCess: number;
  newRegimeCess: number;
  oldRegimeTotal: number;
  newRegimeTotal: number;
  betterRegime: TaxRegime;
  taxSavings: number;
  
  // Breakdown data for charts and display
  oldRegimeBreakdown: { name: string; value: number }[];
  newRegimeBreakdown: { name: string; value: number }[];
  taxComparisonData: { name: string; value: number; color: string }[];
  
  // Functions
  exportAsPDF: () => void;
  shareCalculation: () => void;
  getTaxRecommendations: () => string[];
}

const defaultContext: TaxDataContextType = {
  calculatorMode: 'simple',
  setCalculatorMode: () => {},
  assessmentYear: '2025-26',
  setAssessmentYear: () => {},
  selectedRegime: 'new',
  setSelectedRegime: () => {},
  
  salaryIncome: 1000000,
  setSalaryIncome: () => {},
  basicSalary: 500000,
  setBasicSalary: () => {},
  hasOtherIncome: false,
  setHasOtherIncome: () => {},
  otherIncome: 0,
  setOtherIncome: () => {},
  rentalIncome: 0,
  setRentalIncome: () => {},
  businessIncome: 0,
  setBusinessIncome: () => {},
  capitalGains: 0,
  setCapitalGains: () => {},
  agricultureIncome: 0,
  setAgricultureIncome: () => {},
  totalIncome: 1000000,
  
  receivesHRA: false,
  setReceivesHRA: () => {},
  isMetroCity: false,
  setIsMetroCity: () => {},
  hasHomeLoan: false,
  setHasHomeLoan: () => {},
  
  hra: 0,
  setHra: () => {},
  lta: 0,
  setLta: () => {},
  professionalTax: 2400,
  setProfessionalTax: () => {},
  totalExemptions: 2400,
  
  standardDeduction: true,
  setStandardDeduction: () => {},
  
  hasOtherDeductions: true,
  setHasOtherDeductions: () => {},
  
  epfContribution: 0,
  setEpfContribution: () => {},
  ppfInvestment: 0,
  setPpfInvestment: () => {},
  elssInvestment: 0,
  setElssInvestment: () => {},
  lifeInsurance: 0,
  setLifeInsurance: () => {},
  tuitionFees: 0,
  setTuitionFees: () => {},
  otherEightyC: 0,
  setOtherEightyC: () => {},
  section80C: 0,
  
  section80D: 25000,
  setSection80D: () => {},
  nps: 50000,
  setNps: () => {},
  housingLoanInterest: 0,
  setHousingLoanInterest: () => {},
  educationLoanInterest: 0,
  setEducationLoanInterest: () => {},
  
  employmentType: 'private',
  setEmploymentType: () => {},
  employerNpsContribution: 0,
  setEmployerNpsContribution: () => {},
  
  oldRegimeTax: 0,
  newRegimeTax: 0,
  oldRegimeSurcharge: 0,
  newRegimeSurcharge: 0,
  oldRegimeCess: 0,
  newRegimeCess: 0,
  oldRegimeTotal: 0,
  newRegimeTotal: 0,
  betterRegime: 'new',
  taxSavings: 0,
  
  oldRegimeBreakdown: [],
  newRegimeBreakdown: [],
  taxComparisonData: [],
  
  exportAsPDF: () => {},
  shareCalculation: () => {},
  getTaxRecommendations: () => [],
};

const TaxDataContext = createContext<TaxDataContextType>(defaultContext);

export const useTaxData = () => useContext(TaxDataContext);

export const TaxDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // General settings
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('simple');
  const [assessmentYear, setAssessmentYear] = useState<AssessmentYear>('2025-26');
  const [selectedRegime, setSelectedRegime] = useState<TaxRegime>('new');
  
  // Income details
  const [salaryIncome, setSalaryIncome] = useState<number>(1000000);
  const [basicSalary, setBasicSalary] = useState<number>(500000);
  const [hasOtherIncome, setHasOtherIncome] = useState<boolean>(false);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [businessIncome, setBusinessIncome] = useState<number>(0);
  const [capitalGains, setCapitalGains] = useState<number>(0);
  const [agricultureIncome, setAgricultureIncome] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(1000000);
  
  // HRA and other flags
  const [receivesHRA, setReceivesHRA] = useState<boolean>(false);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(false);
  const [hasHomeLoan, setHasHomeLoan] = useState<boolean>(false);
  
  // Exemptions
  const [hra, setHra] = useState<number>(0);
  const [lta, setLta] = useState<number>(0);
  const [professionalTax, setProfessionalTax] = useState<number>(2400);
  const [totalExemptions, setTotalExemptions] = useState<number>(2400);
  
  // Standard deduction
  const [standardDeduction, setStandardDeduction] = useState<boolean>(true);
  
  // Deductions
  const [hasOtherDeductions, setHasOtherDeductions] = useState<boolean>(true);
  
  // 80C components
  const [epfContribution, setEpfContribution] = useState<number>(0);
  const [ppfInvestment, setPpfInvestment] = useState<number>(0);
  const [elssInvestment, setElssInvestment] = useState<number>(0);
  const [lifeInsurance, setLifeInsurance] = useState<number>(0);
  const [tuitionFees, setTuitionFees] = useState<number>(0);
  const [otherEightyC, setOtherEightyC] = useState<number>(0);
  const [section80C, setSection80C] = useState<number>(0);
  
  // Other deductions
  const [section80D, setSection80D] = useState<number>(25000);
  const [nps, setNps] = useState<number>(50000);
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(0);
  const [educationLoanInterest, setEducationLoanInterest] = useState<number>(0);
  
  // Employment details
  const [employmentType, setEmploymentType] = useState<EmploymentType>('private');
  const [employerNpsContribution, setEmployerNpsContribution] = useState<number>(0);
  
  // Tax calculation results
  const [oldRegimeTax, setOldRegimeTax] = useState<number>(0);
  const [newRegimeTax, setNewRegimeTax] = useState<number>(0);
  const [oldRegimeSurcharge, setOldRegimeSurcharge] = useState<number>(0);
  const [newRegimeSurcharge, setNewRegimeSurcharge] = useState<number>(0);
  const [oldRegimeCess, setOldRegimeCess] = useState<number>(0);
  const [newRegimeCess, setNewRegimeCess] = useState<number>(0);
  const [oldRegimeTotal, setOldRegimeTotal] = useState<number>(0);
  const [newRegimeTotal, setNewRegimeTotal] = useState<number>(0);
  
  // Update 80C total when individual components change
  useEffect(() => {
    const totalEightyC = epfContribution + ppfInvestment + elssInvestment + lifeInsurance + tuitionFees + otherEightyC;
    setSection80C(Math.min(totalEightyC, 150000));
  }, [epfContribution, ppfInvestment, elssInvestment, lifeInsurance, tuitionFees, otherEightyC]);
  
  // Main calculation effect
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
    
    // Apply tax rebate under Section 87A
    let oldTaxAfterRebate = oldBasicTax;
    let newTaxAfterRebate = newBasicTax;
    
    if (taxableIncomeOldRegime <= 500000) {
      oldTaxAfterRebate = Math.max(0, oldBasicTax - 12500);
    }
    
    if (taxableIncomeNewRegime <= 700000) {
      newTaxAfterRebate = Math.max(0, newBasicTax - 25000);
    }
    
    let oldSurcharge = 0;
    let newSurcharge = 0;
    
    if (taxableIncomeOldRegime > 5000000) {
      if (taxableIncomeOldRegime <= 10000000) {
        oldSurcharge = oldTaxAfterRebate * 0.10;
      } else if (taxableIncomeOldRegime <= 20000000) {
        oldSurcharge = oldTaxAfterRebate * 0.15;
      } else if (taxableIncomeOldRegime <= 50000000) {
        oldSurcharge = oldTaxAfterRebate * 0.25;
      } else {
        oldSurcharge = oldTaxAfterRebate * 0.37;
      }
    }
    
    if (taxableIncomeNewRegime > 5000000) {
      if (taxableIncomeNewRegime <= 10000000) {
        newSurcharge = newTaxAfterRebate * 0.10;
      } else if (taxableIncomeNewRegime <= 20000000) {
        newSurcharge = newTaxAfterRebate * 0.15;
      } else if (taxableIncomeNewRegime <= 50000000) {
        newSurcharge = newTaxAfterRebate * 0.25;
      } else {
        newSurcharge = newTaxAfterRebate * 0.37;
      }
    }
    
    const oldCess = (oldTaxAfterRebate + oldSurcharge) * 0.04;
    const newCess = (newTaxAfterRebate + newSurcharge) * 0.04;
    
    const oldTotal = oldTaxAfterRebate + oldSurcharge + oldCess;
    const newTotal = newTaxAfterRebate + newSurcharge + newCess;
    
    setOldRegimeTax(oldTaxAfterRebate);
    setNewRegimeTax(newTaxAfterRebate);
    setOldRegimeSurcharge(oldSurcharge);
    setNewRegimeSurcharge(newSurcharge);
    setOldRegimeCess(oldCess);
    setNewRegimeCess(newCess);
    setOldRegimeTotal(oldTotal);
    setNewRegimeTotal(newTotal);
  }, [
    salaryIncome, 
    otherIncome,
    businessIncome,
    capitalGains,
    rentalIncome,
    agricultureIncome,
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
    
    if (betterRegime === 'old' && hra === 0 && receivesHRA) {
      recommendations.push("Submit your rent receipts to claim HRA exemption and reduce your tax liability");
    }
    
    if (betterRegime === 'old' && housingLoanInterest === 0 && hasHomeLoan) {
      recommendations.push("Ensure you claim the full interest deduction on your home loan to reduce your taxable income");
    }
    
    return recommendations;
  };
  
  const exportAsPDF = () => {
    // In a real implementation, we would generate a PDF here
    alert("This feature would export your tax calculation as a PDF");
  };
  
  const shareCalculation = () => {
    // In a real implementation, we would generate a shareable link
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams();
    params.append('salary', salaryIncome.toString());
    params.append('regime', selectedRegime);
    
    const shareableUrl = `${baseUrl}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        alert("Shareable link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link. Please try again.");
      });
  };

  return (
    <TaxDataContext.Provider value={{
      calculatorMode,
      setCalculatorMode,
      assessmentYear,
      setAssessmentYear,
      selectedRegime,
      setSelectedRegime,
      
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
      
      hra,
      setHra,
      lta,
      setLta,
      professionalTax,
      setProfessionalTax,
      totalExemptions,
      
      standardDeduction,
      setStandardDeduction,
      
      hasOtherDeductions,
      setHasOtherDeductions,
      
      epfContribution,
      setEpfContribution,
      ppfInvestment,
      setPpfInvestment,
      elssInvestment,
      setElssInvestment,
      lifeInsurance,
      setLifeInsurance,
      tuitionFees,
      setTuitionFees,
      otherEightyC,
      setOtherEightyC,
      section80C,
      
      section80D,
      setSection80D,
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
      
      oldRegimeTax,
      newRegimeTax,
      oldRegimeSurcharge,
      newRegimeSurcharge,
      oldRegimeCess,
      newRegimeCess,
      oldRegimeTotal,
      newRegimeTotal,
      betterRegime,
      taxSavings,
      
      oldRegimeBreakdown,
      newRegimeBreakdown,
      taxComparisonData,
      
      exportAsPDF,
      shareCalculation,
      getTaxRecommendations
    }}>
      {children}
    </TaxDataContext.Provider>
  );
};
