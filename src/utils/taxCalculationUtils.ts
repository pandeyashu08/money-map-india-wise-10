
/**
 * Tax calculation utilities specific to Indian income tax rules
 */

type AgeGroup = 'below60' | '60to80' | 'above80';
type ResidentialStatus = 'resident' | 'non-resident';

/**
 * Calculate tax under old regime based on age group
 */
export const calculateOldRegimeTax = (
  taxableIncome: number, 
  ageGroup: AgeGroup = 'below60'
): number => {
  let tax = 0;

  // Tax slabs for different age groups
  if (ageGroup === 'below60') {
    // Below 60 years
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }
  } else if (ageGroup === '60to80') {
    // 60-80 years
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 10000 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 110000 + (taxableIncome - 1000000) * 0.3;
    }
  } else {
    // Above 80 years
    if (taxableIncome <= 500000) {
      tax = 0;
    } else if (taxableIncome <= 1000000) {
      tax = (taxableIncome - 500000) * 0.2;
    } else {
      tax = 100000 + (taxableIncome - 1000000) * 0.3;
    }
  }

  return tax;
};

/**
 * Calculate tax under new regime (FY 2025-26)
 */
export const calculateNewRegimeTax = (taxableIncome: number): number => {
  let tax = 0;

  if (taxableIncome <= 400000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    tax = (taxableIncome - 400000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 15000 + (taxableIncome - 700000) * 0.1;
  } else if (taxableIncome <= 1200000) {
    tax = 45000 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome <= 1600000) {
    tax = 75000 + (taxableIncome - 1200000) * 0.2;
  } else {
    tax = 155000 + (taxableIncome - 1600000) * 0.3;
  }

  return tax;
};

/**
 * Calculate surcharge based on income level
 */
export const calculateSurcharge = (taxAmount: number, totalIncome: number): number => {
  if (totalIncome > 50000000) {
    return taxAmount * 0.37; // 37% surcharge for income > 5 crores
  } else if (totalIncome > 20000000) {
    return taxAmount * 0.25; // 25% surcharge for income > 2 crores
  } else if (totalIncome > 10000000) {
    return taxAmount * 0.15; // 15% surcharge for income > 1 crore
  } else if (totalIncome > 5000000) {
    return taxAmount * 0.10; // 10% surcharge for income > 50 lakhs
  }
  return 0;
};

/**
 * Calculate rebate under Section 87A
 */
export const calculateRebate = (taxAmount: number, taxableIncome: number, isNewRegime: boolean): number => {
  if (isNewRegime) {
    // For new regime: full rebate up to 12L
    if (taxableIncome <= 1200000) {
      return Math.min(taxAmount, 25000);
    }
  } else {
    // For old regime: rebate up to 5L
    if (taxableIncome <= 500000) {
      return Math.min(taxAmount, 12500);
    }
  }
  return 0;
};

/**
 * Calculate eligible HRA exemption
 */
export const calculateHRAExemption = (
  basicSalary: number,
  hraReceived: number,
  rentPaid: number,
  isMetroCity: boolean
): number => {
  if (rentPaid === 0) return 0;
  
  // HRA exemption is least of these three
  const actualHRA = hraReceived;
  const rentMinusBasic = Math.max(0, rentPaid - (0.1 * basicSalary));
  const percentOfBasic = isMetroCity ? 0.5 * basicSalary : 0.4 * basicSalary;
  
  return Math.min(actualHRA, rentMinusBasic, percentOfBasic);
};

/**
 * Calculate marginal relief for incomes just above rebate limits
 */
export const calculateMarginalRelief = (
  taxAmount: number, 
  taxableIncome: number, 
  isNewRegime: boolean
): number => {
  // Implement marginal relief logic
  if (isNewRegime) {
    // For new regime (marginal relief for incomes just above 12L)
    if (taxableIncome > 1200000 && taxableIncome <= 1250000) {
      const increasedTax = taxAmount;
      const increaseInIncome = taxableIncome - 1200000;
      if (increasedTax > increaseInIncome) {
        return increasedTax - increaseInIncome;
      }
    }
  } else {
    // For old regime (marginal relief for incomes just above 5L)
    if (taxableIncome > 500000 && taxableIncome <= 550000) {
      const increasedTax = taxAmount;
      const increaseInIncome = taxableIncome - 500000;
      if (increasedTax > increaseInIncome) {
        return increasedTax - increaseInIncome;
      }
    }
  }
  return 0;
};

/**
 * Format currency values to Indian Rupee format
 */
export const formatIndianCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};
